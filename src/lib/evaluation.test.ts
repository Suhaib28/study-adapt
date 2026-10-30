import { describe, expect, it } from "vitest";
import {
  DIFFICULTY_ADJUSTMENTS,
  STRESS_ADJUSTMENTS,
  DEFAULT_WORKLOAD_CONFIG,
  lookupHours,
  modelHours,
  plannedHours,
  remainingHours,
  buildPlan,
  Task,
} from "./scheduler";
import { evaluateModels, recordPrediction } from "./evaluation";

// Synthetic fixtures only: these numbers test arithmetic, not predictive accuracy.
const task: Task = {
  id: "synthetic",
  name: "Synthetic test assignment",
  course: "Test",
  dueDate: "2026-11-05",
  estimatedHours: 4,
  gradeWeight: 20,
  effort: 4,
  progress: 0,
};
const recorded = (effort = 4, stress = 4) =>
  recordPrediction({ ...task, effort }, stress, "2026-10-30", true);

describe("experimental model comparison (synthetic fixtures)", () => {
  it.each([
    [1, 1, 2.8],
    [2, 2, 3.68],
    [3, 3, 4],
    [4, 4, 4.44],
    [5, 5, 5.2],
    [5, 1, 4.24],
    [1, 5, 3.76],
  ])(
    "looks up separate category adjustments D=%s S=%s",
    (effort, stress, expected) => {
      expect(lookupHours({ ...task, effort }, stress)).toBeCloseTo(expected);
    },
  );
  it("uses monotonic but unequal steps with neutral middle categories", () => {
    for (const table of [DIFFICULTY_ADJUSTMENTS, STRESS_ADJUSTMENTS]) {
      expect(table).toHaveLength(5);
      expect(table[2]).toBe(0);
      const gaps = table.slice(1).map((value, i) => value - table[i]);
      expect(gaps.every((gap) => gap > 0)).toBe(true);
      expect(new Set(gaps.map((gap) => gap.toFixed(4))).size).toBeGreaterThan(
        1,
      );
    }
    for (let effort = 1; effort <= 5; effort++)
      for (let stress = 1; stress <= 5; stress++) {
        const hours = lookupHours({ ...task, effort }, stress);
        expect(hours).toBeGreaterThanOrEqual(2.8);
        expect(hours).toBeLessThanOrEqual(5.2);
        if (effort < 5)
          expect(
            lookupHours({ ...task, effort: effort + 1 }, stress),
          ).toBeGreaterThan(hours);
        if (stress < 5)
          expect(lookupHours({ ...task, effort }, stress + 1)).toBeGreaterThan(
            hours,
          );
      }
  });
  it.each([0, 6, 1.5, NaN, Infinity])(
    "rejects invalid lookup ratings %s",
    (value) => {
      expect(() => lookupHours({ ...task, effort: value }, 3)).toThrow(
        RangeError,
      );
      expect(() => lookupHours(task, value)).toThrow(RangeError);
    },
  );
  it("keeps the instructor baseline and configurable centered cap distinct", () => {
    const predictions = modelHours(task, 4);
    expect(predictions.instructor).toBe(4);
    expect(predictions.centered).toBeCloseTo(4.6);
    expect(predictions.lookup).toBeCloseTo(4.44);
    const tuned = modelHours(task, 4, {
      ...DEFAULT_WORKLOAD_CONFIG,
      adjustmentCap: 0.2,
    });
    expect(tuned.centered).toBeCloseTo(4.4);
    expect(tuned.lookup).toBe(predictions.lookup);
    expect(tuned.instructor).toBe(4);
    expect(modelHours({ ...task, progress: 100, actualHours: 99 }, 4)).toEqual(
      predictions,
    );
  });
  it("returns no metrics without eligible observations instead of false zero errors", () => {
    expect(
      evaluateModels([]).every(
        (result) =>
          result.count === 0 && result.mae === null && result.bias === null,
      ),
    ).toBe(true);
    const snapshot = recorded();
    const excluded = [
      snapshot,
      { ...snapshot, progress: 100 },
      { ...task, progress: 100, actualHours: 5 },
      { ...snapshot, progress: 99, actualHours: 5 },
      { ...snapshot, progress: 100, actualHours: NaN },
      { ...snapshot, progress: 100, actualHours: -1 },
      { ...snapshot, progress: 100, actualHours: 5, isExample: true },
    ];
    expect(evaluateModels(excluded).every((result) => result.count === 0)).toBe(
      true,
    );
  });
  it("calculates MAE and signed bias over the same two observations", () => {
    const observations = [
      { ...recorded(4, 4), progress: 100, actualHours: 5 },
      { ...recorded(2, 2), id: "second", progress: 100, actualHours: 3 },
    ];
    const results = evaluateModels(observations);
    // Instructor errors: -1,+1; centered: -0.4,+0.4; lookup: -0.56,+0.68.
    expect(results.map((r) => r.count)).toEqual([2, 2, 2]);
    expect(results[0].mae).toBe(1);
    expect(results[0].bias).toBe(0);
    expect(results[1].mae).toBeCloseTo(0.4);
    expect(results[1].bias).toBeCloseTo(0);
    expect(results[2].mae).toBeCloseTo(0.62);
    expect(results[2].bias).toBeCloseTo(0.06);
  });
  it("accepts zero actual hours and does not confuse it with missing data", () => {
    const results = evaluateModels([
      { ...recorded(), progress: 100, actualHours: 0 },
    ]);
    expect(results[0]).toMatchObject({ count: 1, mae: 4, bias: 4 });
  });
  it("freezes saved predictions before completion across edits and weeks", () => {
    const first = recorded();
    const edited = recordPrediction(
      { ...first, effort: 1, estimatedHours: 20 },
      1,
      "2026-11-02",
      true,
    );
    expect(edited.prediction).toEqual(first.prediction);
    expect(
      evaluateModels([{ ...edited, progress: 100, actualHours: 5 }]),
    ).toEqual(evaluateModels([{ ...first, progress: 100, actualHours: 5 }]));
    expect(
      recordPrediction({ ...task, progress: 100 }, 4, "2026-10-30", true)
        .prediction,
    ).toBeUndefined();
    expect(
      recordPrediction({ ...task, actualHours: 0 }, 4, "2026-10-30", true)
        .prediction,
    ).toBeUndefined();
    expect(
      recordPrediction({ ...task, isExample: true }, 4, "2026-10-30", true)
        .prediction,
    ).toBeUndefined();
    expect(
      recordPrediction(task, 3, "2026-10-30", false).prediction?.stressReported,
    ).toBe(false);
  });
  it("keeps actual hours and comparison predictions separate from scheduling", () => {
    for (let stress = 1; stress <= 5; stress++) {
      const withActual = { ...recorded(), actualHours: 25 };
      expect(plannedHours(withActual, stress)).toBe(plannedHours(task, stress));
      expect(remainingHours(withActual, stress)).toBe(
        remainingHours(task, stress),
      );
      const plan = buildPlan(
        [withActual],
        Array(7).fill(0.5),
        "2026-10-30",
        stress,
      );
      expect(plan).toEqual(
        buildPlan([task], Array(7).fill(0.5), "2026-10-30", stress),
      );
      expect(plan.days.every((day) => day.hours <= day.capacity)).toBe(true);
      expect(
        buildPlan(
          [{ ...withActual, progress: 100 }],
          Array(7).fill(2),
          "2026-10-30",
          stress,
        ).days.every((day) => day.hours === 0),
      ).toBe(true);
    }
  });
});
