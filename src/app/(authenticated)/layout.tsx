import { redirect } from 'next/navigation';
import { getServerAppUser } from '@/utils/getServerAppUser';

// Every route in this group requires a signed-in user. The proxy already
// redirects signed-out visitors; this is the authoritative server-side check.
export default async function AuthenticatedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getServerAppUser();
  if (!user) redirect('/login');

  return <>{children}</>;
}
