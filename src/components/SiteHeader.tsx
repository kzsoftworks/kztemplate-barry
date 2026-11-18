import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { getServerAppUser } from '@/utils/getServerAppUser';

export async function SiteHeader() {
  const user = await getServerAppUser();

  return (
    <header className="border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3"
      >
        <Link href="/" className="font-semibold tracking-tight">
          KZ Barry
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile">Profile</Link>
              </Button>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
