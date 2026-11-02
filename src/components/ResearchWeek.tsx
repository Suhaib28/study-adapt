import { courseAccent } from "../lib/course-presentation";
import {
  Plan,
  round,
  sessionLimit,
  Task,
  workloadLabel,
} from "../lib/scheduler";
export default function ResearchWeek({
  plan,
  tasks,
  weeklyStress,
}: {
  plan: Plan;
  tasks: Task[];
  weeklyStress: number;
}) {
  return (
    <div className="week-grid">
      {plan.days.map((day) => {
        const level = workloadLabel(day.hours, day.capacity);
        const taskIds = [...new Set(day.sessions.map((s) => s.taskId))];
        return (
          <article
            key={day.date}
            className={`day ${day.date === plan.days[0].date ? "is-today" : ""}`}
          >
            {day.date === plan.days[0].date && (
              <span className="today-label">Today</span>
            )}
            <h3>
              {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <p>
              {day.hours}h / {day.capacity}h available
            </p>
            <span className={`badge ${level.toLowerCase()}`}>{level}</span>
            {taskIds.map((id) => {
              const task = tasks.find((t) => t.id === id)!;
              const sessions = day.sessions.filter((s) => s.taskId === id);
              return (
                <div
                  key={id}
                  className="session"
                  style={{ borderLeftColor: courseAccent(task.course) }}
                >
                  <strong>{task.name}</strong>
                  <small>{task.course}</small>
                  <p>
                    {round(sessions.reduce((sum, s) => sum + s.hours, 0))}h ·{" "}
                    {sessions.length} session{sessions.length === 1 ? "" : "s"}
                  </p>
                  <small>
                    Up to {sessionLimit(task, weeklyStress) * 60} min each
                  </small>
                </div>
              );
            })}
            {!taskIds.length && (
              <p className="empty">
                {day.capacity ? "No study assigned." : "Day off."}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
