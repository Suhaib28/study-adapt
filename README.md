# Study Adapt — first-phase FURI prototype

This is an early research prototype for estimating assignment study time and making a basic weekly plan. The goal is to show the core idea working before adding more features or evaluating it with students.

## Research idea

The prototype is inspired by Borchers and Pardos’ **Course Load Analytics** paper:

Borchers, C., & Pardos, Z. A. (2025). _Course Load Analytics Interventions on Higher Education Course Selection: Experimental Evidence._ Journal of Learning Analytics, 12(2), 293–311. https://doi.org/10.18608/jla.2025.8473

The paper looks at course workload information and its role in course selection and planning. It treats workload as more than credit hours or time: mental effort and psychological stress also matter. This prototype applies that workload idea at the **assignment level**. It does not reproduce the paper’s analytics, and the paper does not validate the formulas used here.

## What works

1. Enter an assignment name, course, due date, instructor estimated hours, grade weight, student difficulty, student stress, and progress.
2. See the instructor estimate, adjusted planned total, and remaining time separately.
3. See assignments ranked by priority with short reasons.
4. Set daily study availability and receive a plan for the next seven days.
5. Edit assignments or mark them complete. The estimates and plan update automatically.

There is one input form, one assignment list, one weekly plan, and a short plain-language explanation. The interface shows priority as an order (1, 2, 3), rather than presenting the internal score as a precise measurement. Full formulas are documented below. There are no dashboards, charts, accounts, or machine learning. Three example assignments appear on the first visit. Data is saved in this browser only.

## How the estimate works

The instructor’s experience supplies the starting estimate. Student ratings add a small planning allowance:

```text
planned total = instructor hours ×
  [1 + 0.10 × max(0, difficulty − 3) + 0.05 × max(0, stress − 3)]

remaining hours = planned total × (1 − progress / 100)
```

Difficulty and stress are each rated from 1 to 5. Ratings of 1–3 keep the starting estimate unchanged. Difficulty 4 adds 10%, difficulty 5 adds 20%; stress 4 adds 5%, stress 5 adds 10%. The allowances are added together, for a maximum increase of 30%.

**Example:** An instructor estimates 4 hours. Difficulty 5 and stress 5 give `4 × 1.30 = 5.2` planned hours. At 50% progress, 2.6 hours remain. At 100%, no study time is scheduled. Hours are rounded to two decimals.

These percentages are easy-to-change prototype assumptions. High stress does not necessarily mean a student will actually take longer. We use the allowance as planning room, not a measured prediction of performance or wellbeing.

## How priority works

The score adds six contributions, up to 100 points:

| Input                | Contribution                        |
| -------------------- | ----------------------------------- |
| Deadline urgency     | `35 / (1 + max(0, days until due))` |
| Remaining study time | `15 × min(remaining hours / 8, 1)`  |
| Grade weight         | `20 × grade weight / 100`           |
| Mental effort        | `10 × (difficulty − 1) / 4`         |
| Stress               | `10 × (stress − 1) / 4`             |
| Unfinished progress  | `10 × (1 − progress / 100)`         |

Completed assignments score zero. Ties use due date, then assignment ID. Reasons include due soon (within two days), overdue, high mental effort or stress (4–5), high grade weight (20% or more), low progress (below 25%), and long task (four or more hours remaining).

Due dates affect priority and placement, not the estimated amount of work. Dates refresh while the app is open or when it regains focus.

## How the weekly plan works

- Higher-priority assignments are placed first.
- Each session goes on a day with enough available time before the deadline. Overdue assignments are marked and planned as recovery work.
- The scheduler favors days with a lower fraction of their available hours used, with a small preference for earlier days. Its day score is `scheduled hours / available hours + 0.08 × days from today`; lower wins.
- Difficulty or stress of 4–5 uses sessions up to 30 minutes. Other sessions are up to 60 minutes. Final sessions may be shorter. The display groups an assignment’s sessions on each day.
- It never adds work beyond the daily time limit. Anything that cannot fit before a deadline or within seven days is listed as unallocated.
- Availability repeats by weekday. Students choose start times and breaks themselves.

This is a greedy rule, not an optimizer. A different arrangement could fit more work. Assignments due after the week may be started early.

## Workload labels

Compare adjusted remaining hours with weekly availability: **light** is at most 50%, **moderate** is over 50% up to 85%, **heavy** is over 85% up to 100%, and **overloaded** is over 100%. No work is light; work with no available hours is overloaded.

The overall label compares all listed remaining work with one week of availability, including assignments due later. Daily labels use the hours actually allocated. Daily limits mean scheduled days cannot exceed 100%; unmet demand appears in the unallocated list. A deadline can be infeasible even if the overall week is light.

Difficulty and stress already increased the planned hours. They are not multiplied into the workload label again.

## Run and check

Use Node.js 20+ and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:8080.

```sh
npm run build
npm test
npm run lint
npx tsc --noEmit -p tsconfig.app.json
```

Browser tests cover assignment entry, the 4-to-5.2-hour example, progress, persistence, completion, deletion, zero capacity, and desktop/mobile layout:

```sh
npx playwright install chromium
npm run test:e2e
```

## Main files

- `src/lib/scheduler.ts`: time estimates, priority, workload labels, and scheduling.
- `src/lib/study-state.ts`: input validation, browser storage, and example assignments.
- `src/components/TaskEditor.tsx`: inline assignment form.
- `src/components/ResearchAssignments.tsx`: ranked assignment list.
- `src/components/ResearchWeek.tsx`: weekly sessions.
- `src/App.tsx`: connects inputs to the plan and explains the method.

The browser storage key remains `study-adapt-research-v1` so earlier saved assignments can still load. Their estimated-hours field is now the instructor baseline; review it if it previously represented a personal estimate. Earlier time-spent logs are no longer used or retained. The current phase uses progress only. The old MVP pages/components remain in the repository but are not rendered by this app.

## Future work

Test the assumptions with students and instructors, compare planned time with actual time, and refine the rating allowances. Study whether the plan is useful and manageable before claiming better outcomes. Task dependencies, calendar integration, fixed-versus-adaptive evaluation, shared instructor input, and cross-device storage are future work. Progress estimates are subjective, and this version assumes time decreases proportionally with progress.
