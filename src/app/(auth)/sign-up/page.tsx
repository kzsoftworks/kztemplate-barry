import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { signUp } from '@/app/(auth)/actions';
import { AuthForm } from '@/components/AuthForm';
import { getServerAppUser } from '@/utils/getServerAppUser';

export const metadata: Metadata = { title: 'Sign up · KZ Barry' };

export default async function SignUpPage() {
  if (await getServerAppUser()) redirect('/profile');

  return <AuthForm mode="sign-up" action={signUp} />;
}
