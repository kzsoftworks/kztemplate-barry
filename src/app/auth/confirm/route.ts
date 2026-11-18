import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/env';
import { safeRedirectPath } from '@/lib/routes';
import { createClient } from '@/lib/supabase/server';

// Target of the links in Supabase auth emails (see supabase/templates).
// Exchanges the one-time token for a session cookie, then redirects.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get('next'));

  if (isSupabaseConfigured() && tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'confirmation');
  return NextResponse.redirect(loginUrl);
}
