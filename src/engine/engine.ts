/**
 * Motor del cuestionario adaptativo.
 *
 * Funciones puras: el único estado es `Answers`. La UI pregunta `nextQuestion`
 * hasta que devuelve `null` y entonces llama a `buildReport`.
 *
 * Modelo: cada partido tiene una puntuación logarítmica que suma, por cada
 * medida respondida, peso_del_tema · λ · (acuerdo − 0,5), donde acuerdo ∈ [0,1]
 * es 1 − |usuario − partido| / 4. A eso se resta una penalización por
 * corrupción probada, ponderada por la sensibilidad del usuario. Un softmax
 * convierte las puntuaciones en "probabilidad de que este sea tu partido".
 *
 * La siguiente pregunta es la medida que más separa a los partidos que hoy son
 * plausibles (varianza de sus posiciones ponderada por esa probabilidad y por
 * la importancia del tema). Se para cuando el líder es claro y ninguna
 * respuesta a la siguiente pregunta podría desbancarlo.
 */
import {
  CORRUPTION_KEY,
  type Answers,
  type CorruptionCase,
  type Dataset,
  type Importance,
  type Measure,
  type Party,
  type PartyInvolvement,
  type PartyPosition,
  type Question,
  type Stance,
} from '../model/types';

export interface EngineConfig {
  /** Mínimo de preguntas de medidas antes de poder parar. */
  minAgreementQuestions: number;
  /** Máximo de preguntas de medidas. */
  maxAgreementQuestions: number;
  /** Probabilidad del líder a partir de la cual se considera decidido. */
  confidenceThreshold: number;
  /** Nitidez del modelo: cuánto pesa cada respuesta. */
  lambda: number;
  /** Cuánto pesa la corrupción probada a importancia 1 (escala con la importancia). */
  corruptionLambda: number;
  /** Años tras los que una condena pesa la mitad. */
  corruptionHalfLifeYears: number;
  /** Fecha de referencia para la antigüedad (ISO). Por defecto, hoy. */
  referenceDate?: string;
  /**
   * Peso de una posición sacada de declaraciones frente a una del programa
   * (que pesa 1). Menor que 1: el programa es el compromiso formal.
   */
  declarationWeight: number;
  /** Peso de una posición heredada de los miembros de una coalición. */
  inheritedWeight: number;
  /**
   * Fracción mínima de medidas con posición conocida para entrar en la
   * recomendación. Por debajo, el partido sale aparte, en "otros partidos que
   * te pueden interesar", si coincides con la mayoría de lo que sabemos de él.
   */
  minCoverage: number;
}

export const DEFAULT_CONFIG: EngineConfig = {
  minAgreementQuestions: 8,
  maxAgreementQuestions: 30,
  confidenceThreshold: 0.9,
  lambda: 3,
  corruptionLambda: 2,
  corruptionHalfLifeYears: 10,
  declarationWeight: 0.75,
  inheritedWeight: 0.75,
  minCoverage: 0.4,
};

const IMPORTANCE_WEIGHT: Record<Importance, number> = { 0: 0, 1: 0.5, 2: 1, 3: 2 };

const INVOLVEMENT_WEIGHT: Record<PartyInvolvement, number> = {
  persona_juridica_condenada: 1,
  comiso_al_partido: 0.8,
  participe_a_titulo_lucrativo: 0.6,
  responsable_civil_subsidiario: 0.6,
  cargos_condenados: 0.4,
};

// ---------------------------------------------------------------------------
// Índices y filtros de datos

/** Posiciones propias utilizables: verificadas, o cualquiera si el dataset es de ejemplo. */
function ownPositions(ds: Dataset): PartyPosition[] {
  return ds.positions.filter((p) => ds.meta.isSample || p.verification === 'verificado');
}

/** Mediana de las posturas, redondeada hacia el 0 si cae entre dos (la lectura más prudente). */
export function medianStance(stances: Stance[]): Stance {
  const s = [...stances].sort((a, b) => a - b);
  const mid = s.length / 2;
  const m = s.length % 2 ? s[Math.floor(mid)]! : (s[mid - 1]! + s[mid]!) / 2;
  return (Math.trunc(m) || 0) as Stance; // sin -0
}

/**
 * Posiciones que una coalición hereda de sus miembros: en cada medida en la
 * que no tiene posición propia, la mediana de las de sus miembros.
 */
function inheritedPositions(ds: Dataset, own: PartyPosition[]): PartyPosition[] {
  const byParty = new Map<string, Map<string, PartyPosition>>();
  for (const p of own) {
    if (!byParty.has(p.partyId)) byParty.set(p.partyId, new Map());
    byParty.get(p.partyId)!.set(p.measureId, p);
  }
  const out: PartyPosition[] = [];
  for (const party of ds.parties) {
    if (party.kind !== 'coalicion' || !party.members?.length) continue;
    for (const m of ds.measures) {
      if (byParty.get(party.id)?.has(m.id)) continue;
      const from = party.members.map((id) => byParty.get(id)?.get(m.id)).filter((p) => p !== undefined);
      if (from.length === 0) continue;
      out.push({
        partyId: party.id,
        measureId: m.id,
        stance: medianStance(from.map((p) => p.stance)),
        verification: 'verificado',
        inheritedFrom: from.map((p) => p.partyId),
      });
    }
  }
  return out;
}

/**
 * Posiciones que usa el motor: las propias verificadas (o todas en el dataset
 * de ejemplo) más las que las coaliciones heredan de sus miembros.
 */
export function usablePositions(ds: Dataset): PartyPosition[] {
  const own = ownPositions(ds);
  return [...own, ...inheritedPositions(ds, own)];
}

/** Casos que penalizan: sentencia firme y verificados (o de ejemplo). */
export function countableCases(ds: Dataset): CorruptionCase[] {
  return ds.corruptionCases.filter(
    (c) => c.status === 'sentencia_firme' && (ds.meta.isSample || c.verification === 'verificado'),
  );
}

/** Cuánto pesa una posición según su origen: 1 el programa, menos una declaración. */
export function positionWeight(p: PartyPosition, cfg: EngineConfig = DEFAULT_CONFIG): number {
  if (p.inheritedFrom) return cfg.inheritedWeight;
  return p.origin === 'declaracion' ? cfg.declarationWeight : 1;
}

/** ¿Presenta candidatura en la provincia del usuario (o en alguna, si no la ha dicho)? */
export function isOnBallot(party: Party, province?: string): boolean {
  if (!party.constituencies) return true;
  return province === undefined ? party.constituencies.length > 0 : party.constituencies.includes(province);
}

/** Fracción de medidas en las que se conoce la posición de cada partido (propia o heredada). */
function coverageByParty(ds: Dataset): Map<string, number> {
  const known = new Map<string, Set<string>>();
  for (const p of usablePositions(ds)) {
    if (!known.has(p.partyId)) known.set(p.partyId, new Set());
    known.get(p.partyId)!.add(p.measureId);
  }
  const n = ds.measures.length;
  return new Map(ds.parties.map((p) => [p.id, n === 0 ? 0 : (known.get(p.id)?.size ?? 0) / n]));
}

export function partyCoverage(ds: Dataset, partyId: string): number {
  return coverageByParty(ds).get(partyId) ?? 0;
}

/**
 * Reparte las candidaturas de la papeleta del usuario: las que entran en la
 * recomendación y las que conocemos demasiado poco para puntuarlas.
 */
export function ballot(
  ds: Dataset,
  answers: Pick<Answers, 'province'>,
  cfg: EngineConfig = DEFAULT_CONFIG,
): { competing: Party[]; sparse: Party[] } {
  const onBallot = ds.parties.filter((p) => isOnBallot(p, answers.province));
  const coverage = coverageByParty(ds);
  const competing = onBallot.filter((p) => (coverage.get(p.id) ?? 0) >= cfg.minCoverage);
  // Si en una provincia nadie llega al mínimo, se compara a todos antes que a ninguno.
  if (competing.length === 0) return { competing: onBallot, sparse: [] };
  return { competing, sparse: onBallot.filter((p) => !competing.includes(p)) };
}

type StanceIndex = Map<string, Map<string, { stance: Stance; weight: number }>>; // measureId -> partyId -> posición

function indexStances(ds: Dataset, cfg: EngineConfig): StanceIndex {
  const idx: StanceIndex = new Map();
  for (const p of usablePositions(ds)) {
    if (!idx.has(p.measureId)) idx.set(p.measureId, new Map());
    idx.get(p.measureId)!.set(p.partyId, { stance: p.stance, weight: positionWeight(p, cfg) });
  }
  return idx;
}

export function topicWeight(answers: Answers, topicId: string): number {
  const imp = answers.importance[topicId];
  return imp === undefined ? 1 : IMPORTANCE_WEIGHT[imp];
}

/** Fecha de la sentencia más reciente del caso (la que lo hace firme). */
function caseDate(c: CorruptionCase): Date | null {
  const dates = c.sources.filter((s) => s.kind === 'sentencia' && s.date).map((s) => new Date(s.date!).getTime());
  return dates.length ? new Date(Math.max(...dates)) : null;
}

/** Peso por antigüedad: 1 si es reciente, la mitad cada `corruptionHalfLifeYears`. */
export function caseRecencyWeight(c: CorruptionCase, cfg: EngineConfig = DEFAULT_CONFIG): number {
  const date = caseDate(c);
  if (!date) return 1;
  const now = cfg.referenceDate ? new Date(cfg.referenceDate) : new Date();
  const years = Math.max(0, (now.getTime() - date.getTime()) / (365.25 * 24 * 3600 * 1000));
  return 0.5 ** (years / cfg.corruptionHalfLifeYears);
}

/** Gravedad de un caso: tipo de implicación del partido × antigüedad. */
export function caseSeverity(c: CorruptionCase, cfg: EngineConfig = DEFAULT_CONFIG): number {
  return INVOLVEMENT_WEIGHT[c.involvement] * caseRecencyWeight(c, cfg);
}

export function corruptionPenalty(ds: Dataset, partyId: string, cfg: EngineConfig = DEFAULT_CONFIG): number {
  // Sin tope: cada condena suma, para que un partido con muchas tramas no
  // quede igualado con uno que tiene una o dos.
  return countableCases(ds)
    .filter((c) => c.partyIds.includes(partyId))
    .reduce((acc, c) => acc + caseSeverity(c, cfg), 0);
}

export function agreementBetween(user: Stance, party: Stance): number {
  return 1 - Math.abs(user - party) / 4;
}

// ---------------------------------------------------------------------------
// Creencias

function logScores(ds: Dataset, answers: Answers, cfg: EngineConfig, idx: StanceIndex): Map<string, number> {
  const measures = new Map(ds.measures.map((m) => [m.id, m]));
  const corrW = topicWeight(answers, CORRUPTION_KEY);
  const scores = new Map<string, number>();
  for (const party of ballot(ds, answers, cfg).competing) {
    let s = -cfg.corruptionLambda * corrW * corruptionPenalty(ds, party.id, cfg);
    for (const [measureId, user] of Object.entries(answers.agreement)) {
      if (user === null) continue;
      const m = measures.get(measureId);
      const pos = idx.get(measureId)?.get(party.id);
      if (!m || pos === undefined) continue; // sin posición conocida: no informa
      s += topicWeight(answers, m.topicId) * pos.weight * cfg.lambda * (agreementBetween(user, pos.stance) - 0.5);
    }
    scores.set(party.id, s);
  }
  return scores;
}

function softmax(scores: Map<string, number>): Map<string, number> {
  const max = Math.max(...scores.values());
  const exps = new Map([...scores].map(([k, v]) => [k, Math.exp(v - max)]));
  const z = [...exps.values()].reduce((a, b) => a + b, 0);
  return new Map([...exps].map(([k, v]) => [k, v / z]));
}

/** Probabilidad de que cada partido sea el más afín, dadas las respuestas. */
export function beliefs(ds: Dataset, answers: Answers, cfg: EngineConfig = DEFAULT_CONFIG): Map<string, number> {
  return softmax(logScores(ds, answers, cfg, indexStances(ds, cfg)));
}

function leader(b: Map<string, number>): [string, number] {
  return [...b].reduce((best, cur) => (cur[1] > best[1] ? cur : best));
}

// ---------------------------------------------------------------------------
// Selección de preguntas

function answeredCount(answers: Answers): number {
  return Object.keys(answers.agreement).length;
}

/** Medidas candidatas: no respondidas y de temas que al usuario le importan. */
function candidates(ds: Dataset, answers: Answers): Measure[] {
  return ds.measures.filter((m) => !(m.id in answers.agreement) && topicWeight(answers, m.topicId) > 0);
}

/** Cuánto separa una medida a los partidos plausibles ahora mismo. */
function discrimination(m: Measure, b: Map<string, number>, idx: StanceIndex, answers: Answers): number {
  const stances = idx.get(m.id);
  if (!stances || stances.size < 2) return 0;
  // Cada partido cuenta por su probabilidad y por la fiabilidad de su posición.
  let mass = 0;
  let mean = 0;
  for (const [pid, { stance, weight }] of stances) {
    const p = (b.get(pid) ?? 0) * weight;
    mass += p;
    mean += p * stance;
  }
  if (mass === 0) return 0;
  mean /= mass;
  let variance = 0;
  for (const [pid, { stance, weight }] of stances) variance += (((b.get(pid) ?? 0) * weight) / mass) * (stance - mean) ** 2;
  return topicWeight(answers, m.topicId) * variance;
}

function bestMeasure(ds: Dataset, answers: Answers, b: Map<string, number>, idx: StanceIndex): Measure | null {
  let best: Measure | null = null;
  let bestScore = 0;
  for (const m of candidates(ds, answers)) {
    const d = discrimination(m, b, idx, answers);
    if (d > bestScore) {
      best = m;
      bestScore = d;
    }
  }
  return best;
}

/** ¿Seguiría ganando el líder respondiera lo que respondiera a la medida `m`? */
function leaderIsRobust(ds: Dataset, answers: Answers, cfg: EngineConfig, m: Measure, leaderId: string): boolean {
  for (const s of [-2, -1, 0, 1, 2] as Stance[]) {
    const next = { ...answers, agreement: { ...answers.agreement, [m.id]: s } };
    if (leader(beliefs(ds, next, cfg))[0] !== leaderId) return false;
  }
  return true;
}

export function isFinished(ds: Dataset, answers: Answers, cfg: EngineConfig = DEFAULT_CONFIG): boolean {
  return nextQuestion(ds, answers, cfg) === null;
}

/**
 * Devuelve la siguiente pregunta o `null` si ya hay información suficiente.
 *
 * Fase 1: sensibilidad (importancia de cada tema y de la corrupción).
 * Fase 2: acuerdo con medidas, elegidas de forma adaptativa.
 */
export function nextQuestion(ds: Dataset, answers: Answers, cfg: EngineConfig = DEFAULT_CONFIG): Question | null {
  for (const t of ds.topics) {
    if (!(t.id in answers.importance)) {
      return { kind: 'importance', key: t.id, prompt: t.importancePrompt, topicName: t.name };
    }
  }
  if (!(CORRUPTION_KEY in answers.importance)) {
    return {
      kind: 'importance',
      key: CORRUPTION_KEY,
      prompt: '¿Cuánto debería pesar en tu voto que un partido tenga condenas firmes por corrupción?',
    };
  }

  const n = answeredCount(answers);
  if (n >= cfg.maxAgreementQuestions) return null;

  const idx = indexStances(ds, cfg);
  const b = beliefs(ds, answers, cfg);
  const next = bestMeasure(ds, answers, b, idx);
  if (!next) return null; // nada más que preguntar que pueda cambiar el resultado

  if (n >= cfg.minAgreementQuestions) {
    const [lid, lp] = leader(b);
    if (lp >= cfg.confidenceThreshold && leaderIsRobust(ds, answers, cfg, next, lid)) return null;
  }

  const topic = ds.topics.find((t) => t.id === next.topicId);
  return {
    kind: 'agreement',
    measureId: next.id,
    topicName: topic?.name ?? '',
    statement: next.statement,
    explainer: next.explainer,
  };
}
