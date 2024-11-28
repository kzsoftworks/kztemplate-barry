'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';

export function User() {
  const { user } = useUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <img
            src={user?.picture ?? '/placeholder-user.jpg'}
            width={36}
            height={36}
            alt="Avatar"
            className="overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem>
            <Link href="/api/auth/logout">Log Out</Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Link href="/api/auth/login">Sign In</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
