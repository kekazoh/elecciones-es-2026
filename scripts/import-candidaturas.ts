/**
 * Importa las candidaturas al Congreso publicadas en el BOE y actualiza:
 *
 * - src/data/real/candidacies.json: cada lista por provincia, con sus
 *   candidatos y suplentes en orden.
 * - docs/CABEZAS-DE-LISTA.md: el primer candidato de cada lista.
 * - src/data/real/parties.json: en qué provincias se presenta cada partido
 *   (`constituencies`) y las candidaturas nuevas, sin posiciones (la app las
 *   trata como "pocos datos").
 *
 *   npm run import-candidaturas -- BOE-A-2026-22607     (descarga del BOE)
 *   npm run import-candidaturas -- ruta/al/fichero.xml   (XML ya descargado)
 *
 * Las candidaturas se asignan a un partido del dataset con RULES. Las que no
 * casan con ninguna regla entran como partidos nuevos, agrupadas por siglas.
 * Las coaliciones (miembros incluidos) se declaran a mano en CURATED: el BOE
 * da su nombre, pero no qué partidos las forman.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PROVINCES } from '../src/data/provinces';
import type { CandidacyList, Party } from '../src/model/types';
import { writeCabezasDeLista } from './cabezas-de-lista';

const PARTIES_PATH = new URL('../src/data/real/parties.json', import.meta.url);
const CANDIDACIES_PATH = new URL('../src/data/real/candidacies.json', import.meta.url);

/** Color de las candidaturas sin color propio: neutro, para no sugerir nada. */
const NEUTRAL = '#8a8a8a';

/**
 * Partido del dataset al que corresponde cada denominación del BOE. Se prueban
 * en orden contra "DENOMINACIÓN (SIGLAS)" sin tildes y en mayúsculas.
 */
const RULES: [RegExp, string][] = [
  [/UNION DEL PUEBLO NAVARRO EN COALICION CON PARTIDO POPULAR/, 'upn-pp'],
  [/^PARTIDO POPULAR\b|^PARTIT POPULAR/, 'pp'],
  [/\b(PSOE|PSC)\b/, 'psoe'],
  [/^VOX\b/, 'vox'],
  [/UNIDAD DEL PUEBLO CANARIO/, 'upc'],
  [/^COMPROMIS: FRONT VALENCIA/, 'compromis-fv'],
  [/FRENTE AMPLI|FRONT AMPLI|FRONTE AMPLA|FRONTE ZABALA/, 'frente-amplio'],
  [/^PODEMOS\b/, 'podemos'],
  [/^ESQUERRA REPUBLICANA DE CATALUNYA/, 'erc'],
  [/^JUNTS PER CATALUNYA/, 'junts'],
  [/^EUSKAL HERRIA BILDU/, 'bildu'],
  [/^EUZKO ALDERDI JELTZALEA/, 'pnv'],
  [/^BLOQUE NACIONALISTA GALEGO/, 'bng'],
  [/COALICION CANARIA/, 'cc-1can'],
  // Mismos partidos con nombres o siglas que cambian por provincia o idioma.
  [/MUNDO (MAS JUSTO|MAIS XUSTO)/, 'mundo-mas-justo'],
  [/^FALANGE ESPANOLA DE LAS JONS/, 'falange'],
  [/^ESCANOS EN BLANCO/, 'escanos-en-blanco'],
  [/^PARTI(DO|T) ANIMALISTA/, 'pacma'],
  [/^PARTI(DO|T) COMUNISTA D(E LOS|ELS|OS) TR[AE]BA(JADORES|LLADORS|LLADORES)/, 'pcte'],
  [/^SE ACABO LA FIESTA/, 'salf'],
  [/^FRENTE OBRERO/, 'frente-obrero'],
  [/^FEDERACION DE LOS INDEPENDIENTES DE ARAGON/, 'fia'],
  [/^NUEVO EXTREMENISMO/, 'nex'],
  [/^PARTIDO REGIONALISTA DEL PAIS LEONES/, 'prepal'],
];

/** Coaliciones y nombres que no se pueden sacar del BOE. */
const CURATED: Record<string, Partial<Party>> = {
  'frente-amplio': {
    name: 'Frente Amplio',
    shortName: 'FA',
    kind: 'coalicion',
    // Sumar, IU, Más Madrid y Comuns, con socios distintos en cada comunidad.
    // Solo Sumar está en el dataset.
    members: ['sumar'],
  },
  upc: {
    name: 'Unidad del Pueblo Canario',
    shortName: 'UPC',
    kind: 'coalicion',
    // Nueva Canarias-BC, Podemos, IU y Sumar.
    members: ['podemos', 'sumar'],
  },
  'compromis-fv': {
    name: 'Compromís: Front Valencià',
    shortName: 'Compromís',
    kind: 'coalicion',
    // Compromís, EUPV, Podem y ERPV. Compromís no está en el dataset y heredar
    // solo de Podemos le daría sus posturas: queda sin miembros hasta decidirlo.
  },
  'upn-pp': {
    name: 'Unión del Pueblo Navarro en coalición con Partido Popular',
    shortName: 'UPN-PP',
    kind: 'coalicion',
    members: ['upn', 'pp'],
  },
  // Nombres que el BOE da sin tildes o con mayúsculas que el título no arregla.
  'mundo-mas-justo': { name: 'Por un Mundo Más Justo' },
  falange: { name: 'Falange Española de las JONS', shortName: 'FE de las JONS' },
  fia: { name: 'Federación de los Independientes de Aragón' },
  prepal: { name: 'Partido Regionalista del País Leonés' },
  uc: { name: 'Unión Cartaginense' },
  'pancal-urci': { name: 'Partido Nacionalista de Castilla y León-Unión Reformista Ciudadana' },
  'cc-1can': {
    name: 'Coalición Canaria-Municipalistas Primero Canarias',
    shortName: 'CCa-1.ºCAN',
    kind: 'coalicion',
    members: ['cc'],
  },
};

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();

const clean = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();

const LOWER = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'en', 'con', 'para', 'por', 'a', 'al', 'dos', 'da', 'do', 'das', 'i', 'amb', 'per']);
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i > 0 && LOWER.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

const slug = (s: string) =>
  fold(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Código INE a partir del nombre de la Junta Electoral Provincial. */
function provinceCode(junta: string): string {
  const name = fold(junta.replace(/^JUNTA ELECTORAL DE\s+/i, ''));
  const hit = PROVINCES.find((p) => fold(p.name).split('/').some((n) => n === name || n.replace(/^(A|LA|LAS|ILLES) /, '') === name.replace(/^(A|LA|LAS|ILLES) /, '')));
  if (!hit) throw new Error(`Provincia desconocida: ${junta}`);
  return hit.code;
}

interface Parsed {
  id: string;
  date: string;
  lists: CandidacyList[];
}

/** Lee las candidaturas al Congreso del XML de la disposición del BOE. */
export function parseBoe(xml: string): Parsed {
  const id = /<identificador>([^<]+)</.exec(xml)?.[1] ?? '';
  const date = /<fecha_publicacion>(\d{4})(\d{2})(\d{2})</.exec(xml)?.slice(1).join('-') ?? '';
  const paragraphs = [...xml.matchAll(/<p class="([^"]+)">([\s\S]*?)<\/p>/g)].map((m) => ({ cls: m[1]!, text: clean(m[2]!) }));

  const lists: CandidacyList[] = [];
  let province: string | null = null;
  let congress = false;
  let current: CandidacyList | null = null;
  let inSubstitutes = false;

  for (const { cls, text } of paragraphs) {
    if (cls === 'centro_negrita' && /^JUNTA ELECTORAL DE/i.test(text)) {
      province = provinceCode(text);
      congress = false;
      current = null;
      continue;
    }
    if (cls === 'centro_cursiva') {
      congress = /^CONGRESO/i.test(text);
      current = null;
      continue;
    }
    if (!congress || !province) continue;
    if (cls === 'centro_redonda') {
      const full = text.replace(/^\d+\.\s*/, '');
      // "DENOMINACIÓN (SIGLAS)"; las siglas son el último paréntesis.
      const m = /^(.*?)\s*\(([^()]*(?:\([^()]*\))?[^()]*)\)\s*(?:\[.*\])?$/.exec(full);
      current = {
        province,
        partyId: '',
        name: m ? m[1]! : full,
        acronym: m ? m[2] : undefined,
        candidates: [],
        substitutes: [],
      };
      current.partyId = partyIdFor(full, current.acronym);
      lists.push(current);
      inSubstitutes = false;
      continue;
    }
    if (!current) continue;
    if (/^Suplentes:?$/i.test(text)) {
      inSubstitutes = true;
      continue;
    }
    if (current.candidates.length === 0 && /inadmitid|retirad|excluid/i.test(text)) {
      current.note = text;
      continue;
    }
    const cand = /^\d+\.\s*(.+?)\.?$/.exec(text);
    if (cand) (inSubstitutes ? current.substitutes : current.candidates).push(cand[1]!.replace(/\.\s*\(/, ' ('));
  }
  return { id, date, lists };
}

function partyIdFor(full: string, acronym?: string): string {
  const key = fold(full);
  for (const [re, id] of RULES) if (re.test(key)) return id;
  // Siglas que no sirven de id ("SIGLAS", solo números): se usa la denominación.
  const usable = acronym && !/^SIGLAS$/i.test(acronym) && /[A-Za-z]/.test(acronym);
  return slug(usable ? acronym : full.replace(/\s*\(.*$/, ''));
}

async function load(arg: string): Promise<string> {
  if (/^BOE-A-\d{4}-\d+$/.test(arg)) {
    const res = await fetch(`https://www.boe.es/diario_boe/xml.php?id=${arg}`);
    if (!res.ok) throw new Error(`BOE ${arg}: HTTP ${res.status}`);
    return res.text();
  }
  return readFileSync(arg, 'utf8');
}

async function main() {
  const arg = process.argv[2];
  if (!arg) throw new Error('Uso: npm run import-candidaturas -- <BOE-A-…|fichero.xml>');
  const { id, date, lists } = parseBoe(await load(arg));
  if (lists.length === 0) throw new Error('No se ha encontrado ninguna candidatura al Congreso');

  const parties = JSON.parse(readFileSync(PARTIES_PATH, 'utf8')) as Party[];
  const byId = new Map(parties.map((p) => [p.id, p]));
  const provincesOf = new Map<string, Set<string>>();
  for (const l of lists) {
    if (l.candidates.length === 0) continue; // inadmitida o vacía: no está en la papeleta
    if (!provincesOf.has(l.partyId)) provincesOf.set(l.partyId, new Set());
    provincesOf.get(l.partyId)!.add(l.province);
  }

  // Partidos del dataset: dónde se presentan con candidatura propia (vacía = solo en coalición).
  for (const p of parties) {
    p.constituencies = [...(provincesOf.get(p.id) ?? [])].sort();
  }
  // Candidaturas nuevas.
  const added: string[] = [];
  for (const [pid, provs] of provincesOf) {
    if (byId.has(pid)) continue;
    const sample = lists.filter((l) => l.partyId === pid);
    // El nombre más repetido entre provincias.
    const names = new Map<string, number>();
    for (const l of sample) names.set(l.name, (names.get(l.name) ?? 0) + 1);
    const name = [...names].sort((a, b) => b[1] - a[1])[0]![0];
    const acronym = sample[0]!.acronym;
    const curated = CURATED[pid] ?? {};
    const party: Party = {
      id: pid,
      name: titleCase(name),
      // Siglas cortas tal cual; las que son el nombre entero, en minúsculas como el nombre.
      shortName: acronym && /[A-Za-z]/.test(acronym) && !/^SIGLAS$/i.test(acronym)
        ? (/\s/.test(acronym) ? titleCase(acronym) : acronym)
        : titleCase(name),
      // Una coalición toma el color de su primer miembro; el resto, neutro.
      color: byId.get(curated.members?.[0] ?? '')?.color ?? NEUTRAL,
      ...curated,
      constituencies: [...provs].sort(),
    };
    parties.push(party);
    byId.set(pid, party);
    added.push(pid);
  }

  writeFileSync(PARTIES_PATH, JSON.stringify(parties, null, 2) + '\n');
  writeFileSync(
    CANDIDACIES_PATH,
    JSON.stringify(
      {
        source: {
          title: 'Candidaturas presentadas a las elecciones al Congreso de los Diputados (BOE)',
          url: `https://www.boe.es/diario_boe/txt.php?id=${id}`,
          date,
        },
        lists,
      },
      null,
      1,
    ) + '\n',
  );

  writeCabezasDeLista();

  console.log(`${id}: ${lists.length} candidaturas al Congreso en ${new Set(lists.map((l) => l.province)).size} provincias`);
  console.log(`Partidos nuevos (${added.length}): ${added.join(', ')}`);
  const missing = parties.filter((p) => p.constituencies?.length === 0).map((p) => p.id);
  if (missing.length) console.log(`Sin candidatura propia: ${missing.join(', ')}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
