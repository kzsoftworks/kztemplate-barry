'use client';
import Link from 'next/link';
import { Label } from './label';
import { Input } from './input';
import { SubmitButton } from './submit-button';

export function SignUpForm() {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!document.getElementById('email')) return;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    window.location.href = `/api/auth/signup?email=${email}`;
  };

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Try KzBarry
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address to sign up and create a new account for you
          and your collaborators.
        </p>
      </div>
      <form>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="name@example.com"
              required
            />
          </div>
          <SubmitButton onClick={(e) => handleClick(e)}>
            Get Started
          </SubmitButton>
        </div>
      </form>
      <p className="px-8 text-center text-sm text-muted-foreground">
        By continuing, you agree to our
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          {' '}
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
