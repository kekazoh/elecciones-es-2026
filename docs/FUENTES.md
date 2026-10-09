# Política de fuentes

La credibilidad de la app depende de que cada dato sea trazable. Ningún dato
entra como `verificado` sin cumplir esto.

## Posiciones de los partidos

- Fuente: el **programa electoral oficial** para estas elecciones, publicado por
  el propio partido. Hasta que se publiquen, se puede usar el último programa,
  indicándolo en `source.title` y `source.date`.
- Cada posición lleva `source.url`, `source.locator` (página o apartado) y,
  preferiblemente, `source.quote` con la frase literal.
- Si el programa no se pronuncia sobre una medida, **no se crea la posición**.
  No se infiere a partir de declaraciones o votaciones.
- La codificación de −2 a +2 la hace una persona y la revisa otra.

## Casos de corrupción

Solo penalizan casos con:

1. `status: sentencia_firme` (no recurrible, o confirmada por el Supremo / TC).
2. Al menos una fuente `kind: sentencia` enlazada a **CENDOJ**
   (`poderjudicial.es`) con su **ECLI**, o publicada en el **BOE**.
3. `involvement` fiel a la sentencia: distinguir entre condena al partido como
   persona jurídica, partícipe a título lucrativo y condena solo a cargos.
4. `verification: verificado` y `lastReviewed` con la fecha de la revisión.

Dominios aceptados por el validador para datos reales: `poderjudicial.es`,
`boe.es`, `tribunalconstitucional.es`, `tcu.es`, `fiscal.es`, `curia.europa.eu`.
La prensa sirve para encontrar casos, no como fuente.

Si no se puede verificar un caso, se registra con `verification: pendiente`:
queda guardado para revisión pero no aparece en el informe ni afecta al
resultado. Nunca se completa un dato a partir de la memoria o de suposiciones.

Casos con sentencias posteriores que los modifican (anulaciones del TC,
indultos, amnistía) se revisan y se refleja la situación vigente en `summary`.

## Estado del dataset real (`src/data/real/`)

- Partidos: los 12 con representación en el Congreso en la XV legislatura
  (grupos propios y partidos del Grupo Mixto).
- Casos verificados con nota oficial del CGPJ y enlace a la sentencia por ECLI:
  Gürtel época I (PP), obras de Génova (PP) y De Miguel (PNV). El texto íntegro
  de las sentencias en CENDOJ no se ha podido abrir desde el entorno de trabajo;
  conviene cotejarlo a mano.
- Pendientes: ERE (falta reflejar los amparos del TC de 2024) y Palau (CDC está
  disuelta; falta decidir si se atribuye a Junts).
- La lista no es exhaustiva: hay que revisar otras piezas de Gürtel, Púnica,
  Filesa y casos autonómicos y municipales.
- Posiciones: pendientes de codificar a partir de los programas de 2023.
