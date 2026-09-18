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
  await page.getByLabel("Student difficulty (mental effort)").selectOption("5");
  await page.getByLabel("Student stress").selectOption("5");
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
  await expect(assignment).toContainText("High stress/load");
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
