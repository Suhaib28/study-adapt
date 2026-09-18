export interface Task {
  id: string;
  name: string;
  course: string;
  dueDate: string;
  /** Instructor estimate before student workload adjustments. */
  estimatedHours: number;
  gradeWeight: number;
  effort: number;
  stress: number;
  progress: number;
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
// Only high ratings add a small planning allowance; these are prototype weights.
export function plannedHours(task: Task): number {
  const difficultyAllowance = 0.1 * Math.max(0, task.effort - 3);
  const stressAllowance = 0.05 * Math.max(0, task.stress - 3);
  return round(
    task.estimatedHours * (1 + difficultyAllowance + stressAllowance),
  );
}
export function remainingHours(task: Task): number {
  return round(plannedHours(task) * (1 - task.progress / 100));
}
export function priority(task: Task, today: string) {
  const days = daysBetween(today, task.dueDate);
  const remaining = remainingHours(task);
  const parts = {
    urgency: 35 / (1 + Math.max(0, days)),
    time: 15 * Math.min(remaining / 8, 1),
    grade: (20 * task.gradeWeight) / 100,
    effort: (10 * (task.effort - 1)) / 4,
    stress: (10 * (task.stress - 1)) / 4,
    progress: 10 * (1 - task.progress / 100),
  };
  const reasons = [
    days < 0 ? "Overdue" : days <= 2 ? "Due soon" : "",
    task.effort >= 4 ? "High mental effort" : "",
    task.gradeWeight >= 20 ? "High grade weight" : "",
    task.stress >= 4 ? "High stress/load" : "",
    task.progress < 25 ? "Low progress" : "",
    remaining >= 4 ? "Long task" : "",
  ].filter(Boolean);
  return {
    score:
      remaining === 0
        ? 0
        : round(Object.values(parts).reduce((a, b) => a + b, 0)),
    parts,
    reasons:
      remaining === 0
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
    : ratio > 0.85
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
): Plan {
  const days: PlanDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    return {
      date,
      capacity: round(availability[new Date(`${date}T12:00:00`).getDay()] ?? 0),
      hours: 0,
      sessions: [],
    };
  });
  const ranked = tasks
    .filter((t) => t.progress < 100)
    .slice()
    .sort(
      (a, b) =>
        priority(b, today).score - priority(a, today).score ||
        a.dueDate.localeCompare(b.dueDate) ||
        a.id.localeCompare(b.id),
    );
  const unplaced: Plan["unplaced"] = [];
  for (const task of ranked) {
    let remaining = remainingHours(task);
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
      const maxSession = task.effort >= 4 || task.stress >= 4 ? 0.5 : 1;
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
