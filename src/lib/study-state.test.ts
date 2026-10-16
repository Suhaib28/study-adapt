import { beforeEach, expect, it } from "vitest";
import {
  demoState,
  readState,
  STORAGE_KEY,
  stressForWeek,
  taskSchema,
  weekKey,
} from "./study-state";
import { plannedHours } from "./scheduler";

beforeEach(() => localStorage.clear());

it("keys local weeks by Monday across month, year and DST boundaries", () => {
  expect(weekKey("2026-10-18")).toBe("2026-10-12");
  expect(weekKey("2026-10-19")).toBe("2026-10-19");
  expect(weekKey("2027-01-01")).toBe("2026-12-28");
  expect(weekKey("2026-03-08")).toBe("2026-03-02");
});

it("uses only the requested week's response, otherwise defaults to 3", () => {
  const state = {
    ...demoState(),
    weeklyStress: { "2026-10-12": 5, "2026-10-26": 1 },
  };
  expect(stressForWeek(state, "2026-10-18")).toBe(5);
  expect(stressForWeek(state, "2026-10-19")).toBe(3);
  expect(stressForWeek(state, "2026-10-27")).toBe(1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  expect(readState().state.weeklyStress).toEqual(state.weeklyStress);
});

it("preserves legacy assignments and fields without inventing a weekly response", () => {
  const { tasks, availability } = demoState("2026-10-15");
  const legacy = {
    tasks: tasks.map((t) => ({ ...t, stress: 5, note: "keep this" })),
    availability,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
  const { state, warning } = readState();
  expect(warning).toBe("");
  expect(state.tasks).toEqual(legacy.tasks);
  expect(state.availability).toEqual(availability);
  expect(state.weeklyStress).toEqual({});
  expect(stressForWeek(state, "2026-10-15")).toBe(3);
  expect(plannedHours(state.tasks[0])).toBe(plannedHours(tasks[0], 3));
  const edited = taskSchema.parse({ ...state.tasks[0], progress: 50 });
  expect(edited.stress).toBe(5);
  expect(edited.note).toBe("keep this");
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, tasks: [edited, ...state.tasks.slice(1)] }),
  );
  expect(readState().state.tasks[0]).toEqual(edited);
});

it("invalid weekly responses do not discard assignments or valid responses", () => {
  const state = demoState();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      weeklyStress: {
        "2026-10-12": 5,
        "2026-10-19": 6,
        "2026-10-26": 2.5,
        "2026-10-20": 1,
        "not-a-date": 4,
      },
    }),
  );
  const loaded = readState();
  expect(loaded.state.tasks).toEqual(state.tasks);
  expect(loaded.state.weeklyStress).toEqual({ "2026-10-12": 5 });
  expect(stressForWeek(loaded.state, "2026-10-19")).toBe(3);
  expect(loaded.warning).toContain("invalid");
});
