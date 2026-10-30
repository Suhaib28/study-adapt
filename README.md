# Study Adapt

A first-phase FURI research prototype for assignment study planning.

Live demo: https://suhaib28.github.io/study-adapt/

The app starts with instructor estimated hours, assignment difficulty and weekly stress. The centered model creates a weekly plan within available study hours. A category lookup model and the original instructor estimate provide comparisons.

Optional actual hours on completed assignments let us compare saved estimates using MAE and prediction bias. The adjustments are provisional; real student data are needed before claiming predictive accuracy.

See [research notes](docs/research-notes.md) for the formulas, four sources, assumptions and evaluation limits.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run build
npm test
npm run test:e2e
npm run lint
npx tsc --noEmit -p tsconfig.app.json
```
