import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { HandlerError } from '@auth0/nextjs-auth0';
import { authConfig } from 'app/lib/auth0';

export const GET = authConfig.handleAuth({
  login: authConfig.handleLogin((request) => {
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
  logout: authConfig.handleLogout((request) => {
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
