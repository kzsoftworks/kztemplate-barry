// Runs in the browser before the app becomes interactive.
import * as Sentry from '@sentry/nextjs';
import {
  SENTRY_TUNNEL_PATH,
  sentryDsn,
  sentryEnvironment,
  tracesSampleRate
} from '@/lib/sentry-options';

Sentry.init({
  dsn: sentryDsn,
  environment: sentryEnvironment,
  tunnel: { path: SENTRY_TUNNEL_PATH },
  tracesSampleRate,
  integrations: [Sentry.replayIntegration()],
  // Record a replay only for sessions that hit an error.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
