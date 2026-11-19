// check-signup: sign a new user up in a running app and check where they land.
//
//   node scripts/check-signup.mjs [base-url]        (default http://localhost:3000)
//
// Passes when the new user lands on /profile and the page shows the `member`
// role. Used by /setup against the local app and against a Preview deployment.
//
// For a Vercel Preview behind deployment protection, put the bypass secret in
// the VERCEL_AUTOMATION_BYPASS_SECRET environment variable.
// CHECK_EMAIL and CHECK_PASSWORD choose the credentials; by default they are
// random. Only the email is printed.

import { randomBytes } from 'node:crypto';
import { chromium } from '@playwright/test';

const baseURL = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const email =
  process.env.CHECK_EMAIL ??
  `setup-check-${randomBytes(4).toString('hex')}@example.com`;
const password = process.env.CHECK_PASSWORD ?? randomBytes(12).toString('hex');
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

const browser = await chromium.launch();
let failure = null;

try {
  const context = await browser.newContext({
    baseURL,
    extraHTTPHeaders: bypass
      ? {
          'x-vercel-protection-bypass': bypass,
          'x-vercel-set-bypass-cookie': 'true'
        }
      : {}
  });
  const page = await context.newPage();

  await page.goto('/sign-up');
  await page.locator('input[name="name"]').fill('Setup Check');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL('**/profile', { timeout: 30_000 }).catch(() => {});
  const path = new URL(page.url()).pathname;

  if (path !== '/profile') {
    const alert = await page
      .locator('[role="alert"]')
      .first()
      .textContent({ timeout: 1000 })
      .catch(() => null);
    failure = `ended on ${path}, not /profile${alert ? ` ("${alert.trim()}")` : ''}`;
  } else {
    const roles = await page
      .locator('dt:has-text("Roles") + dd')
      .first()
      .textContent({ timeout: 10_000 })
      .catch(() => null);
    if (!roles?.includes('member'))
      failure = `roles on /profile: "${roles ?? 'not found'}"`;
  }
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
} finally {
  await browser.close();
}

if (failure) {
  console.error(`check-signup: FAILED for ${email} on ${baseURL}: ${failure}`);
  process.exit(1);
}
console.log(
  `check-signup: OK ${email} landed on /profile with role member (${baseURL})`
);
