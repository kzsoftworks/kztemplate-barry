import { defineConfig, devices } from '@playwright/test';

// When PLAYWRIGHT_BASE_URL is set (a Vercel Preview URL, for example) the tests run
// against that deployment. Otherwise Playwright starts the app locally.
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const port = Number(process.env.PORT ?? 3000);
const baseURL = externalBaseUrl ?? `http://localhost:${port}`;

// Vercel Deployment Protection: send the automation bypass secret when available.
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    extraHTTPHeaders: bypassSecret
      ? {
          'x-vercel-protection-bypass': bypassSecret,
          'x-vercel-set-bypass-cookie': 'true'
        }
      : undefined
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `npm run dev -- --port ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
      }
});
