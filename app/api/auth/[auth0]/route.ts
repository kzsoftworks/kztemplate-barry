import { NextRequest } from 'next/server';
import { HandlerError, Session } from '@auth0/nextjs-auth0';
import { authConfig } from '@/lib/auth0';
import { prisma, syncAuth0User } from '@/lib/prisma';

export const GET = authConfig.handleAuth({
  login: authConfig.handleLogin(() => {
    return {
      returnTo: '/',
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

        // Check if user exists in our database
        let dbUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        });

        // If user doesn't exist, this is their first login (signup)
        if (!dbUser) {
          // Create new user in database
          dbUser = await syncAuth0User({
            sub: session.user.sub,
            email: session.user.email,
            name: session.user.name,
            roles: session.user.roles,
            picture: session.user.picture
          });
        }

        if (!dbUser) {
          console.error('User not found in database');
          return session;
        }

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
      returnTo: 'http://localhost:3000',
      logoutParams: {
        returnTo: 'http://localhost:3000'
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
