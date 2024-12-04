'use client';

import { useAppUser } from 'src/lib/useAppUser';

export default function Test() {
  const { user } = useAppUser();

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">{user?.email}</h1>
    </div>
  );
}
