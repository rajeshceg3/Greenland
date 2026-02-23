const { test, expect } = require('@playwright/test');

test('Landing page loads and entering transitions to map', async ({ page }) => {
  await page.goto('/');

  // Check landing screen is visible
  const landing = page.locator('#landing-screen');
  await expect(landing).toBeVisible();

  // Click enter
  await page.click('#enter-btn');

  // Wait for map to be visible
  const map = page.locator('#map');
  await expect(map).toHaveClass(/visible/, { timeout: 10000 }); // It adds .visible class

  // Also check display style of landing
  await expect(landing).not.toBeVisible();
});
