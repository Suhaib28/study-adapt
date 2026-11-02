import { ArrowRight, BookOpen, Clock3, CalendarDays } from "lucide-react";
import {
  Task,
  daysBetween,
  remainingHours,
  round,
  workloadLabel,
} from "../lib/scheduler";

import { courseAccent } from "../lib/course-presentation";

interface Props {
  tasks: Task[];
  today: string;
  weeklyStress: number;
  remaining: number;
  capacity: number;
  onEdit: (task: Task) => void;
  onCourse: (course: string) => void;
}
export default function DashboardOverview({
  tasks,
  today,
  weeklyStress,
  remaining,
  capacity,
  onEdit,
  onCourse,
}: Props) {
  const open = tasks.filter((task) => task.progress < 100);
  const due = open
    .filter((task) => daysBetween(today, task.dueDate) <= 6)
    .sort(
      (a, b) => a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id),
    );
  const courses = [...new Set(tasks.map((task) => task.course))].sort();
  const level = workloadLabel(remaining, capacity);
  return (
    <div className="overview-content">
      <div className="summary-grid">
        <div className="summary-card">
          <span className="eyebrow">
            <Clock3 size={15} aria-hidden="true" /> Remaining work
          </span>
          <p className="summary-number">
            {remaining}
            <span> hrs</span>
          </p>
          <p className="muted">Adjusted time across all assignments</p>
        </div>
        <div className="summary-card">
          <span className="eyebrow">
            <CalendarDays size={15} aria-hidden="true" /> Study capacity
          </span>
          <p className="summary-number">
            {capacity}
            <span> hrs</span>
          </p>
          <a href="#planner" className="text-link">
            Set your available hours <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
        <div className="summary-card workload-card">
          <span className="eyebrow">Workload balance</span>
          <p className="summary-level">
            {level}
            <span
              className={`status-dot ${level.toLowerCase()}`}
              aria-hidden="true"
            />
          </p>
          <div className="load-track" aria-hidden="true">
            <span
              style={{
                width: `${capacity ? Math.min(100, (remaining / capacity) * 100) : remaining ? 100 : 0}%`,
              }}
            />
          </div>
          <p className="muted">
            {capacity
              ? `${Math.round((remaining / capacity) * 100)}% of this week’s capacity`
              : "No available study hours set"}
          </p>
        </div>
      </div>
      <div className="overview-columns">
        <section
          className="panel courses-panel"
          aria-labelledby="courses-heading"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your workspace</span>
              <h2 id="courses-heading">Courses</h2>
            </div>
            <span className="count-label">{courses.length} total</span>
          </div>
          {!courses.length && (
            <p className="empty">Add an assignment to see its course here.</p>
          )}
          <div className="course-grid">
            {courses.map((course) => {
              const work = tasks.filter((task) => task.course === course);
              const active = work.filter((task) => task.progress < 100);
              return (
                <button
                  className="course-card"
                  key={course}
                  onClick={() => onCourse(course)}
                  aria-label={`View ${course} assignments`}
                  style={{ borderTopColor: courseAccent(course) }}
                >
                  <span
                    className="course-icon"
                    style={{ color: courseAccent(course) }}
                  >
                    <BookOpen size={20} aria-hidden="true" />
                  </span>
                  <h3>{course}</h3>
                  <span className="muted">
                    {active.length} open · {work.length - active.length}{" "}
                    completed
                  </span>
                  <span className="course-bottom">
                    <strong>
                      {round(
                        work.reduce(
                          (sum, task) =>
                            sum + remainingHours(task, weeklyStress),
                          0,
                        ),
                      )}
                      h remaining
                    </strong>
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
        <section
          className="panel deadlines-panel"
          aria-labelledby="deadlines-heading"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">On the horizon</span>
              <h2 id="deadlines-heading">Upcoming deadlines</h2>
            </div>
            <CalendarDays size={19} aria-hidden="true" />
          </div>
          <p className="muted">Next seven days, including overdue work.</p>
          {due.length === 0 ? (
            <p className="empty">You’re clear for the next seven days.</p>
          ) : (
            <ul className="deadline-list">
              {due.slice(0, 5).map((task) => {
                const days = daysBetween(today, task.dueDate);
                return (
                  <li key={task.id}>
                    <button
                      className="deadline-link"
                      onClick={() => onEdit(task)}
                    >
                      <span
                        className="course-dot"
                        style={{ background: courseAccent(task.course) }}
                        aria-hidden="true"
                      />
                      <span>
                        <strong>{task.name}</strong>
                        <small>{task.course}</small>
                      </span>
                      <span
                        className={`due-label ${days < 0 ? "overdue" : ""}`}
                      >
                        {days < 0
                          ? "Overdue"
                          : days === 0
                            ? "Today"
                            : days === 1
                              ? "Tomorrow"
                              : new Date(
                                  `${task.dueDate}T12:00:00`,
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <a href="#assignments" className="text-link">
            {due.length > 5
              ? `View all ${due.length} deadlines`
              : "View assignments"}{" "}
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </section>
      </div>
    </div>
  );
}
