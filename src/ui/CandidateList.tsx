import { useEffect, useState } from 'react';
import { PROVINCE_NAME } from '../data/provinces';
import type { CandidacyList, Party } from '../model/types';

interface Candidacies {
  source: { title: string; url: string; date: string };
  lists: CandidacyList[];
}

// Las listas de todo el país pesan más que la app: se cargan solo al mostrarlas.
let cache: Promise<Candidacies> | undefined;
const loadCandidacies = () =>
  (cache ??= import('../data/real/candidacies.json').then((m) => m.default as Candidacies));

/** Las candidaturas del BOE, una vez cargadas; `null` mientras tanto o si no hay provincia. */
export function useCandidacies(province?: string) {
  const [data, setData] = useState<Candidacies | null>(null);
  useEffect(() => {
    if (province) void loadCandidacies().then(setData);
  }, [province]);
  return data;
}

/** Lista de un partido en una provincia, si tiene candidatos (las inadmitidas no los tienen). */
export const listOf = (data: Candidacies, partyId: string, province: string) =>
  data.lists.find((l) => l.province === province && l.partyId === partyId && l.candidates.length > 0);

/** Lista de un partido en la provincia del usuario, tal como sale en el BOE. */
export function CandidateList({ party, province }: { party: Party; province?: string }) {
  const data = useCandidacies(province);

  if (!province) {
    return (
      <p className="muted">
        Si al empezar indicas en qué provincia votas, aquí verás la lista de {party.shortName} en tu provincia.
      </p>
    );
  }
  if (!data) return <p className="muted">Cargando la lista…</p>;

  const list = listOf(data, party.id, province);
  const where = PROVINCE_NAME.get(province);
  if (!list) return <p className="muted">No consta ninguna lista de {party.shortName} en {where}.</p>;

  return (
    <div className="candidate-list">
      <p className="muted">
        {list.name}
        {list.acronym && list.acronym.toUpperCase() !== list.name.toUpperCase() ? ` (${list.acronym})` : ''} en {where}, en el orden de la papeleta. Fuente:{' '}
        <a href={data.source.url} target="_blank" rel="noreferrer">
          BOE del {new Date(data.source.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
        </a>{' '}
        (candidaturas presentadas; pueden cambiar hasta la proclamación).
      </p>
      <ol>
        {list.candidates.map((c, i) => (
          <li key={i}>
            {c}
            {i === 0 && <span className="muted"> · cabeza de lista</span>}
          </li>
        ))}
      </ol>
      {list.substitutes.length > 0 && (
        <details>
          <summary>Suplentes ({list.substitutes.length})</summary>
          <ol>
            {list.substitutes.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
