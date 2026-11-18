'use client';

import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database.types';

export type ClientAppUser = {
  id: string;
  email: string | null;
  profile: Tables<'profiles'> | null;
};

type State = {
  user: ClientAppUser | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * Signed-in user plus their profile row, for Client Components.
 * For display only: authorization happens on the server (getServerAppUser) and
 * in the database (RLS).
 */
export function useAppUser() {
  const [state, setState] = useState<State>({
    user: null,
    isLoading: isSupabaseConfigured(),
    error: null
  });
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !data.user) {
        setState({ user: null, isLoading: false, error: null });
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      if (cancelled) return;
      setState({
        user: {
          id: data.user.id,
          email: data.user.email ?? null,
          profile: profile ?? null
        },
        isLoading: false,
        error: profileError ? profileError.message : null
      });
    }

    void load();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') void load();
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [refreshCount]);

  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  return { ...state, refresh };
}
