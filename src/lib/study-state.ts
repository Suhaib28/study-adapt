import { z } from "zod";
import { addDays, localDate, Task } from "./scheduler";
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(`${s}T12:00:00`);
    return !isNaN(d.getTime()) && localDate(d) === s;
  });
export const taskSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  course: z.string().trim().min(1).max(80),
  dueDate: date,
  estimatedHours: z.number().min(0.25).max(200),
  gradeWeight: z.number().min(0).max(100),
  effort: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  progress: z.number().min(0).max(100),
});
export const stateSchema = z.object({
  tasks: z
    .array(taskSchema)
    .refine((tasks) => new Set(tasks.map((t) => t.id)).size === tasks.length),
  availability: z.array(z.number().min(0).max(12)).length(7),
});
export interface StudyState {
  tasks: Task[];
  availability: number[];
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
    stress: number,
    progress = 0,
  ): Task => ({
    id,
    name,
    course,
    dueDate: addDays(today, due),
    estimatedHours,
    gradeWeight,
    effort,
    stress,
    progress,
  });
  return {
    availability: [2, 2, 2.5, 2, 2.5, 1, 3],
    tasks: [
      task(
        "lab",
        "Process scheduling lab",
        "Operating Systems",
        2,
        3,
        15,
        4,
        4,
        25,
      ),
      task("project", "Graph algorithms project", "Algorithms", 5, 4, 30, 5, 5),
      task("math", "Problem set 04", "Linear Algebra", 4, 2, 5, 3, 2),
    ],
  };
}
export function readState(): { state: StudyState; warning: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return {
      state: saved
        ? (stateSchema.parse(JSON.parse(saved)) as StudyState)
        : demoState(),
      warning: "",
    };
  } catch {
    return {
      state: demoState(),
      warning:
        "Saved data could not be read. Example tasks are shown; changes will replace the unreadable save.",
    };
  }
}
