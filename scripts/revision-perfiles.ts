/**
 * Comprueba src/data/real/candidate-profiles.json y genera
 * docs/REVISION-PERFILES.md para revisarlos a mano.
 *
 *   npm run revision-perfiles
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PROVINCE_NAME } from '../src/data/provinces';
import type { CandidacyList, CandidateProfile, JudicialStage, Party, SourceRef } from '../src/model/types';

const read = <T>(path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as T;
const profiles = read<CandidateProfile[]>('../src/data/real/candidate-profiles.json');
const { lists } = read<{ lists: CandidacyList[] }>('../src/data/real/candidacies.json');
const parties = read<Party[]>('../src/data/real/parties.json');
const short = new Map(parties.map((p) => [p.id, p.shortName]));

const STAGE: Record<JudicialStage, string> = {
  investigado: 'investigado',
  juicio: 'en juicio',
  condenado_no_firme: 'condenado (no firme)',
  condenado_firme: 'condenado (firme)',
  absuelto: 'absuelto',
  archivado: 'archivado',
};

/** Errores de forma: cada perfil debe ser el cabeza de lista que dice ser y todo dato, tener fuente. */
export function checkProfiles(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const hasUrl = (s: SourceRef) => /^https:\/\//.test(s.url);
  for (const p of profiles) {
    if (seen.has(p.name)) errors.push(`${p.name}: perfil repetido`);
    seen.add(p.name);
    for (const { province, partyId } of p.lists) {
      const list = lists.find((l) => l.province === province && l.partyId === partyId && l.candidates.length > 0);
      if (list?.candidates[0] !== p.name) errors.push(`${p.name}: no encabeza la lista de ${partyId} en ${province}`);
    }
    for (const item of [...p.current, ...p.career, ...p.education]) {
      if (!hasUrl(item.source)) errors.push(`${p.name}: «${item.text}» sin fuente`);
    }
    for (const j of p.judicial) {
      if (!STAGE[j.stage]) errors.push(`${p.name}: estado desconocido en «${j.name}»`);
      if (j.sources.filter(hasUrl).length < 1) errors.push(`${p.name}: «${j.name}» sin fuente`);
    }
  }
  return errors;
}

function render(): string {
  const link = (s: SourceRef) => `[${s.title}](${s.url})`;
  const out = [
    '# Revisión de los perfiles de los cabezas de lista',
    '',
    '<!-- Generado por `npm run revision-perfiles` a partir de src/data/real/candidate-profiles.json. No editar a mano. -->',
    '',
    `${profiles.length} perfiles, ${profiles.filter((p) => p.verification === 'verificado').length} revisados. ` +
      'Criterios en [FUENTES.md](FUENTES.md#perfiles-de-los-cabezas-de-lista).',
  ];
  for (const p of profiles) {
    const where = p.lists.map((l) => `${short.get(l.partyId) ?? l.partyId} en ${PROVINCE_NAME.get(l.province)}`).join(', ');
    out.push('', `## ${p.name}`, '', `${where} · ${p.verification}`, '');
    const section = (title: string, items: CandidateProfile['career']) => {
      if (!items.length) return;
      out.push(`**${title}**`, '');
      for (const i of items) out.push(`- ${i.period ? `${i.period}: ` : ''}${i.text} (${link(i.source)})`);
      out.push('');
    };
    section('Ahora', p.current);
    section('Trayectoria', p.career);
    section('Formación', p.education);
    out.push(
      `**Procedimientos judiciales** (${p.judicialChecked ? `búsqueda del ${p.judicialChecked}` : 'sin buscar'})`,
      '',
    );
    if (!p.judicial.length) out.push(p.judicialChecked ? '- No consta ninguno.' : '- No se han buscado.');
    for (const j of p.judicial) {
      out.push(
        `- ${j.name}: ${j.kind}${j.corruption ? ', corrupción' : ''}, ${STAGE[j.stage]}. ${j.summary} ` +
          `(${j.sources.map(link).join('; ')})`,
      );
    }
    if (p.notes) out.push('', `*Notas:* ${p.notes}`);
  }
  return out.join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = checkProfiles();
  if (errors.length) {
    console.error(errors.map((e) => `✗ ${e}`).join('\n'));
    process.exit(1);
  }
  writeFileSync(new URL('../docs/REVISION-PERFILES.md', import.meta.url), render());
  console.log(`${profiles.length} perfiles ✓`);
}
