/**
 * Comprobaciones de integridad y de neutralidad del dataset.
 * Devuelve la lista de problemas; vacía = dataset válido.
 */
import type { Dataset } from '../model/types';

const OFFICIAL_HOSTS = [
  'poderjudicial.es', // CENDOJ / CGPJ
  'boe.es',
  'tribunalconstitucional.es',
  'tcu.es', // Tribunal de Cuentas
  'fiscal.es',
  'curia.europa.eu',
];

export function validateDataset(ds: Dataset): string[] {
  const errors: string[] = [];
  const topicIds = new Set(ds.topics.map((t) => t.id));
  const measureIds = new Set(ds.measures.map((m) => m.id));
  const partyIds = new Set(ds.parties.map((p) => p.id));

  const dupes = (ids: string[], what: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${what} duplicado: ${id}`);
      seen.add(id);
    }
  };
  dupes(ds.topics.map((t) => t.id), 'Tema');
  dupes(ds.measures.map((m) => m.id), 'Medida');
  dupes(ds.parties.map((p) => p.id), 'Partido');

  for (const m of ds.measures) {
    if (!topicIds.has(m.topicId)) errors.push(`Medida ${m.id}: tema desconocido ${m.topicId}`);
  }

  // Neutralidad: ninguna pregunta puede nombrar a un partido.
  const names = ds.parties.flatMap((p) => [p.name, p.shortName]).map((n) => n.toLowerCase());
  const texts = [
    ...ds.measures.map((m) => [m.id, `${m.statement} ${m.explainer ?? ''}`] as const),
    ...ds.topics.map((t) => [t.id, t.importancePrompt] as const),
  ];
  for (const [id, text] of texts) {
    const lower = text.toLowerCase();
    for (const n of names) {
      if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'u').test(lower)) {
        errors.push(`Pregunta ${id} menciona a un partido ("${n}")`);
      }
    }
  }

  const seenPos = new Set<string>();
  for (const p of ds.positions) {
    const key = `${p.partyId}/${p.measureId}`;
    if (!partyIds.has(p.partyId)) errors.push(`Posición ${key}: partido desconocido`);
    if (!measureIds.has(p.measureId)) errors.push(`Posición ${key}: medida desconocida`);
    if (seenPos.has(key)) errors.push(`Posición duplicada ${key}`);
    seenPos.add(key);
    if (p.verification === 'verificado' && !p.source?.url) {
      errors.push(`Posición ${key}: marcada como verificada sin fuente`);
    }
  }

  for (const c of ds.corruptionCases) {
    for (const pid of c.partyIds) if (!partyIds.has(pid)) errors.push(`Caso ${c.id}: partido desconocido ${pid}`);
    if (c.verification !== 'verificado') continue;
    if (c.sources.length === 0) errors.push(`Caso ${c.id}: verificado sin fuentes`);
    if (c.status === 'sentencia_firme' && !c.sources.some((s) => s.kind === 'sentencia')) {
      errors.push(`Caso ${c.id}: sentencia firme sin enlazar la sentencia`);
    }
    if (!ds.meta.isSample) {
      for (const s of c.sources) {
        let host = '';
        try {
          host = new URL(s.url).hostname;
        } catch {
          errors.push(`Caso ${c.id}: URL inválida ${s.url}`);
          continue;
        }
        if (!OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
          errors.push(`Caso ${c.id}: fuente no oficial (${host}); usa CENDOJ, BOE u otro órgano oficial`);
        }
      }
      if (!c.lastReviewed) errors.push(`Caso ${c.id}: falta lastReviewed`);
    }
  }
  return errors;
}
