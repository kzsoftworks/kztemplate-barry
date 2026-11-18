# POLICY

The rules a change must meet to be approved. The `reviewer` subagent checks
every change against this file and cites the rule it applies.

A rule belongs here when breaking it is a defect regardless of the feature.
Preferences and how-to go in `CLAUDE.md` or a skill. When a review finds a
problem that no rule covers, it is recorded as a `POLICY-GAP` on the issue, and
adding the rule is its own `harness` issue with a `harness/CHANGELOG.md` entry.

## Data and access (Supabase)

- **D1.** Every table in an exposed schema has Row Level Security enabled in
  the migration that creates it.
- **D2.** Privileges are granted explicitly: revoke the defaults from `anon`
  and `authenticated`, then grant only the operations and columns needed.
- **D3.** Policies name their role (`to authenticated`) and operation, and
  compare against `(select auth.uid())`. No policy is `using (true)` for write
  operations. Columns used in policies are indexed.
- **D4.** Every new table or policy change comes with pgTAP tests in
  `supabase/tests/` proving that another user and `anon` cannot read or write
  the rows.
- **D5.** Schema changes happen only through files in `supabase/migrations/`.
  Merged migrations are never edited. `src/types/database.types.ts` is
  regenerated, not hand-edited.
- **D6.** Migrations run inside a transaction on an empty database and on one
  holding production data: no `create index concurrently`, no destructive
  change without a staged plan (add, backfill, switch, then remove).
- **D7.** `security definer` functions pin `search_path = ''`, schema-qualify
  every object, and have `execute` revoked from API roles unless they are meant
  to be called.
- **D8.** Data every environment needs is in a migration. `supabase/seed.sql`
  holds disposable fixtures only, and never real user data.

## Authentication and authorization

- **A1.** Every Server Action and Route Handler that reads or writes private
  data verifies the user on the server (`requireAppUser()` /
  `getServerAppUser()`). The proxy redirect is not an authorization check.
- **A2.** Server-side authorization never relies on
  `supabase.auth.getSession()`.
- **A3.** The secret key (`SUPABASE_SECRET_KEY`) is used only in files that
  import `server-only`, and each use is justified in the pull request.
- **A4.** New routes are private unless added to `src/lib/routes.ts`. Adding a
  public route is called out in the pull request.
- **A5.** Redirect targets taken from a request go through
  `safeRedirectPath()`. Auth links are built with `getSiteUrl()`, never a
  hardcoded domain.
- **A6.** Auth error messages do not reveal whether an account exists.

## Secrets and configuration

- **S1.** No secret, token or key in the repo, in logs, in a pull request or in
  an error message. `.env*` files are not committed.
- **S2.** Only values that are safe in a browser get the `NEXT_PUBLIC_` prefix.
- **S3.** A new environment variable is added to `.env.example` with a comment,
  and to `ASSISTANT_SETUP_GUIDE.md` if a person has to set it.

## Input and errors

- **I1.** Input from a form, a URL or a request body is validated with zod on
  the server before use.
- **I2.** Expected failures are returned to the user as a message. Unexpected
  ones are thrown or passed to `Sentry.captureException`; they are not
  swallowed by an empty `catch` or reduced to a `console.log`.
- **I3.** No personal data in Sentry events, logs or analytics beyond the user
  id.

## Code

- **C1.** TypeScript stays strict: no `any`, no `@ts-ignore`, no
  `eslint-disable` without a comment saying why it is safe.
- **C2.** `'use client'` only where state, effects or browser APIs require it.
- **C3.** The app still boots, and the smoke tests pass, without Supabase or
  Sentry configured.
- **C4.** The change does what its issue says. Unrelated refactors and
  dependency upgrades are separate issues.
- **C5.** New dependencies are justified in the pull request and are not added
  for something the stack already does.

## Tests and verification

- **T1.** New behaviour has a test that fails without the change. Bug fixes
  start with a failing test.
- **T2.** No test is deleted, skipped or loosened to make a gate pass.
- **T3.** User-facing flows that change have a Playwright test or an updated
  one.
- **T4.** `harness/bin/verify` passed on the final code. Skipped gates are
  reported as skipped with the reason.

## Pull requests and Previews

- **P1.** A Preview never uses the production Supabase project.
- **P2.** No check, protection or policy is disabled to get a green build.
- **P3.** A pull request is ready only with evidence for its final commit:
  checks, the `preview-binding` line, and the changed flow exercised on the
  Preview.
- **P4.** Agents do not merge. Merging needs a person's approval of the
  current revision.
