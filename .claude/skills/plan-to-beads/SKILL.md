---
name: plan-to-beads
description: Turn an agreed request from INTENT.md into a beads epic with issues, acceptance criteria and dependencies. Use after /intent, or when the user asks to plan, break down or schedule a feature. Second step of the harness process.
---

# /plan-to-beads

A request becomes one **epic** and a set of **issues** in beads (`bd`). Each
issue is small enough for one session to build, verify and review.

## Steps

1. Mark the phase:

   ```bash
   harness/bin/lf-score phase plan
   ```

2. Read the request's entry in `INTENT.md`, then `POLICY.md`, then the code the
   request touches. Check existing work first so you do not duplicate it:

   ```bash
   bd search "<keywords>"
   bd list --status=open
   ```

3. Design the breakdown before creating anything. A good issue:
   - delivers one verifiable slice (a migration with its RLS policies and
     tests; a server action with its form; a page with its e2e check)
   - has acceptance criteria someone else could check without asking you
   - names the gates that must pass and any new test it must add
   - is ordered so the database comes before the code that reads it

   For this stack, schema changes are their own issue and come first:
   migration + RLS policies + pgTAP test + regenerated types.

4. Show the breakdown to the user and get agreement. Then create it:

   ```bash
   EPIC=$(bd create "<outcome, as in INTENT.md>" -t epic \
     -d "<why, link to the INTENT.md entry>" --silent)

   bd create "<issue title>" -t task --parent "$EPIC" \
     -d "<what and why>" \
     --acceptance "<checkable criteria, one per line>" --silent
   ```

   Children get ids like `<epic>.1`, `<epic>.2`.

5. Add the dependencies (the first issue depends on the second):

   ```bash
   bd dep add <issue> <depends-on>
   ```

6. Verify the plan reads correctly and tell the user what is ready to start:

   ```bash
   bd show "$EPIC" --children
   bd ready --parent "$EPIC"
   ```

## Rules

- Acceptance criteria are mandatory. An issue without them is not ready.
- Do not write code in this step.
- If the plan reveals that the intent is unclear or wrong, go back to `/intent`
  instead of guessing.
- Changes to the harness itself (skills, `POLICY.md`, `harness/`) are issues
  with the label `harness` and an entry in `harness/CHANGELOG.md`.

## Starting an issue (claim)

When you begin work on an issue, claim it and bind the session to it:

```bash
bd update <id> --claim
harness/bin/lf-score bd_issue <id>
```

From then on every recorded event carries the issue, its epic and the phase.
Next steps: build, then `/verify`.
