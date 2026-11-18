'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAppUser } from '@/hooks/useAppUser';

export function UserDataDisplay() {
  const { user, isLoading, error, refresh } = useAppUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Read in the browser</CardTitle>
        <CardDescription>
          <code>useAppUser()</code> in a Client Component, limited by RLS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isLoading && <p role="status">Loading…</p>}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {!isLoading && !user && <p>Not signed in.</p>}
        {user && (
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user.email ?? '—'}</dd>
            <dt className="text-muted-foreground">Name</dt>
            <dd>{user.profile?.name ?? '—'}</dd>
          </dl>
        )}
        <Button type="button" variant="outline" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
