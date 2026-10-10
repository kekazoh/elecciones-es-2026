/**
 * Resumen animado del resultado, en diapositivas a pantalla completa que
 * avanzan solas (al estilo de un "Wrapped"). Es la primera vez que la app
 * muestra partidos y colores de partido: el cuestionario es monocromo a
 * propósito para no dar pistas.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import type { MeasureMatch, Report } from '../engine/report';
import type { Party, Stance } from '../model/types';
import { INK, PAPER, textOn } from './colors';
import { ShareButton } from './ShareButton';

const STANCE_LABEL: Record<Stance, string> = {
  2: 'muy a favor',
  1: 'a favor',
  0: 'neutral',
  [-1]: 'en contra',
  [-2]: 'muy en contra',
};

function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

function CountUp({ to, ms = 1400, delay = 0, reduced }: { to: number; ms?: number; delay?: number; reduced: boolean }) {
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) {
      setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / ms));
      setV(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, delay, reduced]);
  return <>{v}</>;
}

type Deco = 'rings' | 'stripes' | 'shards' | 'burst' | 'grid';

interface Slide {
  id: string;
  bg: string;
  fg: string;
  accent: string;
  deco: Deco;
  /** ms; `null` = no avanza sola. */
  duration: number | null;
  render: (reduced: boolean) => ReactNode;
}

const pct = (x: number) => Math.round(x * 100);

function MatchCard({ m, party, i }: { m: MeasureMatch; party: Party; i: number }) {
  return (
    <li className="w-card" style={{ '--i': i } as CSSProperties}>
      <span className="w-tag">{m.topicName}</span>
      <p>{m.statement}</p>
      <span className="w-stances">
        Tú: {STANCE_LABEL[m.userStance]} · {party.shortName}: {STANCE_LABEL[m.partyStance]}
      </span>
    </li>
  );
}

function buildSlides(report: Report): Slide[] {
  const rec = report.recommended;
  const party = rec.party;
  const onParty = textOn(party.color);
  const topics = [...rec.topicAffinity]
    .filter((t) => t.weight > 0)
    .sort((a, b) => b.weight - a.weight || b.affinity - a.affinity)
    .slice(0, 3);
  const podium = report.ranking.slice(0, 5);
  const maxAff = Math.max(...podium.map((r) => r.affinity), 0.01);
  const alt = report.recommendedIgnoringCorruption;
  const slides: Slide[] = [];

  slides.push({
    id: 'intro',
    bg: INK,
    fg: PAPER,
    accent: PAPER,
    deco: 'rings',
    duration: 4200,
    render: (reduced) => (
      <>
        <p className="w-eyebrow">Tu brújula electoral</p>
        <p className="w-line">Has valorado</p>
        <p className="w-mega">
          <CountUp to={report.measuresRated} reduced={reduced} delay={300} />
        </p>
        <p className="w-line">medidas concretas.</p>
        <p className="w-small">Esto es lo que dicen de ti.</p>
      </>
    ),
  });

  if (topics.length > 0) {
    slides.push({
      id: 'temas',
      bg: PAPER,
      fg: INK,
      accent: INK,
      deco: 'stripes',
      duration: 5200,
      render: () => (
        <>
          <p className="w-eyebrow">Lo que más te importa</p>
          <ol className="w-ranks">
            {topics.map((t, i) => (
              <li key={t.topicId} style={{ '--i': i } as CSSProperties}>
                <b>{i + 1}</b>
                <span>{t.topicName}</span>
              </li>
            ))}
          </ol>
        </>
      ),
    });
  }

  slides.push({
    id: 'suspense',
    bg: INK,
    fg: PAPER,
    accent: PAPER,
    deco: 'shards',
    duration: 4600,
    render: () => (
      <>
        <p className="w-line w-in" style={{ '--i': 0 } as CSSProperties}>
          Hemos cruzado tus respuestas con <b>{report.ranking.length} partidos</b>.
        </p>
        <p className="w-big w-in" style={{ '--i': 3 } as CSSProperties}>
          Uno se parece a ti más que ningún otro.
        </p>
      </>
    ),
  });

  slides.push({
    id: 'reveal',
    bg: party.color,
    fg: onParty,
    accent: onParty,
    deco: 'burst',
    duration: 7000,
    render: (reduced) => (
      <>
        <p className="w-eyebrow">Tu partido más afín es</p>
        <p className="w-name" style={{ '--len': party.shortName.length } as CSSProperties}>
          {party.shortName}
        </p>
        {party.name !== party.shortName && <p className="w-small w-in">{party.name}</p>}
        <p className="w-score">
          <span>
            <CountUp to={pct(rec.affinity)} reduced={reduced} delay={900} ms={1600} />%
          </span>
          de coincidencia
        </p>
      </>
    ),
  });

  if (report.supporting.length > 0) {
    slides.push({
      id: 'porque',
      bg: PAPER,
      fg: INK,
      accent: party.color,
      deco: 'grid',
      duration: 8000,
      render: () => (
        <>
          <p className="w-eyebrow">Por qué</p>
          <p className="w-big">Coincidís en esto</p>
          <ul className="w-cards">
            {report.supporting.slice(0, 3).map((m, i) => (
              <MatchCard key={m.measureId} m={m} party={party} i={i} />
            ))}
          </ul>
        </>
      ),
    });
  }

  if (report.divergences.length > 0) {
    slides.push({
      id: 'choque',
      bg: INK,
      fg: PAPER,
      accent: party.color,
      deco: 'stripes',
      duration: 6500,
      render: () => (
        <>
          <p className="w-eyebrow">Ojo</p>
          <p className="w-big">Pero no en todo</p>
          <ul className="w-cards">
            {report.divergences.slice(0, 2).map((m, i) => (
              <MatchCard key={m.measureId} m={m} party={party} i={i} />
            ))}
          </ul>
        </>
      ),
    });
  }

  slides.push({
    id: 'podio',
    bg: PAPER,
    fg: INK,
    accent: INK,
    deco: 'grid',
    duration: 7000,
    render: (reduced) => (
      <>
        <p className="w-eyebrow">Tu podio</p>
        <p className="w-big">Así quedan los cinco primeros</p>
        <ol className="w-race">
          {podium.map((r, i) => (
            <li key={r.party.id} style={{ '--i': i, '--c': r.party.color, '--w': r.affinity / maxAff } as CSSProperties}>
              <span className="w-race-name">{r.party.shortName}</span>
              <span className="w-race-bar" />
              <span className="w-race-pct">
                <CountUp to={pct(r.affinity)} reduced={reduced} delay={300 + i * 180} />%
              </span>
            </li>
          ))}
        </ol>
      </>
    ),
  });

  if (alt) {
    slides.push({
      id: 'giro',
      bg: INK,
      fg: PAPER,
      accent: alt.color,
      deco: 'rings',
      duration: 6500,
      render: () => (
        <>
          <p className="w-eyebrow">Un giro</p>
          <p className="w-big">
            Sin contar la corrupción, tu más afín sería <span className="w-hl">{alt.shortName}</span>.
          </p>
          <p className="w-small">
            El resultado cambia porque dijiste que las condenas firmes por corrupción deben pesar en tu voto.
          </p>
        </>
      ),
    });
  }

  slides.push({
    id: 'fin',
    bg: party.color,
    fg: onParty,
    accent: onParty,
    deco: 'burst',
    duration: null,
    render: () => null,
  });

  return slides;
}

export function Wrapped({
  report,
  onDetail,
  onChoice,
  onRestart,
}: {
  report: Report;
  onDetail: () => void;
  onChoice: () => void;
  onRestart: () => void;
}) {
  const reduced = useReducedMotion();
  const slides = useMemo(() => buildSlides(report), [report]);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const downAt = useRef(0);
  const slide = slides[i]!;
  const last = i === slides.length - 1;
  const rec = report.recommended;
  const topTopic = [...rec.topicAffinity].sort((a, b) => b.weight - a.weight)[0];

  const next = () => setI((x) => Math.min(x + 1, slides.length - 1));
  const prev = () => setI((x) => Math.max(x - 1, 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ' && !last) {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === 'Escape') onDetail();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Mantener pulsado pausa; un toque en el tercio izquierdo retrocede y en el resto avanza.
  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    downAt.current = performance.now();
    setPaused(true);
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!downAt.current) return;
    const tap = performance.now() - downAt.current < 250;
    downAt.current = 0;
    setPaused(false);
    if (!tap) return;
    const box = e.currentTarget.getBoundingClientRect();
    if (e.clientX - box.left < box.width * 0.3) prev();
    else next();
  };

  const style = { '--bg': slide.bg, '--fg': slide.fg, '--accent': slide.accent } as CSSProperties;

  return (
    <div className="wrapped" style={style}>
      <div
        className={`stage s-${slide.id}`}
        data-paused={paused || undefined}
        data-reduced={reduced || undefined}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          downAt.current = 0;
          setPaused(false);
        }}
      >
        <div className="w-top">
          <div className="w-progress" aria-hidden="true">
            {slides.map((s, k) => (
              <span key={s.id} className={k < i ? 'done' : ''}>
                {k === i && (
                  <i
                    key={i}
                    className={s.duration && !reduced ? 'run' : 'done'}
                    style={{ animationDuration: `${s.duration ?? 0}ms` }}
                    onAnimationEnd={next}
                  />
                )}
              </span>
            ))}
          </div>
          <div className="w-bar">
            <span className="w-brand">Brújula electoral</span>
            <span className="w-ctrl">
              {!last && (
                <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Reanudar' : 'Pausar'}>
                  {paused ? '▶' : '❚❚'}
                </button>
              )}
              <button onClick={onDetail}>Ver informe</button>
            </span>
          </div>
        </div>

        <Decoration kind={slide.deco} key={`d-${slide.id}`} colors={report.ranking.map((r) => r.party.color)} />

        <div className="w-body" key={slide.id} aria-live="polite">
          {slide.id === 'fin' ? (
            <div className="w-final">
              <p className="w-eyebrow">Tu resultado</p>
              <div className="w-poster">
                <span className="w-poster-label">Partido más afín</span>
                <span className="w-poster-name">{rec.party.shortName}</span>
                <dl>
                  <div>
                    <dt>Coincidencia</dt>
                    <dd>{pct(rec.affinity)}%</dd>
                  </div>
                  <div>
                    <dt>Medidas</dt>
                    <dd>{report.measuresRated}</dd>
                  </div>
                  {topTopic && (
                    <div className="wide">
                      <dt>Lo que más te importa</dt>
                      <dd>{topTopic.topicName}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="w-actions">
                <ShareButton report={report} className="w-primary" />
                <button className="w-secondary wide" onClick={onDetail}>
                  Ver el informe completo, con fuentes
                </button>
                <button className="w-secondary wide" onClick={onChoice}>
                  ¿Ya sabes a quién vas a votar?
                </button>
                <button className="w-secondary" onClick={() => setI(0)}>
                  Ver otra vez
                </button>
                <button className="w-secondary" onClick={onRestart}>
                  Volver a empezar
                </button>
              </div>
            </div>
          ) : (
            slide.render(reduced)
          )}
        </div>

        {!last && <p className="w-tap">Toca para seguir</p>}
      </div>
    </div>
  );
}

function Decoration({ kind, colors }: { kind: Deco; colors: string[] }) {
  if (kind === 'shards') {
    return (
      <div className="deco deco-shards" aria-hidden="true">
        {colors.map((c, k) => (
          <i key={c + k} style={{ '--c': c, '--k': k, '--n': colors.length } as CSSProperties} />
        ))}
      </div>
    );
  }
  const count = { rings: 4, stripes: 7, burst: 12, grid: 1 }[kind];
  return (
    <div className={`deco deco-${kind}`} aria-hidden="true">
      {Array.from({ length: count }, (_, k) => (
        <i key={k} style={{ '--k': k } as CSSProperties} />
      ))}
    </div>
  );
}
