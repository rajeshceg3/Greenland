const { test, expect } = require('./fixtures');

test.beforeEach(async ({ page }) => {
    // Contract testing never downloads map areas from the community tile server.
    await page.route('https://tile.openstreetmap.org/**', route => route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#dde9ef"/></svg>'}));
    await page.goto('/');
    await page.click('#enter-btn');
    // Wait for map transition
    await expect(page.locator('#map')).toHaveClass(/visible/, { timeout: 10000 });
    await expect(page.locator('#landing-screen')).toBeHidden();
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
