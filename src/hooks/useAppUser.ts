import { UserContext, UserProfile, useUser } from '@auth0/nextjs-auth0/client';
import { User } from '@prisma/client';
import { useState, useEffect } from 'react';

export type AppUserContext = Omit<UserContext, 'user'> & {
  user?: UserProfile & { dbData?: User };
  refreshDbData?: () => Promise<void>;
};

export const useAppUser = (): AppUserContext => {
  const { user, ...rest } = useUser();
  const [dbData, setDbData] = useState<User | undefined>();

  const fetchDbData = async () => {
    if (user?.sub) {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setDbData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  useEffect(() => {
    fetchDbData();
  }, [user?.sub]);

  const enhancedUser = user
    ? {
        ...user,
        dbData
      }
    : undefined;

  return {
    ...rest,
    user: enhancedUser,
    refreshDbData: fetchDbData
  };
};
