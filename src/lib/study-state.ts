import { z } from "zod";
import { addDays, localDate, Task } from "./scheduler";
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(`${s}T12:00:00`);
    return !isNaN(d.getTime()) && localDate(d) === s;
  });
const rating = z.number().int().min(1).max(5);
export const taskSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(120),
    course: z.string().trim().min(1).max(80),
    dueDate: date,
    estimatedHours: z.number().min(0.25).max(200),
    gradeWeight: z.number().min(0).max(100),
    effort: rating,
    // Preserve old assignment ratings as historical data, never as weekly responses.
    stress: z.unknown().optional(),
    progress: z.number().min(0).max(100),
  })
  .passthrough();
export function weekKey(day = localDate()): string {
  const weekday = new Date(`${day}T12:00:00`).getDay();
  return addDays(day, -((weekday + 6) % 7));
}
const mondayDate = date.refine((day) => weekKey(day) === day);
const weeklyStressSchema = z.record(mondayDate, rating);
export const stateSchema = z
  .object({
    tasks: z
      .array(taskSchema)
      .refine((tasks) => new Set(tasks.map((t) => t.id)).size === tasks.length),
    availability: z.array(z.number().min(0).max(12)).length(7),
    weeklyStress: weeklyStressSchema.default({}),
  })
  .passthrough();
export interface StudyState {
  tasks: Task[];
  availability: number[];
  weeklyStress: Record<string, number>;
}
export function stressForWeek(state: StudyState, day: string): number {
  const result = rating.safeParse(state.weeklyStress[weekKey(day)]);
  return result.success ? result.data : 3;
}
export const STORAGE_KEY = "study-adapt-research-v1";
export function demoState(today = localDate()): StudyState {
  const task = (
    id: string,
    name: string,
    course: string,
    due: number,
    estimatedHours: number,
    gradeWeight: number,
    effort: number,
    progress = 0,
  ): Task => ({
    id,
    name,
    course,
    dueDate: addDays(today, due),
    estimatedHours,
    gradeWeight,
    effort,
    progress,
  });
  return {
    availability: [2, 2, 2.5, 2, 2.5, 1, 3],
    weeklyStress: {},
    tasks: [
      task(
        "lab",
        "Process scheduling lab",
        "Operating Systems",
        2,
        3,
        15,
        4,
        25,
      ),
      task("project", "Graph algorithms project", "Algorithms", 5, 4, 30, 5),
      task("math", "Problem set 04", "Linear Algebra", 4, 2, 5, 3),
    ],
  };
}
export function readState(): { state: StudyState; warning: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { state: demoState(), warning: "" };
    const raw = JSON.parse(saved);
    // An invalid weekly response must not discard otherwise valid assignments.
    const weeklyStress: Record<string, number> = {};
    const entries =
      raw.weeklyStress &&
      typeof raw.weeklyStress === "object" &&
      !Array.isArray(raw.weeklyStress)
        ? Object.entries(raw.weeklyStress)
        : [];
    for (const [key, value] of entries) {
      if (mondayDate.safeParse(key).success && rating.safeParse(value).success)
        weeklyStress[key] = value as number;
    }
    const invalidWeekly =
      raw.weeklyStress !== undefined &&
      !weeklyStressSchema.safeParse(raw.weeklyStress).success;
    return {
      state: stateSchema.parse({ ...raw, weeklyStress }) as StudyState,
      warning: invalidWeekly
        ? "Some saved weekly stress responses were invalid and were ignored. Assignments were preserved; missing weeks use 3."
        : "",
    };
  } catch {
    return {
      state: demoState(),
      warning:
        "Saved data could not be read. Example tasks are shown; changes will replace the unreadable save.",
    };
  }
}
