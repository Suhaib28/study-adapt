import { FormEvent, useState } from "react";
import {
  plannedHours,
  remainingHours,
  round,
  lookupHours,
  Task,
} from "../lib/scheduler";
import { taskSchema } from "../lib/study-state";
interface Props {
  task: Task;
  editing: boolean;
  weeklyStress: number;
  onSave: (task: Task) => void;
  onCancel: () => void;
}
export default function TaskEditor({
  task,
  editing,
  weeklyStress,
  onSave,
  onCancel,
}: Props) {
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
      <span className="eyebrow">
        {editing ? "Make an adjustment" : "Start with an estimate"}
      </span>
      <h2 id="input-heading">
        {editing ? "Edit assignment" : "New assignment"}
      </h2>
      <p className="muted">
        Use the instructor’s expected time as a starting point, then add the
        assignment’s difficulty. Weekly stress is set below.
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
            Assignment difficulty (mental effort)
            <select
              value={draft.effort}
              onChange={(e) => number("effort", e.target.value)}
            >
              {["Very low", "Low", "Normal", "High", "Very high"].map(
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
          {draft.progress === 100 && (
            <label>
              Actual total hours spent (optional)
              <input
                type="number"
                min="0"
                step="any"
                value={draft.actualHours ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    actualHours:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
              />
              <small>
                All time spent on this assignment, separate from progress.
              </small>
            </label>
          )}
        </div>
        <p className="estimate-preview" aria-live="polite">
          {valid
            ? `Estimate: ${draft.estimatedHours}h instructor → ${round(plannedHours(draft, weeklyStress))}h planned total → ${round(remainingHours(draft, weeklyStress))}h remaining.`
            : "Complete the fields to preview the adjusted time estimate."}
        </p>
        {valid && (
          <p className="muted">
            Comparison totals: instructor {draft.estimatedHours}h · category
            lookup {round(lookupHours(draft, weeklyStress))}h. The weekly plan
            uses the centered estimate above.
          </p>
        )}
        <p className="muted">
          Saving unfinished work records its first estimate for later
          comparison. Add actual total hours after setting progress to 100%.
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
