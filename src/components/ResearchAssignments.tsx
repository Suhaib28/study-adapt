import { useState } from "react";
import { Search, Plus, Check, Pencil } from "lucide-react";
import { courseAccent } from "../lib/course-presentation";
import {
  Task,
  plannedHours,
  lookupHours,
  priority,
  maxRemainingHours,
  round,
} from "../lib/scheduler";
interface Props {
  courseFilter: string;
  onCourseFilter: (course: string) => void;
  tasks: Task[];
  today: string;
  weeklyStress: number;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}
export default function ResearchAssignments({
  tasks,
  courseFilter,
  onCourseFilter,
  today,
  weeklyStress,
  onEdit,
  onComplete,
  onDelete,
}: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const courses = [...new Set(tasks.map((task) => task.course))].sort();
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
  const visible = ranked
    .map((task, index) => ({ task, rank: index + 1 }))
    .filter(
      ({ task }) =>
        (!courseFilter || task.course === courseFilter) &&
        (status === "all" ||
          (status === "completed"
            ? task.progress === 100
            : task.progress < 100)) &&
        `${task.name} ${task.course}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    );
  return (
    <section
      className="panel assignments-panel"
      aria-labelledby="assignments-heading"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Your coursework, in one place</span>
          <h2 id="assignments-heading">Assignments</h2>
        </div>
        <a className="text-link" href="#assignment-input">
          <Plus size={16} aria-hidden="true" /> Add assignment
        </a>
      </div>
      <p className="muted">
        Ordered by research-model priority. Filters change this view, not your
        study plan.
      </p>
      <div className="assignment-toolbar">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <input
            aria-label="Search assignments"
            type="search"
            placeholder="Search assignments or courses"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by course"
          value={courseFilter}
          onChange={(e) => onCourseFilter(e.target.value)}
        >
          <option value="">All courses</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-row">
        <div
          className="status-filters"
          role="group"
          aria-label="Assignment status"
        >
          {[
            ["all", "All assignments"],
            ["open", "Open assignments"],
            ["completed", "Completed assignments"],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="count-label" role="status">
          {visible.length} of {tasks.length} shown
        </span>
      </div>
      {!tasks.length && (
        <p className="empty">
          No assignments yet. Enter one above to create a plan.
        </p>
      )}
      {tasks.length > 0 && visible.length === 0 && (
        <div className="empty">
          <p>No assignments match these filters.</p>
          <button
            className="secondary"
            onClick={() => {
              setQuery("");
              setStatus("all");
              onCourseFilter("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <div className="assignment-list">
        {visible.map(({ task, rank }) => {
          const p = priority(task, today, maxRemaining, weeklyStress);
          return (
            <article
              key={task.id}
              className={`assignment ${task.progress === 100 ? "is-complete" : ""}`}
              aria-label={task.name}
            >
              <div className="assignment-header">
                <div>
                  <span
                    className="course-label"
                    style={{ color: courseAccent(task.course) }}
                  >
                    {task.course}
                  </span>
                  <h3>{task.name}</h3>
                  <p>
                    Due <time dateTime={task.dueDate}>{task.dueDate}</time>
                    {p.days < 0 && task.progress < 100 ? " · Overdue" : ""}
                  </p>
                </div>
                <strong className="rank">
                  {task.progress === 100 ? "Completed" : `Priority ${rank}`}
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
              <progress
                className="assignment-progress"
                value={task.progress}
                max={100}
                aria-label={`${task.name} progress`}
              />
              <details className="assignment-details">
                <summary>Estimates & research details</summary>
                {task.isExample && (
                  <p className="muted">
                    Example assignment · excluded from evaluation
                  </p>
                )}
                <p className="muted">
                  Category lookup total:{" "}
                  {round(lookupHours(task, weeklyStress))}h · weekly plan uses
                  the centered model.
                </p>
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
              </details>
              {task.progress === 100 && task.actualHours !== undefined && (
                <p>Actual total hours: {task.actualHours}h</p>
              )}

              <p className="reasons">
                <strong>Why:</strong> {p.reasons.join(" · ")}
              </p>
              <div className="actions">
                <button className="secondary" onClick={() => onEdit(task)}>
                  <Pencil size={14} aria-hidden="true" /> Edit
                </button>
                {task.progress < 100 && (
                  <button
                    className="secondary"
                    onClick={() => onComplete(task)}
                  >
                    <Check size={14} aria-hidden="true" /> Mark complete
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
