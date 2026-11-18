// Options shared by the browser, server and edge Sentry SDKs.

/** Same-origin path the browser sends events to, so ad-blockers do not drop them.
 * It is excluded from the auth proxy in src/proxy.ts. Keep the two in sync. */
export const SENTRY_TUNNEL_PATH = '/monitoring';

const vercelEnv =
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? undefined;

/** "production" | "preview" | "development": keeps PR Previews out of
 * production issue streams and alerts. */
export const sentryEnvironment =
  vercelEnv ?? process.env.NODE_ENV ?? 'development';

export const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/** Trace everything while developing, sample in deployed environments. */
export const tracesSampleRate = sentryEnvironment === 'development' ? 1 : 0.1;
