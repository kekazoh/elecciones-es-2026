import type { Dataset } from '../../model/types';
import meta from './meta.json';
import topics from './topics.json';
import measures from './measures.json';
import parties from './parties.json';
import positions from './positions.json';
import corruptionCases from './corruption-cases.json';

/**
 * Dataset real. Las posiciones salen de los programas de las generales de 2023
 * (o anteriores) y de declaraciones; las de los programas del 29N esperan
 * revisión en positions-29n.json (ver docs/FUENTES.md y docs/REVISION-29N.md).
 */
export const realDataset = {
  meta,
  topics,
  measures,
  parties,
  positions,
  corruptionCases,
} as Dataset;
