/**
 * Simula usuarios "perfectos" (que responden exactamente como un partido) y
 * usuarios con ruido, para comprobar que el cuestionario acierta y cuántas
 * preguntas necesita.
 */
import { sampleDataset as ds } from '../src/data/ejemplo';
import { nextQuestion } from '../src/engine/engine';
import { buildReport } from '../src/engine/report';
import type { Answers, Stance } from '../src/model/types';

function run(target: string, noise: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const answers: Answers = { importance: {}, agreement: {} };
  for (let q = nextQuestion(ds, answers); q; q = nextQuestion(ds, answers)) {
    if (q.kind === 'importance') answers.importance[q.key] = 2;
    else {
      const st = ds.positions.find((p) => p.partyId === target && p.measureId === q.measureId)!.stance;
      const jitter = rand() < noise ? (rand() < 0.5 ? -1 : 1) : 0;
      answers.agreement[q.measureId] = Math.max(-2, Math.min(2, st + jitter)) as Stance;
    }
  }
  const r = buildReport(ds, answers);
  return { ok: r.recommended.party.id === target, n: r.questionsAnswered };
}

for (const noise of [0, 0.3, 0.6]) {
  const rows = ds.parties.map((p) => {
    const runs = Array.from({ length: 20 }, (_, i) => run(p.id, noise, i + 1));
    const acc = runs.filter((r) => r.ok).length / runs.length;
    const avg = runs.reduce((a, r) => a + r.n, 0) / runs.length;
    return `${p.shortName.padEnd(10)} acierto ${(acc * 100).toFixed(0).padStart(3)}%  preguntas ${avg.toFixed(1)}`;
  });
  console.log(`\nRuido ${noise * 100}%\n${rows.join('\n')}`);
}
