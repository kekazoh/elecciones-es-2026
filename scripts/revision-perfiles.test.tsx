import { describe, expect, it } from 'vitest';
import { checkProfiles } from './revision-perfiles';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeadProfileView, findProfile } from '../src/ui/HeadProfile';
import type { CandidateProfile } from '../src/model/types';

describe('perfiles de cabezas de lista', () => {
  it('cada perfil encabeza su lista y todo dato tiene fuente', () => {
    expect(checkProfiles()).toEqual([]);
  });

  it('solo se muestran los perfiles revisados', () => {
    const base = { name: 'Ana Uno', lists: [{ province: '28', partyId: 'pp' }], current: [], career: [], education: [], judicial: [] };
    const pendiente = [{ ...base, verification: 'pendiente' }] as CandidateProfile[];
    const verificado = [{ ...base, verification: 'verificado' }] as CandidateProfile[];
    expect(findProfile(pendiente, 'Ana Uno', 'pp', '28')).toBeNull();
    expect(findProfile(verificado, 'Ana Uno', 'pp', '28')?.name).toBe('Ana Uno');
    expect(findProfile(verificado, 'Ana Uno', 'pp', '08')).toBeNull();
  });
});

describe('ficha del cabeza de lista', () => {
  const src = { title: 'Fuente', url: 'https://example.org' };
  const p = {
    name: 'Ana Uno', lists: [{ province: '28', partyId: 'pp' }], verification: 'verificado', judicialChecked: '2026-10-28',
    current: [{ text: 'Alcaldesa', source: src }], career: [], education: [],
    judicial: [
      { name: 'Caso A', kind: 'penal', corruption: true, stage: 'investigado', summary: 'Abierto.', sources: [src] },
      { name: 'Caso B', kind: 'penal', corruption: false, stage: 'archivado', summary: 'Cerrado.', sources: [src] },
    ],
  } as CandidateProfile;

  it('enseña las causas abiertas y oculta las archivadas', () => {
    const html = renderToStaticMarkup(<HeadProfileView p={p} />);
    expect(html).toContain('Alcaldesa');
    expect(html).toContain('Caso A');
    expect(html).not.toContain('Caso B');
  });
});
