import { getServerAppUser } from '@/utils/getServerAppUser';
import Link from 'next/link';
import { SignUpForm } from '@/components/SignUpForm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerAppUser();

  return (
    <>
      <nav>
        <ul>
          <li>
            <strong>KzBarry</strong>
          </li>
        </ul>
        <ul>
          <li>
            {session?.user ? (
              <a href="/api/auth/logout" role="button">
                Logout
              </a>
            ) : (
              <>
                <span>Already joined? </span>
                <a href="/api/auth/login" role="button">
                  Log in
                </a>
              </>
            )}
          </li>
        </ul>
      </nav>

      <main>
        <article>
          <header>
            <h1>What is KzBarry?</h1>
          </header>
          <p>
            KzBarry consists of several templates of a tech stack that can be
            cloned to start a new project. This will significantly reduce the
            bootstrap time and enable the development team to focus most of
            their effort on business logic. It will save considerable time in
            releasing the initial prototype/MVP and allow Kaizen to decrease
            estimation time during the discovery phase of new projects, making
            client proposals more appealing.
          </p>
        </article>

        {session?.user ? (
          <article>
            <h2>Welcome back!</h2>
            <p>You are logged in.</p>
            <Link href="/profile" role="button">
              See your profile
            </Link>
          </article>
        ) : (
          <SignUpForm />
        )}
      </main>
    </>
  );
}
