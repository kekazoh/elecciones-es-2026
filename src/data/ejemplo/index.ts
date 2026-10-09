import type { Dataset } from '../../model/types';
import meta from './meta.json';
import topics from './topics.json';
import measures from './measures.json';
import parties from './parties.json';
import positions from './positions.json';
import corruptionCases from './corruption-cases.json';

/** Dataset ficticio de demostración. Partidos, posiciones y casos son inventados. */
export const sampleDataset = {
  meta,
  topics,
  measures,
  parties,
  positions,
  corruptionCases,
} as Dataset;
