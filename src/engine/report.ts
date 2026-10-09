/**
 * Informe final. Solo se construye cuando el cuestionario ha terminado: es el
 * único punto en el que la app revela partidos.
 */
import { CORRUPTION_KEY } from '../model/types';
import type { Answers, CorruptionCase, Dataset, Party, PartyPosition, SourceRef, Stance } from '../model/types';
import {
  DEFAULT_CONFIG,
  agreementBetween,
  beliefs,
  corruptionPenalty,
  countableCases,
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
  weight: number;
  source?: SourceRef;
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

function matchesFor(ds: Dataset, answers: Answers, partyId: string, positions: PartyPosition[]): MeasureMatch[] {
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
      weight: topicWeight(answers, m.topicId),
      source: pos.source,
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
      const matches = matchesFor(ds, answers, party.id, positions);
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
  const recMatches = matchesFor(ds, answers, recommended.party.id, positions);
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
