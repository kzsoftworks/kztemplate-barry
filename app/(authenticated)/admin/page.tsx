'use client';

import { useEffect, useState } from 'react';
import { useAppUser } from '@/hooks/useAppUser';
import { updateUserProfile, fetchUserStats, ActionResponse } from './actions';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';

const initialState: ActionResponse = {
  success: false,
  message: ''
};

export default function HomePage() {
  const { user, refreshDbData } = useAppUser();
  const [stats, setStats] = useState<any>(null);
  const [state, formAction] = useFormState(updateUserProfile, initialState);

  useEffect(() => {
    if (state.message && state !== initialState) {
      if (state.success) {
        toast.success(state.message);
        refreshDbData?.();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  async function loadStats() {
    const result = await fetchUserStats();

    if (result.success) {
      setStats(result.stats);
    } else {
      toast.error('Error getting stats');
    }
  }

  return (
    <>
      <div>
        <h1>User Profile</h1>
        <form action={formAction}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email || ''}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              placeholder="Name"
              defaultValue={user?.dbData?.name || ''}
            />
          </div>

          <div>
            <label htmlFor="picture">Profile Image URL</label>
            <input
              id="picture"
              name="picture"
              type="url"
              placeholder="https://example.com/profile.jpg"
              defaultValue={user?.picture || ''}
            />
          </div>

          <div>
            <button type="submit">Upload Profile</button>
          </div>
        </form>
      </div>

      <div>
        <div>
          <div>Users Stats</div>
          <button onClick={loadStats}>Load Stats</button>
        </div>

        <div>
          {stats && (
            <div>
              {stats.map((user: any) => (
                <div key={user.id}>
                  <div>
                    {user.picture && (
                      <img src={user.picture} alt={user.name || 'Profile'} />
                    )}
                    <div>
                      <h3>{user.name || 'Sin nombre'}</h3>
                      <p>{user.email}</p>
                      <p>
                        Roles: {user.roles.map((r: any) => r.name).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats.length === 0 && (
        <div>
          <p>No users found</p>
        </div>
      )}
    </>
  );
}
