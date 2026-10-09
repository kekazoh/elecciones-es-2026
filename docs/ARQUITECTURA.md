# Arquitectura

## Visión general

```
┌──────────────── Navegador (todo ocurre aquí) ────────────────┐
│  UI React (src/ui)                                           │
│    └─ pregunta a ─▶ Motor (src/engine)  ◀── Dataset (JSON)   │
│                      nextQuestion(ds, answers) → Pregunta|null│
│                      buildReport(ds, answers)  → Informe      │
└──────────────────────────────────────────────────────────────┘
        ▲
        │ build estático (vite build) → cualquier hosting estático
```

- **SPA estática, sin backend.** Las respuestas nunca salen del navegador: no hay
  servidor que las reciba ni analítica. Es la forma más simple de cumplir con
  privacidad (opinión política = dato de categoría especial en el RGPD) y de
  inspirar confianza.
- **Motor puro en TypeScript** (`src/engine`). El único estado es el objeto
  `Answers`; todas las funciones son deterministas y testeables sin UI. Se puede
  reutilizar tal cual en una app móvil o un backend si algún día hace falta.
- **Datos como JSON versionados** (`src/data/<dataset>/`). Cada cambio de datos
  pasa por revisión (PR) y por `npm run validate-data`, que comprueba
  integridad, neutralidad de las preguntas y fuentes oficiales.

## Modelo de datos (`src/model/types.ts`)

| Entidad | Qué es | Campos clave |
|---|---|---|
| `Topic` | Tema de los programas (vivienda, sanidad…) | `importancePrompt`: pregunta de sensibilidad |
| `Measure` | Medida concreta dentro de un tema | `statement` neutral (es la pregunta), `explainer` |
| `Party` | Partido que concurre | `program`: enlace al programa |
| `PartyPosition` | Postura de un partido ante una medida, de −2 a +2 | `source` (documento, página, cita), `verification` |
| `CorruptionCase` | Caso de corrupción | `status` procesal, `involvement` del partido, `sources` (sentencia/BOE/órgano oficial, ECLI), `verification` |

Reglas:

- Una `PartyPosition` o un `CorruptionCase` en estado `pendiente` **no afecta**
  a la recomendación (excepto en el dataset de ejemplo, `meta.isSample = true`).
- Solo los casos con `status: sentencia_firme` penalizan. El resto pueden
  guardarse para seguimiento, pero no cuentan.
- Si un partido no tiene posición conocida en una medida, esa medida no le suma
  ni le resta en la puntuación. En la práctica equivale a un 50 % de coincidencia
  en esa medida frente a los partidos que sí tienen posición, y así se muestra en
  el informe.

## Lógica del cuestionario adaptativo (`src/engine/engine.ts`)

**Fase 1 · Sensibilidad.** Una pregunta por tema: "¿Cuánto te importa…?"
(Nada / Poco / Bastante / Mucho → peso 0 / 0,5 / 1 / 2), y una final sobre cuánto
debe pesar la corrupción probada. Un tema con peso 0 no vuelve a aparecer.

**Fase 2 · Medidas.** Afirmaciones con escala de acuerdo de 5 puntos más
"No lo sé" (que no cuenta).

1. *Creencia.* Cada partido acumula una puntuación
   `Σ peso_tema · λ · (acuerdo − 0,5)`, con `acuerdo = 1 − |usuario − partido| / 4`,
   menos `λc · peso_corrupción · penalización_partido`. Un softmax la convierte en
   probabilidad de que ese partido sea el más afín.
2. *Selección.* La siguiente medida es la que maximiza
   `peso_tema · varianza de las posturas de los partidos, ponderada por su probabilidad actual`.
   Es decir: se pregunta lo que más separa a los partidos que todavía compiten,
   no lo que ya está claro.
3. *Parada.* Tras un mínimo de medidas (8), se para si el líder supera el 90 %
   de probabilidad **y** ninguna respuesta posible a la siguiente pregunta lo
   desbancaría. Tope de 30 medidas. También se para si no quedan medidas que
   distingan a nadie.

Con el dataset de ejemplo, un usuario coherente termina en ~8 medidas (más las
9 de sensibilidad) y uno con respuestas ruidosas en 9–12. Lo puedes reproducir con
`npm run simulate`.

**Sin pistas durante el cuestionario.** Las preguntas solo contienen texto de
temas y medidas; el validador rechaza cualquier pregunta que nombre a un
partido; la UI no muestra colores, porcentajes ni barra de progreso hacia ningún
partido. El tema de cada medida sí se muestra para dar contexto.

## Cómo cuenta la corrupción

`penalización_partido = min(1, Σ gravedad_caso)`, con
`gravedad_caso = implicación × 0,5^(años desde la sentencia / 10)`.
Implicación: partido condenado como persona jurídica 1; partícipe a título
lucrativo 0,6; solo cargos condenados 0,4. La penalización se multiplica por la
sensibilidad que indicó el usuario (0 = no cuenta). Si la corrupción cambia el
partido recomendado, el informe lo dice y muestra cuál saldría sin ella.

## Informe (`src/engine/report.ts`)

- Partido recomendado (mayor probabilidad) y % de coincidencia ponderada sobre
  todas las medidas valoradas, contando como 50 % las que el partido no aborda.
  Es la misma cuenta que usa el motor, así que el orden de la tabla y el
  porcentaje coinciden cuando la corrupción no pesa. Se muestra además cuántas
  medidas tienen posición conocida y la coincidencia solo en esas.
- **Medidas que lo respaldan**: en las que el usuario y el partido van en la
  misma dirección, ordenadas por peso del tema e intensidad; cada una enlaza la
  fuente del programa.
- **Discrepancias**: dónde el usuario está en el lado opuesto, por honestidad.
- Afinidad por tema y tabla con todos los partidos y sus condenas firmes, con
  enlace a la sentencia.

## Parámetros a calibrar

`DEFAULT_CONFIG` en `engine.ts`: mínimo/máximo de preguntas, umbral de
confianza, `λ` (cuánto pesa cada respuesta) y `λc` (cuánto puede pesar la
corrupción). Conviene recalibrarlos con el dataset real usando el simulador.
