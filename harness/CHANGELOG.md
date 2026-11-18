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
