import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { UserDataDisplay } from '@/components/UserDataDisplay';
import { getServerAppUser } from '@/utils/getServerAppUser';

export const metadata: Metadata = { title: 'Profile · KZ Barry' };

export default async function ProfilePage() {
  const user = await getServerAppUser();
  if (!user) redirect('/login');

  const memberSince = user.profile
    ? new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(
        new Date(user.profile.created_at)
      )
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Read on the server</CardTitle>
          <CardDescription>
            <code>getServerAppUser()</code> in a Server Component.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user.email ?? '—'}</dd>
            <dt className="text-muted-foreground">Name</dt>
            <dd>{user.profile?.name ?? '—'}</dd>
            <dt className="text-muted-foreground">Roles</dt>
            <dd>{user.roles.length ? user.roles.join(', ') : '—'}</dd>
            <dt className="text-muted-foreground">Member since</dt>
            <dd>{memberSince ?? '—'}</dd>
          </dl>
        </CardContent>
      </Card>

      <UserDataDisplay />
    </div>
  );
}
