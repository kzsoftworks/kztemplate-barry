import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv, isSupabaseConfigured } from '@/lib/env';
import { isPublicPath } from '@/lib/routes';
import type { Database } from '@/types/database.types';

/**
 * Refreshes the Supabase session cookie and redirects signed-out visitors away
 * from protected routes. This is an optimistic check only: every Server Action
 * and data read must still verify the user (see `getServerAppUser`).
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured()) {
    // Fresh clone without env vars: keep public pages working, lock the rest.
    return isPublicPath(pathname)
      ? NextResponse.next({ request })
      : redirectToLogin(request);
  }

  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  // Do not run code between createServerClient and getClaims(): it is what
  // refreshes the token. Skipping it causes random sign-outs.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);

  if (!isSignedIn && !isPublicPath(pathname)) {
    return redirectToLogin(request, response);
  }

  // Always return this response object: it carries the refreshed cookies.
  return response;
}

function redirectToLogin(request: NextRequest, source?: NextResponse) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  const { pathname, search } = request.nextUrl;
  if (pathname !== '/') loginUrl.searchParams.set('next', pathname + search);

  const redirect = NextResponse.redirect(loginUrl);
  // Keep any refreshed auth cookies on the redirect.
  source?.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
