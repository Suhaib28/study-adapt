import { Plan, round, Task, workloadLabel } from "../lib/scheduler";
export default function ResearchWeek({
  plan,
  tasks,
}: {
  plan: Plan;
  tasks: Task[];
}) {
  return (
    <div className="week-grid">
      {plan.days.map((day) => {
        const level = workloadLabel(day.hours, day.capacity);
        const taskIds = [...new Set(day.sessions.map((s) => s.taskId))];
        return (
          <article key={day.date} className="day">
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
                <div key={id} className="session">
                  <strong>{task.name}</strong>
                  <small>{task.course}</small>
                  <p>
                    {round(sessions.reduce((sum, s) => sum + s.hours, 0))}h ·{" "}
                    {sessions.length} session{sessions.length === 1 ? "" : "s"}
                  </p>
                  <small>
                    Up to {task.effort >= 4 || task.stress >= 4 ? 30 : 60} min
                    each
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
