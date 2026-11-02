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

test("dashboard course filters preserve the global plan and saved records", async ({
  page,
}) => {
  await page.goto("/");
  const list = page.getByRole("region", { name: "Assignments", exact: true });
  const before = await page.evaluate(() =>
    localStorage.getItem("study-adapt-research-v1"),
  );
  const sessions = await page.locator(".session").allTextContents();
  const project = page.getByRole("article", {
    name: "Graph algorithms project",
    exact: true,
  });
  const rank = await project.locator(".rank").textContent();
  await page
    .getByRole("button", { name: "View Algorithms assignments", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Filter by course" }),
  ).toHaveValue("Algorithms");
  await expect(list.locator(".assignment")).toHaveCount(1);
  await expect(project.locator(".rank")).toHaveText(rank!);
  await page
    .getByRole("button", { name: "Completed assignments", exact: true })
    .click();
  await expect(list).toContainText("No assignments match these filters.");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(list.locator(".assignment")).toHaveCount(3);
  await page
    .getByRole("searchbox", { name: "Search assignments" })
    .fill("process");
  await expect(list.locator(".assignment")).toHaveCount(1);
  await expect(list).toContainText("Process scheduling lab");
  await page
    .getByRole("button", { name: "View Algorithms assignments", exact: true })
    .click();
  await expect(
    page.getByRole("searchbox", { name: "Search assignments" }),
  ).toHaveValue("");
  await expect(list.locator(".assignment")).toHaveCount(1);
  await expect(project).toBeVisible();
  expect(await page.locator(".session").allTextContents()).toEqual(sessions);
  expect(
    await page.evaluate(() => localStorage.getItem("study-adapt-research-v1")),
  ).toBe(before);
});

test("navigation, deadline editing and reduced-motion layouts stay accessible", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to workspace" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page
    .getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "Weekly planner" })
    .click();
  await expect(page).toHaveURL(/#planner$/);
  await expect(
    page.getByRole("heading", { name: "Weekly study planner" }),
  ).toBeInViewport();
  await page.locator(".deadline-link").first().click();
  await expect(
    page.getByRole("heading", { name: "Edit assignment", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Assignment name", { exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Cancel editing" }).click();
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page
      .getByRole("navigation", { name: "Workspace navigation" })
      .getByRole("link", { name: "Overview", exact: true })
      .click();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe("auto");
    await page.screenshot({
      path: testInfo.outputPath(`dashboard-${width}.png`),
    });
  }
});

test("empty workspace has honest zero summaries and usable assignment entry", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "study-adapt-research-v1",
      JSON.stringify({
        tasks: [],
        availability: [0, 0, 0, 0, 0, 0, 0],
        weeklyStress: {},
      }),
    ),
  );
  await page.reload();
  await expect(page.locator(".summary-grid")).toContainText(
    "No available study hours set",
  );
  await expect(
    page.getByRole("region", { name: "Courses", exact: true }),
  ).toContainText("Add an assignment");
  await expect(
    page.getByRole("region", { name: "Assignments", exact: true }),
  ).toContainText("No assignments yet");
  await page
    .getByRole("link", { name: "Add an assignment", exact: true })
    .click();
  await expect(
    page.getByLabel("Assignment name", { exact: true }),
  ).toBeInViewport();
});

test("scheduling model example updates estimates without changing saved work", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const saved = await page.evaluate(() =>
    localStorage.getItem("study-adapt-research-v1"),
  );
  const sessions = await page.locator(".session").allTextContents();
  const comparison = await page
    .getByRole("region", { name: "Model comparison", exact: true })
    .textContent();
  await page
    .getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "Scheduling Model", exact: true })
    .click();
  const model = page.getByRole("region", {
    name: "Scheduling Model",
    exact: true,
  });
  await expect(page).toHaveURL(/#scheduling-model$/);
  await expect(
    model.getByRole("heading", { name: "Scheduling Model", exact: true }),
  ).toBeInViewport();
  await expect(model).toContainText("not a validated prediction model");
  await expect(model).toContainText("Provisional coefficients");
  const results = model.locator(".example-results > div");
  await expect(results.nth(0)).toContainText("4 hours");
  await expect(results.nth(1)).toContainText("2 hours");
  await model
    .getByRole("combobox", { name: "Example difficulty" })
    .selectOption("5");
  await model
    .getByRole("combobox", { name: "Example weekly stress" })
    .selectOption("5");
  await expect(results.nth(0)).toContainText("5.2 hours");
  await expect(results.nth(1)).toContainText("2.6 hours");
  await model
    .getByRole("combobox", { name: "Example difficulty" })
    .selectOption("1");
  await model
    .getByRole("combobox", { name: "Example weekly stress" })
    .selectOption("1");
  await expect(results.nth(0)).toContainText("2.8 hours");
  await model
    .getByRole("spinbutton", { name: "Example instructor hours" })
    .fill("8");
  await expect(results.nth(0)).toContainText("5.6 hours");
  await expect(results.nth(1)).toContainText("2.8 hours");
  for (const invalid of ["", "-1", "201"]) {
    await model
      .getByRole("spinbutton", { name: "Example instructor hours" })
      .fill(invalid);
    await expect(
      model.getByRole("spinbutton", { name: "Example instructor hours" }),
    ).toHaveAttribute("aria-invalid", "true");
    await expect(results.nth(0)).toContainText("—");
    await expect(model).toContainText(
      "Enter instructor hours from 0.25 to 200.",
    );
  }
  await model
    .getByRole("spinbutton", { name: "Example instructor hours" })
    .fill("4");
  expect(
    await page.evaluate(() => localStorage.getItem("study-adapt-research-v1")),
  ).toBe(saved);
  expect(await page.locator(".session").allTextContents()).toEqual(sessions);
  expect(
    await page
      .getByRole("region", { name: "Model comparison", exact: true })
      .textContent(),
  ).toBe(comparison);
  await expect(
    model.getByRole("link", { name: "Research notes" }),
  ).toHaveAttribute("href", /docs\/research-notes\.md$/);
  await page.evaluate(() => document.fonts.ready);
  await model.screenshot({ path: testInfo.outputPath("scheduling-model.png") });
  await model.getByRole("link", { name: "Compare the models" }).click();
  await expect(page).toHaveURL(/#research$/);
});
