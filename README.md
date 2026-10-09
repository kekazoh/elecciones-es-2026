# Brújula electoral

App de afinidad electoral para las próximas elecciones generales de España.
El usuario responde a preguntas sencillas sobre qué temas le importan y qué
medidas prefiere; al final recibe el partido más afín, las medidas que
respaldan esa recomendación y los casos de corrupción con sentencia firme de
cada partido. Durante el cuestionario no se muestra ningún partido.

> Estado: esqueleto funcional con **datos ficticios** (partidos Ámbar, Brezo,
> Cobalto, Dalia y Esmeralda). Los datos reales se añadirán en `src/data/`
> siguiendo [docs/FUENTES.md](docs/FUENTES.md).

## Uso

```bash
npm install
npm run dev            # app en http://localhost:5173
npm test               # tests del motor
npm run validate-data  # integridad, neutralidad y fuentes del dataset
npm run simulate       # aciertos y nº de preguntas con usuarios simulados
npm run build          # build estático en dist/
```

## Estructura

```
src/model/types.ts        modelo de datos
src/engine/engine.ts      cuestionario adaptativo (selección y parada)
src/engine/report.ts      informe final
src/data/ejemplo/         dataset ficticio de demostración (JSON)
src/data/validate.ts      validador de datos
src/ui/                   interfaz React
scripts/                  validate-data, simulate
docs/ARQUITECTURA.md      arquitectura, modelo y algoritmo
docs/FUENTES.md           política de fuentes y verificación
```
