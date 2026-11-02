import {
  BookOpen,
  CalendarDays,
  FlaskConical,
  Layers,
  LayoutDashboard,
  Plus,
  HardDrive,
  Sigma,
} from "lucide-react";
import DashboardOverview from "./components/DashboardOverview";
import { useEffect, useMemo, useState } from "react";
import TaskEditor from "./components/TaskEditor";
import ResearchAssignments from "./components/ResearchAssignments";
import ResearchWeek from "./components/ResearchWeek";
import ModelEvaluation from "./components/ModelEvaluation";
import SchedulingModel from "./components/SchedulingModel";
import { recordPrediction } from "./lib/evaluation";
import {
  addDays,
  buildPlan,
  localDate,
  remainingHours,
  round,
  Task,
  workloadLabel,
} from "./lib/scheduler";
import {
  demoState,
  readState,
  STORAGE_KEY,
  weekKey,
  stressForWeek,
} from "./lib/study-state";
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function emptyTask(today: string): Task {
  return {
    id: crypto.randomUUID(),
    name: "",
    course: "",
    dueDate: addDays(today, 3),
    estimatedHours: 4,
    gradeWeight: 10,
    effort: 3,
    progress: 0,
  };
}
export default function App() {
  const [initial] = useState(readState);
  const [state, setState] = useState(initial.state);
  const [warning, setWarning] = useState(initial.warning);
  const [today, setToday] = useState(localDate);
  const [draft, setDraft] = useState(() => emptyTask(localDate()));
  const [message, setMessage] = useState(
    "Example assignments are provided on the first visit. Changes are saved in this browser.",
  );
  const [courseFilter, setCourseFilter] = useState("");
  const [courseView, setCourseView] = useState(0);
  const [activeSection, setActiveSection] = useState("overview");
  const editing = state.tasks.some((t) => t.id === draft.id);
  useEffect(() => {
    const refresh = () => setToday(localDate());
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setWarning(
        "Browser storage is unavailable. Changes will last only for this visit.",
      );
    }
  }, [state]);
  useEffect(() => {
    const updateSection = () => {
      const sections = [
        "overview",
        "scheduling-model",
        "assignments",
        "planner",
        "research",
      ];
      const current = sections
        .filter(
          (id) =>
            (document.getElementById(id)?.getBoundingClientRect().top ??
              Infinity) <= 180,
        )
        .pop();
      setActiveSection(current ?? "overview");
    };
    window.addEventListener("scroll", updateSection, { passive: true });
    return () => window.removeEventListener("scroll", updateSection);
  }, []);
  const currentWeek = weekKey(today);
  const weeklyStress = stressForWeek(state, today);
  const plan = useMemo(
    () => buildPlan(state.tasks, state.availability, today, weeklyStress),
    [state, today, weeklyStress],
  );
  const remaining = round(
    state.tasks.reduce((sum, t) => sum + remainingHours(t, weeklyStress), 0),
  );
  const capacity = round(state.availability.reduce((sum, h) => sum + h, 0));
  const level = workloadLabel(remaining, capacity);
  function save(task: Task) {
    task = recordPrediction(
      task,
      weeklyStress,
      today,
      state.weeklyStress[currentWeek] !== undefined,
    );
    setState((s) => ({
      ...s,
      tasks: s.tasks.some((t) => t.id === task.id)
        ? s.tasks.map((t) => (t.id === task.id ? task : t))
        : [...s.tasks, task],
    }));
    setDraft(emptyTask(today));
    setMessage(
      `Saved “${task.name}”. Time estimates, priorities, and the plan have been updated.`,
    );
  }
  function edit(task: Task) {
    setDraft({ ...task });
    document.getElementById("assignment-input")?.scrollIntoView();
    window.requestAnimationFrame(() =>
      document
        .querySelector<HTMLInputElement>("#assignment-input input")
        ?.focus(),
    );
  }
  function remove(task: Task) {
    if (!window.confirm(`Delete “${task.name}”?`)) return;
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== task.id) }));
    if (draft.id === task.id) setDraft(emptyTask(today));
    setMessage("Assignment deleted. Plan updated.");
  }
  function openCourse(course: string) {
    setCourseFilter(course);
    setCourseView((view) => view + 1);
    document.getElementById("assignments")?.scrollIntoView();
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to workspace
      </a>
      <aside className="workspace-nav">
        <a className="brand" href="#overview">
          <span className="brand-mark">
            <Layers size={22} aria-hidden="true" />
          </span>
          <span>
            Study Adapt<small>STUDENT WORKSPACE</small>
          </span>
        </a>
        <p className="nav-caption">Workspace</p>
        <nav aria-label="Workspace navigation">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "scheduling-model", label: "Scheduling Model", icon: Sigma },
            {
              id: "assignments",
              label: "Courses & assignments",
              icon: BookOpen,
            },
            { id: "planner", label: "Weekly planner", icon: CalendarDays },
            { id: "research", label: "Research & models", icon: FlaskConical },
          ].map(({ id, label, icon: Icon }) => (
            <a
              href={`#${id}`}
              key={id}
              aria-current={activeSection === id ? "location" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="nav-note">
          <span className="local-dot" aria-hidden="true" /> Local workspace
          <p>Your assignments stay in this browser.</p>
          <span className="prototype-tag">FURI · Research prototype</span>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1}>
        <div className="workspace-topbar">
          <span>
            Workspace <span aria-hidden="true">/</span> Study planning
          </span>
          <span className="storage-label">
            <HardDrive size={14} aria-hidden="true" /> Browser storage
          </span>
        </div>
        <section id="overview" className="page-section">
          <header className="page-header">
            <div>
              <span className="eyebrow">
                {new Date(`${today}T12:00:00`).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <h1>
                Your study overview<span className="heading-period">.</span>
              </h1>
              <p className="muted">
                A little clarity for the work ahead. Plan with time, effort, and
                weekly stress.
              </p>
            </div>
            <a href="#assignment-input" className="button-link">
              <Plus size={16} aria-hidden="true" /> Add an assignment
            </a>
          </header>
          <DashboardOverview
            tasks={state.tasks}
            today={today}
            weeklyStress={weeklyStress}
            remaining={remaining}
            capacity={capacity}
            onEdit={edit}
            onCourse={openCourse}
          />
        </section>
        <SchedulingModel />
        {warning && (
          <p className="notice" role="alert">
            {warning}
          </p>
        )}
        <section id="assignments" className="page-section">
          <ResearchAssignments
            key={courseView}
            courseFilter={courseFilter}
            onCourseFilter={setCourseFilter}
            tasks={state.tasks}
            today={today}
            weeklyStress={weeklyStress}
            onEdit={edit}
            onComplete={(task) => save({ ...task, progress: 100 })}
            onDelete={remove}
          />
          <TaskEditor
            key={draft.id + ":" + editing}
            task={draft}
            editing={editing}
            weeklyStress={weeklyStress}
            onSave={save}
            onCancel={() => setDraft(emptyTask(today))}
          />
          <p className="save-status" role="status">
            {message}
          </p>
        </section>
        <section
          id="planner"
          className="panel page-section"
          aria-labelledby="plan-heading"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">Make room for focused work</span>
              <h2 id="plan-heading">Weekly study planner</h2>
            </div>
            <CalendarDays size={22} aria-hidden="true" />
          </div>
          <p className="muted">
            Next seven days: {today} to {addDays(today, 6)}. Enter the hours
            available for studying, excluding classes and breaks.
          </p>
          <section
            aria-labelledby="weekly-stress-heading"
            className="weekly-stress"
          >
            <h3 id="weekly-stress-heading">Stress this week</h3>
            <p className="muted">Week of {currentWeek} (Monday–Sunday).</p>
            <label>
              How often have you felt academic stress this week?
              <select
                aria-label="Stress this week"
                value={weeklyStress}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setState((s) => ({
                    ...s,
                    weeklyStress: { ...s.weeklyStress, [currentWeek]: value },
                  }));
                  setMessage(
                    "Weekly stress saved. Estimates, priorities, and the plan have been updated.",
                  );
                }}
              >
                {[
                  "Nearly never",
                  "Seldom",
                  "Sometimes",
                  "Frequently",
                  "Nearly always",
                ].map((label, i) => (
                  <option key={label} value={i + 1}>
                    {i + 1} — {label}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted">
              {state.weeklyStress[currentWeek] === undefined
                ? "No response saved for this week; using 3."
                : "Response saved for this week."}{" "}
              This response applies to this seven-day preview. A new week uses
              its own response or defaults to 3.
            </p>
          </section>
          <div className="availability-grid">
            {plan.days.map((day) => {
              const index = new Date(`${day.date}T12:00:00`).getDay();
              return (
                <label key={day.date}>
                  {weekdays[index]}
                  <input
                    aria-label={`${weekdays[index]} available hours`}
                    type="number"
                    min="0"
                    max="12"
                    step="0.25"
                    value={state.availability[index]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (!Number.isFinite(value) || value < 0 || value > 12)
                        return;
                      setState((s) => ({
                        ...s,
                        availability: s.availability.map((h, i) =>
                          i === index ? value : h,
                        ),
                      }));
                      setMessage(
                        "Study availability updated. Plan recalculated.",
                      );
                    }}
                  />
                </label>
              );
            })}
          </div>
          <p className="workload">
            <strong>All remaining work: {remaining}h</strong> / {capacity}h
            available this week.{" "}
            <span className={`badge ${level.toLowerCase()}`}>{level}</span>
          </p>
          <p className="muted">
            This compares all listed work with one week’s capacity, including
            assignments due later. Daily labels describe the time actually
            scheduled.
          </p>
          <ResearchWeek
            plan={plan}
            tasks={state.tasks}
            weeklyStress={weeklyStress}
          />
          {plan.unplaced.length > 0 && (
            <div className="notice">
              <strong>
                Some work does not fit before its deadline or within this week.
              </strong>
              <ul>
                {plan.unplaced.map((item) => (
                  <li key={item.taskId}>
                    {state.tasks.find((t) => t.id === item.taskId)?.name}:{" "}
                    {item.hours}h unallocated
                  </li>
                ))}
              </ul>
              <p>
                Adjust availability or discuss the assignment scope. The plan
                never adds hours beyond your daily limit.
              </p>
            </div>
          )}
          {state.tasks.some((t) => t.progress < 100 && t.dueDate < today) && (
            <p className="notice">
              Overdue assignments are scheduled as recovery work; their
              deadlines have already passed.
            </p>
          )}
          <p className="muted">
            Choose your own session start times and breaks. Availability repeats
            by weekday.
          </p>
        </section>
        <section id="research" className="page-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Behind the estimates</span>
              <h2>Research & methodology</h2>
            </div>
            <span className="prototype-tag">Experimental models</span>
          </div>
          <ModelEvaluation tasks={state.tasks} />
        </section>
        <footer>
          <span>Assignments are saved in this browser.</span>
          <button
            className="plain"
            onClick={() => {
              if (
                window.confirm(
                  "Replace your assignments and availability with example data?",
                )
              ) {
                setState(demoState(today));
                setDraft(emptyTask(today));
                setMessage("Example assignments restored.");
              }
            }}
          >
            Restore examples
          </button>
        </footer>
      </main>
    </div>
  );
}
