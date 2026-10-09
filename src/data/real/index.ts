import type { Dataset } from '../../model/types';
import meta from './meta.json';
import topics from './topics.json';
import measures from './measures.json';
import parties from './parties.json';
import positions from './positions.json';
import corruptionCases from './corruption-cases.json';

/**
 * Dataset real. Las posiciones se codifican a partir de los programas de las
 * generales de 2023 hasta que se publiquen los nuevos (ver docs/FUENTES.md).
 */
export const realDataset = {
  meta,
  topics,
  measures,
  parties,
  positions,
  corruptionCases,
} as Dataset;
