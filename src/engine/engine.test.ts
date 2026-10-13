import { describe, expect, it } from 'vitest';
import { sampleDataset } from '../data/ejemplo';
import { validateDataset } from '../data/validate';
import { CORRUPTION_KEY, type Answers, type Dataset, type Stance } from '../model/types';
import { DEFAULT_CONFIG, ballot, beliefs, caseRecencyWeight, medianStance, nextQuestion, usablePositions } from './engine';
import { buildChoiceReport, buildReport } from './report';

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
    // "esmeralda" solo tiene posición en 10 de 24 medidas: le faltan muchas, pero llega al mínimo para entrar
    const keep = new Set(ds.measures.slice(0, 10).map((m) => m.id));
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
    expect(esm.coverage).toBe(10);
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

describe('informe del partido que piensas votar', () => {
  const stance = (pid: string, mid: string) =>
    sampleDataset.positions.find((p) => p.partyId === pid && p.measureId === mid)!.stance;

  it('lista las medidas que contradicen tus respuestas, de más a menos peso', () => {
    const a = answerAs(sampleDataset, 'cobalto');
    for (const m of sampleDataset.measures) a.agreement[m.id] = stance('cobalto', m.id);
    const r = buildChoiceReport(sampleDataset, a, 'ambar');
    expect(r.rank).toBeGreaterThan(1);
    expect(r.recommended.party.id).toBe('cobalto');
    expect(r.contradictions.length).toBeGreaterThan(0);
    for (const m of r.contradictions) {
      expect(m.agreement).toBeLessThanOrEqual(0.5);
      expect(m.userStance).not.toBe(0);
      expect(m.source).toBeDefined();
    }
    for (let i = 1; i < r.contradictions.length; i++) {
      expect(r.contradictions[i - 1]!.cost).toBeGreaterThanOrEqual(r.contradictions[i]!.cost);
    }
  });

  it('pesa más lo que dijiste que te importa más', () => {
    const a = answerAs(sampleDataset, 'cobalto');
    for (const m of sampleDataset.measures) a.agreement[m.id] = stance('cobalto', m.id);
    const base = buildChoiceReport(sampleDataset, a, 'ambar').contradictions[0]!;
    const topic = sampleDataset.measures.find((m) => m.id === base.measureId)!.topicId;
    const more = buildChoiceReport(sampleDataset, { ...a, importance: { ...a.importance, [topic]: 3 } }, 'ambar');
    expect(more.contradictions.find((m) => m.measureId === base.measureId)!.weight).toBeGreaterThan(base.weight);
  });

  it('explica las condenas que le restan y lo que no cuenta', () => {
    const a = answerAs(sampleDataset, 'dalia', 1);
    sampleDataset.measures.forEach((m, i) => {
      a.agreement[m.id] = stance(i % 3 === 0 ? 'cobalto' : 'dalia', m.id);
    });
    a.importance[CORRUPTION_KEY] = 3;
    const r = buildChoiceReport(sampleDataset, a, 'dalia');
    expect(r.rank).toBe(2);
    expect(r.rankIgnoringCorruption).toBe(1);
    expect(r.cases.map((c) => c.case.id)).toEqual(['caso-ejemplo-1']);
    expect(buildChoiceReport(sampleDataset, a, 'ambar').otherCases.map((c) => c.id)).toEqual(['caso-ejemplo-3']);
  });

  it('si eliges tu partido más afín lo dice', () => {
    const a = answerAs(sampleDataset, 'esmeralda');
    const r = buildChoiceReport(sampleDataset, a, buildReport(sampleDataset, a).recommended.party.id);
    expect(r.rank).toBe(1);
    expect(r.topicGaps).toEqual([]);
  });
});

describe('candidaturas con pocos datos', () => {
  const sparseDataset = () => {
    const ds = structuredClone(sampleDataset);
    const keep = new Set(ds.measures.slice(0, 3).map((m) => m.id));
    ds.positions = ds.positions.filter((p) => p.partyId !== 'esmeralda' || keep.has(p.measureId));
    return ds;
  };

  it('no entran en la recomendación', () => {
    const ds = sparseDataset();
    expect(ballot(ds, {}).sparse.map((p) => p.id)).toEqual(['esmeralda']);
    const r = buildReport(ds, answerAs(sampleDataset, 'esmeralda'));
    expect(r.ranking.some((x) => x.party.id === 'esmeralda')).toBe(false);
  });

  it('salen como "otros partidos" si coincides en la mayoría de sus posturas conocidas', () => {
    const ds = sparseDataset();
    const a = empty();
    for (const t of ds.topics) a.importance[t.id] = 2;
    a.importance[CORRUPTION_KEY] = 0;
    const esm = (id: string) => sampleDataset.positions.find((p) => p.partyId === 'esmeralda' && p.measureId === id)!.stance;
    for (const m of ds.measures) a.agreement[m.id] = esm(m.id);
    const r = buildReport(ds, a);
    expect(r.others.map((o) => o.party.id)).toEqual(['esmeralda']);
    expect(r.others[0]).toMatchObject({ known: 3, agreeing: 3 });

    // Si discrepas en todas, no se sugiere.
    for (const m of ds.measures.slice(0, 3)) a.agreement[m.id] = (esm(m.id) >= 0 ? -2 : 2) as Stance;
    expect(buildReport(ds, a).others).toEqual([]);
  });
});

describe('coaliciones', () => {
  it('la mediana se redondea hacia el 0', () => {
    expect(medianStance([2, -1, 1])).toBe(1);
    expect(medianStance([1, 2])).toBe(1);
    expect(medianStance([-1, 0])).toBe(0);
    expect(medianStance([-2, -1])).toBe(-1);
  });

  it('heredan la mediana de sus miembros donde no tienen posición propia', () => {
    const ds = structuredClone(sampleDataset);
    const [m1, m2] = ds.measures;
    ds.parties.push({ id: 'frente', name: 'Frente', shortName: 'Fr', color: '#000', kind: 'coalicion', members: ['ambar', 'brezo', 'cobalto'] });
    ds.positions.push({ partyId: 'frente', measureId: m1!.id, stance: -2, verification: 'verificado', source: { title: 'P', url: 'https://example.org' } });
    expect(validateDataset(ds)).toEqual([]);

    const pos = usablePositions(ds).filter((p) => p.partyId === 'frente');
    // La posición propia manda; no se hereda encima.
    expect(pos.find((p) => p.measureId === m1!.id)).toMatchObject({ stance: -2 });
    expect(pos.find((p) => p.measureId === m1!.id)!.inheritedFrom).toBeUndefined();
    const members = ['ambar', 'brezo', 'cobalto'].map((id) => ds.positions.find((p) => p.partyId === id && p.measureId === m2!.id)!.stance);
    expect(pos.find((p) => p.measureId === m2!.id)).toMatchObject({ stance: medianStance(members), inheritedFrom: ['ambar', 'brezo', 'cobalto'] });
    expect(pos).toHaveLength(ds.measures.length);
  });

  it('un partido que solo va en coalición no aparece en la recomendación', () => {
    const ds = structuredClone(sampleDataset);
    ds.parties.find((p) => p.id === 'ambar')!.constituencies = [];
    ds.parties.push({ id: 'frente', name: 'Frente', shortName: 'Fr', color: '#000', kind: 'coalicion', members: ['ambar'] });
    const { competing } = ballot(ds, {});
    expect(competing.map((p) => p.id)).toContain('frente');
    expect(competing.map((p) => p.id)).not.toContain('ambar');
  });
});

describe('provincia', () => {
  it('solo compara las candidaturas que se presentan en tu provincia', () => {
    const ds = structuredClone(sampleDataset);
    ds.parties.find((p) => p.id === 'dalia')!.constituencies = ['08', '17', '25', '43'];
    expect(ballot(ds, { province: '28' }).competing.map((p) => p.id)).not.toContain('dalia');
    expect(ballot(ds, { province: '08' }).competing.map((p) => p.id)).toContain('dalia');
    expect(ballot(ds, {}).competing.map((p) => p.id)).toContain('dalia');

    const a = answerAs(ds, 'dalia');
    const r = buildReport(ds, { ...a, province: '28' });
    expect(r.ranking.some((x) => x.party.id === 'dalia')).toBe(false);
    expect(r.province).toBe('28');
  });

  it('el validador rechaza provincias y miembros desconocidos', () => {
    const ds = structuredClone(sampleDataset);
    ds.parties[0]!.constituencies = ['99'];
    ds.parties.push({ id: 'x', name: 'X', shortName: 'X', color: '#000', kind: 'coalicion', members: ['nadie'] });
    const errors = validateDataset(ds);
    expect(errors.some((e) => e.includes('provincia desconocida'))).toBe(true);
    expect(errors.some((e) => e.includes('miembro desconocido'))).toBe(true);
  });
});
