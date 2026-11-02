import katex from "katex";
import "katex/dist/katex.min.css";
import { DEFAULT_WORKLOAD_CONFIG } from "../lib/scheduler";

const coefficientFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 20,
});
const { adjustmentCap, difficultyWeight, stressWeight } =
  DEFAULT_WORKLOAD_CONFIG;
const equations = [
  {
    label: "Adjusted study time",
    latex: String.raw`T_{i,w} = E_i \left[1 + C\left(w_D\frac{D_i-3}{2} + w_S\frac{S_w-3}{2}\right)\right]`,
  },
  {
    label: "Remaining study time",
    latex: String.raw`R_{i,w} = T_{i,w}(1-P_i)`,
  },
].map((equation) => ({
  ...equation,
  html: katex.renderToString(equation.latex, {
    displayMode: true,
    trust: false,
  }),
}));
const coefficients = katex.renderToString(
  String.raw`C = ${coefficientFormat.format(adjustmentCap)},\quad w_D = ${coefficientFormat.format(difficultyWeight)},\quad w_S = ${coefficientFormat.format(stressWeight)}`,
  { trust: false },
);

export default function StudyFormulas() {
  return (
    <div className="study-formulas">
      {equations.map((equation) => (
        <div key={equation.label}>
          <p>
            <strong>{equation.label}:</strong>
          </p>
          <div
            className="study-equation"
            dangerouslySetInnerHTML={{ __html: equation.html }}
          />
        </div>
      ))}
      <p
        className="formula-coefficients"
        dangerouslySetInnerHTML={{ __html: coefficients }}
      />
      <dl className="model-variables">
        <div>
          <dt>
            E<sub>i</sub>
          </dt>
          <dd>Instructor estimated hours</dd>
        </div>
        <div>
          <dt>
            D<sub>i</sub>
          </dt>
          <dd>Assignment difficulty, 1–5</dd>
        </div>
        <div>
          <dt>
            S<sub>w</sub>
          </dt>
          <dd>Weekly stress, 1–5</dd>
        </div>
        <div>
          <dt>
            P<sub>i</sub>
          </dt>
          <dd>Completed fraction, 0–1</dd>
        </div>
        <div>
          <dt>
            T<sub>i,w</sub> / R<sub>i,w</sub>
          </dt>
          <dd>Adjusted total / remaining hours</dd>
        </div>
        <div>
          <dt>C</dt>
          <dd>Adjustment cap</dd>
        </div>
        <div>
          <dt>
            w<sub>D</sub> / w<sub>S</sub>
          </dt>
          <dd>Difficulty / stress weights</dd>
        </div>
        <div>
          <dt>i / w</dt>
          <dd>Assignment / week</dd>
        </div>
      </dl>
    </div>
  );
}
