import { expect, test } from '@playwright/test';

// Smoke tests: the app boots and the auth boundary holds. They pass with or
// without Supabase configured, so they run locally, in CI and against a Vercel
// Preview (set PLAYWRIGHT_BASE_URL).

test('home page renders', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'KZ Barry' })
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
      name: 'Log in'
    })
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('protected routes redirect signed-out visitors to login', async ({
  page
}) => {
  await page.goto('/profile');

  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('sign-up page renders its form', async ({ page }) => {
  await page.goto('/sign-up');

  await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
});

test('the Sentry tunnel is not behind the auth redirect', async ({
  request
}) => {
  const response = await request.post('/monitoring', {
    data: '',
    maxRedirects: 0
  });

  // Whatever the tunnel answers for an empty envelope, it must not be the
  // login redirect: signed-out browsers need to be able to report errors.
  expect(response.headers()['location'] ?? '').not.toContain('/login');
});
