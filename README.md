# Study Adapt

A first-phase FURI research prototype for assignment-level study planning. It starts with instructor estimates and adjusts planned time using assignment difficulty and weekly academic stress.

Live demo: https://suhaib28.github.io/study-adapt/

## Current algorithm (V2)

For each assignment:

- E = instructor estimated hours
- D = assignment difficulty, 1–5
- S = academic stress this week, 1–5
- P = progress completed, 0–1

```text
d = (D - 3) / 2
s = (S - 3) / 2
planned hours = E × (1 + 0.30 × (0.60 × d + 0.40 × s))
remaining hours = planned hours × (1 - P)
```

Ratings of 3 leave the estimate unchanged; lower or higher ratings can reduce or increase it. For E=4, D=5 and S=5, planned time is 5.2 hours, or 2.6 hours remaining at 50% progress. Priority uses urgency, grade weight, remaining work and progress to fill available study hours.

The equal rating steps, 60/40 weights and ±30% bound are provisional assumptions, not validated time predictions.

## Research basis

Workload includes time, mental effort and psychological stress. This prototype applies course-level ideas to assignments.

- [Borchers & Pardos (2025): Course Load Analytics](https://doi.org/10.18608/jla.2025.8473)
- [Pardos, Borchers & Yu (2023): Credit Hours Is Not Enough](https://doi.org/10.1016/j.iheduc.2022.100882)
- [Wentling & Variawa (2020): Instructor Expectation and Student Workload](https://doi.org/10.24908/pceea.vi0.14189)

See [research notes](docs/research-notes.md) for evidence, assumptions and future validation.

## Run locally

```sh
npm install
npm run dev
```

Checks:

```sh
npm run build
npm test
npm run test:e2e
npm run lint
npx tsc --noEmit -p tsconfig.app.json
```
