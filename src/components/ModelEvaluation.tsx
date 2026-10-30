import { evaluateModels } from "../lib/evaluation";
import { round, Task } from "../lib/scheduler";

export default function ModelEvaluation({ tasks }: { tasks: Task[] }) {
  const results = evaluateModels(tasks);
  const count = results[0].count;
  return (
    <section
      className="panel model-evaluation"
      aria-labelledby="evaluation-heading"
    >
      <h2 id="evaluation-heading">Model comparison</h2>
      <p className="muted">
        Save an unfinished assignment to record its estimates, then enter actual
        total hours when it is complete. Examples and work without a saved
        estimate are excluded.
      </p>
      {count === 0 ? (
        <p>
          No completed assignments with actual hours and saved estimates yet.
        </p>
      ) : (
        <>
          <p>
            {count} completed assignment{count === 1 ? "" : "s"} with entered
            actual hours.
          </p>
          <table>
            <caption className="muted">
              Errors against estimates saved before completion (hours)
            </caption>
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col">MAE</th>
                <th scope="col">Bias</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.model}>
                  <th scope="row">{result.label}</th>
                  <td>{round(result.mae!)}</td>
                  <td>{round(result.bias!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">
            MAE is the average absolute error. Positive bias means
            overestimating; negative bias means underestimating. These entered
            observations do not establish predictive accuracy.
          </p>
        </>
      )}
    </section>
  );
}
