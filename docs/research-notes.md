# Research notes: Study Adapt experimental models

This first-phase prototype uses course workload research to explore assignment planning. It does not yet predict actual completion time reliably.

## What the papers support

### 1. Course Load Analytics

[Borchers & Pardos (2025), DOI: 10.18608/jla.2025.8473](https://doi.org/10.18608/jla.2025.8473), Abstract, p. 293, provides the main framework: time load, mental effort and psychological stress. Its course-choice experiment found mental effort especially influential, followed by stress. Course-choice odds ratios are not assignment completion-time coefficients.

### 2. Workload self-ratings

[Pardos, Borchers & Yu (2023), DOI: 10.1016/j.iheduc.2022.100882](https://doi.org/10.1016/j.iheduc.2022.100882). References below use the printed pages in the [repository manuscript](https://escholarship.org/content/qt4424x23s/qt4424x23s.pdf).

- Sections 3.1–3.2.1, p. 5: retrospective course ratings adapted SWAT to education, separating time, mental effort and stress. Most responses had five categories; weekly hours used six.
- Appendix A.2–A.3, pp. 15–16: mental effort concerns attention and concentration; stress concerns experiences such as confusion, frustration and anxiety. Effort uses low-to-high categories, while stress uses frequency categories.
- Table 5, p. 9: overlapping assignment deadlines were associated with stress.
- Section 5.1, pp. 14–15: retrospective recall, missing classroom information and the remote-instruction context limit interpretation and generalization.

The app adapts the stress question to a student's current week. Its frequency options are Nearly never, Seldom, Sometimes, Frequently and Nearly always. This is an adaptation of a course-level survey, not a validated reproduction. The app does not infer stress from overlapping deadlines.

### 3. Instructor expectations and reported hours

[Wentling & Variawa (2020), DOI: 10.24908/pceea.vi0.14189](https://doi.org/10.24908/pceea.vi0.14189), Section 3.0 (PDF p. 2), compares weekly student workload reports with course coordinator expectations. Table B (PDF p. 4) lists expected hours; Section 5.0 (PDF pp. 4–5) discusses reports both above and below expectations.

This supports allowing estimates to move in either direction. It does not establish assignment-level error coefficients or a universal ±30% range.

### 4. Interpreting Likert-type ratings

[Sullivan & Artino (2013), Analyzing and Interpreting Data From Likert-Type Scales](https://pmc.ncbi.nlm.nih.gov/articles/PMC3886444/), pp. 541–542, discusses ordinal responses and the debate over numerical analysis. Ordered categories do not guarantee equal distances: the difference between low and normal effort need not equal the difference between high and very high effort.

The article also discusses the robustness of parametric tests. It does not forbid numerical models of ordinal responses. That discussion does not establish a conversion from difficulty or stress categories into study hours.

Here, D and S are individual ordinal items, not a validated multi-item scale. Centering the numbers does not make them interval measurements. The lookup alternative lets category gaps differ, but its chosen values still require evidence.

## Evidence, assumptions and validation

| Direct support from the papers                                | Provisional modeling assumption                                                            | Future validation needed                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Workload has time, effort and stress dimensions.              | Apply these course-level ideas to individual assignments.                                  | Compare estimates with assignment-level time records.                |
| Five-category self-ratings separate effort and stress.        | Code each ordinal step as equally spaced. Use a weekly stress response across assignments. | Check response reliability and compare alternative ordinal mappings. |
| Mental effort influenced course choices.                      | Give difficulty 60% and stress 40% of the time adjustment.                                 | Fit and compare weights using completion-time data.                  |
| Reported hours can be above or below instructor expectations. | Allow a symmetric ±30% adjustment.                                                         | Estimate separate lower and upper bounds from observed errors.       |

## Three models

### Centered model

For instructor hours E, difficulty D, weekly stress S and completion fraction P:

```text
d = (D - 3) / 2
s = (S - 3) / 2
T = E × (1 + C × (wD × d + wS × s))
R = T × (1 - P)
```

The named defaults in `src/lib/scheduler.ts` are `ADJUSTMENT_CAP=0.30`, `DIFFICULTY_WEIGHT=0.60` and `STRESS_WEIGHT=0.40`. Helpers accept a configuration object for experiments. Validation requires finite, nonnegative weights summing to 1 and a finite cap from 0 up to, but excluding, 1. This keeps positive instructor estimates positive.

Centered coding is not z-score standardization. Mapping categories to −1, −0.5, 0, 0.5 and 1 does not solve the ordinal-scale problem: equal distances remain a simplifying assumption. A middle stress response means “Sometimes”; treating it as zero adjustment is a modeling choice. The 60/40 split and symmetric 30% bound are exploratory. Instructor hours are a reference, not a minimum. None of these papers establishes a validated stress-to-completion-time function.

### Category lookup model

Use a separate percentage adjustment for each category:

| Category | Difficulty adjustment aD | Weekly stress adjustment aS |
| -------- | ------------------------ | --------------------------- |
| 1        | −0.18                    | −0.12                       |
| 2        | −0.05                    | −0.03                       |
| 3        | 0                        | 0                           |
| 4        | +0.07                    | +0.04                       |
| 5        | +0.18                    | +0.12                       |

```text
T_lookup = E × (1 + aD[D] + aS[S])
R_lookup = T_lookup × (1 - P)
```

These monotonic tables have unequal gaps and category 3 neutral. They are manually chosen prototype values, not estimates from the papers or observed data. Their current combined range is also ±30%, chosen to keep this first comparison bounded. This is not a universal limit; additivity and monotonicity are assumptions too. The tables are separate constants in `scheduler.ts`; they do not apply the centered model's weights or C again.

For E=4, D=4, S=4, the lookup total is 4 × 1.11 = 4.44 hours. The centered model gives 4.6 hours. Both give 4 hours at D=S=3.

### Instructor-only baseline

```text
T_instructor = E
R_instructor = E × (1 - P)
```

This baseline applies no rating adjustment. It is the reference against which the two experimental models must earn any claimed improvement.

### Scheduling

The weekly plan continues using the centered model. Lookup and instructor totals are comparison estimates; there is no model selector or automatic choice of a winning model.

Internal estimates keep floating-point precision. Display values and scheduled hours use the existing two-decimal rounding. Progress is stored as a percentage and converted to a fraction for the formula.

Priority remains:

```text
U = 1 / (max(0, daysUntilDue) + 1)
G = gradeWeight / 100
W = R / maxRemainingHours
L = 1 - P
priority = 0.40 × U + 0.25 × G + 0.20 × W + 0.15 × L
```

W is zero when its denominator is zero; completed assignments have zero priority. Difficulty and stress enter only through R. Their explanation labels describe time adjustments, not extra priority bonuses. Existing daily capacity limits, deadline handling and workload labels remain. High difficulty or frequent weekly stress uses at most 30-minute sessions; otherwise the limit is 60 minutes. These scheduling choices are also prototype assumptions.

## Weekly responses and old saves

Weekly stress is saved in the existing browser storage record as `weeklyStress`, keyed by local Monday dates such as `2026-10-12`. Each week uses its own response, or 3 if none exists. A missing response is not an observed student rating. Older responses stay saved but are not carried forward.

The current week's response applies to the entire rolling seven-day preview, including days after the next Monday. When the local date enters a new week, the app recalculates using that week's response or default. Changes update estimates, priorities, session lengths and the plan immediately.

Legacy assignment stress fields and other assignment fields are preserved through loading and editing but ignored by V2 calculations. They never become a weekly self-report. Invalid saved weekly responses are ignored with a warning without discarding valid assignments.

## Actual hours and evaluation

`actualHours` is optional total time spent on the whole assignment, entered when progress is 100%. Blank means missing, while zero is an explicit observation. It never changes progress or the remaining-hours formula. Reopened assignments retain entered hours but are excluded from evaluation until completed again.

The app records each model's total hours on the first save of unfinished work, together with date, difficulty, progress, weekly stress and whether stress was supplied or defaulted. These predictions stay fixed across subsequent edits, cap changes, weeks and reloads. The plan still adapts to current inputs. This separates a forecast from later information about the outcome. A saved estimate may have been made after work started; this is an exploratory comparison, not a controlled prospective study.

Only completed, non-example assignments with valid actual hours and a saved pre-completion prediction are included. All three models use the same assignments. Old assignments are preserved; unfinished ones can acquire predictions when edited and saved. Already-completed work without a saved prediction is excluded, rather than reconstructed using today's stress.

For n included assignments and model m:

```text
error_i,m = savedPredictedTotal_i,m - actualHours_i
MAE_m = sum(abs(error_i,m)) / n
bias_m = sum(error_i,m) / n
```

Both metrics are in hours. Lower MAE means smaller errors on the entered records. Positive bias means overestimation; negative means underestimation. Opposing errors can cancel in bias, so both are shown. No observations produces an empty message, not zero error.

Synthetic actual-hour observations exist only in explicitly labeled unit and browser test fixtures. The app seeds no actual hours or evaluation results. Existing planning examples are labeled and excluded from evaluation when marked as examples. Entered data are self-reported and cannot be verified by this local prototype. There is no claim of real predictive accuracy from test fixtures or a small convenience sample.

## Next validation step

Collect instructor estimates, actual study hours, assignment difficulty, weekly stress and progress with student consent. For positive instructor estimates, calculate:

```text
relativeError = (actualHours - instructorEstimatedHours) / instructorEstimatedHours
```

Compare all three models on held-out assignments with observations collected before outcomes are known. Keep calibration data separate from evaluation data and report sample sizes and missing-response patterns. Examine the error distribution and evaluate data-derived lower and upper adjustment bounds, which may be asymmetric. Compare alternative weights and ordinal mappings before treating the formula as predictive.

Previous-week workload and stress–performance relationships remain future research questions. Neither is used to calculate stress or completion time in this version.
