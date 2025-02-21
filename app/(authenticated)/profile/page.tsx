import UserDataDisplay from '@/src/components/UserDataDisplay';
import { getServerAppUser } from '@/src/utils/getServerAppUser';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Profile() {
  const { user } = await getServerAppUser();

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
            <Link href="/" role="button">
              Home
            </Link>
          </li>
          <li>
            <a href="/api/auth/logout" role="button">
              Logout
            </a>
          </li>
        </ul>
      </nav>

      <UserDataDisplay />

      <main className="container">
        <article>
          <header>
            <h2>From Server User Data</h2>
          </header>

          <section>
            <h3>Profile Information</h3>
            {user!.picture && (
              <img
                src={user!.picture}
                alt="Profile"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  marginBottom: '1rem'
                }}
              />
            )}
            <dl>
              <dt>Email</dt>
              <dd>{user!.email}</dd>
              {user!.dbData?.name && (
                <>
                  <dt>Name</dt>
                  <dd>{user!.dbData?.name}</dd>
                </>
              )}
              {user!.dbData?.createdAt && (
                <>
                  <dt>Created at:</dt>
                  <dd>
                    {new Date(user!.dbData.createdAt).toLocaleDateString()}
                  </dd>
                </>
              )}
            </dl>
          </section>
        </article>
      </main>
    </>
  );
}
