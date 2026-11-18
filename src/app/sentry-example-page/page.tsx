'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

class SentryExampleFrontendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SentryExampleFrontendError';
  }
}

// Throws one error on the server and one in the browser so you can confirm
// both reach Sentry. Delete this page and its API route once verified.
export default function SentryExamplePage() {
  const [sent, setSent] = useState(false);

  async function throwErrors() {
    await Sentry.startSpan(
      { name: 'Example Frontend Span', op: 'test' },
      async () => {
        const response = await fetch('/api/sentry-example-api');
        setSent(true);
        if (!response.ok) {
          throw new SentryExampleFrontendError(
            'This error is raised on the frontend of the example page.'
          );
        }
      }
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Sentry check</h1>
      <p className="text-muted-foreground max-w-prose">
        Click the button, then open your Sentry project: you should see one
        backend error and one frontend error, tagged with this environment.
      </p>
      <Button type="button" onClick={throwErrors}>
        Throw sample errors
      </Button>
      {sent && (
        <p role="status" className="text-sm">
          Sample errors sent. Without a DSN configured nothing is reported.
        </p>
      )}
    </div>
  );
}
