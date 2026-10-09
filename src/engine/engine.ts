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
}

export const DEFAULT_CONFIG: EngineConfig = {
  minAgreementQuestions: 8,
  maxAgreementQuestions: 30,
  confidenceThreshold: 0.9,
  lambda: 3,
  corruptionLambda: 2,
};

const IMPORTANCE_WEIGHT: Record<Importance, number> = { 0: 0, 1: 0.5, 2: 1, 3: 2 };

const INVOLVEMENT_WEIGHT: Record<PartyInvolvement, number> = {
  persona_juridica_condenada: 1,
  participe_a_titulo_lucrativo: 0.6,
  cargos_condenados: 0.4,
};

// ---------------------------------------------------------------------------
// Índices y filtros de datos

/** Posiciones utilizables: verificadas, o cualquiera si el dataset es de ejemplo. */
export function usablePositions(ds: Dataset): PartyPosition[] {
  return ds.positions.filter((p) => ds.meta.isSample || p.verification === 'verificado');
}

/** Casos que penalizan: sentencia firme y verificados (o de ejemplo). */
export function countableCases(ds: Dataset): CorruptionCase[] {
  return ds.corruptionCases.filter(
    (c) => c.status === 'sentencia_firme' && (ds.meta.isSample || c.verification === 'verificado'),
  );
}

type StanceIndex = Map<string, Map<string, Stance>>; // measureId -> partyId -> stance

function indexStances(ds: Dataset): StanceIndex {
  const idx: StanceIndex = new Map();
  for (const p of usablePositions(ds)) {
    if (!idx.has(p.measureId)) idx.set(p.measureId, new Map());
    idx.get(p.measureId)!.set(p.partyId, p.stance);
  }
  return idx;
}

export function topicWeight(answers: Answers, topicId: string): number {
  const imp = answers.importance[topicId];
  return imp === undefined ? 1 : IMPORTANCE_WEIGHT[imp];
}

export function corruptionPenalty(ds: Dataset, partyId: string): number {
  const total = countableCases(ds)
    .filter((c) => c.partyIds.includes(partyId))
    .reduce((acc, c) => acc + INVOLVEMENT_WEIGHT[c.involvement], 0);
  return Math.min(1, total);
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
  for (const party of ds.parties) {
    let s = -cfg.corruptionLambda * corrW * corruptionPenalty(ds, party.id);
    for (const [measureId, user] of Object.entries(answers.agreement)) {
      if (user === null) continue;
      const m = measures.get(measureId);
      const stance = idx.get(measureId)?.get(party.id);
      if (!m || stance === undefined) continue; // sin posición conocida: no informa
      s += topicWeight(answers, m.topicId) * cfg.lambda * (agreementBetween(user, stance) - 0.5);
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
  return softmax(logScores(ds, answers, cfg, indexStances(ds)));
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
  let mass = 0;
  let mean = 0;
  for (const [pid, s] of stances) {
    const p = b.get(pid) ?? 0;
    mass += p;
    mean += p * s;
  }
  if (mass === 0) return 0;
  mean /= mass;
  let variance = 0;
  for (const [pid, s] of stances) variance += ((b.get(pid) ?? 0) / mass) * (s - mean) ** 2;
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

  const idx = indexStances(ds);
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
