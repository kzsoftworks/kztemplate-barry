import { getServerAppUser } from '@/src/utils/getServerAppUser';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAppUser();

  if (!session?.user) {
    redirect('/');
  }

  return <>{children}</>;
}
