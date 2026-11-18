import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/lib/env';
import type { Database } from '@/types/database.types';

/** Supabase client for Client Components. Runs as the signed-in user, under RLS. */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
