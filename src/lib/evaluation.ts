import { modelHours, Task } from "./scheduler";

// Freeze the first saved, unfinished estimate; never reconstruct predictions from actual hours.
export function recordPrediction(
  task: Task,
  weeklyStress: number,
  recordedOn: string,
  stressReported: boolean,
): Task {
  if (
    task.prediction ||
    task.progress >= 100 ||
    task.actualHours !== undefined ||
    task.isExample
  )
    return task;
  return {
    ...task,
    prediction: {
      recordedOn,
      weeklyStress,
      stressReported,
      difficulty: task.effort,
      progress: task.progress,
      hours: modelHours(task, weeklyStress),
    },
  };
}

export const MODEL_LABELS = {
  instructor: "Instructor baseline",
  centered: "Centered model",
  lookup: "Category lookup",
} as const;

export function evaluateModels(tasks: Task[]) {
  const observations = tasks.filter(
    (task) =>
      !task.isExample &&
      task.progress === 100 &&
      task.actualHours !== undefined &&
      Number.isFinite(task.actualHours) &&
      task.actualHours >= 0 &&
      task.prediction &&
      task.prediction.progress < 100 &&
      Object.values(task.prediction.hours).every(
        (hours) => Number.isFinite(hours) && hours > 0,
      ),
  );
  return (Object.keys(MODEL_LABELS) as (keyof typeof MODEL_LABELS)[]).map(
    (model) => {
      const errors = observations.map(
        (task) => task.prediction!.hours[model] - task.actualHours!,
      );
      return {
        model,
        label: MODEL_LABELS[model],
        count: errors.length,
        mae: errors.length
          ? errors.reduce((sum, error) => sum + Math.abs(error), 0) /
            errors.length
          : null,
        bias: errors.length
          ? errors.reduce((sum, error) => sum + error, 0) / errors.length
          : null,
      };
    },
  );
}
