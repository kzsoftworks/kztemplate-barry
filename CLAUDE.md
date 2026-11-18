# CLAUDE.md

How we work in this repo. Three files, three jobs:

- **`INTENT.md`**: why the product exists and what each request is for.
- **`CLAUDE.md`** (this file), **`POLICY.md`** and the skills: how we work.
  Versioned in git.
- **beads** (`bd`): the work itself (epics, issues, dependencies) and what was
  learned on each issue.

@AGENTS.md

## Stack

- **Next.js 16** (App Router, React 19, TypeScript strict). Source in `src/`.
  The request interceptor is `src/proxy.ts`; there is no `middleware.ts`.
- **Supabase** for Auth and Postgres, through `@supabase/ssr`. Schema lives in
  `supabase/migrations/`. Row Level Security on every table.
- **Tailwind CSS 4 + shadcn/ui** (`src/components/ui/`, added with
  `npx shadcn add <component>`).
- **Sentry** for errors and tracing, tagged by environment.
- **Vercel**: every pull request gets a Preview deployment bound to its own
  Supabase preview branch.
- **Vitest** (unit, next to the code as `*.test.ts`) and **Playwright**
  (`tests/e2e/`).

Next.js 16 and several of these libraries are newer than your training data.
Read `node_modules/next/dist/docs/` or the relevant skill before using an API
you are not sure about.

## Process

Every request follows the same cycle. Each step records its phase with
`harness/bin/lf-score`, so the history of a request can be reconstructed from
`.harness/events.jsonl`.

| Step   | How                                                             | Leaves behind                                           |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------- |
| Intent | `/intent`                                                       | `INTENT.md` updated                                     |
| Plan   | `/plan-to-beads`                                                | epic and issues with acceptance criteria and deps       |
| Claim  | `bd update <id> --claim` + `harness/bin/lf-score bd_issue <id>` | session bound to the issue and its epic                 |
| Build  | code + tests                                                    | the change                                              |
| Verify | `/verify` → `harness/bin/verify`                                | `gate.typecheck`, `gate.lint`, `gate.test`, `gate.e2e`  |
| Review | `reviewer` subagent                                             | APPROVED or CHANGES; `POLICY-GAP` if a rule is missing  |
| Ship   | `/ship`                                                         | `LEARNINGS:` note, `eval-candidate` label, issue closed |

Build → Verify → Review repeats until the reviewer approves. Each extra round
is recorded as rework.

Rules of the process:

- No code without a claimed issue. For a small fix, create the issue first
  (`bd q "<title>"`), it takes one command.
- Track work in beads only. No TODO files, no task lists in markdown.
- Work is not done until `harness/bin/verify` passes on the final code and the
  reviewer approved it. A skipped gate is reported as skipped, never as passed.
- Do not push, open a pull request or merge unless asked. Never merge yourself.

## Commands

```bash
npm run dev              # app on http://localhost:3000
harness/bin/verify       # the four gates; add --db when supabase/ changed
npm run typecheck | lint | test | test:e2e
npm run db:start         # local Supabase (needs Docker); prints URL and keys
npm run db:reset         # re-apply migrations + seed locally
npm run db:types         # regenerate src/types/database.types.ts
npm run test:db          # pgTAP tests in supabase/tests
bd ready                 # what can be worked on now
```

## Where things go

```
src/app/                 routes; (auth) public auth pages, (authenticated) private pages
src/components/          app components;  ui/ is shadcn (do not hand-edit beyond variants)
src/lib/supabase/        client.ts (browser), server.ts (server), proxy.ts (session refresh)
src/lib/routes.ts        which paths are public; safe redirect helper
src/utils/getServerAppUser.ts   current user on the server (the auth check)
src/hooks/useAppUser.ts  current user in Client Components (display only)
supabase/migrations/     schema, policies, functions
supabase/tests/          pgTAP tests, one per table at least
tests/e2e/               Playwright
harness/                 process tooling (verify, lf-score, setup), changelog, evals
```

## Skills to load

- Anything touching auth, the current user, a protected route, a query or a
  table: **`supabase-nextjs-auth`** first, then `supabase` and
  `supabase-postgres-best-practices` for SQL and policies.
- React components and data fetching: `vercel-react-best-practices`,
  `vercel-composition-patterns`. UI components: `shadcn`.
- Checking a change in the running app: `next-dev-loop`.
- Errors, tracing, a Sentry issue: `sentry-instrument`, `sentry-debug-issue`.
- Pull requests and Previews: `preview-deploy`.

## Conventions

- Server Components by default. `'use client'` only for state, effects or
  browser APIs, and as low in the tree as possible.
- Mutations are Server Actions: check the user, validate input with zod, then
  write. Return `{ error }` for expected failures; let unexpected ones throw so
  Sentry reports them.
- Import with the `@/` alias (`@/lib/...`), which maps to `src/`.
- Secrets never get a `NEXT_PUBLIC_` prefix and are never read in a Client
  Component. `.env*` files are not committed and not read by agents.
- The app must keep booting without Supabase or Sentry configured
  (`isSupabaseConfigured()`), so a fresh clone and CI can run the smoke tests.

## Changing the harness

Skills, `POLICY.md`, `CLAUDE.md` and `harness/` are the harness. A change to
them is an issue labelled `harness` with an entry in `harness/CHANGELOG.md`
that cites the issue or event that justifies it. Do not change the harness as a
side effect of feature work: record a `POLICY-GAP` or `LEARNINGS:` note instead.
