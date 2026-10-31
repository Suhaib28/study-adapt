import { test, expect } from "@playwright/test";
test("instructor estimate, ratings, progress and saved assignments work together", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByLabel("Assignment name", { exact: true })
    .fill("Research assignment");
  await page.getByLabel("Course name", { exact: true }).fill("FURI");
  await page.getByLabel("Instructor estimated time (hours)").fill("4");
  await page
    .getByLabel("Assignment difficulty (mental effort)")
    .selectOption("5");
  await page
    .getByRole("combobox", { name: "Stress this week" })
    .selectOption("5");
  await expect(page.locator(".estimate-preview")).toContainText(
    "4h instructor → 5.2h planned total → 5.2h remaining",
  );
  await page
    .getByRole("button", { name: "Add assignment", exact: true })
    .click();
  const assignment = page.getByRole("article", {
    name: "Research assignment",
    exact: true,
  });
  await expect(assignment).toContainText("High mental effort");
  await expect(assignment).toContainText("Frequent stress this week");
  await assignment.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Current progress (%)").fill("50");
  await expect(page.locator(".estimate-preview")).toContainText(
    "2.6h remaining",
  );
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(assignment).toContainText("2.6h");
  await page.reload();
  await expect(assignment).toContainText("2.6h");
  await assignment.getByRole("button", { name: "Mark complete" }).click();
  await expect(assignment).toContainText("Completed");
  await expect(assignment).toContainText("100%");
  await expect(
    page.locator(".session").filter({ hasText: "Research assignment" }),
  ).toHaveCount(0);
  page.once("dialog", (d) => d.accept());
  await assignment.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(assignment).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("capacity limits, workload labels and responsive layout", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("prototype.png"),
    fullPage: true,
  });
  for (const day of [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ])
    await page.getByLabel(`${day} available hours`).fill("0");
  await expect(page.locator(".workload")).toContainText("Overloaded");
  await expect(
    page.getByText(
      "Some work does not fit before its deadline or within this week.",
    ),
  ).toBeVisible();
  await expect(page.locator(".session")).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("Monday available hours")).toHaveValue("0");
});

test("legacy assignments survive weekly stress changes and Monday rollover", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-18T12:00:00") });
  await page.goto("/");
  const legacyTask = {
    id: "legacy",
    name: "Legacy assignment",
    course: "FURI",
    dueDate: "2026-10-25",
    estimatedHours: 4,
    gradeWeight: 20,
    effort: 5,
    stress: 1,
    progress: 0,
    note: "preserve",
  };
  await page.evaluate(
    (task) =>
      localStorage.setItem(
        "study-adapt-research-v1",
        JSON.stringify({
          tasks: [task],
          availability: Array(7).fill(2),
        }),
      ),
    legacyTask,
  );
  await page.reload();
  const assignment = page.getByRole("article", {
    name: "Legacy assignment",
    exact: true,
  });
  await expect(assignment).toContainText("4.72h");
  await expect(
    page.getByRole("combobox", { name: "Stress this week" }),
  ).toHaveValue("3");
  await page
    .getByRole("combobox", { name: "Stress this week" })
    .selectOption("5");
  await expect(assignment).toContainText("5.2h");
  await expect(page.locator(".workload")).toContainText("5.2h");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Stress this week" }),
  ).toHaveValue("5");
  await page.clock.setSystemTime(new Date("2026-10-19T12:00:00"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByRole("combobox", { name: "Stress this week" }),
  ).toHaveValue("3");
  await expect(assignment).toContainText("4.72h");
  await page
    .getByRole("combobox", { name: "Stress this week" })
    .selectOption("1");
  await expect(assignment).toContainText("4.24h");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("study-adapt-research-v1")!),
  );
  expect(saved.tasks).toEqual([legacyTask]);
  expect(saved.weeklyStress).toEqual({ "2026-10-12": 5, "2026-10-19": 1 });
});

test("synthetic evaluation fixture: actual hours use frozen estimates across reloads", async ({
  page,
}) => {
  await page.goto("/");
  const comparison = page.getByRole("region", { name: "Model comparison" });
  await expect(comparison).toContainText("No completed assignments");
  await page
    .getByRole("combobox", { name: "Stress this week" })
    .selectOption("4");
  await page
    .getByLabel("Assignment name", { exact: true })
    .fill("Synthetic evaluation fixture");
  await page.getByLabel("Course name", { exact: true }).fill("Test only");
  await page
    .getByLabel("Assignment difficulty (mental effort)")
    .selectOption("4");
  await page
    .getByRole("button", { name: "Add assignment", exact: true })
    .click();
  const assignment = page.getByRole("article", {
    name: "Synthetic evaluation fixture",
    exact: true,
  });
  await expect(assignment).toContainText("4.44h");
  await assignment.getByRole("button", { name: "Mark complete" }).click();
  await expect(comparison).toContainText("No completed assignments");
  await assignment.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Actual total hours spent (optional)").fill("5");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(assignment).toContainText("Actual total hours: 5h");
  const centered = comparison.getByRole("row", { name: "Centered model" });
  await expect(centered).toContainText("0.4");
  await expect(centered).toContainText("-0.4");
  const lookup = comparison.getByRole("row", { name: "Category lookup" });
  await expect(lookup).toContainText("-0.56");
  await page
    .getByRole("combobox", { name: "Stress this week" })
    .selectOption("1");
  await page.reload();
  await expect(centered).toContainText("-0.4");
  await expect(assignment).toContainText("Actual total hours: 5h");
  const before = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("study-adapt-research-v1")!).tasks.find(
        (t: { name: string }) => t.name === "Synthetic evaluation fixture",
      ).prediction,
  );
  expect(before.weeklyStress).toBe(4);
  await assignment.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Actual total hours spent (optional)").fill("");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(comparison).toContainText("No completed assignments");
  await assignment.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Actual total hours spent (optional)").fill("0");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    comparison.getByRole("row", { name: "Instructor baseline" }),
  ).toContainText("4");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("LaTeX equations render with readable fractions and fit narrow screens", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const formulas = page.locator(".study-formulas");
  await expect(formulas.locator(".study-equation .katex")).toHaveCount(2);
  await expect(formulas.locator(".study-equation math mfrac")).toHaveCount(2);
  await expect(formulas.locator(".katex-error")).toHaveCount(0);
  await expect(formulas.locator(".formula-coefficients")).toContainText("0.30");
  await expect(formulas.locator(".formula-coefficients")).toContainText("0.60");
  await expect(formulas.locator(".formula-coefficients")).toContainText("0.40");
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 393, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const fits = await formulas
      .locator(".study-equation .katex-html .base")
      .evaluateAll((elements) =>
        elements.every((element) => {
          const equation = element.closest(".study-equation")!;
          const bounds = element.getBoundingClientRect();
          const container = equation.getBoundingClientRect();
          return (
            bounds.left >= container.left - 1 &&
            bounds.right <= container.right + 1
          );
        }),
      );
    expect(fits, `equations fit at ${width}px`).toBe(true);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    if (width === 320 || width === 1280) {
      await formulas.screenshot({
        path: testInfo.outputPath(`formulas-${width}.png`),
      });
    }
  }
});
