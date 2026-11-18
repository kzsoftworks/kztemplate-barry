// Public Supabase configuration. Both values are safe to expose to the browser:
// access to data is governed by Row Level Security, not by hiding the key.
// They must be referenced literally so Next.js can inline them in client bundles.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * The template boots without Supabase so a fresh clone renders something useful.
 * Auth-dependent code must check this (or call `getSupabaseEnv`) before creating a client.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseEnv(): { url: string; publishableKey: string } {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).'
    );
  }
  return { url: supabaseUrl, publishableKey: supabasePublishableKey };
}
