import { UserProfile, useUser } from '@auth0/nextjs-auth0/client';
import { User } from '@prisma/client';

export interface AppUserContext {
  user?: UserProfile & { dbData?: User };
  error?: Error;
  isLoading: boolean;
  refreshDbData: () => Promise<void>;
}

export const useAppUser = (): AppUserContext => {
  const { user, error, isLoading } = useUser();

  const refreshDbData = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to refresh user data');
      }

      // Force a revalidation of the user data in the client
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  return {
    user,
    error,
    isLoading,
    refreshDbData
  };
};
