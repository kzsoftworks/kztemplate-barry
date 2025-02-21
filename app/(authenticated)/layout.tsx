import { getServerAppUser } from '@/src/utils/getServerAppUser';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

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
