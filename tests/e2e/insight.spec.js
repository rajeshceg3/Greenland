const { test, expect } = require('@playwright/test');

test('Toggling insight mode', async ({ page }) => {
    await page.goto('/');
    await page.click('#enter-btn');
    await expect(page.locator('#map')).toHaveClass(/visible/, { timeout: 10000 });

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
