/**
 * Modelo de datos de la app de afinidad electoral.
 *
 * Principio rector: todo dato que afecte a la recomendación debe ser trazable
 * a una fuente. Un dato sin fuente verificada se guarda como `pendiente` y el
 * motor lo ignora (salvo en el dataset de ejemplo, marcado con `isSample`).
 */

/** Posición sobre una medida: -2 muy en contra … 0 neutral … +2 muy a favor. */
export type Stance = -2 | -1 | 0 | 1 | 2;

/** Importancia que el usuario da a un tema: 0 nada … 3 mucha. */
export type Importance = 0 | 1 | 2 | 3;

export type Verification = 'verificado' | 'pendiente';

export interface SourceRef {
  title: string;
  url: string;
  /** Fecha del documento (ISO yyyy-mm-dd). */
  date?: string;
  /** Página, sección o apartado concreto dentro del documento. */
  locator?: string;
  /** Cita literal breve que respalda el dato. */
  quote?: string;
}

export interface Topic {
  id: string;
  name: string;
  /** Pregunta de sensibilidad, redactada en lenguaje llano y sin sesgo. */
  importancePrompt: string;
  description?: string;
}

/**
 * Medida concreta dentro de un tema. `statement` es la afirmación que se le
 * presenta al usuario; nunca debe mencionar ni insinuar a ningún partido.
 */
export interface Measure {
  id: string;
  topicId: string;
  statement: string;
  /** Contexto opcional para quien no conozca el tema ("¿Qué significa esto?"). */
  explainer?: string;
}

export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  /** Programa electoral del que se extraen las posiciones. */
  program?: SourceRef;
}

export interface PartyPosition {
  partyId: string;
  measureId: string;
  stance: Stance;
  source?: SourceRef;
  verification: Verification;
}

/** Estado procesal. Solo `sentencia_firme` penaliza en la recomendación. */
export type CaseStatus =
  | 'sentencia_firme'
  | 'sentencia_no_firme'
  | 'juicio_oral'
  | 'instruccion'
  | 'archivado';

/** Cómo queda implicado el partido en la sentencia. */
export type PartyInvolvement =
  | 'persona_juridica_condenada'
  | 'participe_a_titulo_lucrativo'
  | 'cargos_condenados';

export type CaseSourceKind = 'sentencia' | 'boe' | 'organo_oficial';

export interface CaseSource extends SourceRef {
  kind: CaseSourceKind;
  /** Identificador europeo de jurisprudencia, p. ej. ECLI:ES:TS:2020:xxxx. */
  ecli?: string;
}

export interface CorruptionCase {
  id: string;
  name: string;
  partyIds: string[];
  summary: string;
  status: CaseStatus;
  involvement: PartyInvolvement;
  sources: CaseSource[];
  verification: Verification;
  /** Fecha de la última revisión humana del caso (ISO). */
  lastReviewed?: string;
}

export interface Dataset {
  meta: {
    election: string;
    version: string;
    /** true = datos ficticios de demostración; la UI lo avisa. */
    isSample: boolean;
  };
  topics: Topic[];
  measures: Measure[];
  parties: Party[];
  positions: PartyPosition[];
  corruptionCases: CorruptionCase[];
}

/** Clave especial de importancia para la sensibilidad a la corrupción. */
export const CORRUPTION_KEY = '__corrupcion__';

/** Respuestas del usuario. Es todo el estado del cuestionario. */
export interface Answers {
  /** Importancia por id de tema (y por CORRUPTION_KEY). */
  importance: Record<string, Importance>;
  /** Acuerdo por id de medida; `null` = "no lo sé / prefiero no responder". */
  agreement: Record<string, Stance | null>;
}

export type Question =
  | { kind: 'importance'; key: string; prompt: string; topicName?: string }
  | { kind: 'agreement'; measureId: string; topicName: string; statement: string; explainer?: string };
