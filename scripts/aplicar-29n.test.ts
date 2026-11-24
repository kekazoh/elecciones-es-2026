import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { aplicar29n, type Proposals } from './aplicar-29n';
import type { Party, PartyPosition } from '../src/model/types';

const src = (title: string) => ({ title, url: 'https://example.org/x.pdf', date: '2026-11-10' });
const positions: PartyPosition[] = [
  { partyId: 'pp', measureId: 'viv-1', stance: -2, source: src('2023'), verification: 'verificado', origin: 'declaracion', declarationKind: 'web_partido' },
  { partyId: 'pp', measureId: 'eco-3', stance: 1, source: src('2023'), verification: 'verificado' },
];
const parties = [{ id: 'pp', name: 'PP', shortName: 'PP', color: '#000', program: src('2023') }] as Party[];
const proposals: Proposals = {
  programs: { pp: src('29N') },
  positions: [
    { partyId: 'pp', measureId: 'viv-1', stance: -2, source: src('29N'), verification: 'verificado' },
    { partyId: 'pp', measureId: 'inm-1', stance: -2, source: src('29N'), verification: 'pendiente' },
  ],
};

describe('aplicar las posiciones del 29N', () => {
  it('sustituye solo las verificadas, en su sitio, y quita el origen de declaración', () => {
    const r = aplicar29n(positions, proposals, parties);
    expect(r.positions).toHaveLength(2);
    expect(r.positions[0]).toEqual(proposals.positions[0]);
    expect(r.positions[1]).toBe(positions[1]);
    expect(r.proposals.positions.map((p) => p.measureId)).toEqual(['inm-1']);
    expect(r.parties[0]?.program?.title).toBe('29N');
  });

  it('con --todas aplica también las pendientes, ya verificadas, y vacía el fichero', () => {
    const r = aplicar29n(positions, proposals, parties, true);
    expect(r.positions).toHaveLength(3);
    expect(r.positions[2]).toMatchObject({ measureId: 'inm-1', verification: 'verificado' });
    expect(r.proposals).toEqual({ programs: {}, positions: [] });
  });

  it('no toca el programa del partido si no se aplica nada suyo', () => {
    const r = aplicar29n(positions, { ...proposals, positions: [proposals.positions[1]!] }, parties);
    expect(r.parties[0]?.program?.title).toBe('2023');
  });
});

describe('propuestas del 29N en el repositorio', () => {
  const file = JSON.parse(readFileSync(new URL('../src/data/real/positions-29n.json', import.meta.url), 'utf8')) as Proposals;
  const measures = new Set(
    (JSON.parse(readFileSync(new URL('../src/data/real/measures.json', import.meta.url), 'utf8')) as { id: string }[]).map((m) => m.id),
  );

  it('cada propuesta tiene programa, medida conocida, cita y página, sin duplicados', () => {
    const seen = new Set<string>();
    for (const p of file.positions) {
      const k = `${p.partyId}/${p.measureId}`;
      expect(seen.has(k), k).toBe(false);
      seen.add(k);
      expect(measures.has(p.measureId), k).toBe(true);
      expect(file.programs[p.partyId]?.url, k).toBe(p.source?.url);
      expect(p.source?.quote, k).toBeTruthy();
      expect(p.source?.locator, k).toMatch(/^págs?\. \d/);
      expect(p.origin, k).toBeUndefined();
    }
  });
});
