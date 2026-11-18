export const dynamic = 'force-dynamic';

class SentryExampleAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SentryExampleAPIError';
  }
}

// A deliberately failing route to verify Sentry's server-side reporting.
export function GET() {
  throw new SentryExampleAPIError(
    'This error is raised on the backend called by the example page.'
  );
}
