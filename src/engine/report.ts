/**
 * Informe final. Solo se construye cuando el cuestionario ha terminado: es el
 * único punto en el que la app revela partidos.
 */
import { CORRUPTION_KEY } from '../model/types';
import type {
  Answers,
  CorruptionCase,
  Dataset,
  Party,
  PartyPosition,
  PositionOrigin,
  SourceRef,
  Stance,
} from '../model/types';
import {
  DEFAULT_CONFIG,
  agreementBetween,
  beliefs,
  caseSeverity,
  corruptionPenalty,
  countableCases,
  positionWeight,
  topicWeight,
  usablePositions,
  type EngineConfig,
} from './engine';

export interface MeasureMatch {
  measureId: string;
  topicName: string;
  statement: string;
  userStance: Stance;
  partyStance: Stance;
  /** 0..1, 1 = coincidencia total. */
  agreement: number;
  /** Peso del tema × peso del origen de la posición (programa 1, declaración menos). */
  weight: number;
  source?: SourceRef;
  origin: PositionOrigin;
  speaker?: string;
}

export interface PartyResult {
  party: Party;
  /** Probabilidad del modelo, incluye la penalización por corrupción. */
  probability: number;
  /**
   * % de coincidencia ponderada en todas las medidas respondidas (sin
   * corrupción). Donde no se conoce la posición del partido cuenta como 50 %,
   * igual que en el motor, así que ordena a los partidos igual que la
   * recomendación cuando la corrupción no pesa.
   */
  affinity: number;
  /** % de coincidencia ponderada solo en las medidas con posición conocida. */
  knownAffinity: number;
  /** Medidas respondidas en las que el partido tiene posición conocida. */
  coverage: number;
  /** De esas, cuántas salen de declaraciones y no del programa. */
  fromDeclarations: number;
  corruptionPenalty: number;
  corruptionCases: CorruptionCase[];
  topicAffinity: { topicId: string; topicName: string; affinity: number; weight: number }[];
}

export interface Report {
  isSample: boolean;
  questionsAnswered: number;
  /** Medidas respondidas con una postura (sin contar "No lo sé"). */
  measuresRated: number;
  ranking: PartyResult[];
  recommended: PartyResult;
  /**
   * Partido que saldría si no se tuviera en cuenta la corrupción, solo cuando
   * es distinto del recomendado. Se muestra para que el efecto sea transparente.
   */
  recommendedIgnoringCorruption?: Party;
  /** Medidas que más respaldan la recomendación. */
  supporting: MeasureMatch[];
  /** Medidas en las que discrepas del partido recomendado. */
  divergences: MeasureMatch[];
}

function matchesFor(
  ds: Dataset,
  answers: Answers,
  partyId: string,
  positions: PartyPosition[],
  cfg: EngineConfig,
): MeasureMatch[] {
  const byMeasure = new Map(positions.filter((p) => p.partyId === partyId).map((p) => [p.measureId, p]));
  const topics = new Map(ds.topics.map((t) => [t.id, t]));
  const out: MeasureMatch[] = [];
  for (const m of ds.measures) {
    const user = answers.agreement[m.id];
    const pos = byMeasure.get(m.id);
    if (user === undefined || user === null || !pos) continue;
    out.push({
      measureId: m.id,
      topicName: topics.get(m.topicId)?.name ?? '',
      statement: m.statement,
      userStance: user,
      partyStance: pos.stance,
      agreement: agreementBetween(user, pos.stance),
      weight: topicWeight(answers, m.topicId) * positionWeight(pos, cfg),
      source: pos.source,
      origin: pos.origin ?? 'programa',
      speaker: pos.speaker,
    });
  }
  return out;
}

function weightedAffinity(matches: MeasureMatch[]): number {
  const w = matches.reduce((a, m) => a + m.weight, 0);
  return w === 0 ? 0 : matches.reduce((a, m) => a + m.weight * m.agreement, 0) / w;
}

/** Peso total de las medidas respondidas con postura: el denominador común a todos los partidos. */
function ratedWeight(ds: Dataset, answers: Answers): number {
  return ds.measures
    .filter((m) => answers.agreement[m.id] !== undefined && answers.agreement[m.id] !== null)
    .reduce((a, m) => a + topicWeight(answers, m.topicId), 0);
}

/** Coincidencia en todas las medidas respondidas; las de posición desconocida cuentan 0,5 (como en el motor). */
function overallAffinity(matches: MeasureMatch[], totalWeight: number): number {
  if (totalWeight === 0) return 0;
  return 0.5 + matches.reduce((a, m) => a + m.weight * (m.agreement - 0.5), 0) / totalWeight;
}

export function buildReport(ds: Dataset, answers: Answers, cfg: EngineConfig = DEFAULT_CONFIG): Report {
  const b = beliefs(ds, answers, cfg);
  const positions = usablePositions(ds);
  const cases = countableCases(ds);
  const measureTopic = new Map(ds.measures.map((m) => [m.id, m.topicId]));
  const totalWeight = ratedWeight(ds, answers);

  const ranking: PartyResult[] = ds.parties
    .map((party) => {
      const matches = matchesFor(ds, answers, party.id, positions, cfg);
      const topicAffinity = ds.topics
        .map((t) => {
          const tm = matches.filter((m) => measureTopic.get(m.measureId) === t.id);
          return { topicId: t.id, topicName: t.name, affinity: weightedAffinity(tm), weight: topicWeight(answers, t.id), n: tm.length };
        })
        .filter((t) => t.n > 0)
        .map(({ n: _n, ...rest }) => rest);
      return {
        party,
        probability: b.get(party.id) ?? 0,
        affinity: overallAffinity(matches, totalWeight),
        knownAffinity: weightedAffinity(matches),
        coverage: matches.length,
        fromDeclarations: matches.filter((m) => m.origin === 'declaracion').length,
        corruptionPenalty: corruptionPenalty(ds, party.id, cfg),
        corruptionCases: cases.filter((c) => c.partyIds.includes(party.id)),
        topicAffinity,
      };
    })
    .sort((a, b2) => b2.probability - a.probability);

  const recommended = ranking[0]!;
  const noCorruption = beliefs(ds, { ...answers, importance: { ...answers.importance, [CORRUPTION_KEY]: 0 } }, cfg);
  const [altId] = [...noCorruption].reduce((best, cur) => (cur[1] > best[1] ? cur : best));
  const alt = altId !== recommended.party.id ? ds.parties.find((p) => p.id === altId) : undefined;
  const recMatches = matchesFor(ds, answers, recommended.party.id, positions, cfg);
  const byImpact = (m: MeasureMatch) => m.weight * (m.agreement - 0.5) * (1 + Math.abs(m.userStance) / 2);

  return {
    isSample: ds.meta.isSample,
    questionsAnswered: Object.keys(answers.agreement).length,
    measuresRated: ds.measures.filter((m) => answers.agreement[m.id] !== undefined && answers.agreement[m.id] !== null).length,
    ranking,
    recommended,
    recommendedIgnoringCorruption: alt,
    supporting: recMatches
      .filter((m) => m.weight > 0 && m.userStance !== 0 && Math.sign(m.userStance) === Math.sign(m.partyStance))
      .sort((x, y) => byImpact(y) - byImpact(x))
      .slice(0, 6),
    divergences: recMatches
      .filter((m) => m.agreement <= 0.25 && m.weight > 0)
      .sort((x, y) => byImpact(x) - byImpact(y))
      .slice(0, 3),
  };
}

// ---------------------------------------------------------------------------
// Segundo informe: el partido que el usuario ya piensa votar

export interface Contradiction extends MeasureMatch {
  /** Puntos de coincidencia (0..1) que esta medida le quita frente a coincidir del todo. */
  cost: number;
  /** El partido está en el lado contrario, no solo más tibio. */
  opposite: boolean;
}

export interface ChoiceCase {
  case: CorruptionCase;
  /** Gravedad usada por el motor: tipo de implicación × antigüedad. */
  severity: number;
}

export interface ChoiceReport {
  chosen: PartyResult;
  /** Puesto del partido elegido en tu ranking (1 = el más afín). */
  rank: number;
  recommended: PartyResult;
  /** Medidas en las que el partido elegido va contra lo que respondiste, de más a menos peso. */
  contradictions: Contradiction[];
  /** Temas que te importan en los que el elegido encaja claramente peor que tu más afín. */
  topicGaps: { topicId: string; topicName: string; chosen: number; recommended: number; weight: number }[];
  /** Condenas firmes que restan en la recomendación. */
  cases: ChoiceCase[];
  /** Casos del partido que no cuentan (sin sentencia firme o sin verificar). */
  otherCases: CorruptionCase[];
  /** Peso que diste a la corrupción (0 = no cuenta). */
  corruptionWeight: number;
  /** Puesto que tendría si la corrupción no pesara. */
  rankIgnoringCorruption: number;
  /** Medidas que valoraste en las que no conocemos su posición. */
  unknown: number;
}

function rankOf(b: Map<string, number>, partyId: string): number {
  const p = b.get(partyId) ?? 0;
  return [...b.values()].filter((v) => v > p).length + 1;
}

/**
 * Por qué el partido elegido no es el más afín: qué medidas suyas contradicen
 * tus respuestas (pesadas por la importancia que diste a cada tema y por si
 * salen del programa o de declaraciones) y qué condenas le restan.
 */
export function buildChoiceReport(
  ds: Dataset,
  answers: Answers,
  partyId: string,
  cfg: EngineConfig = DEFAULT_CONFIG,
): ChoiceReport {
  const report = buildReport(ds, answers, cfg);
  const chosen = report.ranking.find((r) => r.party.id === partyId);
  if (!chosen) throw new Error(`Partido desconocido: ${partyId}`);
  const recommended = report.recommended;
  const totalWeight = ratedWeight(ds, answers);

  const contradictions = matchesFor(ds, answers, partyId, usablePositions(ds), cfg)
    .filter((m) => m.weight > 0 && m.userStance !== 0 && m.agreement <= 0.5)
    .map((m) => ({
      ...m,
      cost: totalWeight === 0 ? 0 : (m.weight * (1 - m.agreement)) / totalWeight,
      opposite: m.partyStance !== 0 && Math.sign(m.partyStance) !== Math.sign(m.userStance),
    }))
    .sort((x, y) => y.cost - x.cost || Math.abs(y.userStance) - Math.abs(x.userStance));

  const recTopics = new Map(recommended.topicAffinity.map((t) => [t.topicId, t.affinity]));
  const topicGaps = chosen.topicAffinity
    .filter((t) => t.weight > 0 && recTopics.has(t.topicId) && recTopics.get(t.topicId)! - t.affinity >= 0.1)
    .map((t) => ({ topicId: t.topicId, topicName: t.topicName, chosen: t.affinity, recommended: recTopics.get(t.topicId)!, weight: t.weight }))
    .sort((x, y) => y.weight * (y.recommended - y.chosen) - x.weight * (x.recommended - x.chosen));

  const counted = new Set(chosen.corruptionCases.map((c) => c.id));
  const noCorruption = beliefs(ds, { ...answers, importance: { ...answers.importance, [CORRUPTION_KEY]: 0 } }, cfg);

  return {
    chosen,
    rank: report.ranking.indexOf(chosen) + 1,
    recommended,
    contradictions,
    topicGaps,
    cases: chosen.corruptionCases
      .map((c) => ({ case: c, severity: caseSeverity(c, cfg) }))
      .sort((x, y) => y.severity - x.severity),
    otherCases: ds.corruptionCases.filter(
      (c) => c.partyIds.includes(partyId) && !counted.has(c.id) && c.status !== 'archivado',
    ),
    corruptionWeight: topicWeight(answers, CORRUPTION_KEY),
    rankIgnoringCorruption: rankOf(noCorruption, partyId),
    unknown: report.measuresRated - chosen.coverage,
  };
}
