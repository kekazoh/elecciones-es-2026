/**
 * Aplica las posiciones revisadas de los programas del 29N.
 *
 * Las propuestas están en src/data/real/positions-29n.json, todas `pendiente`
 * hasta que una persona las revisa (docs/REVISION-29N.md). Las que se marcan
 * `verificado` sustituyen en positions.json a la posición de ese partido y
 * medida, sea del programa anterior o una declaración; el partido pasa a citar
 * su programa del 29N en parties.json y la propuesta sale del fichero.
 *
 *   npm run aplicar-29n              # solo las marcadas `verificado`
 *   npm run aplicar-29n -- --todas   # también las pendientes, que entran verificadas
 */
import { readFileSync, writeFileSync } from 'node:fs';
import type { Party, PartyPosition, SourceRef } from '../src/model/types';

const POSITIONS_PATH = new URL('../src/data/real/positions.json', import.meta.url);
const PROPOSALS_PATH = new URL('../src/data/real/positions-29n.json', import.meta.url);
const PARTIES_PATH = new URL('../src/data/real/parties.json', import.meta.url);

export interface Proposals {
  programs: Record<string, SourceRef>;
  positions: PartyPosition[];
}

const key = (p: PartyPosition) => `${p.partyId}/${p.measureId}`;

export function aplicar29n(
  positions: PartyPosition[],
  proposals: Proposals,
  parties: Party[],
  todas = false,
): { positions: PartyPosition[]; proposals: Proposals; parties: Party[]; applied: PartyPosition[] } {
  const applied = proposals.positions
    .filter((p) => todas || p.verification === 'verificado')
    .map((p): PartyPosition => ({ ...p, verification: 'verificado' }));
  const byKey = new Map(applied.map((p) => [key(p), p]));

  // Sustituye en su sitio para que el diff de positions.json sea legible.
  const next = positions.map((p) => byKey.get(key(p)) ?? p);
  const existing = new Set(positions.map(key));
  next.push(...applied.filter((p) => !existing.has(key(p))));

  const touched = new Set(applied.map((p) => p.partyId));
  const nextParties = parties.map((party) => {
    const program = proposals.programs[party.id];
    return touched.has(party.id) && program ? { ...party, program } : party;
  });

  const rest = proposals.positions.filter((p) => !byKey.has(key(p)));
  const programs = Object.fromEntries(
    Object.entries(proposals.programs).filter(([id]) => rest.some((p) => p.partyId === id)),
  );
  return { positions: next, proposals: { programs, positions: rest }, parties: nextParties, applied };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const read = <T>(url: URL) => JSON.parse(readFileSync(url, 'utf8')) as T;
  const write = (url: URL, data: unknown) => writeFileSync(url, `${JSON.stringify(data, null, 2)}\n`);
  const result = aplicar29n(
    read<PartyPosition[]>(POSITIONS_PATH),
    read<Proposals>(PROPOSALS_PATH),
    read<Party[]>(PARTIES_PATH),
    process.argv.includes('--todas'),
  );
  write(POSITIONS_PATH, result.positions);
  write(PROPOSALS_PATH, result.proposals);
  write(PARTIES_PATH, result.parties);
  console.log(
    `Aplicadas ${result.applied.length} posiciones; quedan ${result.proposals.positions.length} propuestas pendientes.`,
  );
}
