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

## Algorithm Specification

### 1. Goal and research basis

Estimate how much study time an assignment may need, rank unfinished assignments, and place study sessions within the student's available hours. The instructor estimate is the baseline; student difficulty and stress ratings adjust it. This specification describes the implemented first-phase rules, not a trained or validated prediction model.

The [Course Load Analytics study by Borchers and Pardos (2025)](https://doi.org/10.18608/jla.2025.8473) supports considering time load, mental effort, and psychological stress together. Mental effort was especially influential in students' course choices. We use this as a reason to give difficulty a larger allowance than stress. Applying those course-level ideas to individual assignments is our prototype design decision.

The supporting workload survey study, [Pardos, Borchers, and Yu (2023), _Credit hours is not enough_](https://doi.org/10.1016/j.iheduc.2022.100882), used five-point response options for course workload questions, except the question asking for actual weekly hours. This provides precedent for a short five-point student self-rating. It does not establish our exact labels, adjustment percentages, or priority weights.

### 2. Inputs and variables

For each assignment `i`:

| Symbol                    | Meaning and units                                     | Implementation                                               |
| ------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| `E_i`                     | Instructor estimated total hours, 0.25–200            | `task.estimatedHours`                                        |
| `D_i`                     | Student difficulty / mental effort, integer 1–5       | `task.effort`                                                |
| `S_i`                     | Student stress, integer 1–5                           | `task.stress`                                                |
| `P_i`                     | Fraction completed, 0–1                               | `task.progress / 100`; form stores percent 0–100             |
| `G_i`                     | Normalized grade weight, 0–1                          | `task.gradeWeight / 100`; form stores percent 0–100          |
| `days_i`                  | Signed calendar days from today to due date           | `daysBetween(today, task.dueDate)`                           |
| `difficulty_adjustment_i` | Fractional difficulty allowance                       | `0.09 × max(0, D_i − 3)`                                     |
| `stress_adjustment_i`     | Fractional stress allowance                           | `0.06 × max(0, S_i − 3)`                                     |
| `T_i`                     | Adjusted planned total hours                          | `plannedHours(task)`                                         |
| `R_i`                     | Remaining adjusted hours                              | `remainingHours(task)`                                       |
| `M = max(R)`              | Largest remaining hours in the current assignment set | `maxRemainingHours(tasks)`                                   |
| `U_i`                     | Urgency, 0–1                                          | Defined below                                                |
| `L_i`                     | Fraction of work unfinished, 0–1                      | `1 − P_i`                                                    |
| `W_i`                     | Relative remaining workload, 0–1                      | `R_i / M`, or zero if `M = 0`                                |
| `Priority_i`              | Internal unitless ranking score, 0–1                  | `priority(task, today, M).score`                             |
| `A_d`                     | Available study hours on day `d`, 0–12                | Weekday availability, indexed Sunday 0 through Saturday 6    |
| `H_d`                     | Hours already placed on day `d`                       | `PlanDay.hours`, initially zero                              |
| `k_d`                     | Calendar-day offset from today, 0–6                   | Used to prefer earlier days                                  |
| `B_i`                     | Maximum session length in hours                       | 0.5 for high difficulty/stress; otherwise 1                  |
| `q`                       | Hours allocated in one session                        | Minimum of remaining task hours, `B_i`, and free daily hours |
| `A_week`                  | Total hours available in the seven-day plan           | Sum of `A_d`                                                 |
| `weekly_load_ratio`       | All remaining adjusted hours / weekly available hours | Used for overall workload label                              |

Names and courses must be nonempty; IDs must be unique; due dates must be valid local calendar dates. Grade weight is normalized by 100, **not** by the largest grade weight or the sum across courses. Ungraded work may use zero. Ratings, ranges, and saved data are checked in `src/lib/study-state.ts` before scheduling.

### 3. Rating scale and why it is 1–5

| Rating | Label     | Interpretation in this prototype              |
| ------ | --------- | --------------------------------------------- |
| 1      | Very low  | Below normal; no reduction to instructor time |
| 2      | Low       | Below normal; no reduction to instructor time |
| 3      | Normal    | Neutral reference point; no added allowance   |
| 4      | High      | One step above normal                         |
| 5      | Very high | Two steps above normal                        |

Five choices keep student input short and give two levels on either side of a midpoint. The survey precedent above supports using a five-point format. **Treating 3 as normal is our operational definition**, not a claim that a survey has proven 3 to be a universal neutral workload. Students should rate relative to what feels normal for them. Stress 3 does not mean no stress.

Ratings above 3 add planning room. Ratings below 3 do not reduce instructor time in this first version because we do not yet have evidence for how much time to subtract. Treating adjacent rating steps as equal increments is another simplifying assumption: these self-ratings are ordinal, not measured hour differences.

### 4. Adjusted and remaining time

```text
difficulty_adjustment_i = max(0, D_i − 3) × 0.09
stress_adjustment_i     = max(0, S_i − 3) × 0.06

T_i = E_i × (1 + difficulty_adjustment_i + stress_adjustment_i)
    = E_i × (1 + 0.09 × max(0, D_i − 3) + 0.06 × max(0, S_i − 3))

R_i = T_i × (1 − P_i)
```

Difficulty gets 9% per above-normal step and stress gets 6%. The larger difficulty allowance reflects the emphasis on mental effort in the CLA paper; stress still contributes. The **exact 9% and 6% are prototype assumptions**, not coefficients estimated by the paper. With both ratings at 5, `2 × 0.09 + 2 × 0.06 = 0.30`: the multiplier stays between 1.00 and 1.30. Allowances are additive, not compounded.

Implementation rounds `T_i` to two decimal hours, then calculates and rounds `R_i` from that rounded total. Progress assumes time decreases proportionally with completion. Due dates and grade weights never change `T_i`. Completed assignments (`P_i = 1`) have `R_i = 0` and receive no sessions.

### 5. Priority formula and normalization

```text
U_i = 1 / (max(0, days_i) + 1)
L_i = 1 − P_i
M   = max(R_i across all current assignments), or 0 for an empty set
W_i = R_i / M if M > 0, otherwise 0

Priority_i = 0.40 × U_i
           + 0.25 × G_i
           + 0.20 × W_i
           + 0.15 × L_i
```

For nonnegative days, urgency is exactly `1 / (days_i + 1)`. Overdue dates are clamped to zero to avoid division by zero or negative urgency; overdue and due-today assignments both have `U_i = 1`. Completed assignments override all four contributions and the final score to zero.

| Weight                   | Why it is used                                                  |
| ------------------------ | --------------------------------------------------------------- |
| Urgency: 0.40            | Deadlines matter most for deciding what needs attention first.  |
| Grade weight: 0.25       | Higher-stakes work comes next.                                  |
| Remaining workload: 0.20 | Larger unfinished assignments need room in the plan.            |
| Progress left: 0.15      | Less-complete work gets an additional, smaller priority signal. |

The weights sum to 1 and represent our initial design priorities. They are not fitted research results. Difficulty and stress have **no direct priority terms**; their effect comes through `T_i`, then `R_i` and `W_i`. Progress intentionally affects both remaining hours and the explicit progress-left term, as specified for this version.

Both the assignment list and session scheduler compute `M` from the same full set of current assignments before sorting. Completed assignments contribute zero to `M`. The denominator stays fixed during that planning pass; it is not recalculated as sessions are allocated. Task or progress edits recompute it. Adding a large assignment can therefore change other assignments' relative priority. If only one unfinished assignment exists, its workload score is 1.

Scores are kept at JavaScript floating-point precision for sorting, not rounded to two decimals. Sort by descending score, then ascending due date, then ID. The UI displays the resulting rank (1, 2, 3), not the internal score. Completed assignments remain visible at the end of the list.

Reasons are explanatory labels, not extra score bonuses: due soon (at most two days), overdue, high grade weight (at least 20%), low progress (below 25%), long task (at least four remaining hours), and high effort/stress (4–5). High-rating reasons explicitly describe a **time allowance**, rather than a separate priority contribution.

### 6. Weekly workload labels

```text
A_week = sum(A_d for the next seven days)
weekly_load_ratio = sum(R_i for all current assignments) / A_week
```

| Ratio                 | Label      |
| --------------------- | ---------- |
| `0 ≤ ratio ≤ 0.50`    | Light      |
| `0.50 < ratio ≤ 0.80` | Moderate   |
| `0.80 < ratio ≤ 1.00` | Heavy      |
| `ratio > 1.00`        | Overloaded |

These continuous intervals implement the requested 0.00–0.50 / 0.51–0.80 / 0.81–1.00 labels without gaps for ratios such as 0.505. Classify before rounding the ratio. If no time is available: no remaining work is light; positive remaining work is overloaded.

The overall label includes all remaining assignments, including those due beyond this week. Daily labels use `H_d / A_d`, the time actually placed. Scheduled days cannot exceed capacity; work that cannot fit is shown as unallocated. A near deadline can be infeasible even when the week is light. Ratings already affect remaining hours and are not multiplied into the ratio again. Label thresholds are descriptive prototype choices, not validated stress or health thresholds.

### 7. Session allocation procedure

1. Create seven days beginning with the student's local date. Initialize each `H_d` to zero and read recurring weekday availability.
2. Compute adjusted remaining hours, `M`, and priorities; sort unfinished assignments as described above.
3. For each assignment, set local remaining work to `R_i`.
4. Eligible days have free capacity and are on or before the due date. Already-overdue assignments may use any of the seven days as recovery work; show a warning.
5. Choose the eligible day with the lowest `H_d / A_d + 0.08 × k_d`. Break ties by earlier date. This favors less-full days with a small preference for earlier study.
6. Set `B_i = 0.5` hours if difficulty or stress is at least 4; otherwise `B_i = 1` hour. Allocate `q = min(local remaining work, B_i, A_d − H_d)` and round it to two decimals.
7. Record the session, increase `H_d`, subtract `q` from local remaining work, and repeat until finished or no eligible capacity remains. Record any leftover hours as unallocated.

Difficulty/stress still select session length; this is a placement rule, not an extra priority weight. Students choose their own start times and breaks. Final sessions may be shorter than the limit. Assignments due beyond seven days may start early.

### 8. Other implementation constants and assumptions

| Constant or rule       | Value and reason                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Planning horizon       | 7 days: one simple weekly plan.                                                                                                                 |
| Earlier-day preference | 0.08 per day: a small tie-balancing preference, not a learned value.                                                                            |
| High-rating threshold  | 4: first level above the normal reference of 3.                                                                                                 |
| Session limits         | 0.5 / 1 hour: simple short/standard study blocks; not proven optimal lengths.                                                                   |
| Numeric rounding       | Nearest 0.01 hour for planned, remaining, available, allocated, and daily hours; prevents floating-point accumulation in allocations.           |
| Allocation tolerance   | 0.001 hour: numerical guard below the 0.01-hour resolution, not a scheduling allowance.                                                         |
| Input limits           | Instructor hours 0.25–200; daily hours 0–12; grade/progress 0–100; ratings integer 1–5. Practical form guardrails, not research-derived bounds. |
| Form increments        | Hours 0.25; grade percent 0.1; progress percent 1. Simple input controls; computed sessions may have finer remainders.                          |
| Date handling          | Local calendar dates; UTC midnight differences for day counts to avoid daylight-saving shifts; no due-time-of-day input.                        |
| Date refresh           | Every 30 seconds and on window focus; refresh priorities when the local date changes.                                                           |

### 9. Example calculation

```text
E_i = 4 hours, D_i = 5, S_i = 5

difficulty_adjustment_i = (5 − 3) × 0.09 = 0.18
stress_adjustment_i     = (5 − 3) × 0.06 = 0.12
multiplier             = 1 + 0.18 + 0.12 = 1.30
T_i                    = 4 × 1.30 = 5.2 hours

P_i = 50 / 100 = 0.50
R_i = 5.2 × (1 − 0.50) = 2.6 hours
```

For a separate priority check, suppose an assignment has `R_i = 2h`, `M = 4h`, is due tomorrow, has grade weight 50%, and progress 50%:

```text
U_i = 1 / (1 + 1) = 0.5
G_i = 0.5, W_i = 2 / 4 = 0.5, L_i = 0.5
Priority_i = 0.40(0.5) + 0.25(0.5) + 0.20(0.5) + 0.15(0.5) = 0.5
```

### 10. Limitations

Instructor estimates and student ratings may be inaccurate. The five categories are subjective; normal can mean different things to different students. Extra stress does not necessarily cause extra working time. The 30% cap, linear progress assumption, priority weights, session lengths, and workload thresholds all need evaluation. Normalizing to the largest task makes priority relative to the current assignment set. Very small remaining amounts may round to zero without the task being marked complete.

This is a greedy scheduler, not a global optimizer: another arrangement could fit more work. It does not model dependencies, breaks, exact clock times, calendar conflicts, or learning outcomes. The research supports the workload dimensions and survey format; it does not prove this assignment scheduler improves grades or wellbeing.

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
