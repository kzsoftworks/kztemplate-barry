'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { AuthFormState } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  mode: 'login' | 'sign-up';
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next?: string;
  initialError?: string;
};

const COPY = {
  login: {
    title: 'Log in',
    description: 'Welcome back.',
    submit: 'Log in',
    pending: 'Logging in…',
    altText: 'No account yet?',
    altHref: '/sign-up',
    altLabel: 'Sign up'
  },
  'sign-up': {
    title: 'Create an account',
    description: 'It takes less than a minute.',
    submit: 'Sign up',
    pending: 'Creating account…',
    altText: 'Already have an account?',
    altHref: '/login',
    altLabel: 'Log in'
  }
} as const;

export function AuthForm({ mode, action, next, initialError }: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    error: initialError
  });
  const copy = COPY[mode];

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          {mode === 'sign-up' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" autoComplete="name" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              minLength={8}
              required
            />
          </div>
          {state.error && (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          )}
          {state.message && (
            <p role="status" className="text-sm">
              {state.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-6 flex-col items-stretch gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? copy.pending : copy.submit}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            {copy.altText}{' '}
            <Link href={copy.altHref} className="text-foreground underline">
              {copy.altLabel}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
