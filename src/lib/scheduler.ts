export interface Task {
  id: string;
  name: string;
  course: string;
  dueDate: string;
  /** Instructor estimate before student workload adjustments. */
  estimatedHours: number;
  gradeWeight: number;
  effort: number;
  /** Retained only for compatibility with old saves; never used in V2 calculations. */
  stress?: unknown;
  progress: number;
  actualHours?: number;
  prediction?: PredictionSnapshot;
  isExample?: boolean;
}
export interface ModelHours {
  instructor: number;
  centered: number;
  lookup: number;
}
export interface PredictionSnapshot {
  recordedOn: string;
  weeklyStress: number;
  stressReported: boolean;
  difficulty: number;
  progress: number;
  hours: ModelHours;
}
export interface Session {
  taskId: string;
  hours: number;
}
export interface PlanDay {
  date: string;
  capacity: number;
  hours: number;
  sessions: Session[];
}
export interface Plan {
  days: PlanDay[];
  unplaced: { taskId: string; hours: number }[];
}
export const round = (n: number) => Math.round(n * 100) / 100;
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d);
}
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86400000,
  );
}
export const ADJUSTMENT_CAP = 0.3;
export const DIFFICULTY_WEIGHT = 0.6;
export const STRESS_WEIGHT = 0.4;
export interface WorkloadConfig {
  adjustmentCap: number;
  difficultyWeight: number;
  stressWeight: number;
}
export const DEFAULT_WORKLOAD_CONFIG: Readonly<WorkloadConfig> = Object.freeze({
  adjustmentCap: ADJUSTMENT_CAP,
  difficultyWeight: DIFFICULTY_WEIGHT,
  stressWeight: STRESS_WEIGHT,
});
export function validateConfig(config: WorkloadConfig): void {
  const { adjustmentCap, difficultyWeight, stressWeight } = config;
  if (
    ![adjustmentCap, difficultyWeight, stressWeight].every(Number.isFinite) ||
    adjustmentCap < 0 ||
    adjustmentCap >= 1 ||
    difficultyWeight < 0 ||
    stressWeight < 0 ||
    Math.abs(difficultyWeight + stressWeight - 1) > 1e-9
  ) {
    throw new RangeError(
      "Use a cap from 0 up to (but not including) 1 and nonnegative weights summing to 1.",
    );
  }
}
export function validateRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new RangeError("Ratings must be integers from 1 to 5.");
  }
}
export function plannedHours(
  task: Task,
  weeklyStress = 3,
  config: WorkloadConfig = DEFAULT_WORKLOAD_CONFIG,
): number {
  validateConfig(config);
  validateRating(task.effort);
  validateRating(weeklyStress);
  // Centered ordinal coding, NOT z-scores; equal step distances are provisional.
  const difficulty = (task.effort - 3) / 2;
  const stress = (weeklyStress - 3) / 2;
  // 60/40 explores course-choice evidence, not validated completion-time coefficients.
  // The symmetric 30% bound is provisional; instructor time is a reference, not a minimum.
  return (
    task.estimatedHours *
    (1 +
      config.adjustmentCap *
        (config.difficultyWeight * difficulty + config.stressWeight * stress))
  );
}
export function remainingHours(
  task: Task,
  weeklyStress = 3,
  config: WorkloadConfig = DEFAULT_WORKLOAD_CONFIG,
): number {
  return plannedHours(task, weeklyStress, config) * (1 - task.progress / 100);
}
// Separate category effects with unequal steps. These are provisional, not fitted values.
export const DIFFICULTY_ADJUSTMENTS = Object.freeze([
  -0.18, -0.05, 0, 0.07, 0.18,
]);
export const STRESS_ADJUSTMENTS = Object.freeze([-0.12, -0.03, 0, 0.04, 0.12]);
export function lookupHours(task: Task, weeklyStress = 3): number {
  validateRating(task.effort);
  validateRating(weeklyStress);
  return (
    task.estimatedHours *
    (1 +
      DIFFICULTY_ADJUSTMENTS[task.effort - 1] +
      STRESS_ADJUSTMENTS[weeklyStress - 1])
  );
}
export function modelHours(
  task: Task,
  weeklyStress = 3,
  config: WorkloadConfig = DEFAULT_WORKLOAD_CONFIG,
): ModelHours {
  return {
    instructor: task.estimatedHours,
    centered: plannedHours(task, weeklyStress, config),
    lookup: lookupHours(task, weeklyStress),
  };
}
export function maxRemainingHours(
  tasks: Task[],
  weeklyStress = 3,
  config: WorkloadConfig = DEFAULT_WORKLOAD_CONFIG,
): number {
  validateConfig(config);
  validateRating(weeklyStress);
  return tasks.reduce(
    (maximum, task) =>
      Math.max(maximum, remainingHours(task, weeklyStress, config)),
    0,
  );
}
export function sessionLimit(task: Task, weeklyStress = 3): number {
  validateRating(task.effort);
  validateRating(weeklyStress);
  return task.effort >= 4 || weeklyStress >= 4 ? 0.5 : 1;
}
export function priority(
  task: Task,
  today: string,
  maxRemaining: number,
  weeklyStress = 3,
  config: WorkloadConfig = DEFAULT_WORKLOAD_CONFIG,
) {
  const days = daysBetween(today, task.dueDate);
  const remaining = remainingHours(task, weeklyStress, config);
  const completed = task.progress >= 100;
  // Clamp overdue dates to zero; normalize workload across the full assignment set.
  const urgency = 1 / (Math.max(0, days) + 1);
  const grade = task.gradeWeight / 100;
  const workload = maxRemaining > 0 ? remaining / maxRemaining : 0;
  const progressLeft = 1 - task.progress / 100;
  // Effort and stress only enter through adjusted remaining time, not extra terms.
  const parts = {
    urgency: completed ? 0 : 0.4 * urgency,
    grade: completed ? 0 : 0.25 * grade,
    workload: completed ? 0 : 0.2 * workload,
    progress: completed ? 0 : 0.15 * progressLeft,
  };
  const reasons = [
    days < 0 ? "Overdue" : days <= 2 ? "Due soon" : "",
    task.effort >= 4 ? "High mental effort (time adjustment)" : "",
    task.gradeWeight >= 20 ? "High grade weight" : "",
    weeklyStress >= 4 ? "Frequent stress this week (time adjustment)" : "",
    task.progress < 25 ? "Low progress" : "",
    remaining >= 4 ? "Long task" : "",
  ].filter(Boolean);
  return {
    score: Object.values(parts).reduce((a, b) => a + b, 0),
    parts,
    reasons: completed
      ? ["Completed"]
      : reasons.length
        ? reasons
        : ["Steady progress"],
    remaining,
    days,
  };
}
export function workloadLabel(load: number, capacity: number) {
  const ratio = capacity > 0 ? load / capacity : load > 0 ? Infinity : 0;
  return ratio > 1
    ? "Overloaded"
    : ratio > 0.8
      ? "Heavy"
      : ratio > 0.5
        ? "Moderate"
        : "Light";
}
/** A rolling seven-day plan. Availability is indexed Sunday (0) through Saturday (6). */
export function buildPlan(
  tasks: Task[],
  availability: number[],
  today: string,
  weeklyStress = 3,
  config: WorkloadConfig = DEFAULT_WORKLOAD_CONFIG,
): Plan {
  validateConfig(config);
  validateRating(weeklyStress);
  const days: PlanDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    return {
      date,
      capacity: round(availability[new Date(`${date}T12:00:00`).getDay()] ?? 0),
      hours: 0,
      sessions: [],
    };
  });
  const maxRemaining = maxRemainingHours(tasks, weeklyStress, config);
  const ranked = tasks
    .filter((t) => t.progress < 100)
    .slice()
    .sort(
      (a, b) =>
        priority(b, today, maxRemaining, weeklyStress, config).score -
          priority(a, today, maxRemaining, weeklyStress, config).score ||
        a.dueDate.localeCompare(b.dueDate) ||
        a.id.localeCompare(b.id),
    );
  const unplaced: Plan["unplaced"] = [];
  for (const task of ranked) {
    let remaining = round(remainingHours(task, weeklyStress, config));
    while (remaining > 0.001) {
      // Overdue tasks get a recovery plan; future tasks are never placed after their deadline.
      const eligible = days.filter(
        (d) =>
          d.capacity - d.hours > 0.001 &&
          (task.dueDate < today || d.date <= task.dueDate),
      );
      if (!eligible.length) break;
      // Balance the fraction of available time already used, preferring earlier days.
      eligible.sort(
        (a, b) =>
          a.hours / a.capacity +
            daysBetween(today, a.date) * 0.08 -
            (b.hours / b.capacity + daysBetween(today, b.date) * 0.08) ||
          a.date.localeCompare(b.date),
      );
      const day = eligible[0];
      const maxSession = sessionLimit(task, weeklyStress);
      const hours = round(
        Math.min(remaining, maxSession, day.capacity - day.hours),
      );
      day.sessions.push({ taskId: task.id, hours });
      day.hours = round(day.hours + hours);
      remaining = round(remaining - hours);
    }
    if (remaining > 0.001) unplaced.push({ taskId: task.id, hours: remaining });
  }
  return { days, unplaced };
}
