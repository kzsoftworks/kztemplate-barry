/**
 * Public base URL of the current deployment, without a trailing slash.
 *
 * Order: explicit NEXT_PUBLIC_SITE_URL, then the Vercel deployment URLs (so each
 * PR Preview builds auth links that point back to itself), then localhost.
 * Pass `env` in tests.
 */
export function getSiteUrl(
  env: Record<string, string | undefined> = process.env
): string {
  const isPreview = env.VERCEL_ENV === 'preview';
  const candidate =
    // On Preview the explicit value usually holds the production URL: skip it.
    (!isPreview && env.NEXT_PUBLIC_SITE_URL) ||
    (isPreview && (env.VERCEL_BRANCH_URL || env.VERCEL_URL)) ||
    env.NEXT_PUBLIC_SITE_URL ||
    env.VERCEL_PROJECT_PRODUCTION_URL ||
    env.VERCEL_URL ||
    'http://localhost:3000';

  const withProtocol = /^https?:\/\//.test(candidate)
    ? candidate
    : `https://${candidate}`;
  return withProtocol.replace(/\/+$/, '');
}
