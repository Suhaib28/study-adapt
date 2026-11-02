import { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import StudyFormulas from "./StudyFormulas";
import {
  DEFAULT_WORKLOAD_CONFIG,
  localDate,
  plannedHours,
  remainingHours,
  round,
  Task,
} from "../lib/scheduler";

export default function SchedulingModel() {
  const [hours, setHours] = useState("4");
  const [difficulty, setDifficulty] = useState(3);
  const [stress, setStress] = useState(3);
  const estimatedHours = Number(hours);
  const validHours =
    hours.trim() !== "" &&
    Number.isFinite(estimatedHours) &&
    estimatedHours >= 0.25 &&
    estimatedHours <= 200;
  // This example stays in component state and never enters the saved assignment list.
  const example: Task = {
    id: "model-example",
    name: "Interactive example",
    course: "Example only",
    dueDate: localDate(),
    estimatedHours,
    effort: difficulty,
    gradeWeight: 0,
    progress: 50,
    isExample: true,
  };
  const planned = validHours
    ? plannedHours(example, stress, DEFAULT_WORKLOAD_CONFIG)
    : null;
  const remaining = validHours
    ? remainingHours(example, stress, DEFAULT_WORKLOAD_CONFIG)
    : null;

  return (
    <section
      id="scheduling-model"
      className="panel page-section scheduling-model"
      aria-labelledby="scheduling-model-heading"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">The proposed research model</span>
          <h2 id="scheduling-model-heading">Scheduling Model</h2>
        </div>
        <span className="prototype-tag">Provisional coefficients</span>
      </div>
      <p className="model-introduction">
        Instructor estimates are the starting point. Assignment difficulty and
        weekly stress adjust planned time in either direction. This is a
        proposed research model, not a validated prediction model.
      </p>
      <div className="model-layout">
        <div className="model-equations">
          <StudyFormulas />
          <p className="muted">
            These coefficients and the equal-step treatment of ratings are
            provisional and require empirical validation.
          </p>
        </div>
        <div
          className="model-example"
          role="group"
          aria-labelledby="model-example-heading"
        >
          <span className="eyebrow">Explore the estimate</span>
          <h3 id="model-example-heading">Try a small example</h3>
          <p className="muted">
            Example only. Your assignments and weekly stress stay unchanged.
          </p>
          <div className="example-inputs">
            <label>
              Instructor hours
              <input
                aria-label="Example instructor hours"
                type="number"
                min="0.25"
                max="200"
                step="0.25"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                aria-invalid={!validHours}
                aria-describedby={
                  !validHours ? "example-hours-error" : undefined
                }
              />
            </label>
            <label>
              Difficulty
              <select
                aria-label="Example difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
              >
                {["Very low", "Low", "Normal", "High", "Very high"].map(
                  (label, index) => (
                    <option key={label} value={index + 1}>
                      {index + 1} — {label}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label>
              Weekly stress
              <select
                aria-label="Example weekly stress"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
              >
                {[
                  "Nearly never",
                  "Seldom",
                  "Sometimes",
                  "Frequently",
                  "Nearly always",
                ].map((label, index) => (
                  <option key={label} value={index + 1}>
                    {index + 1} — {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!validHours && (
            <p id="example-hours-error" className="example-error">
              Enter instructor hours from 0.25 to 200.
            </p>
          )}
          <div
            className="example-results"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div>
              <span>Adjusted total</span>
              <strong>
                {planned === null ? "—" : round(planned)}
                <small> hours</small>
              </strong>
            </div>
            <div>
              <span>Remaining at 50% progress</span>
              <strong>
                {remaining === null ? "—" : round(remaining)}
                <small> hours</small>
              </strong>
            </div>
          </div>
          <p className="muted">
            Progress is fixed at 50% in this example to illustrate remaining
            time.
          </p>
        </div>
      </div>
      <div className="model-connection">
        <h3>From an estimate to a weekly plan</h3>
        <p>
          Remaining adjusted work contributes to priority alongside deadline
          urgency, grade weight, and progress left. Difficulty and stress
          receive no extra priority bonus. The planner places higher-priority
          work into available study hours.
        </p>
        <div className="model-links">
          <a
            className="text-link"
            href="https://github.com/Suhaib28/study-adapt/blob/main/docs/research-notes.md"
          >
            <BookOpen size={14} aria-hidden="true" /> Research notes
          </a>
          <a className="text-link" href="#research">
            Compare the models <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
