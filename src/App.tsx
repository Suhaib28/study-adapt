import { useEffect, useMemo, useState } from "react";
import TaskEditor from "./components/TaskEditor";
import ResearchAssignments from "./components/ResearchAssignments";
import ResearchWeek from "./components/ResearchWeek";
import {
  addDays,
  buildPlan,
  localDate,
  remainingHours,
  round,
  Task,
  workloadLabel,
} from "./lib/scheduler";
import { demoState, readState, STORAGE_KEY } from "./lib/study-state";
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
    stress: 3,
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
  const plan = useMemo(
    () => buildPlan(state.tasks, state.availability, today),
    [state, today],
  );
  const remaining = round(
    state.tasks.reduce((sum, t) => sum + remainingHours(t), 0),
  );
  const capacity = round(state.availability.reduce((sum, h) => sum + h, 0));
  const level = workloadLabel(remaining, capacity);
  function save(task: Task) {
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
  return (
    <main>
      <header>
        <h1>Study Adapt</h1>
        <p>FURI · First-phase research prototype</p>
        <p className="muted">
          Estimate assignment study time using instructor experience and student
          workload ratings.
        </p>
      </header>
      {warning && (
        <p className="notice" role="alert">
          {warning}
        </p>
      )}
      <TaskEditor
        key={draft.id + ":" + editing}
        task={draft}
        editing={editing}
        onSave={save}
        onCancel={() => setDraft(emptyTask(today))}
      />
      <p className="save-status" role="status">
        {message}
      </p>
      <ResearchAssignments
        tasks={state.tasks}
        today={today}
        onEdit={edit}
        onComplete={(task) => save({ ...task, progress: 100 })}
        onDelete={remove}
      />
      <section className="panel" aria-labelledby="plan-heading">
        <h2 id="plan-heading">3. Weekly study plan</h2>
        <p className="muted">
          Next seven days: {today} to {addDays(today, 6)}. Enter the hours
          available for studying, excluding classes and breaks.
        </p>
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
        <ResearchWeek plan={plan} tasks={state.tasks} />
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
            Overdue assignments are scheduled as recovery work; their deadlines
            have already passed.
          </p>
        )}
        <p className="muted">
          Choose your own session start times and breaks. Availability repeats
          by weekday.
        </p>
      </section>
      <aside
        className="panel explanation"
        aria-labelledby="explanation-heading"
      >
        <h2 id="explanation-heading">Why the plan looks this way</h2>
        <p>
          <strong>Estimated time:</strong> start with the instructor’s hours.
          Difficulty ratings of 4 or 5 add 10% or 20%; stress ratings of 4 or 5
          add 5% or 10%. Progress reduces the remaining time.
        </p>
        <p>
          Example: 4 instructor hours with difficulty 5 and stress 5 becomes
          5.2 planned hours, or 2.6 hours remaining at 50% progress.
        </p>
        <p>
          <strong>Priority:</strong> nearer deadlines, greater grade weight,
          more remaining work, higher difficulty or stress, and lower progress
          raise an assignment’s priority. The list shows the resulting order.
        </p>
        <p>
          <strong>Weekly plan:</strong> higher-priority assignments get space
          first. Work is spread across available days before its deadline.
          High difficulty or stress uses sessions up to 30 minutes; other
          sessions are up to 60 minutes.
        </p>
        <p>
          <strong>Workload:</strong> light uses up to half the available time;
          moderate uses up to 85%; heavy uses the rest. Overloaded means there
          is more work than available time. Work that cannot fit is listed
          separately. Full formulas and assumptions are in the project README.
        </p>
        <p className="muted">
          Inspired by{" "}
          <a
            href="https://doi.org/10.18608/jla.2025.8473"
            target="_blank"
            rel="noreferrer"
          >
            Borchers & Pardos (2025)
          </a>
          . Their paper studies course workload information and course
          selection. This prototype applies those workload dimensions to
          assignment scheduling. These weights are simple design assumptions,
          not validated predictions.
        </p>
      </aside>
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
  );
}
