'use client';

import Link from 'next/link';

export function SignUpForm() {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!document.getElementById('email')) return;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    window.location.href = `/api/auth/signup?email=${email}`;
  };

  return (
    <article>
      <hgroup>
        <h2>Try KzBarry</h2>
        <p>
          Enter your email address to sign up and create a new account for you
          and your collaborators.
        </p>
      </hgroup>

      <form>
        <label htmlFor="email">
          Email Address
          <input
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
            required
            aria-required="true"
          />
        </label>

        <button type="submit" onClick={(e) => handleClick(e)}>
          Get Started
        </button>

        <small>
          By continuing, you agree to our{' '}
          <Link href="/terms">Terms of Service</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </small>
      </form>
    </article>
  );
}
