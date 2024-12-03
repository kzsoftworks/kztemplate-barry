import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/callback',
  '/api/auth/signup',
  '/api/auth/error'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('appSession');

  if (!authCookie || authCookie.value === '') {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
