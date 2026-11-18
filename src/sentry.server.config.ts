// Sentry for the Node.js server runtime. Loaded from src/instrumentation.ts.
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
  tracesSampleRate,
  // Forwards browser events sent to the tunnel path on to Sentry.
  integrations: [Sentry.serveTunnelIntegration({ path: SENTRY_TUNNEL_PATH })]
});
