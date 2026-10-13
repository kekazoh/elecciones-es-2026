import { useState } from 'react';
import { PROVINCES, PROVINCE_NAME } from '../data/provinces';
import { CANARIAS_FRAME, MAP_VIEWBOX, PROVINCE_CENTROIDS, PROVINCE_PATHS } from './province-paths';

/** Demasiado pequeñas para pulsarlas en el mapa: se marcan con un círculo. */
const TINY = new Set(['51', '52']);

/**
 * Primera pregunta: en qué provincia vota. Sirve para comparar solo las
 * candidaturas de su papeleta. El mapa es para pulsar; el desplegable, para
 * teclado y lectores de pantalla.
 */
export function ProvincePicker({
  initial,
  onDone,
  onBack,
}: {
  initial?: string;
  onDone: (province: string | undefined) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<string | undefined>(initial);
  const [hover, setHover] = useState<string | undefined>();
  const shown = hover ?? selected;

  return (
    <section className="question province-step" aria-live="polite">
      <p className="eyebrow">Antes de nada</p>
      <h2 className="statement">¿En qué provincia votas?</h2>
      <p className="muted province-why">
        Cada provincia tiene su papeleta. Así solo te comparamos con las candidaturas que vas a encontrar en la tuya. Como
        el resto de respuestas, no sale de tu navegador.
      </p>

      <figure className="province-map">
        <svg viewBox={MAP_VIEWBOX} role="img" aria-label="Mapa de provincias de España">
          <path className="frame" d={CANARIAS_FRAME} />
          {Object.entries(PROVINCE_PATHS).map(([code, d]) => (
            <path
              key={code}
              d={d}
              className={code === selected ? 'province on' : 'province'}
              onClick={() => setSelected(code)}
              onPointerEnter={() => setHover(code)}
              onPointerLeave={() => setHover(undefined)}
            >
              <title>{PROVINCE_NAME.get(code)}</title>
            </path>
          ))}
          {[...TINY].map((code) => {
            const [cx, cy] = PROVINCE_CENTROIDS[code]!;
            return (
              <circle
                key={code}
                cx={cx}
                cy={cy}
                r={7}
                className={code === selected ? 'province tiny on' : 'province tiny'}
                onClick={() => setSelected(code)}
                onPointerEnter={() => setHover(code)}
                onPointerLeave={() => setHover(undefined)}
              >
                <title>{PROVINCE_NAME.get(code)}</title>
              </circle>
            );
          })}
        </svg>
        <figcaption>{shown ? PROVINCE_NAME.get(shown) : 'Pulsa tu provincia'}</figcaption>
        <small className="map-credit">Mapa: © Instituto Geográfico Nacional, vía es-atlas</small>
      </figure>

      <label className="province-select">
        <span>O elígela de la lista</span>
        <select value={selected ?? ''} onChange={(e) => setSelected(e.target.value || undefined)}>
          <option value="">—</option>
          {[...PROVINCES]
            .sort((a, b) => a.name.localeCompare(b.name, 'es'))
            .map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
        </select>
      </label>

      <div className="province-actions">
        <button className="cta" disabled={!selected} onClick={() => onDone(selected)}>
          Continuar <span aria-hidden="true">→</span>
        </button>
        <button className="link" onClick={() => onDone(undefined)}>
          Prefiero no decirlo: compararme con todas
        </button>
      </div>

      <div className="question-foot">
        <button className="link" onClick={onBack}>
          ← Inicio
        </button>
        <span />
      </div>
    </section>
  );
}
