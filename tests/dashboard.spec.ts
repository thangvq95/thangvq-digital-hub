import { test, expect } from '@playwright/test';

test.describe('TechTrend Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tech');
  });

  test('renders dashboard header with search', async ({ page }) => {
    await expect(page.locator('#dashboard-header')).toBeVisible();
    await expect(page.locator('#dashboard-search-input')).toBeVisible();
  });

  test('renders filter bar with period tabs', async ({ page }) => {
    await expect(page.locator('#filter-bar')).toBeVisible();
    await expect(page.locator('#filter-period-daily')).toBeVisible();
  });

  test('renders repo grid container', async ({ page }) => {
    await expect(page.locator('#repo-grid')).toBeVisible();
  });

  test('renders stats bar with sync info', async ({ page }) => {
    await expect(page.locator('#stats-bar')).toBeVisible();
  });
});
