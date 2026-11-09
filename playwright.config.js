const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    ...(process.env.CHROME_PATH ? {launchOptions:{executablePath:process.env.CHROME_PATH}} : {}),
    baseURL: 'http://localhost:4197',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx http-server -p 4197',
    port: 4197,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
