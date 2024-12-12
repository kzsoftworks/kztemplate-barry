'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { User } from '@prisma/client';
import { useEffect, useState } from 'react';

export default function UsersComponent() {
  const { user, isLoading, error } = useUser();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await fetch('http://localhost:3001/api/users', {
        credentials: 'include'
      });

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Welcome, {user.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of all registered users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: User) => (
          <div
            key={user.auth0Id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden 
                       hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={user.picture || '/default-avatar.png'}
                    className="h-12 w-12 rounded-full object-cover 
                             border-2 border-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 
                                  border border-gray-300 dark:border-gray-600 
                                  rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 
                                  transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">No users found</p>
        </div>
      )}
    </div>
  );
}
