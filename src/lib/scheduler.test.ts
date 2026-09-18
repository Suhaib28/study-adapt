import { describe, expect, it } from "vitest";
import {
  addDays,
  buildPlan,
  daysBetween,
  plannedHours,
  priority,
  remainingHours,
  Task,
  workloadLabel,
} from "./scheduler";
import { demoState, stateSchema } from "./study-state";
const today = "2026-09-14";
const task: Task = {
  id: "one",
  name: "Task",
  course: "CS",
  dueDate: "2026-09-20",
  estimatedHours: 4,
  gradeWeight: 20,
  effort: 3,
  stress: 3,
  progress: 0,
};
describe("remaining time and priority", () => {
  it("starts with instructor time and adds only high-rating allowances", () => {
    expect(plannedHours(task)).toBe(4);
    expect(plannedHours({ ...task, effort: 1, stress: 1 })).toBe(4);
    expect(plannedHours({ ...task, effort: 4 })).toBe(4.4);
    expect(plannedHours({ ...task, stress: 4 })).toBe(4.2);
    expect(plannedHours({ ...task, effort: 5, stress: 5 })).toBe(5.2);
    expect(
      remainingHours({ ...task, effort: 5, stress: 5, progress: 50 }),
    ).toBe(2.6);
    expect(remainingHours({ ...task, progress: 100 })).toBe(0);
  });
  it("increases priority for each workload signal and approaching deadlines", () => {
    const score = priority(task, today).score;
    for (const change of [
      { estimatedHours: 8 },
      { gradeWeight: 80 },
      { effort: 5 },
      { stress: 5 },
      { dueDate: today },
    ])
      expect(priority({ ...task, ...change }, today).score).toBeGreaterThan(
        score,
      );
    expect(priority({ ...task, progress: 50 }, today).score).toBeLessThan(
      score,
    );
    expect(priority(task, addDays(today, 5)).score).toBeGreaterThan(score);
    expect(priority({ ...task, progress: 100 }, today).score).toBe(0);
  });
});
describe("scheduling constraints", () => {
  it("conserves remaining work, never exceeds capacity or places work beyond deadlines", () => {
    const { tasks, availability } = demoState(today);
    {
      const plan = buildPlan(tasks, availability, today);
      for (const day of plan.days) {
        expect(day.hours).toBeLessThanOrEqual(day.capacity);
        for (const session of day.sessions)
          expect(
            day.date <= tasks.find((t) => t.id === session.taskId)!.dueDate,
          ).toBe(true);
      }
      for (const t of tasks) {
        const scheduled = plan.days
          .flatMap((d) => d.sessions)
          .filter((s) => s.taskId === t.id)
          .reduce((s, x) => s + x.hours, 0);
        expect(
          scheduled +
            (plan.unplaced.find((u) => u.taskId === t.id)?.hours ?? 0),
        ).toBeCloseTo(remainingHours(t));
      }
    }
  });
  it("reports infeasible work and respects days off", () => {
    const plan = buildPlan(
      [{ ...task, dueDate: today }],
      [0, 1, 0, 0, 0, 0, 0],
      today,
    );
    expect(plan.days[0].hours).toBe(1);
    expect(plan.unplaced).toEqual([{ taskId: "one", hours: 3 }]);
    expect(buildPlan([task], Array(7).fill(0), today).unplaced[0].hours).toBe(
      4,
    );
  });
  it("places the adjusted estimate into short sessions spread over days", () => {
    const demanding = { ...task, effort: 5, stress: 5 };
    const plan = buildPlan([demanding], Array(7).fill(2), today);
    const sessions = plan.days.flatMap((d) => d.sessions);
    expect(sessions.every((s) => s.hours <= 0.5)).toBe(true);
    expect(sessions.reduce((sum, s) => sum + s.hours, 0)).toBeCloseTo(5.2);
    expect(plan.days.filter((d) => d.hours > 0).length).toBeGreaterThan(1);
  });
  it("replans for progress, ratings, changed availability and date", () => {
    const availability = Array(7).fill(2);
    const total = (t: Task) =>
      buildPlan([t], availability, today).days.reduce((s, d) => s + d.hours, 0);
    expect(total({ ...task, progress: 50 })).toBe(2);
    expect(total({ ...task, effort: 5, stress: 5 })).toBeCloseTo(5.2);
    expect(total({ ...task, progress: 100 })).toBe(0);
    expect(
      buildPlan([task], Array(7).fill(0), today).days.every(
        (d) => d.hours === 0,
      ),
    ).toBe(true);
    expect(
      buildPlan([task], availability, addDays(today, 1)).days[0].date,
    ).toBe("2026-09-15");
  });
  it("includes overdue recovery and handles empty plans", () => {
    expect(
      buildPlan(
        [{ ...task, dueDate: "2026-09-13" }],
        Array(7).fill(2),
        today,
      ).days.some((d) => d.hours > 0),
    ).toBe(true);
    expect(buildPlan([], Array(7).fill(2), today).unplaced).toEqual([]);
  });
  it("handles small remainders and date boundaries without losing work", () => {
    const p = buildPlan(
      [{ ...task, estimatedHours: 0.25, progress: 50 }],
      Array(7).fill(1),
      today,
    );
    expect(
      p.days.flatMap((d) => d.sessions).reduce((s, d) => s + d.hours, 0),
    ).toBe(0.13);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
  });
});
it("classifies adjusted time against availability without counting ratings twice", () => {
  expect([0, 0.5, 0.85, 1, 1.01].map((n) => workloadLabel(n, 1))).toEqual([
    "Light",
    "Light",
    "Moderate",
    "Heavy",
    "Overloaded",
  ]);
  expect(workloadLabel(0, 0)).toBe("Light");
  expect(workloadLabel(1, 0)).toBe("Overloaded");
});
it("rejects malformed storage data and duplicate task ids", () => {
  const state = demoState(today);
  expect(stateSchema.safeParse(state).success).toBe(true);
  expect(stateSchema.safeParse({ ...state, availability: [-1] }).success).toBe(
    false,
  );
  expect(
    stateSchema.safeParse({
      ...state,
      tasks: [{ ...task, dueDate: "2026-02-30" }],
    }).success,
  ).toBe(false);
  expect(stateSchema.safeParse({ ...state, tasks: [task, task] }).success).toBe(
    false,
  );
});
