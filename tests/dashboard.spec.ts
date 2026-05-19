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

  test("sanitizes malformed stars_growth strings containing SVG tags", async ({
    page,
  }) => {
    await page.route("**/api/repos*", async (route) => {
      await route.fulfill({
        json: {
          data: [
            {
              full_name: "test-owner/test-repo",
              description: "Test description",
              html_url: "https://github.com/test-owner/test-repo",
              language: "TypeScript",
              avatar_url: null,
              stars_total: 123,
              stars_growth: '<path d="M12 2..." /> </svg> 45 stars today',
              forks_total: 12,
              trending_rank: 1,
              is_favorite: false,
              is_archived: false,
              is_read: true,
              latest_release_tag: null,
              latest_release_body: null,
              has_new_release: false,
              ai_summary: null,
              tags: [],
              analyze_status: "idle",
              first_seen_at: new Date().toISOString(),
              last_scraped_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          meta: { total: 1, page: 1, limit: 20, tab: "all" },
        },
      });
    });

    await page.goto("/tech");

    const card = page.locator("#repo-card-test-owner-test-repo");
    await expect(card).toBeVisible();
    await expect(card).toContainText("45 stars today");
    await expect(card).not.toContainText("/svg>");
  });
});
