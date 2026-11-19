# Harness changelog

Every change to the harness (skills, `POLICY.md`, `CLAUDE.md`, `harness/`,
`.claude/`) gets an entry here with the issue or recorded event that justifies
it. Newest first.

The harness improves in phases, each with an entry condition:

1. **Manual, with evidence** (now). Each change is an issue labelled `harness`
   plus an entry here. Meanwhile the process collects events
   (`.harness/events.jsonl`), `LEARNINGS:` notes, `POLICY-GAP` notes and
   `eval-candidate` issues.
2. **Proposals a person approves.** Enters at about 20 closed issues: a review
   that crosses recorded gate and rework results with the notes in beads and
   proposes changes as issues.
3. **Loop gated by evals.** Enters at about 30 stable evals in
   `harness/evals/`: propose, re-run the evals in a worktree, open a pull
   request only if it improves without regressions. Never merged automatically.

## v0.3 - 2026-11-19

`/setup` was run end to end by an agent on a throwaway repository with real
Supabase, Vercel and Sentry accounts. The run reached a green test pull
request (checks, preview binding, a user isolated from production, Sentry
tagged `preview`) and the migration and RLS tests passed in CI. Docker was not
available, so the local stack of step 2 is still unverified. Everything below
comes from that run's notes.

- Logins go in a separate terminal; `!` in Claude Code is not a TTY.
- Global binaries are resolved through `npm prefix -g` before being reported
  missing.
- Step 0 checks that the commit author maps to a GitHub account (Vercel blocks
  deployments otherwise) and whether the repository can have branch protection.
- Sentry needs a re-authorization before a token can be created.
- `supabase projects create` needs `--yes`; `link` is retried once.
- `config push` applies every difference, which the skill now says; its check
  is "no differences under `auth`", since pooler and storage are not managed.
- Production gets email confirmation through `[remotes.production]`. Before,
  Branching would have applied the local setting (off) to production.
- New Vercel projects need `createDeployments` enabled, or `E2E on Preview`
  never triggers.
- Secrets are captured in a variable and then stored; piping `sentry` into
  `vercel env add` lost the token to a race.
- "Supabase changes only" must be off, or pull requests without database
  changes get no branch and fail their Preview build.
- `preview-deploy` and the guide's troubleshooting cover the same failures.
- With Docker available: the migration applies locally, the 12 RLS tests and
  `db lint` pass, and `src/types/database.types.ts` is now generated instead
  of hand-written. Local analytics is off in `supabase/config.toml`: with it
  on, the stack plus the e2e gate ran out of memory on a 4 GB machine.

## v0.2 - 2026-11-19

- **`/setup` skill.** Setup was a guide in prose with every cloud step done by
  hand in a dashboard. The skill drives the Supabase, Vercel, Sentry and
  GitHub CLIs instead; two authorizations in the Supabase dashboard stay
  manual. Requested by the template owner; no issue, beads is not initialised
  in the template itself. Not yet run against real accounts.
- `harness/bin/setup` now requires Docker, `gh` and `vercel`: the template is
  opinionated and setup needs all of them.
- `sentry` (the Sentry CLI) is a direct dev dependency, so `npx sentry` does
  not depend on a transitive install.

## v0.1 - 2026-11-18

Initial harness for the Next.js + Supabase + Sentry + Vercel template,
reconstructed from the "Tu Tarotero de Bolsillo" harness v0.1.

- Process: `/intent`, `/plan-to-beads`, `/verify`, `/ship`, `reviewer`
  subagent, `INTENT.md`, `POLICY.md`, `CLAUDE.md`.
- State: beads, initialised per app by `harness/bin/setup <prefix>`;
  `bd prime` runs from the SessionStart hook in `.claude/settings.json`.
- Gates: `harness/bin/verify` (typecheck, lint, test, e2e; optional `--db`).
- Record: `harness/bin/lf-score` writes `.harness/events.jsonl` and a
  per-session context. Local only.
- Stack skills: `supabase-nextjs-auth`, `preview-deploy`, plus the vendored
  skills listed in `.claude/skills/VENDORED.md`.

Differences from the original, on purpose:

- **No Langfuse.** The original sends every Claude turn and every process step
  to a self-hosted Langfuse. Here `lf-score` keeps the same interface but only
  writes the local log, so a sender can be added later without touching the
  skills.
- **`gate.db`** is an extra, opt-in gate for the Supabase schema.
