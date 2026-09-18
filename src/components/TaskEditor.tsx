import { FormEvent, useState } from "react";
import { plannedHours, remainingHours, Task } from "../lib/scheduler";
import { taskSchema } from "../lib/study-state";
interface Props {
  task: Task;
  editing: boolean;
  onSave: (task: Task) => void;
  onCancel: () => void;
}
export default function TaskEditor({ task, editing, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(task);
  const [error, setError] = useState("");
  const number = (key: keyof Task, value: string) =>
    setDraft((t) => ({ ...t, [key]: value === "" ? NaN : Number(value) }));
  const valid = taskSchema.safeParse(draft).success;
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = taskSchema.safeParse(draft);
    if (!result.success) {
      setError("Enter valid dates, ratings, and numbers in the ranges shown.");
      return;
    }
    onSave(result.data as Task);
  }
  return (
    <section
      className="panel"
      id="assignment-input"
      aria-labelledby="input-heading"
    >
      <h2 id="input-heading">
        {editing ? "Edit assignment" : "1. Enter an assignment"}
      </h2>
      <p className="muted">
        Use the instructor’s expected time as a starting point, then add the
        student’s own ratings.
      </p>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Assignment name
            <input
              required
              maxLength={120}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label>
            Course name
            <input
              required
              maxLength={80}
              value={draft.course}
              onChange={(e) => setDraft({ ...draft, course: e.target.value })}
            />
          </label>
          <label>
            Due date
            <input
              required
              type="date"
              value={draft.dueDate}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
            />
          </label>
          <label>
            Instructor estimated time (hours)
            <input
              required
              type="number"
              min="0.25"
              max="200"
              step="0.25"
              value={
                Number.isNaN(draft.estimatedHours) ? "" : draft.estimatedHours
              }
              onChange={(e) => number("estimatedHours", e.target.value)}
            />
          </label>
          <label>
            Grade weight (%)
            <input
              required
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={Number.isNaN(draft.gradeWeight) ? "" : draft.gradeWeight}
              onChange={(e) => number("gradeWeight", e.target.value)}
            />
            <small>Share of the course grade; use 0 for ungraded work.</small>
          </label>
          <label>
            Student difficulty (mental effort)
            <select
              value={draft.effort}
              onChange={(e) => number("effort", e.target.value)}
            >
              {["Very low", "Low", "Moderate", "High", "Very high"].map(
                (s, i) => (
                  <option key={s} value={i + 1}>
                    {i + 1} — {s}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            Student stress
            <select
              value={draft.stress}
              onChange={(e) => number("stress", e.target.value)}
            >
              {["Very low", "Low", "Moderate", "High", "Very high"].map(
                (s, i) => (
                  <option key={s} value={i + 1}>
                    {i + 1} — {s}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            Current progress (%)
            <input
              required
              type="number"
              min="0"
              max="100"
              step="1"
              value={Number.isNaN(draft.progress) ? "" : draft.progress}
              onChange={(e) => number("progress", e.target.value)}
            />
            <small>0 = not started; 100 = completed.</small>
          </label>
        </div>
        <p className="estimate-preview" aria-live="polite">
          {valid
            ? `Estimate: ${draft.estimatedHours}h instructor → ${plannedHours(draft)}h planned total → ${remainingHours(draft)}h remaining.`
            : "Complete the fields to preview the adjusted time estimate."}
        </p>
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit">
            {editing ? "Save changes" : "Add assignment"}
          </button>
          {editing && (
            <button type="button" className="secondary" onClick={onCancel}>
              Cancel editing
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
