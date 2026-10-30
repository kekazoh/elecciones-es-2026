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
  Cuentan tres cuartos de lo que cuenta una del programa (`declarationWeight` en el motor) y el
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

## Perfiles de los cabezas de lista

Perfiles de los cabezas de lista de los partidos con representación en la XV
legislatura y sus coaliciones (`src/data/real/candidate-profiles.json`). No
afectan a la recomendación: son información para el votante. Revisión en
[REVISION-PERFILES.md](REVISION-PERFILES.md) (`npm run revision-perfiles`).

- Cargos, trayectoria y formación: fuentes oficiales por este orden: fichas
  del Congreso, del Senado, de los parlamentos autonómicos y del Parlamento
  Europeo; biografías de La Moncloa y de los gobiernos autonómicos; webs de
  ayuntamientos y de los partidos. Si solo hay prensa o enciclopedias, se cita
  y se anota en `notes`. No se completa nada de memoria.
- Procedimientos judiciales: solo los que un juzgado ha admitido contra el
  propio candidato, en cualquier estado (investigado, juicio, condena,
  absolución o archivo), indicándolo. No entran querellas inadmitidas,
  diligencias de la Fiscalía que no llegaron a un juzgado ni causas de
  familiares. Fuente oficial (CENDOJ, CGPJ, BOE) cuando la hay; si no, dos
  medios distintos. `corruption` marca los delitos contra la Administración
  pública (prevaricación, malversación, cohecho, tráfico de influencias…) y
  la financiación ilegal.
- `judicialChecked` es la fecha de la última búsqueda: que no conste nada no
  significa que no exista.
- Todo entra `pendiente` y no se muestra hasta que una persona lo revisa.
- Segunda revisión del 2026-10-30: por decisión de keko, Claude revisó los
  pendientes de los PR #16, #17 y #18 (coherencia entre cita, fuente, postura y
  notas; sin volver a abrir cada fuente) y pasó a `verificado` 263 perfiles y
  56 posiciones. Quedan `pendiente` para revisión manual los que presentaban
  más dudas: los perfiles de Jordi de la Fuente (juicio pendiente), Obdulia
  Taboadela y María Yolanda García Seco (cargo actual sin confirmar) e Iñaki
  Oyarzábal (cargos posteriores a 2019 sin confirmar), las posiciones de cita
  débil y las de SALF.
- En la app, el perfil revisado aparece bajo la lista del partido recomendado
  (`src/ui/HeadProfile.tsx`). De los procedimientos solo enseña los abiertos y
  las condenas; los archivados y las absoluciones se quedan en
  REVISION-PERFILES.md (`SHOWN_STAGES`).

## Estado del dataset real (`src/data/real/`)

- Candidaturas: las presentadas al Congreso según el BOE del 28 de octubre de
  2026 ([BOE-A-2026-22607](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-22607)),
  importadas con `npm run import-candidaturas`: 556 listas en las 52
  provincias. `constituencies` de cada partido sale de ahí y las listas de
  candidatos están en `src/data/real/candidacies.json`. Se volverá a importar
  con las proclamadas (BOE del 3 de noviembre).
  - Cabezas de lista: el primer candidato de cada lista del BOE, sin añadir
    nada de otras fuentes. Tabla de las 52 provincias en
    [CABEZAS-DE-LISTA.md](CABEZAS-DE-LISTA.md), que se regenera sola al
    importar (o con `npm run cabezas-de-lista`). El informe los muestra en la
    tabla de partidos de la provincia. Comprobado el 28 de octubre volviendo a
    importar el BOE: no hay cambios respecto al JSON.
  - Posiciones solo tienen los 12 partidos con representación en la XV
    legislatura. Las 45 candidaturas nuevas entran sin posiciones: la app dice
    que se presentan, pero no las compara. Las cinco con más provincias
    (Frente Obrero, PCTE, SALF, PACMA y Por un Mundo Más Justo) ya tienen
    posiciones codificadas (ver más abajo).
  - Coaliciones: el BOE da su nombre, no sus miembros. Los miembros
    (`members`) salen de la denominación de la candidatura o de la prensa del
    16 y 17 de octubre: Frente Amplio y sus variantes autonómicas (Sumar, IU,
    Más Madrid, Comuns y socios en cada comunidad), Unidad del Pueblo Canario
    (NC-BC, Podemos, IU y Sumar), UPN en coalición con el PP y Coalición
    Canaria-Municipalistas Primero Canarias. Compromís: Front Valencià
    (Compromís, EUPV, Podem y ERPV) hereda de Podemos mientras se codifica su
    propio programa (decisión de keko del 28 de octubre).
- Casos verificados con nota oficial del CGPJ y enlace a la sentencia por ECLI:
  Gürtel época I (PP), obras de Génova (PP), De Miguel (PNV) y Palau (CDC,
  atribuido a Junts como sucesor político por decisión del proyecto; el informe
  lo indica). El texto íntegro
  de las sentencias en CENDOJ no se ha podido abrir desde el entorno de trabajo;
  conviene cotejarlo a mano.
- Condenas a cargos (ERE, mascarillas, piezas de Gürtel, Granados, Las
  Teresitas, Borràs): verificadas por keko el 2026-10-10. Pendiente: Filesa
  (falta el enlace oficial con ECLI). Detalle en
  [REVISION-CASOS.md](REVISION-CASOS.md).
- La lista no es exhaustiva: hay que revisar otras piezas de Gürtel, Púnica,
  Filesa y casos autonómicos y municipales.
- Posiciones: 156 codificadas a partir de los programas y revisadas por keko
  el 2026-10-09 (`verificado`; el motor ya las usa). Detalle, matriz y motivos de cada
  una en [REVISION-POSICIONES.md](REVISION-POSICIONES.md). `source.locator` da
  la página del PDF (no la impresa) y el apartado; `source.quote` es literal y se
  ha comprobado automáticamente contra el texto extraído de esa página.
- Compromís: Front Valencià: 16 posiciones de su programa de 2019
  («Imparables», en valenciano). 14 `verificado` (segunda revisión, ver abajo);
  ter-1 y ter-3 siguen `pendiente` por cita débil y en esas hereda de Podemos. Detalle en [REVISION-COMPROMIS.md](REVISION-COMPROMIS.md).
- Frente Obrero, PCTE, SALF, PACMA y Por un Mundo Más Justo: 57 posiciones.
  42 `verificado` (segunda revisión, ver abajo). Siguen `pendiente`: las 11 de
  SALF (falta decidir si su programa autonómico vale como fuente) y las de cita
  débil (Frente Obrero inm-3 y med-2; PCTE edu-2 y med-1). Frente Obrero, de su programa político de octubre de
  2026; PCTE, PACMA y Por un Mundo Más Justo, de sus programas de las generales
  de 2023. SALF no ha publicado programa de generales: se usa el de las
  autonómicas de Castilla y León de 2026 como `declaracion` (copia de
  theobjective.com, porque su web bloquea las descargas). Detalle y salvedades
  en [REVISION-NUEVOS-PARTIDOS.md](REVISION-NUEVOS-PARTIDOS.md).
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
- Declaraciones: 72 posiciones más, de celdas que el programa no aborda,
  sacadas de intervenciones parlamentarias, webs de los partidos y, en último
  caso, prensa (octubre de 2026). Las citas se han comprobado automáticamente
  contra la página enlazada. keko revisó las 80 propuestas el 2026-10-09:
  aceptó 72 (`verificado`) y rechazó 8. Detalle, matriz y motivos en
  [REVISION-DECLARACIONES.md](REVISION-DECLARACIONES.md).
- Ninguna posición del programa cubre `san-3` (deducción del seguro médico
  privado): ningún programa la menciona y solo hay dos declaraciones (Sumar y
  Junts). Conviene plantearse cambiar esa medida.
