import { test, expect } from "@playwright/test";

test.describe("Portfolio Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section with name and CTA buttons", async ({ page }) => {
    const hero = page.locator("#hero");
    await expect(hero).toBeVisible();
    await expect(hero.getByText("Thang VQ")).toBeVisible();
    await expect(page.locator("#hero-view-projects")).toBeVisible();
    await expect(page.locator("#hero-download-cv")).toBeVisible();
  });

  test("renders about section with heading", async ({ page }) => {
    const about = page.locator("#about");
    await expect(about).toBeVisible();
    await expect(
      about.getByRole("heading", { name: /about me/i }),
    ).toBeVisible();
  });

  test("renders tech stack section with category cards", async ({ page }) => {
    const techStack = page.locator("#tech-stack");
    await expect(techStack).toBeVisible();
    const cards = techStack.locator('[data-testid^="tech-category-"]');
    await expect(cards).toHaveCount(5);
  });

  test("renders experience timeline with 4 entries", async ({ page }) => {
    const experience = page.locator("#experience");
    await expect(experience).toBeVisible();
    const entries = experience.locator('[data-testid^="exp-entry-"]');
    await expect(entries).toHaveCount(4);
  });

  test("renders projects section and handles links", async ({ page }) => {
    const projects = page.locator("#projects");
    await expect(projects).toBeVisible();
    await expect(
      projects.getByRole("heading", { name: /projects/i }),
    ).toBeVisible();

    // Find the card for ThangVQ Digital Hub (index 1)
    const hubCard = page.locator('[data-testid="project-card-1"]');
    await expect(hubCard).toBeVisible();

    // Check if "More →" button exists
    const moreLink = hubCard.locator("a", { hasText: "More →" });
    await expect(moreLink).toBeVisible();

    // Click "More →" and check it redirects to /stack
    await moreLink.click();
    await expect(page).toHaveURL(/\/stack$/);

    // Navigate back and click the card itself to verify modal dialog opens
    await page.goto("/");
    await page.locator('[data-testid="project-card-1"]').click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
  });

  test("renders contact footer with social links", async ({ page }) => {
    const footer = page.locator("#contact-footer");
    await expect(footer).toBeVisible();
    await expect(page.locator("#footer-github-link")).toBeVisible();
    await expect(page.locator("#footer-linkedin-link")).toBeVisible();
  });
});
