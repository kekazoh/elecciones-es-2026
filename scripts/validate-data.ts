import { sampleDataset } from '../src/data/ejemplo';
import { validateDataset } from '../src/data/validate';

const errors = validateDataset(sampleDataset);
const pending = {
  positions: sampleDataset.positions.filter((p) => p.verification === 'pendiente').length,
  cases: sampleDataset.corruptionCases.filter((c) => c.verification === 'pendiente').length,
};
console.log(`Dataset: ${sampleDataset.meta.election} (${sampleDataset.meta.version})`);
console.log(`Pendientes de verificar: ${pending.positions} posiciones, ${pending.cases} casos`);
if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log('✓ Dataset válido');
