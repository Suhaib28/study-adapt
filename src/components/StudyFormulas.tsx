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
      <p>
        i = assignment; w = week; E<sub>i</sub> = instructor estimated hours; D
        <sub>i</sub> = assignment difficulty (1–5); S<sub>w</sub> = weekly
        stress (1–5); P<sub>i</sub> = completed fraction (0–1).
      </p>
      <p>
        T<sub>i,w</sub> = adjusted total hours; R<sub>i,w</sub> = remaining
        hours; C = adjustment cap; w<sub>D</sub> and w<sub>S</sub> = difficulty
        and stress weights.
      </p>
    </div>
  );
}
