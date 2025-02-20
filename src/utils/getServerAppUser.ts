import { User } from '@prisma/client';
import { Session } from '@auth0/nextjs-auth0';
import { cache } from 'react';
import { authConfig } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export type ServerAppUser = {
  session: Session | null;
  user: (Session['user'] & { dbData?: User }) | null;
  isLoading: boolean;
  error?: Error;
};

export const getServerAppUser = cache(async (): Promise<ServerAppUser> => {
  try {
    const session = await authConfig.getSession();

    if (!session?.user) {
      return {
        session: null,
        user: null,
        isLoading: false
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        auth0Id: session.user.sub
      },
      include: {
        roles: true
      }
    });

    const enhancedUser = {
      ...session.user,
      dbData: dbUser || undefined
    };

    return {
      session,
      user: enhancedUser,
      isLoading: false
    };
  } catch (error) {
    console.error('Error in getServerAppUser:', error);
    return {
      session: null,
      user: null,
      isLoading: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
});
