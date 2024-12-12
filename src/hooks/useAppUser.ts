import { UserContext, UserProfile, useUser } from '@auth0/nextjs-auth0/client';
import { User } from '@prisma/client';

export type AppUserContext = Omit<UserContext, 'user'> & {
  user?: UserProfile & { dbData?: User };
};

export const useAppUser = (): AppUserContext => {
  const { user, ...rest } = useUser();

  return {
    ...rest,
    user: user as AppUserContext['user']
  };
};
