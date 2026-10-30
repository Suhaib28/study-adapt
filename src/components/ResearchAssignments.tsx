import {
  Task,
  plannedHours,
  lookupHours,
  priority,
  maxRemainingHours,
  round,
} from "../lib/scheduler";
interface Props {
  tasks: Task[];
  today: string;
  weeklyStress: number;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}
export default function ResearchAssignments({
  tasks,
  today,
  weeklyStress,
  onEdit,
  onComplete,
  onDelete,
}: Props) {
  const maxRemaining = maxRemainingHours(tasks, weeklyStress);
  const ranked = tasks
    .slice()
    .sort(
      (a, b) =>
        priority(b, today, maxRemaining, weeklyStress).score -
          priority(a, today, maxRemaining, weeklyStress).score ||
        a.dueDate.localeCompare(b.dueDate) ||
        a.id.localeCompare(b.id),
    );
  return (
    <section className="panel" aria-labelledby="assignments-heading">
      <h2 id="assignments-heading">2. Assignments, in priority order</h2>
      <p className="muted">
        Planned total uses difficulty and this week’s stress. Remaining time
        also accounts for progress.
      </p>
      {!tasks.length && (
        <p className="empty">
          No assignments yet. Enter one above to create a plan.
        </p>
      )}
      <div className="assignment-list">
        {ranked.map((task, index) => {
          const p = priority(task, today, maxRemaining, weeklyStress);
          return (
            <article
              key={task.id}
              className="assignment"
              aria-label={task.name}
            >
              <div className="assignment-header">
                <div>
                  <h3>{task.name}</h3>
                  <p>
                    {task.course} · Due {task.dueDate}
                    {p.days < 0 && task.progress < 100 ? " · Overdue" : ""}
                  </p>
                </div>
                <strong className="rank">
                  {task.progress === 100
                    ? "Completed"
                    : `Priority ${index + 1}`}
                </strong>
              </div>
              <dl className="assignment-values">
                <div>
                  <dt>Instructor estimate</dt>
                  <dd>{task.estimatedHours}h</dd>
                </div>
                <div>
                  <dt>Planned total</dt>
                  <dd>{round(plannedHours(task, weeklyStress))}h</dd>
                </div>
                <div>
                  <dt>Remaining</dt>
                  <dd>{round(p.remaining)}h</dd>
                </div>
                <div>
                  <dt>Progress</dt>
                  <dd>{task.progress}%</dd>
                </div>
              </dl>
              {task.isExample && (
                <p className="muted">
                  Example assignment · excluded from evaluation
                </p>
              )}
              <p className="muted">
                Category lookup total: {round(lookupHours(task, weeklyStress))}h
                · weekly plan uses the centered model.
              </p>
              {task.progress === 100 && task.actualHours !== undefined && (
                <p>Actual total hours: {task.actualHours}h</p>
              )}
              {task.prediction && (
                <p className="muted">
                  Comparison estimates saved {task.prediction.recordedOn}:
                  instructor {round(task.prediction.hours.instructor)}h,
                  centered {round(task.prediction.hours.centered)}h, lookup{" "}
                  {round(task.prediction.hours.lookup)}h.
                </p>
              )}
              <p className="muted">
                Difficulty {task.effort}/5 · Grade weight {task.gradeWeight}%
              </p>
              <p className="reasons">
                <strong>Why:</strong> {p.reasons.join(" · ")}
              </p>
              <div className="actions">
                <button className="secondary" onClick={() => onEdit(task)}>
                  Edit
                </button>
                {task.progress < 100 && (
                  <button
                    className="secondary"
                    onClick={() => onComplete(task)}
                  >
                    Mark complete
                  </button>
                )}
                <button className="plain" onClick={() => onDelete(task)}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
