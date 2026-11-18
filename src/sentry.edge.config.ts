// Sentry for the Edge runtime. Loaded from src/instrumentation.ts.
import * as Sentry from '@sentry/nextjs';
import {
  sentryDsn,
  sentryEnvironment,
  tracesSampleRate
} from '@/lib/sentry-options';

Sentry.init({
  dsn: sentryDsn,
  environment: sentryEnvironment,
  tracesSampleRate
});
