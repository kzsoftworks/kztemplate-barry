'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function Test() {
  const { user } = useUser();

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">{user?.email}</h1>
    </div>
  );
}
