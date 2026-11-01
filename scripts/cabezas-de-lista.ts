/**
 * Genera docs/CABEZAS-DE-LISTA.md: quién encabeza cada candidatura al Congreso
 * en cada provincia. Sale de src/data/real/candidacies.json (el primer
 * candidato de cada lista del BOE), así que no hay que tocarlo a mano: se
 * regenera al importar las candidaturas o con
 *
 *   npm run cabezas-de-lista
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PROVINCES } from '../src/data/provinces';
import type { CandidacyList, Party } from '../src/model/types';

const PARTIES_PATH = new URL('../src/data/real/parties.json', import.meta.url);
const CANDIDACIES_PATH = new URL('../src/data/real/candidacies.json', import.meta.url);
const DOC_PATH = new URL('../docs/CABEZAS-DE-LISTA.md', import.meta.url);

/** Columnas del resumen: candidaturas que se presentan en casi todo el país. */
const NATIONAL = ['psoe', 'pp', 'vox', 'frente-amplio', 'podemos', 'salf'];

/**
 * Candidaturas de ámbito autonómico con representación en la XV legislatura,
 * o coaliciones que las incluyen. Van juntas en la última columna del resumen.
 */
const REGIONAL = ['erc', 'junts', 'bildu', 'pnv', 'bng', 'cc-1can', 'upn-pp', 'upc', 'compromis-fv'];

const cell = (s: string) => s.replace(/\|/g, '\\|');

export function cabezasDeLista(
  candidacies: { source: { url: string; date: string }; lists: CandidacyList[] },
  parties: Party[],
): string {
  const short = new Map(parties.map((p) => [p.id, p.shortName]));
  const label = (l: CandidacyList) => short.get(l.partyId) ?? l.acronym ?? l.name;
  const head = (l?: CandidacyList) => (l && l.candidates[0]) || '—';
  const date = new Date(candidacies.source.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const valid = candidacies.lists.filter((l) => l.candidates.length > 0);

  const out: string[] = [
    '# Cabezas de lista al Congreso',
    '',
    '<!-- Generado por `npm run cabezas-de-lista` a partir de src/data/real/candidacies.json. No editar a mano. -->',
    '',
    `Primer candidato de cada lista según el [BOE del ${date}](${candidacies.source.url}) ` +
      `(candidaturas presentadas; pueden cambiar hasta la proclamación). ` +
      `${valid.length} candidaturas en ${new Set(valid.map((l) => l.province)).size} provincias. ` +
      'Los nombres son los del BOE, sin completar ni corregir.',
    '',
    '## Resumen',
    '',
    `| Provincia | ${NATIONAL.map((id) => short.get(id) ?? id).join(' | ')} | Autonómicas |`,
    `|---|${NATIONAL.map(() => '---|').join('')}---|`,
  ];
  for (const { code, name } of PROVINCES) {
    const here = valid.filter((l) => l.province === code);
    const regional = here
      .filter((l) => REGIONAL.includes(l.partyId))
      .map((l) => `${label(l)}: ${head(l)}`)
      .join('; ');
    const cols = NATIONAL.map((id) => cell(head(here.find((l) => l.partyId === id))));
    out.push(`| ${name} | ${cols.join(' | ')} | ${cell(regional) || '—'} |`);
  }

  out.push('', '## Todas las candidaturas por provincia', '', 'En el orden en que salen en el BOE.');
  for (const { code, name } of PROVINCES) {
    out.push('', `### ${name}`, '', '| Candidatura | Cabeza de lista |', '|---|---|');
    for (const l of candidacies.lists.filter((x) => x.province === code)) {
      const what = l.acronym && l.acronym.toUpperCase() !== l.name.toUpperCase() ? `${l.name} (${l.acronym})` : l.name;
      out.push(`| ${cell(what)} | ${l.candidates.length ? cell(l.candidates[0]!) : `— ${cell(l.note ?? 'sin candidatos')}`} |`);
    }
  }
  return out.join('\n') + '\n';
}

export function writeCabezasDeLista() {
  const candidacies = JSON.parse(readFileSync(CANDIDACIES_PATH, 'utf8'));
  const parties = JSON.parse(readFileSync(PARTIES_PATH, 'utf8')) as Party[];
  writeFileSync(DOC_PATH, cabezasDeLista(candidacies, parties));
}

if (import.meta.url === `file://${process.argv[1]}`) writeCabezasDeLista();
