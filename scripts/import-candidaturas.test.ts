import { describe, expect, it } from 'vitest';
import { parseBoe } from './import-candidaturas';

const xml = `<documento><metadatos><identificador>BOE-A-2026-1</identificador><fecha_publicacion>20261028</fecha_publicacion></metadatos><texto>
<p class="centro_negrita">JUNTA ELECTORAL DE NAVARRA</p>
<p class="centro_cursiva">CONGRESO DE LOS DIPUTADOS</p>
<p class="centro_redonda">1.&#8195;UNIÓN DEL PUEBLO NAVARRO EN COALICIÓN CON PARTIDO POPULAR (UPN-PP)</p>
<p class="parrafo_2">1.&#8195;Ana Uno (UPN).</p>
<p class="parrafo">2.&#8195;
      Luis Dos. (Independiente).</p>
<p class="parrafo_2">Suplentes:</p>
<p class="parrafo_2">1.&#8195;Eva Tres.</p>
<p class="centro_redonda">2.&#8195;PARTIDO COMUNISTA DE LOS TRABAJADORES DE ESPAÑA (PCTE)</p>
<p class="parrafo_2">Candidatura inadmitida por acuerdo de la Junta Electoral Provincial de Navarra.</p>
<p class="centro_redonda">3.&#8195;PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE) (PSC)</p>
<p class="parrafo_2">1.&#8195;Pere Quatre.</p>
<p class="centro_cursiva">SENADO</p>
<p class="centro_redonda">1.&#8195;VOX (VOX)</p>
<p class="parrafo_2">1.&#8195;No Cuenta.</p>
<p class="centro_negrita">JUNTA ELECTORAL DE ILLES BALEARS</p>
<p class="centro_cursiva">CONGRESO DE LOS DIPUTADOS</p>
<p class="centro_redonda">1.&#8195;POR UN MUNDO MÁS JUSTO/BIDIZKO MUNDURANTZ (SIGLAS)</p>
<p class="parrafo_2">1.&#8195;Sara Cinco.</p>
</texto></documento>`;

describe('importación de candidaturas del BOE', () => {
  const { id, date, lists } = parseBoe(xml);

  it('lee la disposición y solo las candidaturas al Congreso', () => {
    expect(id).toBe('BOE-A-2026-1');
    expect(date).toBe('2026-10-28');
    expect(lists.map((l) => [l.province, l.partyId])).toEqual([
      ['31', 'upn-pp'],
      ['31', 'pcte'],
      ['31', 'psoe'],
      ['07', 'mundo-mas-justo'],
    ]);
  });

  it('separa candidatos y suplentes, en orden', () => {
    expect(lists[0]).toMatchObject({
      acronym: 'UPN-PP',
      candidates: ['Ana Uno (UPN)', 'Luis Dos (Independiente)'],
      substitutes: ['Eva Tres'],
    });
  });

  it('guarda el aviso de una candidatura inadmitida, sin candidatos', () => {
    expect(lists[1]!.candidates).toEqual([]);
    expect(lists[1]!.note).toMatch(/inadmitida/);
  });

  it('toma como siglas el último paréntesis', () => {
    expect(lists[2]).toMatchObject({ name: 'PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE)', acronym: 'PSC' });
  });
});
