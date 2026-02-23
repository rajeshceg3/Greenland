const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('#enter-btn');
    // Wait for map transition
    await expect(page.locator('#map')).toHaveClass(/visible/, { timeout: 10000 });
});

test('Clicking a marker opens the glass panel', async ({ page }) => {
    // Wait for markers to appear
    const marker = page.locator('.custom-marker').first();
    await expect(marker).toBeVisible();

    // Click marker
    await marker.click();

    // Check glass panel
    const glassPanel = page.locator('#glass-panel');
    await expect(glassPanel).toBeVisible();

    // Check content
    const title = page.locator('#location-title');
    await expect(title).not.toBeEmpty();
});

test('Clicking Explore opens detail modal and switches tabs', async ({ page }) => {
    // Open panel
    const marker = page.locator('.custom-marker').first();
    await marker.click();

    // Click explore
    await page.click('#explore-btn');

    // Check modal
    const modal = page.locator('#detail-modal');
    await expect(modal).toBeVisible();

    // Check tabs
    const historyTab = page.locator('button[data-tab="history"]');
    await historyTab.click();

    // Verify tab switch (active class)
    await expect(historyTab).toHaveClass(/active/);
});
