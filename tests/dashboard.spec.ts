import { test, expect } from "@playwright/test";

test.describe("TechTrend Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/repos*", async (route) => {
      await route.fulfill({ json: { data: [], meta: { total: 0 } } });
    });
    await page.goto("/tech");
  });

  test("renders dashboard header with tabs", async ({ page }) => {
    await expect(page.locator("#dashboard-header")).toBeVisible();
    await expect(page.locator("#tab-all")).toBeVisible();
    await expect(page.locator("#tab-favorites")).toBeVisible();
    await expect(page.locator("#tab-archived")).toBeVisible();
  });

  test("renders repo grid container", async ({ page }) => {
    await expect(page.locator("#repo-grid")).toBeVisible();
  });

  test("can open add repo form", async ({ page }) => {
    const addButton = page.getByText("+ Add");
    await expect(addButton).toBeVisible();
    await addButton.click();

    const input = page.getByPlaceholder("facebook/react or GitHub URL");
    await expect(input).toBeVisible();
  });
});
