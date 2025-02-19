'use client';

import { useAppUser } from '@/src/hooks/useAppUser';

export default function UserDataDisplay() {
  const { user, isLoading, error, refreshDbData } = useAppUser();

  const handleRefresh = async () => {
    try {
      await refreshDbData();
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  };

  if (isLoading) {
    return (
      <article aria-busy="true">
        <h3>Loading user data...</h3>
      </article>
    );
  }

  if (error) {
    return (
      <article>
        <h3>Error loading user data</h3>
        <p>{error.message}</p>
      </article>
    );
  }

  if (!user) {
    return (
      <article>
        <h3>Not logged in</h3>
        <p>Please log in to view your data</p>
        <a href="/api/auth/login" role="button">
          Log in
        </a>
      </article>
    );
  }

  return (
    <article>
      <header>
        <h3>From Client User Data Component</h3>
        {user.picture && (
          <img
            src={user.picture}
            alt="Profile"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              marginBottom: '1rem'
            }}
          />
        )}
      </header>

      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>

        {user.name && (
          <>
            <dt>Name</dt>
            <dd>{user.dbData?.name}</dd>
          </>
        )}

        {user.dbData?.createdAt && (
          <>
            <dt>Member since</dt>
            <dd>{new Date(user.dbData.createdAt).toLocaleDateString()}</dd>
          </>
        )}
      </dl>

      <footer>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleRefresh}>Refresh Data</button>
        </div>
      </footer>
    </article>
  );
}
