import { describe, expect, it } from 'vitest';
import { cabezasDeLista } from './cabezas-de-lista';
import type { Party } from '../src/model/types';

const parties = [
  { id: 'psoe', shortName: 'PSOE' },
  { id: 'upn-pp', shortName: 'UPN-PP' },
] as Party[];
const lists = [
  { province: '31', partyId: 'upn-pp', name: 'UNIÓN DEL PUEBLO NAVARRO EN COALICIÓN CON PARTIDO POPULAR', acronym: 'UPN-PP', candidates: ['Ana Uno (UPN)', 'Luis Dos'], substitutes: [] },
  { province: '31', partyId: 'psoe', name: 'PARTIDO SOCIALISTA OBRERO ESPAÑOL', acronym: 'PSOE', candidates: ['Pere Quatre'], substitutes: [] },
  { province: '31', partyId: 'pcte', name: 'PCTE', candidates: [], substitutes: [], note: 'Candidatura inadmitida.' },
];

describe('cabezas de lista', () => {
  const md = cabezasDeLista({ source: { url: 'https://www.boe.es/x', date: '2026-10-28' }, lists }, parties);

  it('pone el primer candidato de cada lista en el resumen', () => {
    expect(md).toContain('| Navarra | Pere Quatre | — | — | — | — | — | UPN-PP: Ana Uno (UPN) |');
  });

  it('lista todas las candidaturas de la provincia, también las inadmitidas', () => {
    expect(md).toContain('| PARTIDO SOCIALISTA OBRERO ESPAÑOL (PSOE) | Pere Quatre |');
    expect(md).toContain('| PCTE | — Candidatura inadmitida. |');
  });

  it('no cuenta las inadmitidas', () => {
    expect(md).toContain('2 candidaturas en 1 provincias');
  });
});
