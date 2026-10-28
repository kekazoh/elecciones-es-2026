import { useEffect, useState } from 'react';
import type { CandidateProfile, JudicialStage, ProfileItem } from '../model/types';

let cache: Promise<CandidateProfile[]> | undefined;
const loadProfiles = () =>
  (cache ??= import('../data/real/candidate-profiles.json').then((m) => m.default as CandidateProfile[]));

/**
 * Procedimientos que se enseñan al votante. Los archivados y las absoluciones
 * se quedan en docs/REVISION-PERFILES.md.
 */
export const SHOWN_STAGES: Partial<Record<JudicialStage, string>> = {
  investigado: 'investigado',
  juicio: 'pendiente de juicio',
  condenado_no_firme: 'condenado (sentencia no firme)',
  condenado_firme: 'condenado (sentencia firme)',
};

/** Perfil revisado del cabeza de lista; `null` si no lo hay o aún no se ha revisado. */
export function findProfile(profiles: CandidateProfile[], name: string, partyId: string, province: string) {
  return (
    profiles.find(
      (p) =>
        p.verification === 'verificado' &&
        p.name === name &&
        p.lists.some((l) => l.partyId === partyId && l.province === province),
    ) ?? null
  );
}

const Items = ({ title, items }: { title: string; items: ProfileItem[] }) =>
  items.length > 0 && (
    <>
      <h4>{title}</h4>
      <ul>
        {items.map((it, i) => (
          <li key={i}>
            {it.period && <span className="muted">{it.period} · </span>}
            {it.text}{' '}
            <a href={it.source.url} target="_blank" rel="noreferrer" className="muted">
              ({it.source.title})
            </a>
          </li>
        ))}
      </ul>
    </>
  );

/** Quién es el cabeza de lista: cargos, trayectoria y causas judiciales abiertas o con condena. */
export function HeadProfile({ name, partyId, province }: { name: string; partyId: string; province: string }) {
  const [profiles, setProfiles] = useState<CandidateProfile[] | null>(null);
  useEffect(() => {
    void loadProfiles().then(setProfiles);
  }, []);

  const p = profiles && findProfile(profiles, name, partyId, province);
  return p ? <HeadProfileView p={p} /> : null;
}

export function HeadProfileView({ p }: { p: CandidateProfile }) {
  const judicial = p.judicial.filter((j) => SHOWN_STAGES[j.stage]);

  return (
    <div className="head-profile">
      <h4>Quién es {p.name}</h4>
      <Items title="Ahora" items={p.current} />
      <Items title="Trayectoria" items={p.career} />
      <Items title="Formación" items={p.education} />
      {p.judicialChecked && (
        <>
          <h4>Causas judiciales</h4>
          {judicial.length === 0 ? (
            <p className="muted">No consta ninguna causa abierta ni condena (búsqueda del {p.judicialChecked}).</p>
          ) : (
            <ul>
              {judicial.map((j, i) => (
                <li key={i}>
                  <strong>{j.name}</strong>: {SHOWN_STAGES[j.stage]}
                  {j.corruption ? ', corrupción' : ''}. {j.summary}{' '}
                  {j.sources.map((s, k) => (
                    <a key={k} href={s.url} target="_blank" rel="noreferrer" className="muted">
                      ({s.title}){' '}
                    </a>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {p.notes && <p className="muted">{p.notes}</p>}
    </div>
  );
}
