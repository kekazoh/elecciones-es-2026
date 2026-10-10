import type { MeasureMatch, Report } from '../engine/report';
import type { CSSProperties } from 'react';
import type { Stance } from '../model/types';
import { ShareButton } from './ShareButton';

const STANCE_LABEL: Record<Stance, string> = {
  2: 'muy a favor',
  1: 'a favor',
  0: 'neutral',
  [-1]: 'en contra',
  [-2]: 'muy en contra',
};

const pct = (x: number) => `${Math.round(x * 100)}%`;

function MeasureList({ items }: { items: MeasureMatch[] }) {
  return (
    <ul className="measures">
      {items.map((m) => (
        <li key={m.measureId}>
          <span className="topic">{m.topicName}</span>
          <p>{m.statement}</p>
          <p className="muted">
            Tú: {STANCE_LABEL[m.userStance]} · Partido: {STANCE_LABEL[m.partyStance]}
            {m.source && (
              <>
                {' · '}
                <a href={m.source.url} target="_blank" rel="noreferrer">
                  {m.source.title}
                  {m.source.locator ? ` (${m.source.locator})` : ''}
                </a>
                {m.origin === 'declaracion' && (
                  <span title="No está en su programa: sale de declaraciones del partido y cuenta tres cuartos de lo que cuenta el programa">
                    {' '}
                    · declaración{m.speaker ? ` de ${m.speaker}` : ''}, no programa (cuenta menos)
                  </span>
                )}
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ReportView({
  report,
  onRestart,
  onReplay,
}: {
  report: Report;
  onRestart: () => void;
  onReplay: () => void;
}) {
  const rec = report.recommended;
  return (
    <section className="report" style={{ '--party': rec.party.color } as CSSProperties}>
      <p className="eyebrow">Informe completo · {report.questionsAnswered} medidas valoradas</p>
      <h1 className="report-title">
        <span className="swatch" />
        {rec.party.name}
      </h1>
      <p className="lede">
        Coincides en un <strong>{pct(rec.affinity)}</strong> con sus propuestas en las medidas que has valorado, teniendo en
        cuenta la importancia que das a cada tema.
        {rec.coverage < report.measuresRated && (
          <>
            {' '}
            Conocemos su posición en {rec.coverage} de esas {report.measuresRated} medidas (en esas coincides un{' '}
            {pct(rec.knownAffinity)}).
          </>
        )}
        {rec.fromDeclarations > 0 && (
          <>
            {' '}
            En {rec.fromDeclarations} de ellas su programa no se pronuncia y usamos declaraciones del partido, que cuentan
            menos que el programa.
          </>
        )}
      </p>

      {report.recommendedIgnoringCorruption && (
        <p className="notice">
          Sin tener en cuenta la corrupción, tu partido más afín sería{' '}
          <strong>{report.recommendedIgnoringCorruption.name}</strong>. El resultado cambia porque indicaste que las
          condenas firmes por corrupción deben pesar en tu voto.
        </p>
      )}

      {report.supporting.length > 0 && (
        <>
          <h3>Por qué: medidas en las que coincidís</h3>
          <MeasureList items={report.supporting} />
        </>
      )}

      {report.divergences.length > 0 && (
        <>
          <h3>En qué no coincidís</h3>
          <MeasureList items={report.divergences} />
        </>
      )}

      <h3>Afinidad por tema</h3>
      <ul className="bars">
        {rec.topicAffinity.map((t) => (
          <li key={t.topicId}>
            <span>{t.topicName}</span>
            <span className="bar">
              <span style={{ width: pct(t.affinity), background: rec.party.color }} />
            </span>
            <span>{pct(t.affinity)}</span>
          </li>
        ))}
      </ul>

      <h3>Todos los partidos</h3>
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Partido</th>
            <th>Coincidencia</th>
            <th>Posición conocida</th>
            <th>Condenas firmes</th>
          </tr>
        </thead>
        <tbody>
          {report.ranking.map((r) => (
            <tr key={r.party.id}>
              <td>
                <span className="dot" style={{ background: r.party.color }} /> {r.party.name}
              </td>
              <td>
                {pct(r.affinity)}
                {r.coverage < report.measuresRated && r.coverage > 0 && (
                  <div className="muted">{pct(r.knownAffinity)} en las conocidas</div>
                )}
              </td>
              <td>
                {r.coverage} de {report.measuresRated}
              </td>
              <td>
                {r.corruptionCases.length === 0
                  ? '—'
                  : r.corruptionCases.map((c) => (
                      <div key={c.id}>
                        {c.name}{' '}
                        {c.attributionNote && <span className="muted">({c.attributionNote}) </span>}
                        {c.sources.map((s) => (
                          <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                            [fuente]
                          </a>
                        ))}
                      </div>
                    ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <p className="muted">
        Los partidos están ordenados por afinidad contigo. Si un partido no ha fijado posición sobre una medida que has
        valorado, esa medida le cuenta como un 50 % de coincidencia: un partido que coincide mucho contigo en pocas medidas
        no supera a otro que coincide algo menos en muchas más.
      </p>
      <p className="muted">
        Solo se tienen en cuenta condenas por sentencia firme con fuente oficial. Su peso depende de la importancia que
        le diste a la corrupción, de si el condenado es el partido o solo sus cargos, y de la antigüedad de la condena
        (pesa la mitad cada 10 años).
      </p>

      <div className="actions">
        <button className="cta" onClick={onReplay}>
          Ver el resumen otra vez
        </button>
        <ShareButton report={report} className="ghost" />
        <button className="ghost" onClick={onRestart}>
          Volver a empezar
        </button>
      </div>
    </section>
  );
}
