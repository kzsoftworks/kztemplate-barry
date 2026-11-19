---
name: setup
description: Set up a new app created from this template, end to end, by driving the Supabase, Vercel, Sentry and GitHub CLIs - local stack, Supabase project, Vercel project and variables, Sentry project and token, branch protection, and a test pull request. Use when the user says set up, configure, bootstrap or provision the template or the app, when ASSISTANT_SETUP_GUIDE.md is mentioned, or when a checklist item of the guide is not done yet.
---

# Setup

You do the setup. The person logs in, approves, and does the two steps that
only exist in a browser. Everything else is a CLI command you run.

The stack is fixed: Supabase with Branching, Vercel, Sentry, GitHub. Do not
offer alternatives and do not leave a step out.

Setup is the one piece of work that does not need a claimed issue: beads does
not exist until step 2.

## Rules

- **One step at a time.** Run the step, run its check, say what happened, then
  go on. If a check fails, stop and fix it. Never report a step as done because
  the command exited 0; the check is the evidence.
- **Every step is safe to run again.** Before creating anything, look for it
  (`projects list`, `project list`, `env list`). If it exists, reuse it.
- **Secrets never reach the conversation.** Pipe them from the command that
  produces them into the command that stores them. Do not print them, do not
  put them in a file, do not ask the person to paste one.
- **Ask before anything that costs money or is public**: creating the Supabase
  project, enabling Branching, pushing to `main`, changing branch protection.
  One clear question each, with the cost or effect stated.
- **Never** run `supabase db push` or `supabase db reset --linked`. The schema
  reaches production through the GitHub integration when `main` is updated.
- **Never** run `vercel integration add supabase`. It creates a different,
  Vercel-billed Supabase project, not the one from step 4.
- CLI flags change. If a command below is rejected, read `<command> --help`
  and adapt; do not guess a second time.

## 0. Tools and logins

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

For each one that is not logged in, ask the person to run it themselves (in
Claude Code: type `!` followed by the command), because it opens a browser:

```
! gh auth login
! npx supabase login
! vercel login
! npx sentry auth login
```

**Check:** all eight commands above succeed.

## 1. Decisions

Ask once, together, and repeat the answers back before continuing:

| Decision          | How to offer it                                                  |
| ----------------- | ---------------------------------------------------------------- |
| App name          | lowercase, digits and dashes; used for all three projects        |
| Issue prefix      | 2-12 lowercase letters or digits, e.g. `shop`                    |
| Supabase org      | list from `npx supabase orgs list`                               |
| Supabase region   | closest to the users; list in `npx supabase projects create -h`  |
| Vercel team       | list from `vercel teams list`                                    |
| Sentry org        | list from `npx sentry org list`                                  |
| Production domain | default `<app>.vercel.app`; a custom domain can be added later   |

Also confirm here that Supabase Branching is paid, billed per active branch,
and that the person accepts it. Without that, stop: the template needs it.

## 2. Harness and local stack

```bash
npm install
harness/bin/setup <prefix>
npx playwright install chromium
npm run db:start
```

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
npx supabase projects list --output-format json   # reuse if <app> exists
npx supabase projects create <app> --org-id <org-id> --region <region> \
  --db-password "$(openssl rand -hex 24)"
npx supabase link --project-ref <ref>
```

The database password is generated and not kept: nothing here needs it. Tell
the person they can reset it in the dashboard if they ever want a direct
connection.

Now make `supabase/config.toml` describe production, because Branching
applies this file to the project and to every preview branch:

- `[auth] site_url` → `https://<production domain>`
- in `additional_redirect_urls`, replace `<vercel-team-slug>` with the Vercel
  team slug, and add `https://<production domain>/**`

```bash
npx supabase config diff          # show the person the diff
npx supabase config push --yes    # after they agree
```

**Check:** `npx supabase config diff` reports no differences.

## 5. Vercel

```bash
vercel project list --scope <team>                 # reuse if <app> exists
vercel project create <app> --scope <team>
vercel link --yes --scope <team> --project <app>
vercel git connect --yes
```

Variables. `--value` is fine for values that are not secret:

```bash
vercel env add SUPABASE_PROD_PROJECT_REF --environment preview --value <ref> --no-sensitive --yes
vercel env add NEXT_PUBLIC_SITE_URL --environment production --value https://<production domain> --no-sensitive --yes
vercel env add NEXT_PUBLIC_SENTRY_DSN --environment production,preview --value <dsn> --no-sensitive --yes
vercel env add SENTRY_ORG --environment production,preview --value <org> --no-sensitive --yes
vercel env add SENTRY_PROJECT --environment production,preview --value <app> --no-sensitive --yes
```

The Sentry token is a secret: create it and store it in one pipe. Run
`npx sentry token create <org>/vercel-<app> --dry-run --json` first to see
the name of the field that holds the token, then:

```bash
npx sentry token create <org>/vercel-<app> --json \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).<field>))' \
  | vercel env add SENTRY_AUTH_TOKEN --environment production,preview --sensitive --yes
```

Do not add the `NEXT_PUBLIC_SUPABASE_*` variables by hand: the integration in
step 6 owns them.

**Check:** `vercel env list` shows the six variables in the right
environments.

## 6. The two browser steps (person)

These are authorizations between services; no CLI does them. Give the person
the exact link and settings, and wait until they confirm each one.

**A. Supabase → GitHub** (this is what enables Branching).
`https://supabase.com/dashboard/project/<ref>/settings/integrations`

- Authorize GitHub and choose this repository
- Supabase directory: `supabase`
- Production branch: `main`
- Automatic branching: on
- Deploy to production: on

**B. Supabase → Vercel** (this is what points each Preview at its branch).
Same page, Vercel integration: connect the Vercel project `<app>` and enable
environment variable sync for **Production** and **Preview**.

**Check:** `vercel env list` now also shows `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for production.

## 7. GitHub

The bypass secret lets the `E2E on Preview` workflow through Vercel's
deployment protection. Generate it in Vercel and store it in GitHub in one
pipe. Confirm the endpoint first with `vercel api list | grep -i bypass`:

```bash
printf '{"generate":{}}' \
  | vercel api /v1/projects/<project-id>/protection-bypass -X PATCH --input - --raw --scope <team> \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(Object.keys(JSON.parse(s).protectionBypass)[0]))' \
  | gh secret set VERCEL_AUTOMATION_BYPASS_SECRET
```

If that endpoint is not available, this becomes a third browser step: Vercel →
Project → Settings → Deployment Protection → Protection Bypass for Automation,
then the person runs `! gh secret set VERCEL_AUTOMATION_BYPASS_SECRET`.

Commit the setup changes (`supabase/config.toml`, generated types, `.beads/`)
and, after the person agrees, push to `main`. That push is what applies the
first migration to production.

Then protect `main` (ask first). The required checks are the job names:

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

**Check:** `gh secret list` shows the secret, and
`gh api repos/{owner}/{repo}/branches/main/protection` lists the three checks.

## 8. Prove it with a pull request

Create a branch with a trivial change, push it and open a **draft** pull
request. Then follow the `preview-deploy` skill. Setup is done only when, for
that pull request:

- `gh pr checks --watch` ends with `Gates and build`, `Database`,
  `Supabase Preview`, `Vercel` and `Smoke tests` (the `E2E on Preview`
  workflow) green;
- the Vercel build log has a `preview-binding:` line with
  `"productionGuard":"checked"`;
- a sign-up on the Preview URL creates a user that is **not** in the
  production project;
- `/sentry-example-page` on the Preview produces an issue in Sentry with
  `environment: preview` (`npx sentry issue list <org>/<app>`).

The first deployment of a pull request can fail with
`Preview deployment is missing NEXT_PUBLIC_SUPABASE_URL`: the variables arrive
when the Supabase branch is ready, and Supabase redeploys. Wait for it.

Close the pull request without merging, delete the branch, and delete the
Sentry example page and route as the guide says.

## 9. Agent tooling

Tell the person to approve the five MCP servers the first time Claude Code
asks, and to add these two lines to their shell profile:

```bash
export SUPABASE_MCP_URL="https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true&features=database,docs,branching"
export SENTRY_MCP_URL="https://mcp.sentry.dev/mcp/<org>/<app>"
```

## Report

End with the checklist from `ASSISTANT_SETUP_GUIDE.md`, each item marked done,
failed or not done, with the evidence for each. Then suggest `/intent`.
