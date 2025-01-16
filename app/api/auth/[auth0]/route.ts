import { NextRequest } from 'next/server';
import { HandlerError, Session } from '@auth0/nextjs-auth0';
import { authConfig } from '@/lib/auth0';
import { syncAuth0User } from '@/lib/prisma';

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
    async afterCallback(req: NextRequest, session: Session) {
      try {
        if (!session?.user) {
          return session;
        }

        // Create or update the user in the database
        const dbUser = await syncAuth0User({
          sub: session.user.sub,
          email: session.user.email,
          name: session.user.name,
          roles: session.user.roles,
          picture: session.user.picture
        });

        return {
          ...session,
          user: {
            ...session.user,
            dbData: dbUser
          }
        };
      } catch (error) {
        console.error('Database sync error:', error);
        return session;
      }
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
  onError(req: NextRequest, error: HandlerError) {
    console.error('Auth error route:', error);
    const errorMessage = encodeURIComponent('Authentication error occurred');
    return Response.redirect(
      new URL(`/api/auth/error?error=${errorMessage}`, req.url)
    );
  }
});
