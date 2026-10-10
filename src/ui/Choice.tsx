/**
 * Paso opcional tras el resultado: "¿Ya sabes a quién vas a votar?". Si el
 * partido elegido no es el más afín, explica qué medidas suyas contradicen tus
 * respuestas y qué condenas le restan. Se calcula en el navegador con las
 * mismas respuestas; no se guarda nada.
 */
import { useMemo, type CSSProperties } from 'react';
import { buildChoiceReport, type Report } from '../engine/report';
import type { Answers, CaseStatus, Dataset, PartyInvolvement } from '../model/types';
import { MeasureList } from './Report';

const pct = (x: number) => `${Math.round(x * 100)}%`;
const pts = (x: number) => `${Math.max(1, Math.round(x * 100))} pts`;

const STATUS_LABEL: Record<CaseStatus, string> = {
  sentencia_firme: 'sentencia firme',
  sentencia_no_firme: 'sentencia no firme',
  juicio_oral: 'en juicio oral',
  instruccion: 'en instrucción',
  archivado: 'archivado',
};

const INVOLVEMENT_LABEL: Record<PartyInvolvement, string> = {
  persona_juridica_condenada: 'el partido, condenado como persona jurídica',
  comiso_al_partido: 'decomiso al partido',
  participe_a_titulo_lucrativo: 'el partido, partícipe a título lucrativo',
  responsable_civil_subsidiario: 'el partido, responsable civil subsidiario',
  cargos_condenados: 'condenados cargos del partido',
};

export function ChoicePicker({
  ds,
  report,
  onPick,
  onBack,
}: {
  ds: Dataset;
  report: Report;
  onPick: (partyId: string) => void;
  onBack: () => void;
}) {
  // Orden alfabético, no por afinidad: la lista no debe sugerir nada.
  const parties = useMemo(() => [...ds.parties].sort((a, b) => a.name.localeCompare(b.name, 'es')), [ds]);
  return (
    <section className="report">
      <p className="eyebrow">Un paso más · opcional</p>
      <h1 className="report-title">¿Ya sabes a quién vas a votar?</h1>
      <p className="lede">
        Si tu voto no coincide con tu partido más afín ({report.recommended.party.shortName}), te contamos en qué medidas
        ese partido va contra lo que has respondido y qué condenas le restan. Solo se calcula en tu navegador: no se
        guarda ni se envía.
      </p>
      <div className="party-pick" role="group" aria-label="Partido al que piensas votar">
        {parties.map((p, i) => (
          <button
            key={p.id}
            className="party-option"
            style={{ '--c': p.color, '--i': i } as CSSProperties}
            onClick={() => onPick(p.id)}
          >
            <span className="dot" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <div className="actions">
        <button className="ghost" onClick={onBack}>
          ← Volver al informe
        </button>
      </div>
    </section>
  );
}

export function ChoiceReportView({
  ds,
  answers,
  partyId,
  onChange,
  onBack,
}: {
  ds: Dataset;
  answers: Answers;
  partyId: string;
  onChange: () => void;
  onBack: () => void;
}) {
  const r = useMemo(() => buildChoiceReport(ds, answers, partyId), [ds, answers, partyId]);
  const party = r.chosen.party;
  const rec = r.recommended.party;
  const isTop = r.rank === 1;
  const gap = r.recommended.affinity - r.chosen.affinity;
  const opposite = r.contradictions.filter((m) => m.opposite);
  const lukewarm = r.contradictions.filter((m) => !m.opposite);
  const corruptionMoves = r.corruptionWeight > 0 && r.cases.length > 0 && r.rankIgnoringCorruption < r.rank;

  return (
    <section className="report" style={{ '--party': party.color } as CSSProperties}>
      <p className="eyebrow">
        Tu voto · {isTop ? 'coincide con tu más afín' : `${r.rank}º de ${ds.parties.length} en tu afinidad`}
      </p>
      <h1 className="report-title">
        <span className="swatch" />
        {party.name}
      </h1>

      {isTop ? (
        <p className="lede">
          Es también tu partido más afín: coincides en un <strong>{pct(r.chosen.affinity)}</strong> con sus propuestas en
          las medidas que has valorado. Tu voto y tus respuestas apuntan al mismo sitio.
        </p>
      ) : (
        <p className="lede">
          Coincides en un <strong>{pct(r.chosen.affinity)}</strong> con sus propuestas,{' '}
          {gap >= 0.005 ? (
            <>
              {Math.round(gap * 100)} puntos menos que con <strong>{rec.name}</strong> ({pct(r.recommended.affinity)})
            </>
          ) : (
            <>
              casi lo mismo que con <strong>{rec.name}</strong> ({pct(r.recommended.affinity)})
            </>
          )}
          . {r.contradictions.length > 0 ? 'Esto es lo que le aleja de tus respuestas.' : ''}
        </p>
      )}

      {r.unknown > 0 && (
        <p className="muted">
          No conocemos su posición en {r.unknown} de las {r.chosen.coverage + r.unknown} medidas que has valorado; esas no
          suman ni restan.
        </p>
      )}

      {opposite.length > 0 && (
        <>
          <h3>Medidas en las que defiende lo contrario que tú</h3>
          <MeasureList
            items={opposite}
            party={party.shortName}
            tag={(m) => <span className="cost">−{pts(m.cost)}</span>}
          />
        </>
      )}

      {lukewarm.length > 0 && (
        <>
          <h3>Medidas en las que se queda lejos de ti</h3>
          <MeasureList
            items={lukewarm}
            party={party.shortName}
            tag={(m) => <span className="cost">−{pts(m.cost)}</span>}
          />
        </>
      )}

      {r.contradictions.length > 0 && (
        <p className="muted">
          Ordenadas por lo que restan a tu coincidencia: pesa más lo que dijiste que te importa más y lo que respondiste
          con más convicción. Lo que sale de su programa cuenta entero; lo que sale de declaraciones, tres cuartos.
        </p>
      )}

      {!isTop && r.topicGaps.length > 0 && (
        <>
          <h3>Temas en los que {rec.shortName} encaja mejor contigo</h3>
          <ul className="bars duo">
            {r.topicGaps.map((t) => (
              <li key={t.topicId}>
                <span>{t.topicName}</span>
                <span className="duo-bars">
                  <span className="bar" title={party.shortName}>
                    <span style={{ width: pct(t.chosen), background: party.color }} />
                  </span>
                  <span className="bar" title={rec.shortName}>
                    <span style={{ width: pct(t.recommended), background: rec.color }} />
                  </span>
                </span>
                <span>
                  {pct(t.chosen)}
                  <br />
                  <span className="muted">{pct(t.recommended)}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="muted">
            <span className="dot" style={{ background: party.color }} /> {party.shortName} ·{' '}
            <span className="dot" style={{ background: rec.color }} /> {rec.shortName}
          </p>
        </>
      )}

      <h3>Corrupción</h3>
      {r.cases.length === 0 ? (
        <p>No tiene condenas firmes por corrupción con fuente oficial en nuestros datos: no le resta nada.</p>
      ) : (
        <>
          <p>
            {r.corruptionWeight === 0
              ? 'Dijiste que la corrupción no debe pesar en tu voto, así que estas condenas no cambian tu resultado:'
              : corruptionMoves
                ? `Estas condenas le restan en tu resultado: sin ellas quedaría ${r.rankIgnoringCorruption}º en lugar de ${r.rank}º.`
                : 'Estas condenas le restan en tu resultado, aunque no le cambian de puesto:'}
          </p>
          <ul className="measures">
            {r.cases.map(({ case: c, severity }) => (
              <li key={c.id}>
                <span className="topic">{INVOLVEMENT_LABEL[c.involvement]}</span>
                {r.corruptionWeight > 0 && <span className="cost">peso {pct(severity)}</span>}
                <p>{c.name}</p>
                <p className="muted">{c.summary}</p>
                <p className="muted">
                  {c.attributionNote && <>{c.attributionNote} · </>}
                  {c.sources.map((s, k) => (
                    <span key={s.url}>
                      {k > 0 && ' · '}
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
          <p className="muted">
            El peso de cada condena depende de si el condenado es el partido o solo sus cargos y de su antigüedad (la mitad
            cada 10 años); luego se multiplica por la importancia que diste a la corrupción.
          </p>
        </>
      )}
      {r.otherCases.length > 0 && (
        <p className="muted">
          No cuentan: {r.otherCases.map((c) => `${c.name} (${c.verification === 'pendiente' ? 'pendiente de verificar' : STATUS_LABEL[c.status]})`).join(', ')}.
          Solo restan las sentencias firmes con fuente oficial verificada.
        </p>
      )}

      <div className="actions">
        <button className="cta" onClick={onBack}>
          Volver al informe
        </button>
        <button className="ghost" onClick={onChange}>
          Elegir otro partido
        </button>
      </div>
    </section>
  );
}
