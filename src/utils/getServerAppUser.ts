import 'server-only';
import { connection } from 'next/server';
import { cache } from 'react';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database.types';

export type AppUser = {
  id: string;
  email: string | null;
  /** Row from public.profiles. Null only if the signup trigger has not run. */
  profile: Tables<'profiles'> | null;
  roles: string[];
};

/**
 * The signed-in user for the current request, or null.
 *
 * This is the authorization check for server code: call it in every Server
 * Component, Server Action and Route Handler that touches private data. The
 * proxy redirect alone is not a security boundary.
 *
 * Cached per request, so calling it from several components costs one lookup.
 */
export const getServerAppUser = cache(async (): Promise<AppUser | null> => {
  // The answer depends on the request, so never prerender callers at build time.
  await connection();
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const { sub: id, email } = data.claims;

  // RLS limits both queries to the caller's own rows.
  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
    supabase.from('user_roles').select('roles(name)').eq('user_id', id)
  ]);

  return {
    id,
    email: typeof email === 'string' ? email : null,
    profile: profile ?? null,
    roles: (roleRows ?? []).flatMap((row) =>
      row.roles ? [row.roles.name] : []
    )
  };
});

/** Use in Server Actions: throws instead of returning null. */
export async function requireAppUser(): Promise<AppUser> {
  const user = await getServerAppUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}
