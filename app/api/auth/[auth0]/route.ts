import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { HandlerError, Session } from '@auth0/nextjs-auth0';
import { authConfig } from 'src/lib/auth0';
import { syncAuth0User } from 'src/lib/prisma';

export const GET = authConfig.handleAuth({
  login: authConfig.handleLogin(() => {
    return {
      returnTo: '/home',
      authorizationParams: {
        screen_hint: 'login'
      }
    };
  }),
  signup: authConfig.handleLogin((request: NextRequest | any) => {
    return {
      returnTo: '/',
      authorizationParams: {
        screen_hint: 'signup',
        login_hint: request.nextUrl.searchParams.get('email')
      }
    };
  }),
  callback: authConfig.handleCallback({
    afterCallback: async (request: NextRequest, session: Session) => {
      if (!session.user) {
        return session;
      }

      // Create or update the user in the database
      const dbUser = await syncAuth0User({
        sub: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        roles: session.user.roles
      });

      // Return session with the database user included
      return {
        ...session,
        user: {
          ...session.user,
          dbData: dbUser
        }
      };
    }
  }),
  logout: authConfig.handleLogout(() => {
    return {
      returnTo: '/',
      logoutParams: {
        federated: true
      }
    };
  }),
  onError(_req: NextRequest, error: HandlerError) {
    redirect(
      `/api/auth/error?error=${error.cause?.message || 'An error occured while authenticating the user.'}`
    );
  }
});
