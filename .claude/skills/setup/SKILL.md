---
name: setup
description: Set up a new app created from this template, end to end, by driving the Supabase, Vercel, Sentry and GitHub CLIs - local stack, Supabase project, Vercel project and variables, Sentry project and token, branch protection, and a test pull request. Use when the user says set up, configure, bootstrap or provision the template or the app, when ASSISTANT_SETUP_GUIDE.md is mentioned, or when a checklist item of the guide is not done yet.
---

# Setup

You do the setup. The person logs in, approves, and does the steps that only
exist in a browser. Everything else is a CLI command you run.

The stack is fixed: Supabase with Branching, Vercel, Sentry, GitHub. Do not
offer alternatives and do not leave a step out.

Setup is the one piece of work that does not need a claimed issue: beads does
not exist until step 2. Its commits still go through `/verify`.

## Rules

- **One step at a time.** Run the step, run its check, say what happened, then
  go on. If a check fails, stop and fix it. Never report a step as done because
  the command exited 0; the check is the evidence.
- **Look before creating.** Before creating anything, look for it
  (`projects list`, `project list`, `env list`). If it exists, reuse it. A
  tool that is "not found" may only be missing from `PATH`: check before
  installing.
- **Secrets never reach the conversation.** Capture a secret in a shell
  variable and feed it to the command that stores it, inside one command (see
  step 5). Do not print it, not even a prefix; do not write it to a file; do
  not ask the person to paste one. To learn the shape of a JSON response that
  holds secrets, print its keys, never its values.
- **Ask before anything that costs money or is public**: creating the Supabase
  project, enabling Branching, pushing to `main`, changing branch protection,
  changing a setting of a project. One clear question each, with the cost or
  effect stated.
- **Never** run `supabase db push` or `supabase db reset --linked`. The schema
  reaches production through the GitHub integration when `main` is updated.
- **Never** run `vercel integration add supabase`. It creates a different,
  Vercel-billed Supabase project, not the one from step 4.
- The CLIs detect agents: they print JSON, and the Supabase CLI refuses any
  hosted change without `--yes`. Add `--yes` only after the person approved
  that change. Keep stderr out of pipes (`2>/dev/null`).
- CLI flags change. If a command below is rejected, read `<command> --help`
  and adapt; do not guess a second time.

## 0. Tools, logins and accounts

Global npm binaries may not be on your `PATH` (nvm is not loaded in a
non-interactive shell). Start every command with:

```bash
export PATH="$(npm prefix -g)/bin:$PATH"
```

```bash
node -v                       # >= 22.12
docker info >/dev/null && echo docker ok
gh auth status
vercel --version              # npm i -g vercel
bd --version                  # npm i -g @beads/bd
npx supabase projects list    # fails if not logged in
vercel whoami
npx sentry auth status
```

Logins need a real terminal: `!` inside Claude Code is not a TTY and
`supabase login` fails there. Ask the person to run the missing ones in a
separate terminal, in this folder. Logins are stored per user, so you pick
them up:

```
gh auth login
npx supabase login
vercel login
npx sentry auth login
```

Then check the two things that otherwise stop setup much later:

```bash
# 1. Vercel blocks every deployment whose commit author GitHub cannot match to
#    an account. "null" here means the git email is not on the GitHub account.
gh api repos/{owner}/{repo}/commits/HEAD -q .author.login

# 2. Branch protection: 404 "Branch not protected" means it is available;
#    403 "Upgrade to GitHub Pro" means this repository cannot have it.
gh api repos/{owner}/{repo}/branches/main/protection
```

If 1 prints `null`, stop and let the person choose: add and verify the email
at github.com/settings/emails (fixes existing commits too), or set
`git config --local user.email` to their GitHub noreply address (fixes new
commits only). If 2 is a 403, say so now: step 7 will report branch protection
as not done unless the repository becomes public or the plan changes.

**Check:** the eight commands succeed, the commit author has a login, and the
person knows whether branch protection is available.

## 1. Decisions

Ask once, together, and repeat the answers back before continuing:

| Decision          | How to offer it                                                 |
| ----------------- | --------------------------------------------------------------- |
| App name          | lowercase, digits and dashes; used for all three projects       |
| Issue prefix      | 2-12 lowercase letters or digits, e.g. `shop`                   |
| Supabase org      | list from `npx supabase orgs list`; it must be on a paid plan   |
| Supabase region   | closest to the users; list in `npx supabase projects create -h` |
| Vercel team       | list from `vercel teams list`                                   |
| Sentry org        | list from `npx sentry org list`                                 |
| Production domain | default `<app>.vercel.app`; a custom domain can be added later  |

Also confirm here that Supabase Branching is paid: one branch is billed for
every open pull request, whether or not it changes the database. Without that
agreement, stop: the template needs it.

Once the Sentry org is known, one more login step. `sentry auth login` does
not grant what creating a token needs, and the CLI only re-authorizes from an
interactive terminal. Ask the person to run this in their terminal, approve in
the browser, and ignore the token it prints:

```
npx sentry token create <org>/setup-reauth
```

That token is not used. Tell them to revoke `setup-reauth` afterwards in
Sentry → Settings → Auth Tokens.

## 2. Harness and local stack

```bash
npm install
harness/bin/setup <prefix>
npx playwright install chromium
npm run db:start
```

`bd init` (run by the setup script) commits `.beads/` by itself.

Write `.env.local` from `.env.example`, with `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` taken from `npx supabase status -o env`
(local keys are not secrets). Then:

```bash
npm run db:types
npm run test:db
harness/bin/verify --db
```

**Check:** `verify: OK` with all five gates passing, and `git diff --stat`
shows at most `src/types/database.types.ts`. Commit that file if it changed.

## 3. Sentry

```bash
npx sentry project list <org>/ --json            # reuse if <app> exists
npx sentry project create <org>/<app>:javascript-nextjs --json
npx sentry dsn list <org>/<app> --json --fields dsn
```

The DSN is public. Put it in `.env.local` as `NEXT_PUBLIC_SENTRY_DSN`. The
auth token is created in step 5, straight into Vercel.

**Check:** `npx sentry project view <org>/<app>` shows the project.

## 4. Supabase project

Ask for the go-ahead (this creates a billable project), then:

```bash
npx supabase projects list                        # reuse if <app> exists
npx supabase projects create <app> --org-id <org-id> --region <region> \
  --db-password "$(openssl rand -hex 24)" --yes
npx supabase link --project-ref <ref>
```

`link` can fail with "necessary privileges" for about a minute after the
project is created. Wait and run it once more.

The database password is generated and not kept: nothing here needs it. Tell
the person they can reset it in the dashboard if they ever want a direct
connection.

Now make `supabase/config.toml` describe this app. Branching applies the file
to production and to every preview branch, so:

- `[auth] site_url` → `https://<production domain>`
- in `additional_redirect_urls`, replace `<vercel-team-slug>` with the Vercel
  team slug, and add `https://<production domain>/**`
- append this block, so production asks new users to confirm their email
  while local development and preview branches do not:

  ```toml
  [remotes.production]
  project_id = "<ref>"

  [remotes.production.auth.email]
  enable_confirmations = true
  ```

```bash
npx supabase config validate
npx supabase config diff
```

`config diff` lists **every** setting where the file and the new project
differ (OTP length, MFA, and so on), not only the URLs. Show the person the
whole list and say that pushing applies all of it. After they agree:

```bash
npx supabase config push --yes
```

Production sends confirmation emails through Supabase's built-in mail
service, which is rate-limited to a few per hour. Tell the person a custom
SMTP provider is needed before real users sign up.

**Check:** `npx supabase config diff` reports no differences under `auth`.
Differences under `db.pooler` and `storage` remain: `config push` does not
manage them. That is expected.

## 5. Vercel

```bash
vercel project list --scope <team>                 # reuse if <app> exists
vercel project create <app> --scope <team>
vercel link --yes --scope <team> --project <app>
vercel git connect --yes
```

`vercel link` writes `.vercel/project.json` (the `projectId` used below) and
adds a short-lived `VERCEL_OIDC_TOKEN` to `.env.local`. Both are gitignored.

New projects do not report deployments to GitHub, and without that the
`E2E on Preview` workflow never starts. Turn it on:

```bash
printf '{"gitProviderOptions":{"createDeployments":"enabled"}}' \
  | vercel api /v9/projects/<project-id> -X PATCH --input - --raw --scope <team> 2>/dev/null
```

Variables. `--value` is fine for values that are not secret:

```bash
vercel env add SUPABASE_PROD_PROJECT_REF --environment preview --value <ref> --no-sensitive --yes
vercel env add NEXT_PUBLIC_SITE_URL --environment production --value https://<production domain> --no-sensitive --yes
vercel env add NEXT_PUBLIC_SENTRY_DSN --environment production,preview --value <dsn> --no-sensitive --yes
vercel env add SENTRY_ORG --environment production,preview --value <org> --no-sensitive --yes
vercel env add SENTRY_PROJECT --environment production,preview --value <app> --no-sensitive --yes
```

The Sentry token is a secret. Capture it and store it inside one command. Do
not pipe `sentry` straight into `vercel`: the Vercel CLI does not wait for a
slow stdin, and the token is created and lost.

```bash
T="$(npx sentry token create <org>/vercel-<app> --json 2>/dev/null \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).token))')"
[ -n "$T" ] && printf '%s' "$T" \
  | vercel env add SENTRY_AUTH_TOKEN --environment production,preview --sensitive --yes
unset T
```

If the first line fails with "Not allowed to manage org auth tokens", the
re-authorization of step 1 is missing.

Do not add the `NEXT_PUBLIC_SUPABASE_*` variables by hand: the integration in
step 6 owns them.

**Check:** `vercel env list` shows the six variables in the right
environments, and `vercel api /v9/projects/<project-id> --raw` shows
`"createDeployments":"enabled"`.

## 6. The browser steps (person)

These are authorizations between services; no CLI does them. Give the person
the exact link and settings, and wait until they confirm each one.

**A. Supabase → GitHub** (this is what enables Branching).
`https://supabase.com/dashboard/project/<ref>/settings/integrations`

- Authorize GitHub and choose this repository
- Supabase directory: `supabase`
- Production branch: `main`
- Automatic branching: on
- **Supabase changes only: off.** It is on by default, and with it a pull
  request that does not touch `supabase/` gets no branch, so its Preview has
  no database and its build fails.
- Deploy to production: on

**B. Supabase → Vercel** (this is what points each Preview at its branch).
Same page, Vercel integration: connect the Vercel project `<app>` and enable
environment variable sync for **Production** and **Preview**.

The integration adds about fifteen variables, not two: among them
`POSTGRES_*`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` and
`SUPABASE_JWT_SECRET`. The app only reads the two public ones and
`SUPABASE_SECRET_KEY`; tell the person the rest exist.

**Check:**

- `npx supabase branches list` shows `main` bound to the git branch `main`.
- `vercel env list` shows `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for production.
- "Supabase changes only" cannot be read from a CLI. Step 8 proves it.

## 7. GitHub

The bypass secret lets the `E2E on Preview` workflow through Vercel's
deployment protection. Generate it in Vercel and store it in GitHub inside
one command:

```bash
S="$(printf '{"generate":{}}' \
  | vercel api /v1/projects/<project-id>/protection-bypass -X PATCH --input - --raw --scope <team> 2>/dev/null \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(Object.keys(JSON.parse(s).protectionBypass)[0]))')"
[ -n "$S" ] && printf '%s' "$S" | gh secret set VERCEL_AUTOMATION_BYPASS_SECRET
unset S
```

Run `/verify` on the setup changes (`supabase/config.toml`, generated types),
commit them and, after the person agrees, push to `main`. That push applies
the first migration to production and makes the first Production deployment.

```bash
gh run list --branch main --limit 3
npx supabase migration list --remote       # the migration is applied
vercel list --prod                         # the deployment is Ready, not Blocked
```

Then protect `main`, if step 0 found it available (ask first). The required
checks are the job names:

```bash
gh api -X PUT repos/{owner}/{repo}/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": {
    "strict": false,
    "contexts": [
      "Gates and build",
      "Database (migrations, lint, RLS tests)",
      "Supabase Preview"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON
```

**Check:** `gh secret list` shows the secret; the migration is applied; the
Production deployment is Ready; and branch protection lists the three checks,
or is reported as not available.

## 8. Prove it with a pull request

Create a branch whose only change is outside `supabase/` (that is what proves
"Supabase changes only" is off), push it and open a **draft** pull request.
Then follow the `preview-deploy` skill.

Supabase decides whether a pull request gets a branch when it is **opened**.
If `Supabase Preview` says the pull request was ignored, the option in 6A is
still on: have the person turn it off, then close the pull request and open a
new one. Pushing more commits to the ignored one does not help.

Setup is done only when, for that pull request:

- `gh pr checks --watch` ends with `Gates and build`, `Database`,
  `Supabase Preview`, `Vercel` and `Smoke tests` (the `E2E on Preview`
  workflow) green;
- the Vercel build log has a `preview-binding:` line with
  `"productionGuard":"checked"`;
- a user created on the Preview does **not** exist in production;
- `/sentry-example-page` on the Preview produces an issue in Sentry with
  `environment: preview` (`npx sentry issue list <org>/<app>`).

The Preview is behind deployment protection. To reach it, read the bypass
secret from the Vercel project API into a shell variable inside one command
and send it as the `x-vercel-protection-bypass` header; never print it. To
show a user is not in production, sign in with the same credentials against
each project's Auth API using its publishable key: the preview branch accepts
them and production answers `invalid_credentials`.

The first deployment of a pull request can fail with
`Preview deployment is missing NEXT_PUBLIC_SUPABASE_URL` while the Supabase
branch is still being created; Supabase redeploys when it is ready. If
`Supabase Preview` passed and the build still fails with that message, the
Vercel integration of 6B is not syncing Preview.

Close the pull request without merging and delete its branch
(`gh pr close <n> --delete-branch`); the Supabase branch goes with it.

Then delete `src/app/sentry-example-page/` and
`src/app/api/sentry-example-api/`, remove them from `src/lib/routes.ts` and
from the README, delete `.next/dev/types` (it still refers to the deleted
route and fails the typecheck), run `/verify`, commit and, after the person
agrees, push.

## 9. Agent tooling

Tell the person to approve the five MCP servers the first time Claude Code
asks, and to add these two lines to their shell profile. Without the first,
the Supabase server points at the local stack and only connects while
`npm run db:start` is running.

```bash
export SUPABASE_MCP_URL="https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true&features=database,docs,branching"
export SENTRY_MCP_URL="https://mcp.sentry.dev/mcp/<org>/<app>"
```

## Report

End with the checklist from `ASSISTANT_SETUP_GUIDE.md`, each item marked done,
failed or not done, with the evidence for each, and anything left behind for
the person to clean up. Then suggest `/intent`.
