import { sampleDataset } from '../src/data/ejemplo';
import { realDataset } from '../src/data/real';
import { validateDataset } from '../src/data/validate';

let failed = false;
for (const ds of [sampleDataset, realDataset]) {
  const errors = validateDataset(ds);
  const pending = {
    positions: ds.positions.filter((p) => p.verification === 'pendiente').length,
    cases: ds.corruptionCases.filter((c) => c.verification === 'pendiente').length,
  };
  console.log(`\n${ds.meta.election} (${ds.meta.version})`);
  console.log(`  ${ds.parties.length} partidos, ${ds.positions.length} posiciones, ${ds.corruptionCases.length} casos`);
  console.log(`  Pendientes de verificar: ${pending.positions} posiciones, ${pending.cases} casos`);
  if (errors.length) {
    failed = true;
    console.error(errors.map((e) => `  ✗ ${e}`).join('\n'));
  } else console.log('  ✓ válido');
}
if (failed) process.exit(1);
