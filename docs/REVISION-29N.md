# Revisión de los programas del 29N

Posiciones codificadas con los programas que los partidos han publicado para las generales del 29 de noviembre de 2026, siguiendo [FUENTES.md](FUENTES.md). Búsqueda hecha el 15 de noviembre de 2026, ya en campaña. Las propuestas se dejaron `pendiente` en `src/data/real/positions-29n.json` para que una persona las revisara antes de pasar a `positions.json`.

> **Revisión del 16 de noviembre de 2026.** Por indicación de keko se han aplicado las 81 propuestas claras (`verificado`, ya en `positions.json`). Quedan 10 dudosas, `pendiente` en `positions-29n.json`, que keko valida una a una: Vox eco-1 e inm-3, PSOE eco-2, eco-3 y viv-3, PP edu-1 e inm-1, y Por un Mundo Más Justo eco-1, eco-2 e inm-3. Son cambios de postura que dependen de interpretar el texto o citas que solo cubren la medida de forma indirecta. Las tablas de abajo siguen listando las 91 tal como se propusieron.

## Cómo revisar y aplicar

1. Para cada fila, abrir el PDF en la página indicada (número de página del PDF, no el impreso), comprobar la cita y decidir si la postura es fiel a la medida.
2. En `src/data/real/positions-29n.json`, cambiar `verification` a `verificado` en las que se acepten, corregir `stance` donde haga falta y borrar las que se rechacen.
3. Ejecutar `npm run aplicar-29n`. Sustituye en `positions.json` la posición de ese partido y medida (sea del programa anterior o una declaración), actualiza el programa del partido en `parties.json` y quita del fichero de propuestas lo aplicado. `npm run aplicar-29n -- --todas` aplica también las pendientes, por si se decide aceptarlas en bloque.

Criterio: la posición del programa nuevo sustituye a la que hubiera. Donde el programa nuevo no se pronuncia, se mantiene la posición actual (del programa anterior o de una declaración), con su fuente. Las citas se han comprobado automáticamente contra el texto extraído de cada página.

## Estado de los programas (15 de noviembre de 2026)

| Partido | Programa 29N | Qué se ha hecho |
|---|---|---|
| PP | Publicado el 10 de noviembre («La reconstrucción nacional», 249 medidas) | [PDF oficial](https://www.pp.es/wp-content/uploads/2026/11/LA-RECONSTRUCCION-NACIONAL.pdf) |
| PSOE | Publicado el 15 de noviembre («La fuerza de seguir avanzando») | [PDF oficial](https://www.psoe.es/media-content/2026/11/PROGRAMAPSOE29N26.pdf) |
| Vox | Publicado el 12 de noviembre («Es sentido común») | [PDF oficial](https://www.voxespana.es/wp-content/uploads/2026/11/Programa-completo-A5-1.pdf) |
| ERC | Presentado el 5 de noviembre («Pel país. Per la gent. Pel futur.») | No está en la web de ERC; se usa la [copia de beteve.cat](https://img.beteve.cat/wp-content/uploads/2026/11/ERC-programa-electoral-29-N-2026-2026-11-12.pdf) |
| PNV | Presentado el 9 de noviembre («Euskadi zaindu. Defendemos Euskadi») | [PDF oficial](https://www.eaj-pnv.eus/es/adjuntos-documentos/21765/pdf/programa-electoral-29n) |
| CC (CCa-1.ºCAN) | Presentado el 9 de noviembre («Defiende Canarias», 10 causas y 100 medidas) | [PDF oficial](https://primerocanarias.com/wp-content/uploads/2026/11/CCA-26-Programa_Electoral-29NOV-comprimido.pdf) |
| SALF | Presentado el 10 de noviembre («Contrato electoral») | La web del partido bloquea las descargas; [copia de theobjective.com](https://theobjective.com/wp-content/uploads/2026/11/salf.pdf) |
| PACMA | Publicado en noviembre | [PDF oficial](https://pacma.es/wp-content/uploads/2026/11/PE_GENERALES_29N26.pdf) |
| Por un Mundo Más Justo | Publicado en noviembre (32 ejes) | [PDF oficial](https://www.porunmundomasjusto.es/wp-content/uploads/2026/11/Castellano.pdf) |
| BNG | Publicado el 3 de noviembre ([PDF](https://www.bng.gal/media/bnggaliza/files/2026/11/03/26_bng_xerais_documentos_programa_electoral.pdf)) | **Sin codificar**: bng.gal tiene una protección anti-bots que impide descargarlo desde el entorno de trabajo y no se ha encontrado otra copia. Hay que bajarlo a mano. |
| Frente Amplio (Sumar) | Sin programa completo; solo ejes sueltos presentados en campaña | Sin cambios (sigue el programa de Sumar de 2023) |
| Junts | Sin programa publicado | Sin cambios |
| EH Bildu | Sin programa publicado | Sin cambios |
| Podemos | Sin programa publicado (solo propuestas de Irene Montero en mitin) | Sin cambios |
| Compromís: Front Valencià | Propuestas sueltas en su web, sin programa completo localizado (compromis.net bloquea las descargas) | Sin cambios |
| PCTE | Sin programa nuevo | Sin cambios |
| Frente Obrero | Su programa es de octubre de 2026, ya usado | Sin cambios |
| UPN | Concurre en coalición con el PP (UPN-PP), sin programa propio | Sin cambios; la coalición hereda de UPN y del PP |

Las otras candidaturas sin posiciones no se han revisado en este pase.

## Matriz: actual → propuesta

`·` = sin posición. Entre paréntesis, de dónde sale la actual. Solo se listan las celdas con propuesta.

| Medida | PP | PSOE | Vox | ERC | PNV | CC | SALF | PACMA | MUNDO+JUSTO |
|---|---|---|---|---|---|---|---|---|---|
| eco-1 |  | +2 → +2 | -2 → **-1** | +2 → +2 |  |  |  |  | · → **+1** |
| eco-2 |  | -1 → -1 | +2 → +2 | -1 → -1 |  |  | +1 → **+2** |  | -2 → **-1** |
| eco-3 |  | -1 → -1 |  | -2 → -2 |  |  | +2 → +2 |  | · → **-2** |
| viv-1 | -2 → -2 | +1 → **+2** | -2 → -2 |  |  |  |  |  | +2 → +2 |
| viv-2 | +1 → +1 | +2 → +2 | +1 → +1 | +1 → **+2** |  | +1 → +1 |  | +2 → +2 | +1 → **+2** |
| viv-3 | +2 → +2 | +2 → **+1** | +2 → +2 |  |  |  | +2 → +2 |  |  |
| san-1 |  | +1 → **+2** | -1 → -1 | +2 → +2 |  |  | -1 → -1 | +2 → +2 | · → **+2** |
| san-2 |  | +1 → **+2** |  | +1 → **+2** |  |  |  | +2 → +2 |  |
| san-3 |  |  |  |  |  |  |  |  |  |
| edu-1 | · → **+1** |  |  |  |  |  | +1 → **+2** |  | +1 → +1 |
| edu-2 | +2 → +2 | +2 → +2 | +1 → **+2** | +2 → +2 |  | +2 → +2 |  | +2 → +2 |  |
| edu-3 | +1 → +1 |  | +1 → +1 | -2 → -2 |  |  | · → **+2** |  |  |
| emp-1 |  | +1 → **+2** |  | +1 → **+2** |  |  |  |  | +1 → **+2** |
| emp-2 | +1 → **+2** | +2 → +2 |  | +1 → **+2** | +2 → +2 |  | · → **+2** |  | +2 → +2 |
| emp-3 |  |  |  |  |  |  |  |  |  |
| inm-1 | -1 → **-2** |  | -2 → -2 |  |  |  | -2 → -2 |  | +2 → +2 |
| inm-2 | +2 → +2 |  | +2 → +2 | -2 → -2 | -1 → -1 |  | +2 → +2 |  | -2 → -2 |
| inm-3 | +1 → **+2** | +1 → +1 | +1 → **-1** |  | +2 → +2 |  |  |  | · → **+1** |
| med-1 | +2 → +2 | -2 → -2 | +2 → +2 |  |  |  |  | -1 → -1 |  |
| med-2 |  |  | -2 → -2 |  |  |  |  |  |  |
| med-3 |  |  |  |  |  |  |  |  |  |
| ter-1 | -1 → -1 |  |  | +2 → +2 | +2 → +2 | +2 → +2 |  |  |  |
| ter-2 | -2 → -2 |  | -2 → -2 | +2 → +2 | +1 → +1 |  |  |  |  |
| ter-3 | -1 → -1 | -1 → -1 |  | -2 → -2 | -2 → -2 |  |  |  |  |

En negrita, las que cambian de postura o son nuevas.

## Partido Popular

Programa: [Programa electoral del PP para las elecciones generales del 29 de noviembre de 2026 («La reconstrucción nacional»)](https://www.pp.es/wp-content/uploads/2026/11/LA-RECONSTRUCCION-NACIONAL.pdf)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| viv-1 | -2 (decl. 2026) | -2 | pág. 53 · 4.1 · medida 145 «Derogaremos la Ley de Vivienda» | «Eliminaremos las zonas tensionadas y el índice de precios» | Propone eliminar las zonas tensionadas y el índice de precios del alquiler: en contra de limitarlos. |
| viv-2 | +1 (prog. 2023) | +1 | pág. 54 · 4.1 · medida 151 «La financiación local impulsará la construcción de vivienda» | «al cumplimiento de objetivos de suelo, construcción y puesta a disposición de vivienda pública y a precio asequible» | Incentiva la vivienda pública y asequible, pero el grueso del plan es movilizar suelo y construcción privada: a favor moderado. |
| viv-3 | +2 (prog. 2023) | +2 | pág. 55 · 4.1 · medida 157 «El ocupa saldrá en 48 horas por orden judicial» | «Aprobaremos una ley para que el propietario pueda recuperar su vivienda en 48 horas desde el primer día.» | Desalojo en 48 horas: muy a favor de agilizar los desalojos. |
| edu-1 | · | +1 | pág. 67 · 4.7 · medida 212 «Los padres elegirán colegio…» | «Los conciertos durarán al menos seis años en todas las etapas, con módulos que cubran el coste real, para que la plaza concertada sea gratuita de verdad.» | Módulos de concierto que cubran el coste real de la plaza: se acerca a igualar la financiación, sin decirlo en esos términos. |
| edu-2 | +2 (prog. 2023) | +2 | pág. 57 · medida 163 «La escuela infantil de cero a tres años será gratuita» | «Al terminar la legislatura, la etapa será gratuita para todas las familias que la soliciten.» | 0-3 gratuito para todas las familias que lo pidan. |
| edu-3 | +1 (decl. 2025) | +1 | pág. 39 · medida 96 «Garantizaremos el derecho a recibir enseñanza en castellano en toda España» | «Garantizaremos el derecho constitucional de recibir enseñanza en castellano en todas las etapas del sistema educativo y en toda la Nación» | Derecho a la enseñanza en castellano, no una libre elección de lengua: a favor moderado (como la declaración que sustituye). |
| emp-2 | +1 (prog. 2023) | +2 | págs. 42-43 · medida 108 «Garantizaremos las pensiones de hoy y su futuro» | «Aseguraremos que mantengan su poder adquisitivo y suban cada año con el IPC.» | Compromiso explícito de subirlas cada año con el IPC (en 2023 solo hablaba de poder adquisitivo). |
| inm-1 | -1 (decl. 2026) | -2 | pág. 22 · 1.6 · medida 42 «Prohibiremos por ley las regularizaciones masivas e indiscriminadas y el arraigo será excepcional» | «Reformaremos la Ley de Extranjería para prohibir las regularizaciones masivas e indiscriminadas» | Prohibir las regularizaciones y hacer excepcional el arraigo: en contra de facilitarlas. |
| inm-2 | +2 (prog. 2023) | +2 | pág. 23 · medida 44 «Quien delinque será expulsado de España» | «Ampliaremos el tiempo máximo de permanencia en los centros de internamiento, dentro de los límites europeos, para que las expulsiones se ejecuten.» | Más internamiento para ejecutar expulsiones. |
| inm-3 | +1 (prog. 2023) | +2 | pág. 22 · 1.6 · medidas 40 y 41 | «Para venir a trabajar en sectores donde falten trabajadores habrá dos vías: llegar con un contrato firmado en origen o con un visado temporal para buscar empleo» | Llegada ligada a sectores con falta de trabajadores, con contrato en origen y cupos anuales por sector. |
| med-1 | +2 (prog. 2023) | +2 | pág. 71 · 4.9 · medida 228 «Eliminaremos el calendario de cierre de Almaraz, Ascó, Vandellós, Cofrentes y Trillo» | «En los primeros cien días de Gobierno tramitaremos la extensión de su vida útil» | Prolongar la vida útil de todas las centrales. |
| ter-1 | -1 (decl. 2025) | -1 | pág. 16 · 1.3 · medida 16 | «El Estado ejercerá por sí mismo, en todo el territorio, las competencias exclusivas que la Constitución le atribuye.» | Rechaza ceder competencias exclusivas del Estado, pero defiende el autogobierno actual: en contra moderado de ampliar competencias. |
| ter-2 | -2 (prog. 2023) | -2 | pág. 16 · medida 17 «Defenderemos la unidad de España y el orden constitucional» | «Recuperaremos en el Código Penal el delito de sedición, adaptado a la legislación contemporánea, y el de convocatoria de referéndum ilegal.» | Volver a tipificar la convocatoria de referéndum ilegal. |
| ter-3 | -1 (decl. 2025) | -1 | pág. 16 · 1.3 · medida 16 | «Defendemos el Estado de las Autonomías y el autogobierno de las Comunidades Autónomas en el marco de la Constitución.» | Defiende el autogobierno actual (y en sanidad «respetando sus competencias de gestión», p. 69); no propone devolver competencias al Estado. |

## Partido Socialista Obrero Español

Programa: [Programa electoral del PSOE para las elecciones generales del 29 de noviembre de 2026 («La fuerza de seguir avanzando»)](https://www.psoe.es/media-content/2026/11/PROGRAMAPSOE29N26.pdf)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| eco-1 | +2 (decl. 2024) | +2 | pág. 48 · Fiscalidad justa · compromiso 130 | «elevar los tipos a partir de ahí, llegando progresivamente a un tipo máximo del 35% para rentas del capital superiores a 300.000€» | Sube el IRPF de las rentas del capital más altas hasta el 35 %. |
| eco-2 | -1 (prog. 2023) | -1 | pág. 48 · Fiscalidad justa · compromiso 133 «Ley de Salarios Justos» | «al suponer un mayor coste en la tributación societaria» | No baja Sociedades; propone subirlo a cotizadas con grandes brechas salariales. |
| eco-3 | -1 (prog. 2023) | -1 | pág. 47 · compromiso 127 «Ingresos nuevos para derechos nuevos» | «La recaudación de la tributación complementaria de los grandes patrimonios» | Cuenta con la tributación de los grandes patrimonios para financiar la prestación por crianza: no la suprimiría. |
| viv-1 | +1 (prog. 2023) | +2 | pág. 30 · Vivienda · compromiso 62 | «Congelar temporalmente las rentas que superen los índices de referencia, evitando incrementos abusivos en los mercados tensionados.» | Congelar rentas por encima del índice en zonas tensionadas (en 2023, +1). |
| viv-2 | +2 (prog. 2023) | +2 | pág. 28 · Vivienda · compromiso 42 | «Constituir un parque público estatal de 100.000 viviendas mediante la construcción y adquisición» | Parque público estatal de 100.000 viviendas y el 1 % del PIB a vivienda. |
| viv-3 | +2 (prog. 2023) | +1 | pág. 100 · Justicia (balance de la legislatura) | «la ocupación ilegal de viviendas, tanto el allanamiento de morada como la usurpación, se juzga desde abril de 2025 por el procedimiento de juicios rápidos» | Reivindica los juicios rápidos contra la ocupación, pero no propone nada nuevo: a favor moderado (en 2023, +2). |
| san-1 | +1 (prog. 2023) | +2 | pág. 49 · Sanidad · compromiso 138 | «Limitar la privatización de la sanidad estableciendo la gestión directa como modalidad preferente en la prestación sanitaria.» | Gestión directa como modalidad preferente (en 2023, +1). |
| san-2 | +1 (prog. 2023) | +2 | pág. 49 · Sanidad · compromiso 137 «Plan Sonríe: salud bucodental pública» | «Incorporaremos progresivamente a la sanidad pública los tratamientos básicos para toda la población adulta» | Tratamientos dentales básicos públicos para todos los adultos (en 2023, +1). |
| edu-2 | +2 (prog. 2023) | +2 | pág. 51 · Educación · compromiso 157 | «Universalizar la educación de 0 a 3 años» | Universalizar el 0-3. |
| emp-1 | +1 (prog. 2023) | +2 | pág. 41 · Trabajo digno · compromiso 108 | «Completar la reducción de la jornada a 37,5 horas e incentivar los avances en la negociación colectiva hacia las 35 horas.» | 37,5 horas sin perder salario y hacia las 35 (en 2023, +1). |
| emp-2 | +2 (prog. 2023) | +2 | pág. 40 · Pensiones · compromiso 100 | «Blindar constitucionalmente el sistema público de pensiones y su revalorización conforme al IPC» | Revalorización con el IPC en la Constitución. |
| inm-3 | +1 (prog. 2023) | +1 | pág. 92 · Impulsar una política migratoria regular, humana y eficaz | «impulsar la contratación en origen» | Contratación en origen como vía, sin ligarla de forma exclusiva a los empleos que faltan. |
| med-1 | -2 (prog. 2023) | -2 | pág. 66 · Transición ecológica · compromiso 240 | «Mantener el calendario de cierre de las centrales nucleares hasta 2035» | Mantiene el calendario de cierre. |
| ter-3 | -1 (prog. 2023) | -1 | pág. 91 · Un Estado autonómico que funciona | «el reto no es recentralizar ni fragmentar, sino hacer que el Estado autonómico funcione mejor» | Rechaza recentralizar. |

## Vox

Programa: [Programa electoral de Vox para las elecciones generales del 29 de noviembre de 2026 («Es sentido común»)](https://www.voxespana.es/wp-content/uploads/2026/11/Programa-completo-A5-1.pdf)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| eco-1 | -2 (prog. 2023) | -1 | pág. 9 · Economía · medida 3 | «Simplificación y bajada del IRPF.» | Bajada general del IRPF, sin tipos concretos (en 2023 proponía tipos únicos del 15 y el 25 %, −2). |
| eco-2 | +2 (prog. 2023) | +2 | pág. 9 · Economía · medida 3 | «Reducir el tipo del Impuesto de Sociedades» | Bajar Sociedades. |
| viv-1 | -2 (prog. 2023) | -2 | pág. 23 · Vivienda · medida 30 | «Derogación de la Ley de Vivienda.» | Derogar la ley que permite topar alquileres en zonas tensionadas. |
| viv-2 | +1 (prog. 2023) | +1 | pág. 23 · Vivienda · medida 29 | «Aumentar con urgencia la construcción de vivienda protegida para las familias españolas mediante su promoción y colaboración público-privada» | Más vivienda protegida, sobre todo con colaboración público-privada. |
| viv-3 | +2 (prog. 2023) | +2 | pág. 24 · Vivienda · medida 31 | «Desalojo de la vivienda okupada en menos de 24 horas» | Desalojo en 24 horas. |
| san-1 | -1 (prog. 2023) | -1 | pág. 37 · Sanidad · medida 62 | «Fomento de la colaboración público-privada cuando ayude efectivamente a reducir demoras» | Más colaboración público-privada para las listas de espera. |
| edu-2 | +1 (prog. 2023) | +2 | pág. 51 · Familia y vida · medida 94 | «la gratuidad real de la educación infantil de 0 a 3 años» | 0-3 gratuito (en 2023, +1). |
| edu-3 | +1 (prog. 2023) | +1 | pág. 41 · Educación · medida 66 | «Se garantizará la educación en español en todo el territorio nacional.» | Garantiza la enseñanza en español, no una elección libre de lengua. |
| inm-1 | -2 (prog. 2023) | -2 | pág. 15 · Inmigración · medida 9 | «Quien entra de forma ilegal jamás podrá regularizar su situación.» | Prohíbe las regularizaciones y suprime el arraigo. |
| inm-2 | +2 (prog. 2023) | +2 | pág. 15 · Inmigración · medidas 12 a 14 | «Repatriación de quienes permanezcan en situación ilegal en nuestra nación.» | Repatriaciones, remigración y deportaciones. |
| inm-3 | +1 (prog. 2023) | -1 | pág. 15 · Inmigración · medida 9 «Ni uno más» | «España no puede acoger a más inmigrantes.» | Dudosa: ya no habla de inmigración ligada a los empleos (en 2023, +1) sino de no admitir más; se codifica en contra moderado. |
| med-1 | +2 (prog. 2023) | +2 | pág. 12 · Economía, industria y energía · medida 8 | «Se garantizará la supervivencia de las centrales nucleares actuales, derogando el calendario de cierre.» | Derogar el calendario de cierre. |
| med-2 | -2 (prog. 2023) | -2 | págs. 11-12 · Economía, industria y energía · medida 8 | «Revertir las normativas que atacan frontalmente a la industria nacional (prohibición de motores de combustión» | Revertir la prohibición de los motores de combustión. |
| ter-2 | -2 (prog. 2023) | -2 | pág. 56 · Justicia y corrupción · medida 103 | «Ilegalización de los partidos políticos, asociaciones u organizaciones de cualquier tipo que atenten contra la soberanía e independencia de España, su unidad e integridad territorial.» | Ilegalizar a quien atente contra la unidad territorial. |

## Esquerra Republicana de Catalunya

Programa: [Programa electoral d'ERC per a les eleccions al Congrés del 29 de novembre de 2026 («Pel país. Per la gent. Pel futur.»; copia de beteve.cat)](https://img.beteve.cat/wp-content/uploads/2026/11/ERC-programa-electoral-29-N-2026-2026-11-12.pdf)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| eco-1 | +2 (prog. 2023) | +2 | pág. 21 · Cost de la vida · proposta 69 | «Augmentar el tipus màxim de l’IRPF sobre els guanys de capital del 30 % al 35 %» | Sube el tipo máximo del IRPF de las rentas del capital. |
| eco-2 | -1 (prog. 2023) | -1 | pág. 27 · Treball autònom · proposta 116 | «reforçar la progressivitat de l’impost sobre societats» | Más progresividad en Sociedades, no bajarlo. |
| eco-3 | -2 (prog. 2023) | -2 | pág. 22 · Cost de la vida · Fiscalitat dels multimilionaris | «Fer permanent l’impost temporal de solidaritat de les grans fortunes» | Hacer permanente y subir el impuesto a las grandes fortunas: en contra de suprimir la imposición sobre el patrimonio. |
| viv-2 | +1 (prog. 2023) | +2 | pág. 19 · Pla de xoc sobre l’habitatge · Augment del finançament estatal | «incrementar el parc públic d’habitatges de lloguer als estàndards europeus» | Al menos el 1,5 % del PIB a vivienda para ampliar el parque público de alquiler (en 2023, +1). |
| san-1 | +2 (decl. 2024) | +2 | pág. 41 · Enfortir la sanitat pública · proposta 233 | «frenar la privatització de la sanitat» | Sanidad «amb gestió pública» y frenar la privatización (sustituye a una declaración). |
| san-2 | +1 (prog. 2023) | +2 | pág. 42 · Enfortir la sanitat pública · proposta 237 | «garantir l’accés universal i gratuït a l’atenció bucodental» | Atención bucodental universal y gratuita (en 2023, +1). |
| edu-2 | +2 (prog. 2023) | +2 | pág. 11 · Escola catalana · proposta 20 | «Assegurar el finançament estatal de l’educació pública i gratuïta de 0 a 3 anys.» | 0-3 público, universal y gratuito. |
| edu-3 | -2 (prog. 2023) | -2 | pág. 10 · Escola catalana | «El català com a llengua vehicular i la immersió lingüística són pilars del nostre model educatiu.» | Defiende la inmersión: en contra de que las familias elijan la lengua. |
| emp-1 | +1 (prog. 2023) | +2 | pág. 26 · Treball digne · proposta 105 | «Reduir la durada màxima de la jornada laboral setmanal a 37 hores i mitja sense reducció salarial.» | 37,5 horas sin reducir el sueldo (en 2023, +1). |
| emp-2 | +1 (prog. 2023) | +2 | pág. 26 · Treball digne · propostes 106 i 107 | «Cal garantir l’actualització de pensions públiques d’acord amb la inflació.» | Pensiones actualizadas con la inflación, incluso con un IPC por territorio (en 2023, +1). |
| inm-2 | -2 (prog. 2023) | -2 | pág. 17 · Unió Europea · proposta 51 | «Posar fi a l’externalització de les fronteres i garantir vies legals i segures per migrar.» | Contra la externalización de fronteras, los centros de retorno y las deportaciones automáticas. |
| ter-1 | +2 (prog. 2023) | +2 | pág. 14 · Més sobirania i competències | «Catalunya aspira a desenvolupar l’autogovern i a assumir plenament totes les competències.» | Todas las competencias para Cataluña. |
| ter-2 | +2 (prog. 2023) | +2 | pág. 8 · Autodeterminació · proposta 1 | «Negociar la convocatòria d’un referèndum d’autodeterminació a Catalunya» | Referéndum de autodeterminación negociado. |
| ter-3 | -2 (prog. 2023) | -2 | pág. 14 · Més sobirania i competències | «No permetrem cap passa enrere en l’autogovern de Catalunya, ni en l’àmbit de la salut, ni en el de l’habitatge ni en el de l’educació.» | Ningún paso atrás en salud ni educación. |

## EAJ-PNV

Programa: [Programa electoral de EAJ-PNV para las elecciones generales del 29 de noviembre de 2026 («Euskadi zaindu. Defendemos Euskadi»)](https://www.eaj-pnv.eus/es/adjuntos-documentos/21765/pdf/programa-electoral-29n)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| emp-2 | +2 (prog. 2023) | +2 | pág. 31 · 4.1 Pensiones dignas · Poder adquisitivo, 01 | «revalorizarlas anualmente conforme al IPC» | Revalorización anual con el IPC. |
| inm-2 | -1 (prog. 2023) | -1 | pág. 28 · 3.5 Derechos humanos · 06 | «Reforzar las garantías de las personas migrantes y solicitantes de asilo en las fronteras, promoviendo alternativas a la privación de libertad en los Centros de Internamiento de Extranjeros» | Más garantías en frontera y alternativas al internamiento: en contra moderado de endurecer. |
| inm-3 | +2 (prog. 2023) | +2 | pág. 25 · 3.2 Una migración gestionada desde Euskadi · 08 | «Favorecer la contratación en origen, vinculada a las necesidades del mercado laboral vasco» | Contratación en origen ligada a las necesidades del mercado laboral. |
| ter-1 | +2 (prog. 2023) | +2 | pág. 38 · 5.1 Lo pactado se cumple · 01 | «Asegurar el cumplimiento íntegro del Estatuto de Gernika y la culminación de todas las transferencias pendientes» | Todas las transferencias pendientes y más (migración, justicia, Seguridad Social). |
| ter-2 | +1 (prog. 2023) | +1 | pág. 39 · 5.2 Concierto político · 03 | «el respeto a la voluntad democrática de la sociedad vasca y la capacidad de decisión de sus instituciones» | Reconocimiento nacional y capacidad de decisión, sin pedir un referéndum explícito. |
| ter-3 | -2 (prog. 2023) | -2 | pág. 38 · 5.1 Lo pactado se cumple | «defenderemos las que ya ejercemos frente a cualquier intento de recentralización» | Rechaza cualquier recentralización. |

## Coalición Canaria

Programa: [Bases del programa electoral de Coalición Canaria y Municipalistas Primero Canarias para las elecciones generales del 29 de noviembre de 2026 («Defiende Canarias»)](https://primerocanarias.com/wp-content/uploads/2026/11/CCA-26-Programa_Electoral-29NOV-comprimido.pdf)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| viv-2 | +1 (decl. 2023) | +1 | pág. 10 · Derecho a vivir y permanecer en Canarias · medida 22 | «Impulsaremos un fondo estatal de ocho años para cofinanciar vivienda pública y asequible» | Fondo estatal plurianual para vivienda pública y asequible (sustituye a una declaración). |
| edu-2 | +2 (prog. 2019) | +2 | pág. 9 · Defender los derechos de Canarias · medida 14 «Educación infantil de cero a tres años» | «Reforzaremos la financiación estatal para una oferta suficiente de plazas públicas gratuitas y de calidad.» | Plazas 0-3 públicas y gratuitas. |
| ter-1 | +2 (prog. 2019) | +2 | pág. 3 · Introducción | «Aspiramos al máximo autogobierno en un Estado que reconozca y articule de común acuerdo su realidad plurinacional.» | Máximo autogobierno y completar los traspasos del Estatuto. |

## Se Acabó la Fiesta

Programa: [Contrato electoral de SALF para las elecciones generales del 29 de noviembre de 2026 (copia de theobjective.com; la web del partido bloquea las descargas)](https://theobjective.com/wp-content/uploads/2026/11/salf.pdf)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| eco-2 | +1 (decl. 2026) | +2 | pág. 13 · III Impuestos · 5 | «Del 25 al 20 % en dos años» | Sociedades del 25 al 20 %. |
| eco-3 | +2 (decl. 2026) | +2 | pág. 13 · III Impuestos · 6 | «Sucesiones, Donaciones y Patrimonio: suprimidos.» | Suprimir Patrimonio. |
| viv-3 | +2 (decl. 2026) | +2 | pág. 5 · I Vivienda · 3 | «Con denuncia y título de propiedad, la Policía desaloja en 48 horas.» | Desalojo policial en 48 horas. |
| san-1 | -1 (decl. 2026) | -1 | pág. 23 · VI Sanidad · 2 | «Superado el plazo, eliges centro, público o privado, y lo paga la sanidad pública.» | Derivación a la privada pagada por la pública cuando se superan los plazos. |
| edu-1 | +1 (decl. 2026) | +2 | pág. 35 · IX Educación · 6 | «Cheque escolar válido en pública, concertada y privada, con el mismo importe por alumno» | Mismo importe por alumno en pública y concertada. |
| edu-3 | · | +2 | pág. 34 · IX Educación · 2 | «Derecho a la enseñanza en castellano en toda España, exigible por la familia» | La familia puede exigir la enseñanza en castellano. |
| emp-2 | · | +2 | pág. 20 · V Pensiones · 1 | «Revalorización con el IPC y prohibición de recortes, con rango constitucional.» | IPC garantizado en la Constitución. |
| inm-1 | -2 (decl. 2026) | -2 | pág. 17 · IV Inmigración · 2 | «prohibición por ley orgánica de cualquier regularización masiva» | Fin de las regularizaciones y revisión de la de 2026. |
| inm-2 | +2 (decl. 2026) | +2 | pág. 17 · IV Inmigración · 1 | «Identificación, orden y salida en 48 horas.» | Expulsión en 48 horas. |

## Partido Animalista con el Medio Ambiente

Programa: [Programa electoral de PACMA para las elecciones generales del 29 de noviembre de 2026](https://pacma.es/wp-content/uploads/2026/11/PE_GENERALES_29N26.pdf)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| viv-2 | +2 (prog. 2023) | +2 | pág. 69 · 3.5 Por una vivienda digna: mayor parque de vivienda social | «La solución real pasa por la construcción masiva de vivienda pública» | Construcción masiva de vivienda pública. |
| san-1 | +2 (prog. 2023) | +2 | pág. 56 · 3.2.1 Por una sanidad pública, universal y de calidad | «Reintegración al sistema sanitario público los servicios privatizados.» | Revertir las privatizaciones. |
| san-2 | +2 (prog. 2023) | +2 | pág. 59 · 3.2.7 Salud bucodental | «Desde PACMA defendemos el impulso de una atención bucodental gratuita, con una asistencia dental básica para todas las personas» | Atención dental básica gratuita para todos. |
| edu-2 | +2 (prog. 2023) | +2 | pág. 59 · 3.3 Educación | «promover la educación universal de 0 a 3 años» | 0-3 universal con plazas públicas suficientes (p. 60). |
| med-1 | -1 (prog. 2023) | -1 | pág. 34 · 2. Medio ambiente · energía | «El modelo energético basado en el uso masivo de los combustibles fósiles y la energía nuclear es insostenible» | Rechaza la nuclear como modelo, sin hablar del calendario de cierre. |

## Por un Mundo Más Justo

Programa: [Programa de Por un Mundo Más Justo para las elecciones generales del 29 de noviembre de 2026](https://www.porunmundomasjusto.es/wp-content/uploads/2026/11/Castellano.pdf)

| Medida | Actual | Propuesta | Dónde | Cita | Motivo |
|---|---|---|---|---|---|
| eco-1 | · | +1 | pág. 26 · Fiscalidad justa · 01 | «equiparando la tributación de las rentas del capital y del trabajo y aplicando los mismos criterios de progresividad» | Más progresividad para las rentas del capital, sin hablar de subir el tipo máximo general. |
| eco-2 | -2 (prog. 2023) | -1 | pág. 27 · Fiscalidad justa · 06 | «Incrementar la contribución fiscal de las grandes empresas» | Más impuestos a las grandes empresas, no bajar Sociedades (en 2023, −2). |
| eco-3 | · | -2 | pág. 27 · Fiscalidad justa · 04 | «Reforzar la progresividad del Impuesto sobre el Patrimonio» | Reforzar Patrimonio y un mínimo del 3 % a los patrimonios de más de 50 millones. |
| viv-1 | +2 (prog. 2023) | +2 | pág. 8 · Vivienda · 04 «Regular los alquileres privados» | «Establecer un alquiler de referencia y limitar el precio en función de las características y localización de la vivienda.» | Limitar el precio del alquiler. |
| viv-2 | +1 (prog. 2023) | +2 | pág. 5 · Vivienda · 01 | «Crear un gran parque público de vivienda asequible en alquiler.» | 1,35 millones de viviendas sociales en 2030 (en 2023, +1). |
| san-1 | · | +2 | pág. 38 · Sanidad · Atención Primaria | «Frenar la privatización y recuperar progresivamente los servicios externalizados, priorizando la gestión pública directa.» | Revertir externalizaciones. |
| edu-1 | +1 (prog. 2023) | +1 | pág. 45 · Educación · 01 | «Apoyar la coexistencia de la educación pública y privada, concertada y no concertada, reconociendo especialmente la aportación social de la concertada» | Apoya la concertada, sin hablar de igualar la financiación. |
| emp-1 | +1 (prog. 2023) | +2 | pág. 29 · Trabajo digno · 02 | «Reducir progresivamente la jornada laboral hasta las 35 horas semanales, sin reducción salarial» | 35 horas sin bajar el sueldo (en 2023, +1). |
| emp-2 | +2 (prog. 2023) | +2 | pág. 24 · Pensiones · 01 | «garantizar que nunca pierdan poder adquisitivo» | Pensiones que nunca pierdan poder adquisitivo, en la Constitución. |
| inm-1 | +2 (prog. 2023) | +2 | pág. 30 · Trabajo digno · 05 | «Garantizar vías accesibles y estables de regularización de las personas migrantes que viven y trabajan en España» | Vías estables de regularización. |
| inm-2 | -2 (prog. 2023) | -2 | pág. 51 · Migración · 04 y 05 | «poner fin al internamiento de personas migrantes por motivos administrativos» | Fin de los CIE y de las devoluciones en caliente. |
| inm-3 | · | +1 | pág. 51 · Migración · 02 | «Facilitar vías legales y seguras de migración y permisos de trabajo en origen.» | Permisos de trabajo en origen como vía legal, sin ligar la llegada solo a los empleos que faltan. |
