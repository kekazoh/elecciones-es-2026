import { describe, expect, it } from 'vitest';
import { sampleDataset } from '../data/ejemplo';
import { validateDataset } from '../data/validate';
import { CORRUPTION_KEY, type Answers, type Dataset } from '../model/types';
import { DEFAULT_CONFIG, beliefs, caseRecencyWeight, nextQuestion } from './engine';
import { buildReport } from './report';

const empty = (): Answers => ({ importance: {}, agreement: {} });

function answerAs(ds: Dataset, partyId: string, importance = 2): Answers {
  const a = empty();
  for (let q = nextQuestion(ds, a); q; q = nextQuestion(ds, a)) {
    if (q.kind === 'importance') a.importance[q.key] = importance as 0 | 1 | 2 | 3;
    else a.agreement[q.measureId] = ds.positions.find((p) => p.partyId === partyId && p.measureId === q.measureId)!.stance;
  }
  return a;
}

describe('dataset de ejemplo', () => {
  it('es válido y neutral', () => {
    expect(validateDataset(sampleDataset)).toEqual([]);
  });

  it('detecta preguntas que nombran a un partido', () => {
    const ds = structuredClone(sampleDataset);
    ds.measures[0]!.statement = 'El Partido Ámbar tiene razón en esto.';
    expect(validateDataset(ds).some((e) => e.includes('menciona a un partido'))).toBe(true);
  });
});

describe('cuestionario', () => {
  it('pregunta primero la sensibilidad por tema y luego por corrupción', () => {
    const a = empty();
    for (const t of sampleDataset.topics) {
      const q = nextQuestion(sampleDataset, a);
      expect(q).toMatchObject({ kind: 'importance', key: t.id });
      a.importance[t.id] = 2;
    }
    expect(nextQuestion(sampleDataset, a)).toMatchObject({ kind: 'importance', key: CORRUPTION_KEY });
  });

  it('las preguntas no revelan partidos', () => {
    const a = answerAs(sampleDataset, 'cobalto');
    const json = JSON.stringify(nextQuestion(sampleDataset, { importance: a.importance, agreement: {} }));
    for (const p of sampleDataset.parties) expect(json).not.toContain(p.id);
  });

  it('no pregunta por temas que no le importan al usuario', () => {
    const a = empty();
    for (const t of sampleDataset.topics) a.importance[t.id] = t.id === 'vivienda' ? 0 : 2;
    a.importance[CORRUPTION_KEY] = 0;
    for (let q = nextQuestion(sampleDataset, a); q; q = nextQuestion(sampleDataset, a)) {
      expect(q.kind).toBe('agreement');
      if (q.kind === 'agreement') {
        expect(q.measureId.startsWith('viv')).toBe(false);
        a.agreement[q.measureId] = 0;
      }
    }
  });

  it.each(sampleDataset.parties.map((p) => p.id))('recomienda %s a quien piensa exactamente como él', (pid) => {
    const a = answerAs(sampleDataset, pid, 2);
    a.importance[CORRUPTION_KEY] = 0;
    expect(buildReport(sampleDataset, a).recommended.party.id).toBe(pid);
  });

  it('termina antes de agotar todas las medidas cuando el perfil es claro', () => {
    const a = answerAs(sampleDataset, 'ambar');
    expect(Object.keys(a.agreement).length).toBeLessThan(sampleDataset.measures.length);
  });

  it('"no lo sé" no cuenta como respuesta informativa', () => {
    const a = empty();
    for (const t of sampleDataset.topics) a.importance[t.id] = 2;
    a.importance[CORRUPTION_KEY] = 0;
    a.agreement['eco-1'] = null;
    const b = beliefs(sampleDataset, a);
    for (const p of b.values()) expect(p).toBeCloseTo(1 / sampleDataset.parties.length);
  });
});

describe('corrupción', () => {
  it('solo penalizan las sentencias firmes', () => {
    const a = empty();
    for (const t of sampleDataset.topics) a.importance[t.id] = 2;
    a.importance[CORRUPTION_KEY] = 3;
    const r = buildReport(sampleDataset, a);
    const byId = new Map(r.ranking.map((x) => [x.party.id, x]));
    expect(byId.get('dalia')!.corruptionPenalty).toBeGreaterThan(0);
    expect(byId.get('ambar')!.corruptionPenalty).toBe(0); // solo instrucción
  });

  it('en datos reales ignora casos no verificados', () => {
    const ds: Dataset = { ...structuredClone(sampleDataset), meta: { ...sampleDataset.meta, isSample: false } };
    const a = empty();
    a.importance[CORRUPTION_KEY] = 3;
    const r = buildReport(ds, a);
    for (const x of r.ranking) expect(x.corruptionPenalty).toBe(0);
  });

  it('una sensibilidad alta puede cambiar la recomendación', () => {
    const a = answerAs(sampleDataset, 'dalia', 1);
    const stance = (pid: string, mid: string) => sampleDataset.positions.find((p) => p.partyId === pid && p.measureId === mid)!.stance;
    // usuario entre Cobalto y Dalia, algo más cerca de Dalia
    sampleDataset.measures.forEach((m, i) => {
      a.agreement[m.id] = stance(i % 3 === 0 ? 'cobalto' : 'dalia', m.id);
    });
    a.importance[CORRUPTION_KEY] = 0;
    const indifferent = buildReport(sampleDataset, a).recommended.party.id;
    a.importance[CORRUPTION_KEY] = 3;
    expect(indifferent).toBe('dalia');
    expect(buildReport(sampleDataset, a).recommended.party.id).toBe('cobalto');
  });
});

describe('gravedad de la corrupción', () => {
  it('una condena pesa la mitad cada 10 años', () => {
    const c = sampleDataset.corruptionCases[0]!; // sentencia de 2020-01-01
    expect(caseRecencyWeight(c, { ...DEFAULT_CONFIG, referenceDate: '2020-01-01' })).toBeCloseTo(1);
    expect(caseRecencyWeight(c, { ...DEFAULT_CONFIG, referenceDate: '2030-01-01' })).toBeCloseTo(0.5, 2);
  });

  it('el informe dice qué partido saldría sin la corrupción si cambia el resultado', () => {
    const a = answerAs(sampleDataset, 'dalia', 1);
    const stance = (pid: string, mid: string) => sampleDataset.positions.find((p) => p.partyId === pid && p.measureId === mid)!.stance;
    sampleDataset.measures.forEach((m, i) => {
      a.agreement[m.id] = stance(i % 3 === 0 ? 'cobalto' : 'dalia', m.id);
    });
    a.importance[CORRUPTION_KEY] = 3;
    const r = buildReport(sampleDataset, a);
    expect(r.recommended.party.id).toBe('cobalto');
    expect(r.recommendedIgnoringCorruption?.id).toBe('dalia');
    a.importance[CORRUPTION_KEY] = 0;
    expect(buildReport(sampleDataset, a).recommendedIgnoringCorruption).toBeUndefined();
  });
});

describe('informe', () => {
  it('incluye medidas que respaldan la recomendación con su fuente', () => {
    const r = buildReport(sampleDataset, answerAs(sampleDataset, 'esmeralda'));
    expect(r.supporting.length).toBeGreaterThan(0);
    for (const m of r.supporting) {
      expect(Math.sign(m.userStance)).toBe(Math.sign(m.partyStance));
      expect(m.source).toBeDefined();
    }
  });
});

describe('coincidencia y cobertura', () => {
  it('la coincidencia mostrada ordena igual que la recomendación si la corrupción no pesa', () => {
    const ds = structuredClone(sampleDataset);
    // "esmeralda" solo tiene posición en unas pocas medidas
    const keep = new Set(ds.measures.slice(0, 3).map((m) => m.id));
    ds.positions = ds.positions.filter((p) => p.partyId !== 'esmeralda' || keep.has(p.measureId));
    const a = answerAs(sampleDataset, 'esmeralda');
    a.importance[CORRUPTION_KEY] = 0;
    for (const m of ds.measures) {
      const st = sampleDataset.positions.find((p) => p.partyId === 'esmeralda' && p.measureId === m.id)!.stance;
      a.agreement[m.id] = st;
    }
    const r = buildReport(ds, a);
    const esm = r.ranking.find((x) => x.party.id === 'esmeralda')!;
    expect(esm.knownAffinity).toBe(1);
    expect(esm.coverage).toBe(3);
    expect(r.measuresRated).toBe(ds.measures.length);
    for (let i = 1; i < r.ranking.length; i++) {
      expect(r.ranking[i - 1]!.affinity).toBeGreaterThanOrEqual(r.ranking[i]!.affinity - 1e-9);
    }
    expect(r.recommended.affinity).toBeGreaterThanOrEqual(esm.affinity);
  });
});

describe('posiciones por declaraciones', () => {
  it('cuentan menos que las del programa', () => {
    const ds = structuredClone(sampleDataset);
    const [a, b] = ds.parties;
    const m = ds.measures[0]!;
    ds.positions = [
      { partyId: a!.id, measureId: m.id, stance: 2, verification: 'verificado', source: { title: 'Programa', url: 'https://example.org/p' } },
      {
        partyId: b!.id,
        measureId: m.id,
        stance: 2,
        verification: 'verificado',
        origin: 'declaracion',
        declarationKind: 'parlamento',
        source: { title: 'Diario de Sesiones', url: 'https://example.org/d', date: '2025-01-01', quote: 'cita' },
      },
    ];
    ds.corruptionCases = [];
    const answers: Answers = { importance: {}, agreement: { [m.id]: 2 } };
    const p = beliefs(ds, answers);
    expect(p.get(a!.id)!).toBeGreaterThan(p.get(b!.id)!);
    expect(p.get(b!.id)!).toBeGreaterThan(p.get(ds.parties[2]!.id)!);

    const r = buildReport(ds, answers);
    const rb = r.ranking.find((x) => x.party.id === b!.id)!;
    expect(rb.fromDeclarations).toBe(1);
    expect(rb.affinity).toBeCloseTo(0.5 + 0.5 * DEFAULT_CONFIG.declarationWeight);
  });

  it('el validador exige enlace, cita, fecha y tipo de fuente', () => {
    const ds = structuredClone(sampleDataset);
    ds.positions.push({ partyId: ds.parties[0]!.id, measureId: 'no-existe', stance: 1, verification: 'pendiente', origin: 'declaracion' });
    const errors = validateDataset(ds);
    expect(errors.some((e) => e.includes('declaración sin enlace'))).toBe(true);
    expect(errors.some((e) => e.includes('sin tipo de fuente'))).toBe(true);
  });
});
