import { ModeToggle } from 'app/lib/components/ui/mode-toggle';
import { NavItem } from 'app/lib/components/ui/nav-item';
import { SearchInput } from 'app/lib/components/ui/search';
import { User } from 'app/lib/components/ui/user';
import { Home, Package } from 'lucide-react';

export default function HomeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full flex-col bg-muted/40">
      <DesktopNav />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SearchInput />
          <User />
          <ModeToggle />
        </header>
        <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
          {children}
        </main>
      </div>
    </main>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/home/" label="home">
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/home/" label="Products">
          <Package className="h-5 w-5" />
        </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5"></nav>
    </aside>
  );
}
