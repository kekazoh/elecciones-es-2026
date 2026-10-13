/**
 * Genera src/ui/province-paths.ts: el contorno SVG de cada provincia, con
 * Canarias en recuadro. Los datos salen de es-atlas (Instituto Geográfico
 * Nacional). Solo hace falta volver a ejecutarlo si cambian los contornos.
 *
 *   npm run map
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { geoPath } from 'd3-geo';
import type { geoConicConformalSpain as Spain } from 'd3-composite-projections';
// El paquete publica un UMD que Node no carga como módulo: se importa la fuente.
// @ts-expect-error sin tipos; son los de `geoConicConformalSpain`.
import conicConformalSpain from 'd3-composite-projections/src/conicConformalSpain.js';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';

const require = createRequire(import.meta.url);
const topo = require('es-atlas/es/provinces.json') as Topology<{ provinces: GeometryCollection<{ name: string }> }>;

const WIDTH = 600;
const HEIGHT = 480;
const provinces = feature(topo, topo.objects.provinces);
// Gibraltar (54) no es circunscripción.
provinces.features = provinces.features.filter((f) => f.id !== '54');

const geoConicConformalSpain = conicConformalSpain as typeof Spain;
const projection = geoConicConformalSpain().fitSize([WIDTH, HEIGHT], provinces);
const path = geoPath(projection).digits(1);

const rows = provinces.features
  .map((f) => ({ id: String(f.id), d: path(f) ?? '', c: path.centroid(f).map((n) => Math.round(n)) }))
  .sort((a, b) => a.id.localeCompare(b.id));

const out = `// Generado por scripts/build-map.ts a partir de es-atlas (IGN). No editar a mano.
export const MAP_VIEWBOX = '0 0 ${WIDTH} ${HEIGHT}';
/** Línea que separa el recuadro de Canarias. */
export const CANARIAS_FRAME = '${projection.getCompositionBorders().replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1))}';
/** Contorno de cada provincia, por código INE. */
export const PROVINCE_PATHS: Record<string, string> = {
${rows.map((r) => `  '${r.id}': '${r.d}',`).join('\n')}
};
/** Centro aproximado de cada provincia (para marcar las que son demasiado pequeñas). */
export const PROVINCE_CENTROIDS: Record<string, [number, number]> = {
${rows.map((r) => `  '${r.id}': [${r.c.join(', ')}],`).join('\n')}
};
`;
writeFileSync(new URL('../src/ui/province-paths.ts', import.meta.url), out);
console.log(`${rows.length} provincias, ${(out.length / 1024).toFixed(0)} KB`);
