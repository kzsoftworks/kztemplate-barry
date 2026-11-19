# Skills in this repo

Skills are copied into the repo, not installed as plugins, so they work the
same on every machine and in cloud sessions, and changes to them go through
review like any other code.

## Written for this repo

| Skill                  | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `setup`                | Sets up a new app end to end with the service CLIs         |
| `intent`               | Process step 1: keep `INTENT.md` current                   |
| `plan-to-beads`        | Process step 2: epic + issues in beads                     |
| `verify`               | Gates and review loop                                      |
| `ship`                 | Close out an issue                                         |
| `supabase-nextjs-auth` | How Supabase Auth and data access are wired in this repo   |
| `preview-deploy`       | Pull request + Vercel Preview + Supabase branch protocol   |

These are part of the harness: change them through a `harness` issue and a
`harness/CHANGELOG.md` entry.

## Vendored from upstream

Installed with the [`skills`](https://github.com/vercel-labs/skills) CLI in
copy mode. The exact commit and content hash of each one is in
`skills-lock.json` at the repo root. Do not edit these by hand: local edits are
lost on update.

| Skill                              | Source                      | Licence    |
| ---------------------------------- | --------------------------- | ---------- |
| `supabase`                         | `supabase/agent-skills`     | MIT        |
| `supabase-postgres-best-practices` | `supabase/agent-skills`     | MIT        |
| `vercel-react-best-practices`      | `vercel-labs/agent-skills`  | MIT        |
| `vercel-composition-patterns`      | `vercel-labs/agent-skills`  | MIT        |
| `next-dev-loop`                    | `vercel/next.js`            | MIT        |
| `shadcn`                           | `shadcn-ui/ui`              | MIT        |
| `sentry-instrument`                | `getsentry/sentry-for-ai`   | Apache-2.0 |
| `sentry-debug-issue`               | `getsentry/sentry-for-ai`   | Apache-2.0 |

Update one with:

```bash
npx skills update <skill> -p -y
```

Review the diff before committing: a skill is instructions that agents will
follow with the permissions of the session.

## Considered and left out

- **Vendor plugins** (Vercel, Supabase, Sentry): they bundle the same skills
  and MCP servers this repo already configures, so tools would be duplicated.
- **`web-design-guidelines`**: downloads its rules from a URL on every use, so
  its content cannot be reviewed or pinned.
- **`superpowers` and similar workflow packs**: they bring their own planning
  and review process, which would compete with the one in `CLAUDE.md`.
- **A "Next.js knowledge" skill**: Next.js 16 ships its documentation in
  `node_modules/next/dist/docs/` and maintains the pointer in `AGENTS.md`.
