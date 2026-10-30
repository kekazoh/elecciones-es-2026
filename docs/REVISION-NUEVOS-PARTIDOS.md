# Revisión de posiciones: partidos nuevos con presencia amplia

Frente Obrero (52 provincias), PCTE (44), SALF (46), PACMA (37) y Por un Mundo Más Justo (29) se presentan el 29N en muchas provincias, pero hasta ahora entraban sin posiciones: la app decía que se presentan y no los comparaba. Estas 57 posiciones salen de sus programas, con cita literal y página del PDF. Política de citas: [FUENTES.md](FUENTES.md).

Todas entran como `pendiente`, y el motor solo usa las `verificado`: hasta la revisión estos partidos siguen saliendo como «pocos datos». Cómo revisar: abrir el PDF en la página indicada, comprobar la cita y decidir si la postura es fiel al enunciado. Si lo es, cambiar `verification` a `verificado` en `src/data/real/positions.json`; si no, corregir `stance` o borrar la posición. Las citas se han comprobado automáticamente contra el texto extraído de cada página. El "Motivo" es la justificación del codificador y no se guarda en el dataset.

## Fuentes y salvedades

| Partido | Documento | Salvedad |
|---|---|---|
| Frente Obrero | [Programa político del Frente Obrero («Un programa para recuperar España», octubre de 2026)](https://frenteobrero.es/wp-content/uploads/2026/10/Programa.pdf) | Programa político publicado en octubre de 2026, el único de estas elecciones. El propio documento dice que «no pretende ser un programa electoral, es el programa político del Frente Obrero». La fecha es la de la página que lo enlaza (7 de octubre). |
| PCTE | [Programa de lucha 2023-2027 del PCTE (elecciones generales de julio de 2023; aún no ha publicado el del 29N)](https://www.pcte.es/wp-content/uploads/2023/07/PROGRAMA%20DE%20LUCHA%202023-2027.pdf) | Su «Programa de lucha» para las generales de 2023. El documento dice que «no es un programa electoral», sino sus líneas de actuación para la legislatura. Aún no ha publicado el del 29N. |
| SALF | [Programa electoral de SALF para las elecciones a las Cortes de Castilla y León de 2026 («Contrato electoral»; copia de theobjective.com; SALF no ha publicado programa de generales)](https://theobjective.com/wp-content/uploads/2026/03/Programa-electoral-CyL-de-Alvise-Pe%CC%81rez.pdf) | No ha publicado programa de generales ni lo tuvo en las europeas de 2024. Se usa su programa de las autonómicas de Castilla y León de 2026, así que las posiciones entran como `declaracion` (`web_partido`, programa autonómico) y pesan tres cuartos. La web del partido (seacabolafiesta.com) bloquea las descargas automáticas: se cita la copia que publicó theobjective.com. El texto está copiado en parte del de Aragón (habla de «aragoneses» y da la fecha de las elecciones aragonesas). Varias medidas son autonómicas (IRPF autonómico, patrimonio en CyL, 0-3 en CyL). |
| PACMA | [Programa electoral de PACMA para las elecciones generales del 23 de julio de 2023 (aún no ha publicado el del 29N)](https://pacma.es/wp-content/uploads/2023/07/PACMA_PE_GENERALES_23J23.pdf) | Programa de las generales de 2023, de pacma.es. Es casi entero sobre animales y medio ambiente: solo 5 medidas. |
| Por un Mundo Más Justo | [Programa de Por un Mundo Más Justo para las elecciones generales de 2023 («Conectamos buena gente»; aún no ha publicado el del 29N)](https://www.porunmundomasjusto.es/wp-content/uploads/2023/07/Programa-Electoral-Por-Un-Mundo-Mas-Justo-Elecciones-Generales-2023.pdf) | Programa de las generales de 2023, de su web. Cada página del PDF es una doble página impresa. |

## Matriz

`·` = el programa no se pronuncia y no se crea la posición.

| Medida | Enunciado | Frente Obrero | PCTE | SALF | PACMA | Por un Mundo Más Justo |
|---|---|---|---|---|---|---|
| eco-1 | Las rentas más altas deberían pagar un tipo de IRPF más alto que el actual. | +2 | · | · | · | · |
| eco-2 | Habría que bajar el impuesto de sociedades para atraer empresas. | -2 | · | +1 | · | -2 |
| eco-3 | El impuesto sobre el patrimonio debería suprimirse. | -2 | · | +2 | · | · |
| viv-1 | Las administraciones deberían poder limitar el precio del alquiler en zonas con precios muy altos. | · | +2 | -2 | · | +2 |
| viv-2 | El Estado debería construir mucha más vivienda pública de alquiler, aunque suponga más gasto. | +2 | +1 | · | +2 | +1 |
| viv-3 | Habría que agilizar los desalojos en casos de ocupación ilegal de viviendas. | +1 | -1 | +2 | · | · |
| san-1 | Habría que reducir la gestión privada de hospitales públicos. | +2 | +2 | -1 | +2 | · |
| san-2 | La atención dental básica debería estar cubierta por la sanidad pública. | +2 | +2 | · | +2 | · |
| san-3 | Quien contrate un seguro médico privado debería poder deducírselo en la declaración de la renta. | · | · | · | · | · |
| edu-1 | Los colegios concertados deberían recibir la misma financiación por alumno que los públicos. | -2 | -2 | +1 | · | +1 |
| edu-2 | La educación de 0 a 3 años debería ser gratuita y universal. | +2 | +1 | +2 | +2 | +1 |
| edu-3 | En las comunidades con lengua cooficial, las familias deberían poder elegir la lengua en que estudian sus hijos. | +2 | · | · | · | · |
| emp-1 | La jornada laboral máxima debería bajar de 40 horas semanales sin reducir el sueldo. | · | +2 | · | · | +1 |
| emp-2 | Las pensiones deberían subir siempre al menos lo mismo que los precios (IPC). | · | · | · | · | +2 |
| emp-3 | Debería retrasarse la edad de jubilación para asegurar que el sistema de pensiones sea sostenible. | -2 | -2 | · | · | · |
| inm-1 | Debería facilitarse la regularización de inmigrantes que ya viven y trabajan en España. | -2 | +2 | -2 | · | +2 |
| inm-2 | Habría que endurecer los controles en frontera y aumentar las expulsiones de quien entra de forma irregular. | +2 | -2 | +2 | · | -2 |
| inm-3 | La llegada de inmigrantes debería ligarse a los empleos que hacen falta, por ejemplo contratando en el país de origen. | +1 | · | · | · | · |
| med-1 | Las centrales nucleares deberían seguir funcionando más allá del calendario de cierre previsto. | +2 | +1 | +2 | -1 | · |
| med-2 | Debería adelantarse la prohibición de vender coches nuevos de gasolina y diésel. | -1 | · | · | · | · |
| med-3 | Los impuestos sobre los combustibles deberían bajar aunque eso aumente las emisiones. | +1 | · | +1 | · | · |
| ter-1 | Las comunidades autónomas deberían tener más competencias que ahora. | -2 | · | · | · | · |
| ter-2 | Debería poder celebrarse un referéndum de independencia en una comunidad si su parlamento lo pide. | -2 | · | · | · | · |
| ter-3 | Algunas competencias, como educación o sanidad, deberían volver a ser del Estado central. | +2 | · | · | · | · |

Citas más débiles: Frente Obrero inm-3 y med-2; PCTE edu-2 y med-1. En SALF conviene decidir antes si un programa autonómico basta como fuente.

## Frente Obrero

### eco-1 · Las rentas más altas deberían pagar un tipo de IRPF más alto que el actual.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 18 del PDF · 06 Fiscalidad (medida 1) | «Reducir el impuesto sobre la renta a los trabajadores con menos recursos, a la par que incrementarlo para las rentas más altas con la ampliación de los tramos de renta y aumento de los tipos impositivos.» | Literal: subir los tipos a las rentas más altas. |

### eco-2 · Habría que bajar el impuesto de sociedades para atraer empresas.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 19 del PDF · 06 Fiscalidad (medida 5) | «Aumentar el impuesto de sociedades y de patrimonio para las grandes empresas que no contribuyen lo suficiente a la riqueza nacional.» | Propone subir sociedades, no bajarlo. |

### eco-3 · El impuesto sobre el patrimonio debería suprimirse.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 19 del PDF · 06 Fiscalidad (medida 6) | «El impuesto de sucesiones y de patrimonio se centralizará y se suprimirán las bonificaciones que benefician sobre todo a los más ricos.» | Mantiene y centraliza patrimonio, quitando bonificaciones. |

### viv-2 · El Estado debería construir mucha más vivienda pública de alquiler, aunque suponga más gasto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 45 del PDF · 15 Vivienda (medida 1) | «Construir vivienda pública de calidad para aumentar el número de inmuebles existentes y lograr que los trabajadores puedan acceder a una vivienda digna y asequible económicamente.» | Construir vivienda pública; la introducción pide que sea «numerosa». |

### viv-3 · Habría que agilizar los desalojos en casos de ocupación ilegal de viviendas.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 46 del PDF · 15 Vivienda (medida 4) | «Se actuará a su vez contra la ocupación de viviendas de particulares, que no debe ser permitida en ningún caso.» | Contra la ocupación de viviendas de particulares, pero no habla de agilizar desalojos y en la medida 3 pide paralizar desahucios de familias vulnerables: +1. |

### san-1 · Habría que reducir la gestión privada de hospitales públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 42 del PDF · 14 Sanidad | «Acabar con el proceso de externalización y privatización de la sanidad.» | Literal. |

### san-2 · La atención dental básica debería estar cubierta por la sanidad pública.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 42 del PDF · 14 Sanidad (medida 4) | «Implantar la estructura adecuada para asegurar el cuidado y tratamiento bucodental, fisioterapéutico y oftalmológico gratuito.» | Atención bucodental gratuita. |

### edu-1 · Los colegios concertados deberían recibir la misma financiación por alumno que los públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 22 del PDF · 07 Educación (medida 4) | «Eliminar las subvenciones a la escuela privada con el fin de fortalecer el sistema público de educación.» | Quitar las subvenciones a la privada incluye los conciertos: lo contrario de igualar su financiación. |

### edu-2 · La educación de 0 a 3 años debería ser gratuita y universal.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 34 del PDF · 11 Natalidad y familia (medida 2) | «Se construirán guarderías y jardines de infancia públicos y gratuitos para facilitar la compatibilidad del trabajo y la maternidad.» | Guarderías públicas y gratuitas; no dice «universal», pero se codifica como Compromís (+2). |

### edu-3 · En las comunidades con lengua cooficial, las familias deberían poder elegir la lengua en que estudian sus hijos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 22 del PDF · 07 Educación (medida 9) | «Garantizar el derecho a todo el mundo de estudiar en castellano o en las lenguas cooficiales del Estado.» | Derecho a elegir estudiar en castellano o en la lengua cooficial. |

### emp-3 · Debería retrasarse la edad de jubilación para asegurar que el sistema de pensiones sea sostenible.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 48 del PDF · 16 Pensiones (medida 1) | «Revertir el incremento de la edad de jubilación y establecer una edad de retiro adecuada al puesto laboral desempeñado.» | Revertir el retraso de la jubilación. |

### inm-1 · Debería facilitarse la regularización de inmigrantes que ya viven y trabajan en España.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 53 del PDF · 17 Inmigración (medida 3) | «Imposibilidad de regularse si han intentado entrar de forma ilegal. Revisión de los permisos de residencia a aquellos que hayan entrado de forma ilegal y lo hayan conseguido en los últimos años.» | Cierra la regularización y revisa las ya concedidas. |

### inm-2 · Habría que endurecer los controles en frontera y aumentar las expulsiones de quien entra de forma irregular.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 53 del PDF · 17 Inmigración (medida 3) | «Expulsión inmediata de todos aquellos inmigrantes que delinquen de forma reiterada o que están de forma irregular en el país.» | Expulsión inmediata de quien está en situación irregular; medida 1: «control absoluto de las fronteras». |

### inm-3 · La llegada de inmigrantes debería ligarse a los empleos que hacen falta, por ejemplo contratando en el país de origen.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 52 del PDF · 17 Inmigración (introducción) | «Siendo más lógico que los inmigrantes que deban de venir por las necesidades del país hasta que se resuelva la situación sean de contexto europeo o hispanoamericano.» | Acepta inmigración «por las necesidades del país», pero como algo transitorio y restringido por origen: +1 y cita débil. |

### med-1 · Las centrales nucleares deberían seguir funcionando más allá del calendario de cierre previsto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 16 del PDF · 05 Soberanía energética (medidas 4 y 5) | «Frenar el cierre paulatino de las centrales energéticas que se encuentran en plenas capacidades productivas.» | Frenar cierres y, en la medida 5, ampliar el parque nuclear. |

### med-2 · Debería adelantarse la prohibición de vender coches nuevos de gasolina y diésel.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -1 | pág. 15 del PDF · 05 Soberanía energética (medida 1) | «Poner fin a la llamada “transición ecológica”» | No habla de coches; se opone a la transición ecológica en general: −1 y cita débil. |

### med-3 · Los impuestos sobre los combustibles deberían bajar aunque eso aumente las emisiones.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 16 del PDF · 05 Soberanía energética (medida 2) | «La regulación inmediata de la factura de la luz y de los combustibles.» | Regular el precio de los combustibles, «inflados por los costosos impuestos»; no pide bajar el impuesto en concreto: +1. |

### ter-1 · Las comunidades autónomas deberían tener más competencias que ahora.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 56 del PDF · 18 Estructura territorial y administración | «hay que reforzar el gobierno central, haciendo que recupere algunas competencias que jamás deberían de haber sido suyas» | Recentralizar competencias. |

### ter-2 · Debería poder celebrarse un referéndum de independencia en una comunidad si su parlamento lo pide.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 56 del PDF · 18 Estructura territorial y administración | «Defendemos la unidad del país, posicionándonos contra todos los procesos de independencia existentes» | Contra todo proceso de independencia. |

### ter-3 · Algunas competencias, como educación o sanidad, deberían volver a ser del Estado central.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 56 del PDF · 18 Estructura territorial y administración (medida 2) | «Centralizar determinadas competencias como sanidad, educación y los servicios de emergencia.» | Literal. |

## PCTE

### viv-1 · Las administraciones deberían poder limitar el precio del alquiler en zonas con precios muy altos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 14 del PDF · Vivienda | «Conseguir una limitación real y efectiva de los alquileres, en detrimento de la ganancia de los propietarios» | Literal. |

### viv-2 · El Estado debería construir mucha más vivienda pública de alquiler, aunque suponga más gasto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 7 del PDF · ¿A qué aspiramos? (8) | «ordenar la construcción de nuevas viviendas para satisfacer las necesidades populares» | Pide planificar la construcción de vivienda, sin decir que sea pública de alquiler: +1. |

### viv-3 · Habría que agilizar los desalojos en casos de ocupación ilegal de viviendas.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -1 | pág. 14 del PDF · Vivienda | «Mantener la lucha para prohibir todo tipo de desahucios a familias trabajadoras» | Habla de desahucios, no de ocupación; se codifica como Podemos (−1). |

### san-1 · Habría que reducir la gestión privada de hospitales públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 13 del PDF · Servicios públicos | «Defender la expulsión de todas las empresas privadas de la educación, la sanidad y los servicios sociales.» | Fuera las empresas privadas de la sanidad. |

### san-2 · La atención dental básica debería estar cubierta por la sanidad pública.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 13 del PDF · Servicios públicos | «ampliarla a otros como la completa atención bucodental» | Ampliar la cartera pública a la atención bucodental completa. |

### edu-1 · Los colegios concertados deberían recibir la misma financiación por alumno que los públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 13 del PDF · Servicios públicos | «Defender la expulsión de todas las empresas privadas de la educación, la sanidad y los servicios sociales.» | Fuera las empresas privadas de la educación: contra la concertada. |

### edu-2 · La educación de 0 a 3 años debería ser gratuita y universal.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 7 del PDF · ¿A qué aspiramos? (6) | «A un único sistema de enseñanza presencial, público, gratuito, mixto, laico, integral y universal» | Enseñanza pública, gratuita y universal en general; no menciona el 0-3: +1 y cita débil. |

### emp-1 · La jornada laboral máxima debería bajar de 40 horas semanales sin reducir el sueldo.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 11 del PDF · Trabajo | «Seguir exigiendo la reducción de la jornada laboral en todos los sectores sin merma de salario» | Literal; aspira a un máximo de 35 horas (pág. 6). |

### emp-3 · Debería retrasarse la edad de jubilación para asegurar que el sistema de pensiones sea sostenible.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 11 del PDF · Trabajo | «oponerse firmemente a cualquier propuesta de retraso de la edad de jubilación y defender su adelanto» | Literal. |

### inm-1 · Debería facilitarse la regularización de inmigrantes que ya viven y trabajan en España.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 21 del PDF · Unidad de la clase obrera | «los plenos derechos de quienes viven y trabajan en España» | Plenos derechos para quien vive y trabaja en España, lo que pasa por regularizar. |

### inm-2 · Habría que endurecer los controles en frontera y aumentar las expulsiones de quien entra de forma irregular.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 21 del PDF · Unidad de la clase obrera | «Continuar exigiendo el cierre de los CIEs» | Cerrar los CIE, la herramienta de las expulsiones. |

### med-1 · Las centrales nucleares deberían seguir funcionando más allá del calendario de cierre previsto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 7 del PDF · ¿A qué aspiramos? (5) | «utilizando para ello el conjunto de las fuentes de energía con que cuenta el país y prestando especial atención al desarrollo de las capacidades de las fuentes energéticas ya disponibles» | Usar todas las fuentes disponibles, sin nombrar la nuclear: +1 y cita débil. |

## SALF

### eco-2 · Habría que bajar el impuesto de sociedades para atraer empresas.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 5 del PDF · 2. Rebaja de impuestos | «Impulsaremos deducciones autonómicas en el Impuesto de Sociedades (vía bonificaciones en tributos cedidos) para las empresas que generen empleo indefinido» | Rebajas de sociedades ligadas al empleo indefinido: +1. |

### eco-3 · El impuesto sobre el patrimonio debería suprimirse.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 4 del PDF · 2. Rebaja de impuestos | «Suprimiremos el Impuesto sobre el Patrimonio en Castilla y León» | Literal (en su comunidad). |

### viv-1 · Las administraciones deberían poder limitar el precio del alquiler en zonas con precios muy altos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 3 del PDF · 1. Vivienda, alquiler y okupación | «Frente a fracasos como los topes de alquiler (que reducen la oferta), apostamos por incentivos positivos.» | Contra los topes de alquiler. |

### viv-3 · Habría que agilizar los desalojos en casos de ocupación ilegal de viviendas.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 3 del PDF · 1. Vivienda, alquiler y okupación | «para que toda vivienda ocupada ilegalmente sea desalojada policialmente en un plazo máximo de 24 horas» | Desalojo en 24 horas, como el PP. |

### san-1 · Habría que reducir la gestión privada de hospitales públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -1 | pág. 18 del PDF · 6.2 Sanidad | «concertaremos con clínicas privadas aragonesas procedimientos cuando la pública no dé abasto» | Más conciertos con la privada para las listas de espera, aunque rechaza «privatizaciones opacas»: −1. (El texto dice «aragonesas»: está copiado del programa de Aragón). |

### edu-1 · Los colegios concertados deberían recibir la misma financiación por alumno que los públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 17 del PDF · 6.1 Educación | «ampliaremos los conciertos educativos con centros que lo soliciten» | Más conciertos, sin hablar de su financiación por alumno: +1. |

### edu-2 · La educación de 0 a 3 años debería ser gratuita y universal.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 9 del PDF · 4. Fomento de la natalidad | «Implantaremos la gratuidad de la educación infantil de 0 a 3 años en Castilla y León» | Literal (en su comunidad). |

### inm-1 · Debería facilitarse la regularización de inmigrantes que ya viven y trabajan en España.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 7 del PDF · 3. Inmigración y seguridad | «el que esté ilegal, será repatriado sin excusas» | Repatriar a todo el que esté en situación irregular: lo contrario de regularizar. |

### inm-2 · Habría que endurecer los controles en frontera y aumentar las expulsiones de quien entra de forma irregular.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 7 del PDF · 3. Inmigración y seguridad | «ejecutar el mayor plan de deportación de inmigrantes ilegales de la historia reciente del país» | Literal. |

### med-1 · Las centrales nucleares deberían seguir funcionando más allá del calendario de cierre previsto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 21 del PDF · 7. Energía y campo | «exigiremos al Gobierno de España que paralice el calendario de cierres nucleares» | Literal. |

### med-3 · Los impuestos sobre los combustibles deberían bajar aunque eso aumente las emisiones.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 22 del PDF · 7. Energía y campo | «Bonificaremos el gasóleo profesional agrario mientras dure la asfixia fiscal estatal.» | Solo el gasóleo agrario y llama «asfixia fiscal» a los impuestos estatales: +1. |

## PACMA

### viv-2 · El Estado debería construir mucha más vivienda pública de alquiler, aunque suponga más gasto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 65 del PDF · 3.5 Por una vivienda digna: mayor parque de vivienda social | «En España necesitamos ya una gran dotación de vivienda social, tanto para compra como para alquiler» | Gran dotación de vivienda social, también en alquiler. |

### san-1 · Habría que reducir la gestión privada de hospitales públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 50 del PDF · 3.2.1 Por una sanidad pública, universal y de calidad | «Reintegración al sistema sanitario público de los servicios privatizados.» | Revertir lo privatizado. |

### san-2 · La atención dental básica debería estar cubierta por la sanidad pública.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 53 del PDF · 3.2.7 Salud bucodental | «Desde PACMA defendemos el impulso de una atención bucodental gratuita, con una asistencia dental básica para todas las personas» | Literal. |

### edu-2 · La educación de 0 a 3 años debería ser gratuita y universal.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 54 del PDF · 3.3.1 Por una educación pública y de calidad | «avanzar en la gratuidad real, promover la educación universal de 0 a 3 años» | Educación universal de 0 a 3 años y plazas públicas suficientes; la gratuidad va en la misma frase. |

### med-1 · Las centrales nucleares deberían seguir funcionando más allá del calendario de cierre previsto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -1 | pág. 31 del PDF · 2.1.1 Por un modelo energético sostenible | «El modelo energético basado en el uso masivo de los combustibles fósiles y la energía nuclear, es insostenible» | Califica la nuclear de insostenible, pero no pide cerrar centrales: −1. |

## Por un Mundo Más Justo

### eco-2 · Habría que bajar el impuesto de sociedades para atraer empresas.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 32 del PDF · Recursos públicos (medida 97) | «revirtiendo el proceso de disminución de impuesto de sociedades» | Revertir la bajada de sociedades. |

### viv-1 · Las administraciones deberían poder limitar el precio del alquiler en zonas con precios muy altos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 22 del PDF · Vivienda (medida 34) | «Apoyar la aplicación de la nueva Ley por el Derecho a la Vivienda» | Apoya la ley de vivienda, entre otras cosas porque «limita el precio del alquiler en situaciones específicas». |

### viv-2 · El Estado debería construir mucha más vivienda pública de alquiler, aunque suponga más gasto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 22 del PDF · Vivienda (medida 35) | «la creación de nuevos modelos de vivienda pública o el aumento de la cooperación entre el sector privado y el público» | Más vivienda pública, pero junto a la colaboración público-privada: +1. |

### edu-1 · Los colegios concertados deberían recibir la misma financiación por alumno que los públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 25 del PDF · Educación (medida 45) | «apoyamos aumentar la financiación pública, reduciendo la brecha de financiación existente hoy respecto de los colegios públicos» | Reducir la brecha, a condición de que la concertada no cobre a las familias: +1. |

### edu-2 · La educación de 0 a 3 años debería ser gratuita y universal.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 25 del PDF · Educación (medida 46) | «Universalizar la educación de 0-3 años de calidad» | Universal, pero con becas y tarificación social, no gratuita: +1. |

### emp-1 · La jornada laboral máxima debería bajar de 40 horas semanales sin reducir el sueldo.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 26 del PDF · Trabajo digno y pensiones (medida 55) | «Reducir la jornada laboral a 35 horas.» | 35 horas, sin decir que sea sin reducir el sueldo: +1 (como Compromís). |

### emp-2 · Las pensiones deberían subir siempre al menos lo mismo que los precios (IPC).

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 26 del PDF · Trabajo digno y pensiones (medida 57) | «En ella debiera quedar prohibida la privatización de las pensiones públicas y la degradación de su poder adquisitivo.» | Prohibir por la Constitución que las pensiones pierdan poder adquisitivo. |

### inm-1 · Debería facilitarse la regularización de inmigrantes que ya viven y trabajan en España.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 26 del PDF · Migrantes (medida 58) | «Aprobar la Iniciativa Legislativa Popular (ILP) para la regularización extraordinaria de las personas migrantes en España.» | Literal. |

### inm-2 · Habría que endurecer los controles en frontera y aumentar las expulsiones de quien entra de forma irregular.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 26 del PDF · Migrantes (medida 60) | «poniendo fin a las llamadas “devoluciones en caliente”» | Fin de las devoluciones en caliente y, en la medida 61, cierre de los CIE. |
