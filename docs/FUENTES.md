# Política de fuentes

La credibilidad de la app depende de que cada dato sea trazable. Ningún dato
entra como `verificado` sin cumplir esto.

## Posiciones de los partidos

- Fuente: el **programa electoral oficial** para estas elecciones, publicado por
  el propio partido. Hasta que se publiquen, se puede usar el último programa,
  indicándolo en `source.title` y `source.date`.
- Cada posición lleva `source.url`, `source.locator` (página o apartado) y,
  preferiblemente, `source.quote` con la frase literal.
- Si el programa no se pronuncia sobre una medida, se puede buscar la postura en
  **declaraciones oficiales del partido** y guardarla con `origin: declaracion`.
  Cuentan la mitad que una del programa (`declarationWeight` en el motor) y el
  informe lo indica junto a la fuente. Fuentes aceptadas, por orden de
  preferencia (`declarationKind`):
  1. `parlamento`: intervención de un portavoz o diputado del partido en el
     Congreso, el Senado o un parlamento autonómico, o iniciativa registrada por
     su grupo.
  2. `web_partido`: comunicado, noticia o documento de la web oficial del
     partido (incluidos programas autonómicos o europeos y ponencias).
  3. `prensa`: declaración literal de un líder o portavoz oficial en un medio
     reconocido, solo si no hay nada en 1 o 2.
  Siempre con `source.url`, `source.date`, `source.quote` literal y `speaker`.
  No se infiere la postura de una votación sin declaración, de columnas de
  opinión ni de cargos que contradigan la línea del partido. Si no se encuentra
  nada claro, no se crea la posición. Entran como `pendiente` hasta que una
  persona las revise. Detalle en
  [REVISION-DECLARACIONES.md](REVISION-DECLARACIONES.md).
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

Si un caso se atribuye a un partido distinto del condenado (por ejemplo, un
sucesor político de un partido disuelto), se explica en `attributionNote` y el
informe lo muestra.

Casos con sentencias posteriores que los modifican (anulaciones del TC,
indultos, amnistía) se revisan y se refleja la situación vigente en `summary`.

## Estado del dataset real (`src/data/real/`)

- Partidos: los 12 con representación en el Congreso en la XV legislatura
  (grupos propios y partidos del Grupo Mixto).
- Casos verificados con nota oficial del CGPJ y enlace a la sentencia por ECLI:
  Gürtel época I (PP), obras de Génova (PP), De Miguel (PNV) y Palau (CDC,
  atribuido a Junts como sucesor político por decisión del proyecto; el informe
  lo indica). El texto íntegro
  de las sentencias en CENDOJ no se ha podido abrir desde el entorno de trabajo;
  conviene cotejarlo a mano.
- Pendiente: ERE (falta reflejar los amparos del TC de 2024).
- La lista no es exhaustiva: hay que revisar otras piezas de Gürtel, Púnica,
  Filesa y casos autonómicos y municipales.
- Posiciones: 156 codificadas a partir de los programas y revisadas por keko
  el 2026-10-09 (`verificado`; el motor ya las usa). Detalle, matriz y motivos de cada
  una en [REVISION-POSICIONES.md](REVISION-POSICIONES.md). `source.locator` da
  la página del PDF (no la impresa) y el apartado; `source.quote` es literal y se
  ha comprobado automáticamente contra el texto extraído de esa página.
- Programas usados y salvedades:
  - PP, Sumar, ERC, PNV y BNG: PDF oficial del partido, generales de 2023.
  - PSOE y Vox: la web del partido bloquea las descargas automáticas. Se citan
    la URL oficial del PSOE y la página del programa de Vox, pero el texto se
    leyó de copias publicadas por la prensa (ara.cat para el PSOE,
    theobjective.com para Vox, con pie de página votaabascal.es). Conviene
    cotejar la paginación con el original.
  - Junts y EH Bildu: no se ha encontrado el PDF en la web del partido; se citan
    copias de beteve.cat y elnacional.cat del programa de las generales de 2023.
  - Podemos: en 2023 concurrió dentro de Sumar. Se usa su último programa propio
    para unas generales (abril de 2019, copia de beteve.cat).
  - Coalición Canaria: no publicó programa de generales en 2023; se usa el de
    noviembre de 2019 de su web. Es un manifiesto breve: solo 4 medidas.
  - UPN: no se ha localizado programa para las generales de 2023; se usa el de
    las forales y municipales de mayo de 2023 (copia de iniciativa2028.es).
- Declaraciones: 80 posiciones más, de celdas que el programa no aborda,
  sacadas de intervenciones parlamentarias, webs de los partidos y, en último
  caso, prensa (octubre de 2026). Están `pendiente` hasta que keko las revise.
  Las citas se han comprobado automáticamente contra la página enlazada.
  Detalle, matriz y dudas en [REVISION-DECLARACIONES.md](REVISION-DECLARACIONES.md).
- Ninguna posición del programa cubre `san-3` (deducción del seguro médico
  privado): ningún programa la menciona y solo hay dos declaraciones (Sumar y
  Junts). Conviene plantearse cambiar esa medida.
