'use client';
import { User } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useAppUser } from '@/hooks/useAppUser';

export default function UsersComponent() {
  const { user } = useAppUser();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user?.sub]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div>
      <div>
        <h1>Welcome, {user?.name}!</h1>
        <p>Here's an overview of all registered users</p>
      </div>

      <div>
        {users.map((user: User) => (
          <div key={user.auth0Id}>
            <div>
              <div>
                <img
                  src={user.picture || '/default-avatar.png'}
                  alt={user.name || 'Profile'}
                />
              </div>
              <div>
                <p>{user.name}</p>
                <p>{user.email}</p>
              </div>
            </div>
            <div>
              <button>View Profile</button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div>
          <p>No users found</p>
        </div>
      )}
    </div>
  );
}
