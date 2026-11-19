# Setup guide

Step-by-step setup for an app created from this template: local development,
Supabase, Vercel with a Preview per pull request, Sentry, and the agent harness.

The template is opinionated: every section is required and they are done in
order. Setup is finished when the checklist at the end is complete.

## For the AI assistant

If you are an agent guiding a person through this:

- Go one section at a time. After each, run its **Check** and confirm it passed
  before moving on.
- Do what can be done from the terminal yourself. Steps marked **(person)**
  happen in a dashboard: say exactly what to click and wait for confirmation.
- Never ask the person to paste a secret into the chat. Tell them which file or
  dashboard field it goes in.
- Never run `supabase db push`, and do not create paid resources without the
  person agreeing first. Supabase Branching (section 5) is paid.
- If a step fails, read the error and the Troubleshooting section before
  retrying. Do not skip a check to keep going.
- Do not offer alternatives to the stack or leave a section out. If the person
  wants a different service, say that this template does not cover it.

## 0. What you need

| Tool       | Check             | Needed for                      | Install                             |
| ---------- | ----------------- | ------------------------------- | ----------------------------------- |
| Node.js    | `node -v` ≥ 22.12 | everything                      | https://nodejs.org                  |
| git        | `git --version`   | everything                      |                                     |
| beads      | `bd --version`    | the harness's issue tracker     | `npm i -g @beads/bd`                |
| Docker     | `docker info`     | local Supabase, database tests  | https://docs.docker.com/get-docker/ |
| GitHub CLI | `gh auth status`  | pull requests from the terminal | https://cli.github.com              |

Accounts: GitHub, [Supabase](https://supabase.com), [Vercel](https://vercel.com),
[Sentry](https://sentry.io).

## 1. Create your repository

1. **(person)** On GitHub, open the template repository and choose
   **Use this template → Create a new repository**.
2. Clone it and install:

   ```bash
   git clone <your-repo-url> && cd <your-repo>
   npm install
   ```

**Check:** `npm run dev` serves http://localhost:3000 with a notice that
Supabase is not configured yet. Stop it with Ctrl+C.

## 2. Harness

```bash
harness/bin/setup <prefix>
```

`<prefix>` is a short name for your issues (2–12 lowercase letters or digits),
for example `shop` gives `shop-a1b`. The script checks the tools, initialises
beads and commits its configuration.

**Check:** `bd status` prints a summary, and `harness/bin/verify --no-e2e`
ends with `verify: OK`.

To run the browser gate locally, install the browser once:
`npx playwright install chromium`.

## 3. Local Supabase

```bash
npm run db:start
```

The first run downloads the Docker images. When it finishes it prints the local
URL and keys.

```bash
cp .env.example .env.local
```

**(person)** In `.env.local`, set `NEXT_PUBLIC_SUPABASE_URL` to the printed
API URL and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the printed publishable
key.

Then regenerate the database types once, so they match what your Supabase
version generates, and commit the result:

```bash
npm run db:types
```

**Check:**

- `npm run test:db` passes (RLS tests).
- `npm run dev`, then sign up at http://localhost:3000/sign-up. You land on
  `/profile` with your email, name and the `member` role.
- Local emails, if you turn confirmations on, appear at http://localhost:54324.

## 4. Supabase project (production)

1. **(person)** Create a project at https://supabase.com/dashboard. Choose the
   region closest to your users and save the database password in a password
   manager.
2. **(person)** In **Authentication → URL Configuration**, set the Site URL to
   your production URL (you can update it after section 6).
3. Open `supabase/config.toml` and, in `additional_redirect_urls`, replace
   `<vercel-team-slug>` with your Vercel team or account slug. This lets auth
   links return to any Preview deployment. Commit the change.
4. The first migration is applied to this project when the GitHub integration
   is connected (section 5) and the change reaches your production branch. Do
   not push the schema by hand.

## 5. Supabase Branching (a database per pull request)

Branching is required: it is what gives each pull request its own database. It
is a paid Supabase feature, billed for each branch while it is active, so
confirm with whoever pays before enabling it.

1. **(person)** In the Supabase dashboard: **Project Settings → Integrations →
   GitHub**. Authorize and choose your repository.
2. **(person)** Set:
   - **Supabase directory:** `supabase` (the working directory is the repo root)
   - **Production branch:** `main`
   - **Automatic branching:** on
   - **Deploy to production:** on (merging to `main` applies new migrations)
3. **(person)** In GitHub **Settings → Branches**, protect `main` and add
   **Supabase Preview** and **CI** as required status checks.

**Check:** after section 6, opening a pull request shows a comment from
Supabase with the status of its preview branch.

## 6. Vercel

1. **(person)** At https://vercel.com/new, import the repository. The framework
   is detected as Next.js. Deploy; the first deployment works without any
   variable.
2. **(person)** Install the Supabase integration: Vercel **Marketplace →
   Supabase → Connect** to the project from section 4, and enable syncing
   environment variables for **Production** and **Preview**. This sets
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for
   production, and for every Preview the values of its own branch.
3. **(person)** In Vercel **Settings → Environment Variables** add:

   | Variable                    | Environment | Value                                                     |
   | --------------------------- | ----------- | --------------------------------------------------------- |
   | `SUPABASE_PROD_PROJECT_REF` | Preview     | the project ref from section 4 (the subdomain of its URL) |
   | `NEXT_PUBLIC_SITE_URL`      | Production  | your production URL                                       |

4. **(person)** For the `E2E on Preview` workflow: Vercel **Settings →
   Deployment Protection → Protection Bypass for Automation**, create a secret,
   and add it to GitHub as the repository secret
   `VERCEL_AUTOMATION_BYPASS_SECRET`.
5. **(person)** In Supabase **Authentication → URL Configuration**, set the
   Site URL to the production URL and add
   `https://*-<vercel-team-slug>.vercel.app/**` to the redirect URLs.

**Check:** open a draft pull request with a trivial change.

- GitHub shows the checks `CI`, `Supabase Preview`, `Vercel` and
  `E2E on Preview`, all green.
- The Vercel build log of the Preview contains a line starting with
  `preview-binding:` with `"productionGuard":"checked"`.
- On the Preview URL you can sign up, and the new user does **not** appear in
  the production project's Authentication page.

The very first deployment of a pull request can fail with
`Preview deployment is missing NEXT_PUBLIC_SUPABASE_URL`: the variables are
synced when the pull request opens and Supabase redeploys once the branch is
ready. Wait for that redeploy.

## 7. Sentry

1. **(person)** Create a project at https://sentry.io with the Next.js
   platform. Copy the DSN.
2. **(person)** Create an auth token: **Settings → Auth Tokens**, with
   permission to upload source maps (organization token).
3. **(person)** Set the variables:

   | Variable                 | Where                                      |
   | ------------------------ | ------------------------------------------ |
   | `NEXT_PUBLIC_SENTRY_DSN` | `.env.local`; Vercel (Production, Preview) |
   | `SENTRY_ORG`             | Vercel (Production, Preview)               |
   | `SENTRY_PROJECT`         | Vercel (Production, Preview)               |
   | `SENTRY_AUTH_TOKEN`      | Vercel (Production, Preview), as sensitive |

   All four are required. The token is what uploads source maps, so stack
   traces in Sentry point at your code.

**Check:** `npm run dev`, open http://localhost:3000/sentry-example-page and
click the button. Two issues appear in Sentry within a minute, one from the
browser and one from the server, with `environment: development`. Errors from
Previews arrive as `preview` and from production as `production`.

Once verified, delete `src/app/sentry-example-page/` and
`src/app/api/sentry-example-api/`, and remove them from `src/lib/routes.ts`.

## 8. Agent tooling

`.mcp.json` declares MCP servers for Claude Code. Each one asks for approval the
first time, and the hosted ones ask you to sign in.

| Server          | Gives the agent                                   | Notes                       |
| --------------- | ------------------------------------------------- | --------------------------- |
| `next-devtools` | errors, routes and logs of the running dev server | needs `npm run dev`         |
| `shadcn`        | the shadcn/ui component registry                  |                             |
| `supabase`      | schema, docs, branches                            | defaults to the local stack |
| `sentry`        | issues and traces                                 |                             |
| `vercel`        | deployments and build logs                        |                             |

Approve all five. The Supabase server points at the local stack by default. To
point it at a hosted project, and to scope Sentry to your project, export these
in your shell before starting Claude Code. For Supabase use a preview branch,
keep `read_only=true`, and never use the production project:

```bash
export SUPABASE_MCP_URL="https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true&features=database,docs,branching"
export SENTRY_MCP_URL="https://mcp.sentry.dev/mcp/<org-slug>/<project-slug>"
```

## 9. Start building

In Claude Code:

1. `/intent` and describe the product: who it is for and what they need to do.
2. `/plan-to-beads` to turn the first feature into an epic and issues.
3. "Work on `<issue id>`", then `/verify`, then `/ship`.

## Checklist

- [ ] `harness/bin/setup <prefix>` ran; `bd status` works
- [ ] Local sign-up works; `npm run test:db` passes
- [ ] `src/types/database.types.ts` regenerated and committed
- [ ] `<vercel-team-slug>` replaced in `supabase/config.toml`
- [ ] Supabase GitHub integration connected; `Supabase Preview` is a required check
- [ ] Vercel project deployed; Supabase integration syncing Production and Preview
- [ ] `SUPABASE_PROD_PROJECT_REF` set for the Preview environment
- [ ] `VERCEL_AUTOMATION_BYPASS_SECRET` set in GitHub
- [ ] A test pull request shows all four checks green and the `preview-binding` line
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
the redirect allow-list (sections 4 and 6), so Supabase fell back to the Site
URL.

**`E2E on Preview` gets a Vercel login page.** The
`VERCEL_AUTOMATION_BYPASS_SECRET` repository secret is missing or does not
match the one in Vercel.

**No events in Sentry.** `NEXT_PUBLIC_SENTRY_DSN` is unset in that environment,
or an ad blocker is active and the `/monitoring` tunnel path was removed from
the proxy matcher in `src/proxy.ts`.
