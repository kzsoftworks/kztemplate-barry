import { useUser } from '@auth0/nextjs-auth0/client';
import { User } from '@prisma/client';
import {
  UserContext,
  UserProfile
} from 'node_modules/@auth0/nextjs-auth0/dist/client/use-user';

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
