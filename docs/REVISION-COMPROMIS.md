# Revisión de posiciones: Compromís: Front Valencià

Compromís se presenta el 29N en coalición con EUPV, Podem y ERPV en Alicante, Castellón y Valencia. Aún no ha publicado programa para estas elecciones, así que estas 16 posiciones salen de su último programa propio a unas generales: [«Imparables», abril de 2019](https://imparables.compromis.net/docs/programa_complet_VAL.pdf) (en valenciano; la página del PDF coincide con la impresa). Política de citas: [FUENTES.md](FUENTES.md).

Todas entran como `pendiente`, y el motor solo usa las `verificado`. Hasta la revisión, Compromís sigue heredando las posturas de Podemos (su único miembro en el dataset). Al marcar una posición como `verificado` pasa a mandar sobre la heredada; en las medidas donde el programa no dice nada (las de `·` en la segunda columna) seguirá heredando de Podemos.

Cómo revisar: abrir el PDF en la página indicada, comprobar la cita y decidir si la postura es fiel al enunciado. Si lo es, cambiar `verification` a `verificado` en `src/data/real/positions.json`; si no, corregir `stance` o borrar la posición. Cuando Compromís publique su programa del 29N, se recodifica con él.

El "Motivo" es la justificación del codificador y no se guarda en el dataset.

## Comparación con lo que hereda hoy

| Medida | Enunciado | Compromís (propuesta) | Podemos (lo que hereda hoy) |
|---|---|---|---|
| eco-1 | Las rentas más altas deberían pagar un tipo de IRPF más alto que el actual. | +1 | +2 |
| eco-2 | Habría que bajar el impuesto de sociedades para atraer empresas. | · | -1 |
| eco-3 | El impuesto sobre el patrimonio debería suprimirse. | -2 | -2 |
| viv-1 | Las administraciones deberían poder limitar el precio del alquiler en zonas con precios muy altos. | +2 | +2 |
| viv-2 | El Estado debería construir mucha más vivienda pública de alquiler, aunque suponga más gasto. | +2 | +2 |
| viv-3 | Habría que agilizar los desalojos en casos de ocupación ilegal de viviendas. | · | -1 |
| san-1 | Habría que reducir la gestión privada de hospitales públicos. | +2 | +2 |
| san-2 | La atención dental básica debería estar cubierta por la sanidad pública. | +1 | +2 |
| san-3 | Quien contrate un seguro médico privado debería poder deducírselo en la declaración de la renta. | · | · |
| edu-1 | Los colegios concertados deberían recibir la misma financiación por alumno que los públicos. | -1 | -1 |
| edu-2 | La educación de 0 a 3 años debería ser gratuita y universal. | +2 | +2 |
| edu-3 | En las comunidades con lengua cooficial, las familias deberían poder elegir la lengua en que estudian sus hijos. | · | · |
| emp-1 | La jornada laboral máxima debería bajar de 40 horas semanales sin reducir el sueldo. | +1 | +2 |
| emp-2 | Las pensiones deberían subir siempre al menos lo mismo que los precios (IPC). | +2 | +2 |
| emp-3 | Debería retrasarse la edad de jubilación para asegurar que el sistema de pensiones sea sostenible. | -2 | -2 |
| inm-1 | Debería facilitarse la regularización de inmigrantes que ya viven y trabajan en España. | +2 | +2 |
| inm-2 | Habría que endurecer los controles en frontera y aumentar las expulsiones de quien entra de forma irregular. | -2 | -2 |
| inm-3 | La llegada de inmigrantes debería ligarse a los empleos que hacen falta, por ejemplo contratando en el país de origen. | · | -1 |
| med-1 | Las centrales nucleares deberían seguir funcionando más allá del calendario de cierre previsto. | -2 | -2 |
| med-2 | Debería adelantarse la prohibición de vender coches nuevos de gasolina y diésel. | · | · |
| med-3 | Los impuestos sobre los combustibles deberían bajar aunque eso aumente las emisiones. | · | -1 |
| ter-1 | Las comunidades autónomas deberían tener más competencias que ahora. | +1 | +1 |
| ter-2 | Debería poder celebrarse un referéndum de independencia en una comunidad si su parlamento lo pide. | · | +1 |
| ter-3 | Algunas competencias, como educación o sanidad, deberían volver a ser del Estado central. | -1 | -1 |

Diferencias con Podemos: eco-1, san-2 y emp-1 bajan de +2 a +1 porque el programa de Compromís es menos tajante (ver motivos). Las citas más débiles son ter-1 y ter-3.

## Posiciones propuestas

### eco-1 · Las rentas más altas deberían pagar un tipo de IRPF más alto que el actual.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 207 del PDF · Model econòmic (mesura 47) | «Millora en el tracte fiscal de les rendes salarials i modificació del tracte privilegiat de les rendes del capital i empresarial, per reequilibrar de manera justa el pes de les diferents rendes en l’impost i ampliar el seu caràcter redistribuïdor.» | Pide gravar más las rentas del capital y hacer el IRPF más redistributivo; no habla del tipo de las rentas altas, de ahí +1. |

### eco-3 · El impuesto sobre el patrimonio debería suprimirse.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 207 del PDF · Model econòmic (mesura 48) | «Impost per a grans fortunes i per a gravar les transaccions financeres especulatives, seguint el model de la Taxa Tobin.» | Propone un impuesto a las grandes fortunas: lo contrario de suprimir el de patrimonio. |

### viv-1 · Las administraciones deberían poder limitar el precio del alquiler en zonas con precios muy altos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 102 del PDF · Habitatge (mesura 1) | «Permetrem a ajuntaments i comunitats autònomes regular els preus de l’habitatge en determinades zones urbanes.» | Literal: que ayuntamientos y comunidades puedan regular precios en zonas urbanas. |

### viv-2 · El Estado debería construir mucha más vivienda pública de alquiler, aunque suponga más gasto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 102 del PDF · Habitatge (mesura 3) | «Garantirem la promoció pública de l’habitatge en lloguer.» | Garantiza la promoción pública de vivienda en alquiler. |

### san-1 · Habría que reducir la gestión privada de hospitales públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 80 del PDF · Salut (mesura 4) | «Posarem fi a totes les polítiques de privatització i externalitzacions dels serveis sanitaris públics a tot l’estat espanyol. Iniciarem un camí de reversió dels serveis privatitzats.» | Fin de la privatización y reversión de lo privatizado. |

### san-2 · La atención dental básica debería estar cubierta por la sanidad pública.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 81 del PDF · Salut (mesura 12) | «Estudiarem l’ampliació de les prestacions sanitàries com ara podologia, pròtesi, psicologia, fisioteràpia, nutrició, estomatologia i odontologia» | Solo «estudiará» ampliar prestaciones, odontología incluida: +1. |

### edu-1 · Los colegios concertados deberían recibir la misma financiación por alumno que los públicos.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -1 | pág. 38 del PDF · Educació (mesura 2) | «Modificarem el Reial Decret de Concerts perquè la xarxa concertada siga realment subsidiària de la pública» | Quiere la concertada subsidiaria de la pública, no igualar su financiación. |

### edu-2 · La educación de 0 a 3 años debería ser gratuita y universal.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 39 del PDF · Educació (mesura 20) | «Promourem l’extensió de l’ensenyament públic i gratuït a l’educació infantil de 0 a 3 anys.» | Extender la educación pública y gratuita de 0 a 3 años. |

### emp-1 · La jornada laboral máxima debería bajar de 40 horas semanales sin reducir el sueldo.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 90 del PDF · Ocupació (mesura 2) | «Promoure una reducció progressiva de la jornada laboral a 32 hores setmanals per a l’any 2025, com a mecanisme de redistribució del treball, millora de la conciliació familiar i lluita contra el canvi climàtic.» | 32 horas en 2025, pero no dice que sea sin reducir el sueldo: +1. |

### emp-2 · Las pensiones deberían subir siempre al menos lo mismo que los precios (IPC).

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 247 del PDF · Drets de la ciutadania · Protecció de les pensions (mesura 100) | «Garantia de l’actualització de les pensions com a mínim amb l’IPC.» | Literal: actualización de las pensiones al menos con el IPC. |

### emp-3 · Debería retrasarse la edad de jubilación para asegurar que el sistema de pensiones sea sostenible.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 247 del PDF · Drets de la ciutadania · Protecció de les pensions (mesura 95) | «S’ha d’estudiar una possible modificació de l’edat legal de jubilació per avançar-la, mai endarrerir-la.» | Adelantar la edad de jubilación, «mai endarrerir-la». |

### inm-1 · Debería facilitarse la regularización de inmigrantes que ya viven y trabajan en España.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +2 | pág. 303 del PDF · Cooperació i migracions (mesura 56) | «facilitarem la regularització d’aquelles persones migrants amb treball, garantint uns mitjans de vida adequats» | Facilitar la regularización de migrantes con trabajo. |

### inm-2 · Habría que endurecer los controles en frontera y aumentar las expulsiones de quien entra de forma irregular.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 302 del PDF · Cooperació i migracions (mesura 38) | «Acabarem amb el cicle repressiu contra les persones migrades: concertines, les expulsions “en calent” i qualsevol altre tipus de pressió policial a les fronteres; els vols de deportació» | Contra concertinas, devoluciones en caliente y vuelos de deportación. |

### med-1 · Las centrales nucleares deberían seguir funcionando más allá del calendario de cierre previsto.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -2 | pág. 128 del PDF · Canvi climàtic (mesura 7) | «Pla de tancament programat de totes les centrals nuclears» | Plan de cierre programado de todas las nucleares. |

### ter-1 · Las comunidades autónomas deberían tener más competencias que ahora.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| +1 | pág. 58 del PDF · Cultura (introducció) | «cal un pacte, d’àmbit estatal, que done visibilitat, força i seguretat al procés efectiu de traspàs de competències i recursos.» | Pide un pacto estatal para el traspaso efectivo de competencias y recursos, en el apartado de cultura: +1 y cita débil. |

### ter-3 · Algunas competencias, como educación o sanidad, deberían volver a ser del Estado central.

| Postura | Dónde | Cita | Motivo |
|---|---|---|---|
| -1 | pág. 38 del PDF · Educació (mesura 3) | «Redefinirem el paper del Ministeri d’Educació, per estar transferides les seues competències a les comunitats autònomes.» | Da por transferida la educación y redefine el Ministerio en consecuencia; inferido, no dice que no deba volver al Estado: −1 y cita débil. |
