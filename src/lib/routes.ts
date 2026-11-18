import type { Route } from 'next';

// Routes reachable without a session. Everything else requires sign-in.
// Keep this list short and explicit: a new route is private by default.
const PUBLIC_PATHS = ['/', '/login', '/sign-up', '/terms', '/privacy'];
const PUBLIC_PREFIXES = [
  '/auth/',
  '/sentry-example-page',
  '/api/sentry-example-api'
];

export function isPublicPath(pathname: string): boolean {
  const path =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  if (PUBLIC_PATHS.includes(path)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => path === prefix.replace(/\/$/, '') || path.startsWith(prefix)
  );
}

/**
 * Only allow same-origin relative redirects ("/profile"), never "//evil.com"
 * or absolute URLs. Use for any `next` parameter taken from the request.
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback: Route = '/profile'
): Route {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
  if (next.includes('\\')) return fallback;
  // Validated above as a same-origin path; typed routes cannot know it statically.
  return next as Route;
}
