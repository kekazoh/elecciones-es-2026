import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { realDataset } from '../data/real';
import { nextQuestion } from '../engine/engine';
import { buildReport } from '../engine/report';
import type { Answers, Importance, Question, Stance } from '../model/types';
import { ReportView } from './Report';
import { Wrapped } from './Wrapped';

const ds = realDataset;

const IMPORTANCE_OPTIONS: { value: Importance; label: string }[] = [
  { value: 0, label: 'Nada' },
  { value: 1, label: 'Poco' },
  { value: 2, label: 'Bastante' },
  { value: 3, label: 'Mucho' },
];

const AGREEMENT_OPTIONS: { value: Stance | null; label: string }[] = [
  { value: 2, label: 'Muy de acuerdo' },
  { value: 1, label: 'De acuerdo' },
  { value: 0, label: 'Ni de acuerdo ni en desacuerdo' },
  { value: -1, label: 'En desacuerdo' },
  { value: -2, label: 'Muy en desacuerdo' },
  { value: null, label: 'No lo sé / prefiero no responder' },
];

type Step = { question: Question; answers: Answers };

const two = (n: number) => String(n).padStart(2, '0');

export function App() {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({ importance: {}, agreement: {} });
  const [history, setHistory] = useState<Step[]>([]);
  const [view, setView] = useState<'story' | 'detail'>('story');
  // Ver el comentario sobre `data-armed` en styles.css.
  const [armedAt, setArmedAt] = useState(-1);

  const question = useMemo(() => nextQuestion(ds, answers), [answers]);
  const report = useMemo(() => (question === null ? buildReport(ds, answers) : null), [question, answers]);

  const answer = (value: Importance | Stance | null) => {
    if (!question) return;
    setHistory((h) => [...h, { question, answers }]);
    setAnswers((a) =>
      question.kind === 'importance'
        ? { ...a, importance: { ...a.importance, [question.key]: value as Importance } }
        : { ...a, agreement: { ...a.agreement, [question.measureId]: value as Stance | null } },
    );
  };

  const back = () => {
    const prev = history.at(-1);
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setAnswers(prev.answers);
  };

  const restart = () => {
    setAnswers({ importance: {}, agreement: {} });
    setHistory([]);
    setStarted(false);
    setView('story');
    setArmedAt(-1);
  };

  // Atajos de teclado: 1…n eligen opción, Retroceso vuelve a la anterior.
  useEffect(() => {
    if (!started || !question) return;
    const options = question.kind === 'importance' ? IMPORTANCE_OPTIONS : AGREEMENT_OPTIONS;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= options.length) answer(options[n - 1]!.value);
      else if (e.key === 'Backspace') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [history.length, view]);

  if (started && report && view === 'story') {
    return <Wrapped report={report} onDetail={() => setView('detail')} onRestart={restart} />;
  }

  const n = history.length + 1;
  const armed = armedAt === n;

  return (
    <div className="page">
      <header className="masthead">
        <button className="wordmark" onClick={restart} aria-label="Brújula electoral: volver al inicio">
          Brújula<span>electoral</span>
        </button>
        {started && question && (
          <span className="counter" aria-label={`Pregunta ${n}`}>
            <small>Pregunta</small>
            <b key={n}>{two(n)}</b>
          </span>
        )}
      </header>

      <main className="container">
        {!started && (
          <section className="intro">
            <h1 className="display">
              <span>¿A quién</span>
              <span>votarías</span>
              <span>
                si solo <mark>contaran</mark>
              </span>
              <span>las ideas?</span>
            </h1>
            <div className="intro-body">
              <p className="lede">
                Responde a unas preguntas sobre lo que te importa y lo que piensas. No verás ningún partido hasta el
                final: entonces te diremos cuál encaja mejor contigo y por qué.
              </p>
              <ul className="facts">
                <li>
                  <b>Adaptativo</b> El número de preguntas depende de tus respuestas.
                </li>
                <li>
                  <b>Privado</b> Tus respuestas no salen de tu navegador.
                </li>
                <li>
                  <b>Con fuentes</b> Cada posición enlaza al programa o declaración de la que sale.
                </li>
              </ul>
              <button className="cta" onClick={() => setStarted(true)}>
                Empezar <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}

        {started && question && (
          <section
            className="question"
            key={n}
            aria-live="polite"
            data-armed={armed || undefined}
            onPointerMove={(e) => e.pointerType === 'mouse' && !armed && setArmedAt(n)}
          >
            <p className="eyebrow">
              {question.kind === 'agreement' ? question.topicName : 'Antes de nada'}
            </p>
            {question.kind === 'importance' ? (
              <>
                <h2 className="statement">{question.prompt}</h2>
                <div className="scale" role="group" aria-label="Importancia">
                  {IMPORTANCE_OPTIONS.map((o, i) => (
                    <button key={o.value} className="level" style={{ '--i': i } as CSSProperties} onClick={() => answer(o.value)}>
                      <span className="meter" aria-hidden="true">
                        {[0, 1, 2].map((k) => (
                          <i key={k} className={k < o.value ? 'on' : ''} />
                        ))}
                      </span>
                      <span className="label">{o.label}</span>
                      <kbd>{i + 1}</kbd>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="statement">{question.statement}</h2>
                {question.explainer && (
                  <details className="explainer">
                    <summary>¿Qué significa esto?</summary>
                    <p>{question.explainer}</p>
                  </details>
                )}
                <div className="choices" role="group" aria-label="Tu posición">
                  {AGREEMENT_OPTIONS.map((o, i) => (
                    <button
                      key={String(o.value)}
                      className={o.value === null ? 'choice skip' : 'choice'}
                      data-stance={o.value ?? 'na'}
                      style={{ '--i': i } as CSSProperties}
                      onClick={() => answer(o.value)}
                    >
                      <kbd>{i + 1}</kbd>
                      <span>{o.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="question-foot">
              {history.length > 0 ? (
                <button className="link" onClick={back}>
                  ← Anterior
                </button>
              ) : (
                <span />
              )}
              <span className="hint">Usa las teclas 1–{question.kind === 'importance' ? 4 : 6}</span>
            </div>
          </section>
        )}

        {started && report && view === 'detail' && (
          <ReportView report={report} onRestart={restart} onReplay={() => setView('story')} />
        )}
      </main>

      <footer className="colophon">
        {ds.meta.isSample ? (
          <p>
            Versión de demostración: los partidos, sus posiciones y los casos de corrupción son <strong>ficticios</strong>.
          </p>
        ) : (
          <p>
            Mientras no se publiquen los programas de estas elecciones, las posiciones salen del último programa electoral
            de cada partido (en su mayoría, los de las generales de 2023). Cada una enlaza a su fuente en el informe.
          </p>
        )}
      </footer>
    </div>
  );
}
