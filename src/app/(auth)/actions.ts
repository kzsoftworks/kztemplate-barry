'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { isSupabaseConfigured } from '@/lib/env';
import { safeRedirectPath } from '@/lib/routes';
import { getSiteUrl } from '@/lib/site-url';
import { createClient } from '@/lib/supabase/server';

export type AuthFormState = {
  error?: string;
  message?: string;
};

const NOT_CONFIGURED: AuthFormState = {
  error:
    'Supabase is not configured yet. Set the variables from .env.example and restart.'
};

const credentialsSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.')
});

const signUpSchema = credentialsSchema.extend({
  name: z.string().trim().max(120).optional()
});

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Do not reveal whether the email exists.
    return { error: 'Invalid email or password.' };
  }

  revalidatePath('/', 'layout');
  redirect(safeRedirectPath(formData.get('next')?.toString()));
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name')?.toString() || undefined
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const { email, password, name } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
      data: name ? { name } : undefined
    }
  });
  if (error) {
    return { error: 'Could not create the account. Try again.' };
  }

  // With email confirmation off, Supabase returns a session straight away.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/profile');
  }

  return {
    message: 'Check your inbox to confirm your email, then sign in.'
  };
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/');
}
