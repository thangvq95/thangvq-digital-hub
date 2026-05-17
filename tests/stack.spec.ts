import { test, expect } from "@playwright/test";

test.describe("Stack Architecture Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/stack");
  });

  test("renders hero section and stats", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /how this was built/i }),
    ).toBeVisible();
    await expect(page.getByText("4", { exact: true })).toBeVisible(); // 4 Docker containers
    await expect(page.getByText("100%", { exact: true })).toBeVisible(); // 100% Autonomous
  });

  test("renders tech stack grid", async ({ page }) => {
    const stackGrid = page.locator("#stack-grid");
    await expect(stackGrid).toBeVisible();
    await expect(
      stackGrid.getByRole("heading", { name: /complete tech stack/i }),
    ).toBeVisible();
  });

  test("renders main architecture sections", async ({ page }) => {
    await expect(page.locator("#architecture")).toBeVisible();
    await expect(page.locator("#ai-workflows")).toBeVisible();
    await expect(page.locator("#cicd")).toBeVisible();
    await expect(page.locator("#data-pipelines")).toBeVisible();
    await expect(page.locator("#observability")).toBeVisible();
  });

  test("renders github source link", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /view source on github/i }),
    ).toBeVisible();
  });
});
