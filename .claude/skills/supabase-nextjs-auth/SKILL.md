---
name: supabase-nextjs-auth
description: How this repo wires Supabase Auth and data access into Next.js 16 - which client to use where, proxy.ts session refresh, getClaims vs getUser, protecting Server Actions, and the migration + RLS + test + types routine for schema changes. Use BEFORE writing or changing anything that signs users in or out, reads the current user, protects a route, queries Supabase from the app, or adds or alters a table.
---

# Supabase in this repo

The vendored `supabase` and `supabase-postgres-best-practices` skills cover
Supabase and Postgres in general. This skill is the repo-specific layer: the
files that already exist and the rules for extending them. Read the general
skills too when writing SQL or policies.

Next.js 16 is newer than most training data. When unsure about a framework
API, read `node_modules/next/dist/docs/` rather than guessing.

## Which client

| Where the code runs                               | Use                                          |
| ------------------------------------------------- | -------------------------------------------- |
| Server Component, Server Action, Route Handler    | `createClient()` from `@/lib/supabase/server` (async) |
| Client Component                                  | `createClient()` from `@/lib/supabase/client` |
| `src/proxy.ts`                                    | `updateSession()` from `@/lib/supabase/proxy` |

All three use the publishable key and run **as the signed-in user, under RLS**.

Never:

- import from `@supabase/auth-helpers-nextjs` (deprecated)
- use cookie methods other than `getAll` / `setAll`
- share one server client between requests (create it inside the function)
- use `SUPABASE_SECRET_KEY` in anything that can reach the browser. It bypasses
  RLS. If a server-only job truly needs it, create that client in a file that
  starts with `import 'server-only'`, and say so in the pull request.

## Who is the user

- **Server**: `getServerAppUser()` from `@/utils/getServerAppUser`. Returns
  `{ id, email, profile, roles }` or `null`, cached per request. In Server
  Actions use `requireAppUser()`, which throws when signed out.
- **Client**: `useAppUser()` from `@/hooks/useAppUser`. Display only.

`getServerAppUser` uses `supabase.auth.getClaims()`, which verifies the JWT.
Use `supabase.auth.getUser()` only when you need the freshest user record from
the Auth server. **Never use `getSession()` to authorize anything on the
server**: it trusts the cookie without verifying it.

## Protecting things

Three layers, all required:

1. **`src/proxy.ts`** redirects signed-out visitors to `/login` and refreshes
   the session cookie. It is optimistic, not a security boundary. Next.js 16
   calls this file `proxy.ts`; there is no `middleware.ts`.
   - A new route is private by default. To make one public add it to
     `src/lib/routes.ts`.
   - In `updateSession`, nothing may run between `createServerClient` and
     `getClaims()`, and the function must return the same `response` object.
2. **Server code** checks the user itself. Every Server Action and Route
   Handler that reads or writes private data starts with `requireAppUser()` (or
   `getServerAppUser()` and an explicit branch). Pages under
   `src/app/(authenticated)/` are covered by that group's layout.
3. **RLS** in the database decides what each user can see and change. The app
   must stay correct even if layers 1 and 2 had a bug.

Server Action shape:

```ts
'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAppUser } from '@/utils/getServerAppUser';

const schema = z.object({ name: z.string().trim().min(1).max(120) });

export async function updateName(_prev: unknown, formData: FormData) {
  const user = await requireAppUser(); // 1. who
  const parsed = schema.safeParse({ name: formData.get('name') }); // 2. validate
  if (!parsed.success) return { error: 'Enter a name.' };

  const supabase = await createClient();
  const { error } = await supabase // 3. RLS still applies
    .from('profiles')
    .update({ name: parsed.data.name })
    .eq('id', user.id);
  if (error) return { error: 'Could not save. Try again.' };
  return { ok: true };
}
```

Redirect targets taken from the request (`?next=`) go through
`safeRedirectPath()` from `@/lib/routes`.

## Auth flows that exist

- Email + password: `src/app/(auth)/actions.ts` (`login`, `signUp`, `logout`).
- Email links land on `src/app/auth/confirm/route.ts`, which calls
  `verifyOtp({ type, token_hash })`. Email templates in `supabase/templates/`
  must link to `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=<type>`.
- Links are built with `getSiteUrl()` from `@/lib/site-url`, so a Vercel
  Preview sends users back to itself. Do not hardcode a domain.

Adding OAuth or magic links: add the provider in `supabase/config.toml`, reuse
`/auth/confirm` (or add `/auth/callback` with `exchangeCodeForSession` for
OAuth), and keep the redirect allow-list in `config.toml` in sync.

## Changing the schema

Every schema change is a migration. Never change a database through the
dashboard or the SQL editor, and never run `supabase db push` yourself:
migrations reach preview branches and production through the GitHub
integration when the pull request is opened and merged.

1. `npx supabase migration new <short_name>` and write the SQL.
2. In the same migration, for every new table:
   - `alter table ... enable row level security;`
   - `revoke all ... from anon, authenticated;` then grant only what is needed
   - one policy per operation and role, with `(select auth.uid())` (the
     subselect lets Postgres cache it per statement)
   - an index on every column a policy filters by
   - `security definer` functions only when unavoidable, with
     `set search_path = ''`, schema-qualified names and `revoke execute`
3. Add pgTAP tests in `supabase/tests/` proving that another user and `anon`
   cannot read or write the rows. Follow `supabase/tests/rls_test.sql`.
4. `npm run db:reset`, then `npm run db:types` to regenerate
   `src/types/database.types.ts`. Do not edit that file by hand.
5. `harness/bin/verify --db`.

Preview branches run each migration in a transaction and start empty:

- no `create index concurrently` in a migration
- data every environment needs goes in a migration; `supabase/seed.sql` is for
  disposable fixtures and never runs in production
- write migrations so they can be applied to a database that already has
  production data: add columns as nullable or with a default, backfill, then
  tighten
- never edit a migration that has been merged. Add a new one.
