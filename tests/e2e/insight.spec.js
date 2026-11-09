const { test, expect } = require('./fixtures');

test('Toggling insight mode', async ({ page }) => {
    // Contract testing never downloads map areas from the community tile server.
    await page.route('https://tile.openstreetmap.org/**', route => route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#dde9ef"/></svg>'}));
    await page.goto('/');
    await page.click('#enter-btn');
    await expect(page.locator('#map')).toHaveClass(/visible/, { timeout: 10000 });
    await expect(page.locator('#landing-screen')).toBeHidden();

    const toggle = page.locator('#insight-toggle');
    await expect(toggle).toBeVisible();

    // Click toggle
    await toggle.click();

    // Verify active state
    await expect(toggle).toHaveText(/Active/);

    // Click again
    await toggle.click();
    await expect(toggle).toHaveText(/Insight/);
});
