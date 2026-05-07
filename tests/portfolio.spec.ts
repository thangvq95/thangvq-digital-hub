import { test, expect } from '@playwright/test';

test.describe('Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with name and CTA buttons', async ({ page }) => {
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    await expect(hero.getByText('Thang VQ')).toBeVisible();
    await expect(page.locator('#hero-view-projects')).toBeVisible();
    await expect(page.locator('#hero-download-cv')).toBeVisible();
  });
});
