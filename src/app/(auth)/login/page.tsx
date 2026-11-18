import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { login } from '@/app/(auth)/actions';
import { AuthForm } from '@/components/AuthForm';
import { safeRedirectPath } from '@/lib/routes';
import { getServerAppUser } from '@/utils/getServerAppUser';

export const metadata: Metadata = { title: 'Log in · KZ Barry' };

const ERRORS: Record<string, string> = {
  confirmation: 'That confirmation link is invalid or has expired.'
};

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams;
  const next = typeof params.next === 'string' ? params.next : undefined;
  const errorKey = typeof params.error === 'string' ? params.error : undefined;

  if (await getServerAppUser()) redirect(safeRedirectPath(next));

  return (
    <AuthForm
      mode="login"
      action={login}
      next={next ? safeRedirectPath(next) : undefined}
      initialError={errorKey ? ERRORS[errorKey] : undefined}
    />
  );
}
