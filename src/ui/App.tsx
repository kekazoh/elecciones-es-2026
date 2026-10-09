import { useMemo, useState } from 'react';
import { sampleDataset } from '../data/ejemplo';
import { nextQuestion } from '../engine/engine';
import { buildReport } from '../engine/report';
import type { Answers, Importance, Question, Stance } from '../model/types';
import { ReportView } from './Report';

const ds = sampleDataset;

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

export function App() {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({ importance: {}, agreement: {} });
  const [history, setHistory] = useState<Step[]>([]);

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
  };

  return (
    <main className="container">
      {ds.meta.isSample && (
        <p className="banner">
          Versión de demostración: los partidos, sus posiciones y los casos de corrupción son <strong>ficticios</strong>.
        </p>
      )}

      {!started && (
        <section className="card intro">
          <h1>Brújula electoral</h1>
          <p>
            Responde a unas preguntas sencillas sobre lo que te importa y lo que piensas. No verás ningún partido hasta el
            final: entonces te diremos cuál encaja mejor contigo y por qué.
          </p>
          <p className="muted">
            El número de preguntas depende de tus respuestas. Tus respuestas no salen de tu navegador.
          </p>
          <button className="primary" onClick={() => setStarted(true)}>
            Empezar
          </button>
        </section>
      )}

      {started && question && (
        <section className="card" aria-live="polite">
          <p className="step">
            Pregunta {history.length + 1}
            {question.kind === 'agreement' && <span className="topic"> · {question.topicName}</span>}
          </p>
          {question.kind === 'importance' ? (
            <>
              <h2>{question.prompt}</h2>
              <div className="options row">
                {IMPORTANCE_OPTIONS.map((o) => (
                  <button key={o.value} onClick={() => answer(o.value)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2>{question.statement}</h2>
              {question.explainer && (
                <details>
                  <summary>¿Qué significa esto?</summary>
                  <p>{question.explainer}</p>
                </details>
              )}
              <div className="options">
                {AGREEMENT_OPTIONS.map((o) => (
                  <button key={String(o.value)} className={o.value === null ? 'skip' : ''} onClick={() => answer(o.value)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {history.length > 0 && (
            <button className="link" onClick={back}>
              ← Volver a la anterior
            </button>
          )}
        </section>
      )}

      {started && report && <ReportView report={report} onRestart={restart} />}
    </main>
  );
}
