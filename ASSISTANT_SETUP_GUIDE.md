# Setup guide

Setup for an app created from this template: local development, Supabase with
a database per pull request, Vercel with a Preview per pull request, Sentry,
and the agent harness.

The template is opinionated: every part is required. Setup is finished when the
checklist at the end is complete.

## How it works

Open the repository in Claude Code and run **`/setup`**. The agent runs every
step with the service CLIs (`supabase`, `vercel`, `sentry`, `gh`) and checks
each one before moving on. The commands are in
[`.claude/skills/setup/SKILL.md`](./.claude/skills/setup/SKILL.md); this guide
says what happens and what is left to you.

## For the AI assistant

Load the `setup` skill and follow it. In short: one step at a time with its
check, look before creating, secrets go from one command into the next and
never into the conversation, ask before anything paid or public, and never run
`supabase db push`. Do not offer alternatives to the stack.

## What you need

| Tool       | Check             | Install                             |
| ---------- | ----------------- | ----------------------------------- |
| Node.js    | `node -v` ≥ 22.12 | https://nodejs.org                  |
| git        | `git --version`   |                                     |
| Docker     | `docker info`     | https://docs.docker.com/get-docker/ |
| GitHub CLI | `gh --version`    | https://cli.github.com              |
| Vercel CLI | `vercel -v`       | `npm i -g vercel`                   |
| beads      | `bd --version`    | `npm i -g @beads/bd`                |

The Supabase and Sentry CLIs are installed by `npm install` (`npx supabase`,
`npx sentry`).

Accounts: GitHub, [Supabase](https://supabase.com), [Vercel](https://vercel.com)
and [Sentry](https://sentry.io). Supabase Branching is a paid feature, billed
for each branch while it is active.

Create your repository from the template on GitHub (**Use this template →
Create a new repository**), clone it, and start Claude Code in it.

## What the agent does

| Step                 | Result                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Harness, local stack | beads initialised, local Supabase running, `.env.local`, types regenerated, gates passing  |
| Sentry               | project created, DSN in `.env.local` and Vercel                                            |
| Supabase             | project created and linked, Auth URLs set from `supabase/config.toml`                      |
| Vercel               | project created, connected to the repository, variables set, Sentry token stored as secret |
| GitHub               | bypass secret for `E2E on Preview`, `main` protected with the required checks              |
| Proof                | a draft pull request with all checks green, then closed                                    |

## What you do

1. **Log in** to each CLI when asked (`gh auth login`, `npx supabase login`,
   `vercel login`, `npx sentry auth login`). Each opens a browser.
2. **Decide** once: app name, issue prefix, Supabase organisation and region,
   Vercel team, Sentry organisation, production domain.
3. **Approve** what costs money or is public: creating the Supabase project,
   Branching, the push to `main`, branch protection.
4. **Authorize two integrations** in the Supabase dashboard, at
   **Project Settings → Integrations**. The agent gives you the link and waits.
   - **GitHub**: choose the repository; Supabase directory `supabase`;
     production branch `main`; automatic branching on; deploy to production on.
     This is what gives each pull request its own database.
   - **Vercel**: connect the Vercel project and enable environment variable
     sync for **Production** and **Preview**. This is what points each Preview
     at its own branch.
5. **Approve the MCP servers** the first time Claude Code asks (`next-devtools`,
   `shadcn`, `supabase`, `sentry`, `vercel`), and add the two `export` lines
   the agent gives you to your shell profile.

Never paste a secret into the chat. The agent does not need one from you.

## After setup

Delete `src/app/sentry-example-page/` and `src/app/api/sentry-example-api/`,
and remove them from `src/lib/routes.ts`. Then, in Claude Code:

1. `/intent` and describe the product: who it is for and what they need to do.
2. `/plan-to-beads` to turn the first feature into an epic and issues.
3. "Work on `<issue id>`", then `/verify`, then `/ship`.

## Checklist

- [ ] All CLIs installed and logged in
- [ ] `harness/bin/setup <prefix>` ran; `bd status` works
- [ ] Local sign-up works; `npm run test:db` passes
- [ ] `src/types/database.types.ts` regenerated and committed
- [ ] `site_url` and `<vercel-team-slug>` set in `supabase/config.toml` and pushed
- [ ] Supabase GitHub integration connected; `main` protected with the three required checks
- [ ] Vercel project deployed; Supabase integration syncing Production and Preview
- [ ] `SUPABASE_PROD_PROJECT_REF` set for the Preview environment
- [ ] `VERCEL_AUTOMATION_BYPASS_SECRET` set in GitHub
- [ ] A test pull request shows all checks green and the `preview-binding` line
- [ ] Sentry receives the sample errors; example page deleted
- [ ] MCP servers approved in Claude Code
- [ ] `INTENT.md` filled in

## Troubleshooting

**`npm run db:start` fails.** Docker is not running, or ports 54321–54324 are
taken. `npx supabase stop --no-backup` clears a half-started stack.

**Sign-up says "Supabase is not configured".** `.env.local` is missing the two
`NEXT_PUBLIC_SUPABASE_*` values, or the dev server was not restarted after
editing it.

**Signed out at random, or a redirect loop on `/login`.** Something was added
to `src/lib/supabase/proxy.ts` between creating the client and `getClaims()`,
or the function returns a different response object than the one carrying the
cookies.

**"permission denied for table" from the app.** The table has no grant for the
`authenticated` role, or no policy matches. Every table needs both; see
`supabase/migrations/` for the pattern.

**`Supabase Preview` check fails.** Read its comment on the pull request. Usual
causes: a migration that cannot run in a transaction
(`create index concurrently`), or one that depends on data that only exists in
production.

**Preview build fails with "points at the PRODUCTION Supabase project".**
Working as intended. The Preview environment in Vercel has production Supabase
variables set by hand; remove them and let the integration sync the branch
values.

**Confirmation email link goes to the wrong site.** The Preview URL is not in
the redirect allow-list (`additional_redirect_urls` in `supabase/config.toml`),
so Supabase fell back to the Site URL.

**`E2E on Preview` gets a Vercel login page.** The
`VERCEL_AUTOMATION_BYPASS_SECRET` repository secret is missing or does not
match the one in Vercel.

**No events in Sentry.** `NEXT_PUBLIC_SENTRY_DSN` is unset in that environment,
or an ad blocker is active and the `/monitoring` tunnel path was removed from
the proxy matcher in `src/proxy.ts`.
