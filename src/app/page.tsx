import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { isSupabaseConfigured } from '@/lib/env';
import { getServerAppUser } from '@/utils/getServerAppUser';

const STACK = [
  ['Next.js 16', 'App Router, Server Components and Server Actions.'],
  ['Supabase', 'Auth and Postgres with Row Level Security on every table.'],
  ['Sentry', 'Error and performance monitoring, split by environment.'],
  ['Vercel', 'A Preview per pull request, each with its own database branch.']
] as const;

export default async function HomePage() {
  const user = await getServerAppUser();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">KZ Barry</h1>
        <p className="text-muted-foreground max-w-prose">
          A starter for building an app with coding agents. The stack is wired
          up, and the repo carries the process agents follow: intent, plan,
          build, verify, review, ship.
        </p>
        <div className="flex gap-2">
          {user ? (
            <Button asChild>
              <Link href="/profile">Go to your profile</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link href="/sign-up">Create an account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {!isSupabaseConfigured() && (
        <Card role="status">
          <CardHeader>
            <CardTitle>Supabase is not configured yet</CardTitle>
            <CardDescription>
              Copy <code>.env.example</code> to <code>.env.local</code>, run{' '}
              <code>npm run db:start</code> and paste the URL and publishable
              key it prints. Sign-in stays disabled until then.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <section aria-labelledby="stack-heading" className="space-y-3">
        <h2 id="stack-heading" className="text-xl font-semibold">
          What is included
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STACK.map(([name, description]) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle className="text-base">{name}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
