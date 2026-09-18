import { Task, plannedHours, priority } from "../lib/scheduler";
interface Props {
  tasks: Task[];
  today: string;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}
export default function ResearchAssignments({
  tasks,
  today,
  onEdit,
  onComplete,
  onDelete,
}: Props) {
  const ranked = tasks
    .slice()
    .sort(
      (a, b) =>
        priority(b, today).score - priority(a, today).score ||
        a.dueDate.localeCompare(b.dueDate) ||
        a.id.localeCompare(b.id),
    );
  return (
    <section className="panel" aria-labelledby="assignments-heading">
      <h2 id="assignments-heading">2. Assignments, in priority order</h2>
      <p className="muted">
        Planned total includes the workload allowance. Remaining time also
        accounts for progress.
      </p>
      {!tasks.length && (
        <p className="empty">
          No assignments yet. Enter one above to create a plan.
        </p>
      )}
      <div className="assignment-list">
        {ranked.map((task, index) => {
          const p = priority(task, today);
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
                  <dd>{plannedHours(task)}h</dd>
                </div>
                <div>
                  <dt>Remaining</dt>
                  <dd>{p.remaining}h</dd>
                </div>
                <div>
                  <dt>Progress</dt>
                  <dd>{task.progress}%</dd>
                </div>
              </dl>
              <p className="muted">
                Difficulty {task.effort}/5 · Stress {task.stress}/5 · Grade
                weight {task.gradeWeight}%
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
