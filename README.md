# KZ Barry

A starter for building an app **with coding agents**. The stack is wired up,
and the repo carries the process the agents follow.

- **Next.js 16** (App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui)
- **Supabase** for Auth and Postgres, with Row Level Security on every table
- **Sentry** for errors and tracing, split by environment
- **Vercel**, with a Preview per pull request bound to its own Supabase branch
- **An agent harness** for Claude Code: a fixed process, an issue tracker, quality
  gates, a reviewer and stack-specific skills

## Quick start

Requirements: Node.js 22.12+, git, and [beads](https://github.com/gastownhall/beads)
(`npm i -g @beads/bd`). Docker is needed for the local Supabase stack.

```bash
git clone https://github.com/kzsoftworks/kztemplate-barry.git my-app
cd my-app
npm install
harness/bin/setup myapp        # checks tools, initialises the issue tracker
npm run dev                    # http://localhost:3000
```

The app boots without any service configured. To enable sign-in locally:

```bash
npm run db:start               # local Supabase; prints the URL and keys
cp .env.example .env.local     # paste NEXT_PUBLIC_SUPABASE_URL and the publishable key
npm run dev
```

For the full setup (Supabase project, Branching, Vercel, Sentry), open the repo
in Claude Code and say:

> Help me set up this template. Follow ASSISTANT_SETUP_GUIDE.md.

or follow [`ASSISTANT_SETUP_GUIDE.md`](./ASSISTANT_SETUP_GUIDE.md) yourself.

## How work happens

Every request goes through the same cycle. In Claude Code:

| Step   | You run                | What happens                                                              |
| ------ | ---------------------- | ------------------------------------------------------------------------- |
| Intent | `/intent`              | The goal is written into `INTENT.md`                                      |
| Plan   | `/plan-to-beads`       | An epic and issues with acceptance criteria are created in beads          |
| Build  | "work on `<issue id>`" | The agent claims the issue and writes code and tests                      |
| Verify | `/verify`              | Typecheck, lint, unit tests and e2e run; each result is recorded          |
| Review | (part of `/verify`)    | A separate reviewer agent checks the change against `POLICY.md`           |
| Ship   | `/ship`                | Learnings are noted on the issue, it is closed, a PR is opened if you ask |

Build, verify and review repeat until the reviewer approves.

| File / folder     | What it is for                                                         |
| ----------------- | ---------------------------------------------------------------------- |
| `INTENT.md`       | Why the product exists and what each request is for                    |
| `CLAUDE.md`       | How we work: process, commands, conventions                            |
| `POLICY.md`       | The rules a change must meet to be approved                            |
| `.claude/skills/` | Process skills and stack skills ([list](./.claude/skills/VENDORED.md)) |
| `.claude/agents/` | The `reviewer` subagent                                                |
| `harness/`        | `verify`, `lf-score`, `setup`, the harness changelog and evals         |
| `.beads/`         | The work: epics, issues, dependencies, notes (created by setup)        |
| `.harness/`       | Local event log of every process step (not committed)                  |

The harness is at v0.1: see [`harness/CHANGELOG.md`](./harness/CHANGELOG.md)
for what it includes and how it is meant to improve.

## Commands

| Command              | Does                                               |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Start the app                                      |
| `harness/bin/verify` | Run the four gates (`--db` adds the database gate) |
| `npm run typecheck`  | Generate route types and type-check                |
| `npm run lint`       | ESLint                                             |
| `npm test`           | Unit tests (Vitest)                                |
| `npm run test:e2e`   | End-to-end tests (Playwright)                      |
| `npm run db:start`   | Start local Supabase (Docker)                      |
| `npm run db:reset`   | Re-apply migrations and seed locally               |
| `npm run db:types`   | Regenerate `src/types/database.types.ts`           |
| `npm run test:db`    | Database tests (pgTAP) in `supabase/tests/`        |
| `bd ready`           | Issues that can be worked on now                   |

## What is in the app

- Email + password sign-up and sign-in (`/sign-up`, `/login`), a protected
  `/profile` page, and sign-out.
- `src/proxy.ts` refreshes the session and keeps signed-out visitors out of
  private routes. Routes are private unless listed in `src/lib/routes.ts`.
- `getServerAppUser()` (server) and `useAppUser()` (client) return the current
  user with their profile row.
- Tables `profiles`, `roles` and `user_roles`, with RLS policies and tests. A
  profile is created automatically when a user signs up.
- `/sentry-example-page` throws a sample error on the client and the server to
  check the Sentry setup. Delete it once verified.

## Pull request Previews

Opening a pull request creates:

1. a **Supabase preview branch**: an isolated database built from
   `supabase/migrations/` and `supabase/seed.sql`, with no production data;
2. a **Vercel Preview** whose Supabase variables point at that branch.

The build refuses to produce a Preview that has no Supabase variables or that
points at the production project (`scripts/verify-preview-binding.mjs`). Two
GitHub workflows run on each PR: `CI` (gates, build, database tests) and
`E2E on Preview` (Playwright against the deployed URL).

This needs Supabase Branching, which is a paid Supabase feature billed per
active branch. Setup steps are in the guide.

## Environment variables

All of them are documented in [`.env.example`](./.env.example).

| Variable                                            | Where                | Notes                                        |
| --------------------------------------------------- | -------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                          | local, Vercel        | Synced to Vercel by the Supabase integration |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`              | local, Vercel        | Safe in the browser                          |
| `SUPABASE_SECRET_KEY`                               | server only          | Bypasses RLS; leave empty unless needed      |
| `SUPABASE_PROD_PROJECT_REF`                         | Vercel (Preview)     | Enables the production guard                 |
| `NEXT_PUBLIC_SITE_URL`                              | local, Vercel (Prod) | Derived on Vercel if unset                   |
| `NEXT_PUBLIC_SENTRY_DSN`                            | local, Vercel        |                                              |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Vercel, CI           | Source map upload at build time              |

## Not included yet

- **Tracing of agent sessions** (Langfuse). The harness records process steps
  to a local file only.
- **Password reset and OAuth providers.** The auth plumbing supports them; the
  pages are not built.
