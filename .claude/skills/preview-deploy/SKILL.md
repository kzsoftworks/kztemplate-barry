---
name: preview-deploy
description: Protocol for pull requests and their Preview environment - a Vercel Preview deployment bound to its own Supabase preview branch. Use when opening or updating a pull request, when checking whether a PR is ready, when a Preview build fails or shows the wrong data, when the "Supabase Preview" check fails, or before marking a PR ready for review.
---

# Pull requests and Previews

Every pull request gets:

- a **Supabase preview branch**: an isolated database and Auth, built from
  `supabase/migrations/` and then `supabase/seed.sql`. No production data.
- a **Vercel Preview deployment** whose Supabase variables point at that
  branch (synced by the Supabase integration).

Nothing here can be verified from your machine alone. Report what you checked
and what you could not.

## Before opening the PR

1. `harness/bin/verify` passes on the final commit.
2. If `supabase/` changed: `harness/bin/verify --db` passes, the types were
   regenerated, and the migration is safe for a branch (no
   `create index concurrently`, no dependency on data that only exists in
   production).
3. Open the PR as a **draft**. Only when the user asked for a PR.

## After pushing

Use `gh` (and the Vercel and Supabase MCP servers if they are connected).

1. **Checks**: `gh pr checks <number>`.
   - `CI` : the gates and the build.
   - `Supabase Preview`: the branch applied config, migrations and seed. If it
     fails, read its comment on the PR; the usual cause is a migration that
     does not run in a transaction or on an empty database.
   - `Vercel`: the deployment.
   - `E2E on Preview`: Playwright smoke against the deployed URL.
2. **Binding**: the Vercel build log has a line starting with
   `preview-binding:`. It must say `"vercelEnv":"preview"` and
   `"productionGuard":"checked"`. The build fails by itself if the Preview has
   no Supabase variables or points at production
   (`scripts/verify-preview-binding.mjs`).
   - Missing variables on the first deployment are expected: they are synced
     when the PR is opened, and Supabase redeploys once the branch is ready.
     Wait for that redeploy before investigating.
   - If `Supabase Preview` says the pull request was ignored, no branch
     exists and the variables will never arrive: "Supabase changes only" is
     on in the Supabase GitHub integration. It has to be turned off and the
     pull request closed and reopened as a new one.
3. **Smoke**: a Vercel status of READY, or a deployment-protection login page,
   does not prove the app renders. The `E2E on Preview` check is the evidence.
   For a feature, also exercise the changed flow on the Preview URL.
4. **Sentry**: errors from the Preview arrive with `environment: preview`.

Re-check all of this after every push: evidence applies to one commit.

## Marking the PR ready

Only with, for the final commit: all checks green, the binding line as above,
and the changed flow exercised on the Preview. Put this in the PR description:

- commit SHA and Preview URL
- gates run and their results, including anything skipped
- how the changed flow was exercised
- migrations included, if any, and whether they are safe on existing data

## Never

- Point a Preview at the production Supabase project to unblock a build.
- Turn off Vercel deployment protection, RLS, or a failing check to get green.
- Run `supabase db push`, or edit a preview branch or production by hand.
- Put secret values in the PR, the logs or the repo. Name the variable instead.
- Merge. Merging needs a human's approval of the current revision. Merging to
  the production branch applies the migrations to production.
- Create paid resources (persistent branches, larger compute) without the user
  asking for it.
