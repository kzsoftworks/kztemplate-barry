---
name: ship
description: Close out an issue after the gates pass and the reviewer approves - write the LEARNINGS note, label the issue eval-candidate, commit, open the pull request when asked, close the issue and clear the session context. Last step of the harness process. Use when the user says ship, finish, wrap up or close the issue.
---

# /ship

## Preconditions

Stop and go back to `/verify` unless both are true for the **current** code:

- `harness/bin/verify` passed (no failed gate; every skip is explained).
- The `reviewer` subagent returned APPROVED.

## Steps

1. Mark the phase:

   ```bash
   harness/bin/lf-score phase ship
   ```

2. Write what was learned on the issue. This is the raw material for improving
   the harness, so be specific and honest:

   ```bash
   bd note <id> "LEARNINGS: <what was harder than expected, what the plan got
   wrong, what you had to find out, what would have made this faster>"
   ```

   Good: "The pgTAP test needed `set local role` before the claims; the supabase
   skill does not say so." Useless: "Everything went well."

3. Mark the issue as a candidate for the eval set:

   ```bash
   bd label add <id> eval-candidate
   ```

4. Commit. One issue, one coherent commit (or a few), conventional message,
   issue id in the body. Stage files by name; never `git add -A`.

5. Pull request, **only if the user asked for it**. Follow the
   `preview-deploy` skill: the PR gets a Vercel Preview bound to its own
   Supabase branch, and the PR is not ready until the Preview smoke passes.
   Never merge a pull request yourself.

6. Close the issue:

   ```bash
   bd close <id> --reason "<one line: what shipped>"
   ```

   If this was the last open issue of the epic, close the epic too.

7. Clear the session context so the next issue starts clean:

   ```bash
   harness/bin/lf-score clear
   ```

8. Tell the user what shipped, what was verified and how, what was skipped, and
   what is ready next (`bd ready`).

## Rules

- Do not push, open a PR or merge unless the user asked.
- Do not close an issue whose acceptance criteria are not all met. Split the
  remainder into a new issue instead.
