import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

// Next.js 16 renamed `middleware.ts` to `proxy.ts`.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path except:
     * - _next/static, _next/image (build assets)
     * - monitoring (Sentry tunnel route, see next.config.ts): events from
     *   signed-out browsers must not be redirected to /login
     * - favicon and static image files
     */
    '/((?!_next/static|_next/image|monitoring|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
  ]
};
