# Study Adapt

A first-phase FURI research prototype for assignment-level study planning.

The goal is to test whether a student's weekly study plan can be improved by starting with the instructor's estimated time and then adjusting it using the student's own difficulty and stress ratings.

Live demo: [suhaib28.github.io/study-adapt](https://suhaib28.github.io/study-adapt/)

## Research basis

This prototype is based on the [Course Load Analytics paper by Borchers and Pardos](https://doi.org/10.18608/jla.2025.8473) and its idea that workload is not only time. Workload also includes mental effort and psychological stress. This app applies that course-level idea to individual assignments.

In this app:

- Instructor estimated time = starting point
- Difficulty rating = mental effort
- Stress rating = psychological stress
- Progress = how much work is already completed

The research supports using these workload dimensions. The exact formula and weights are first-stage assumptions that can be tested and changed later.

## Current algorithm

For each assignment:

- `E` = instructor estimated hours
- `D` = difficulty rating from 1 to 5
- `S` = stress rating from 1 to 5
- `P` = progress from 0 to 1

The rating scale is: **1 = very low, 2 = low, 3 = normal, 4 = high, 5 = very high.**

A rating of 3 is treated as normal. Ratings below 3 do not reduce the instructor estimate in this first version. Ratings above 3 add planning time.

```text
planned hours = E × (1 + 0.09 × max(0, D - 3) + 0.06 × max(0, S - 3))
remaining hours = planned hours × (1 - P)
```

Difficulty has a slightly larger effect because mental effort was especially important in the Course Load Analytics paper. Stress still matters, with a smaller adjustment. Together, they add at most 30% to the instructor estimate.

## Example

If an instructor estimates 4 hours and the student rates both difficulty and stress as 5:

```text
difficulty adjustment = 0.09 × (5 - 3) = 0.18
stress adjustment = 0.06 × (5 - 3) = 0.12
planned hours = 4 × 1.30 = 5.2 hours
```

At 50% progress:

```text
remaining hours = 5.2 × (1 - 0.50) = 2.6 hours
```

## Priority

The app ranks assignments using:

- Deadline urgency
- Grade weight
- Remaining adjusted workload
- Progress left

Difficulty and stress are not added again directly into priority because they already affect the adjusted planned time. The weekly plan places higher-priority assignments within the student's available hours.

## Prototype assumptions

This is not a final validated model. The 9% and 6% adjustments, priority weights, and workload labels are starting assumptions. The next step is to compare the formula with real student feedback or time data.

## Run locally

```sh
npm install
npm run dev
```

Validation commands:

```sh
npm run build
npm test
npm run test:e2e
npm run lint
```
