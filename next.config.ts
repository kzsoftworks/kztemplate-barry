import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

const nextConfig: NextConfig = {
  typedRoutes: true
};

export default withSentryConfig(nextConfig, {
  // Read from the environment so each app built from this template points at
  // its own Sentry project. Without SENTRY_AUTH_TOKEN the source map upload is
  // skipped and the build still succeeds.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true }
});
