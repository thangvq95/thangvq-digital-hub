import { test, expect } from "@playwright/test";

test.describe("Learning Hub", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the learnings API listing
    await page.route("**/api/learnings*", async (route) => {
      await route.fulfill({ json: { data: [], meta: { total: 0, page: 1, limit: 20, tab: "to_learn" } } });
    });

    // Mock subtopics endpoint
    await page.route("**/api/learnings/subtopics*", async (route) => {
      await route.fulfill({ json: [] });
    });

    await page.goto("/learning");
  });

  test("renders learning hub header with tabs", async ({ page }) => {
    await expect(page.locator("#learning-header")).toBeVisible();
    await expect(page.locator("#tab-to-learn")).toBeVisible();
    await expect(page.locator("#tab-learned")).toBeVisible();
    await expect(page.locator("#tab-favorites")).toBeVisible();
  });

  test("renders learning grid container", async ({ page }) => {
    await expect(page.locator("#learning-grid")).toBeVisible();
  });

  test("can open add learning dialog", async ({ page }) => {
    const addButton = page.getByRole("button", { name: "+ Add Learning" });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Verify modal overlay opens
    const heading = page.locator("h2:has-text('Add New Learning')");
    await expect(heading).toBeVisible();
  });
});
