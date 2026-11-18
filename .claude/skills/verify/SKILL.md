---
name: verify
description: Run the quality gates (typecheck, lint, unit tests, e2e) with harness/bin/verify, record each result, then hand the change to the reviewer subagent. Use after building an issue, before saying work is done, before committing or opening a PR, and again after every fix the reviewer asks for.
---

# /verify

Nothing is "done" until the gates pass and the reviewer approves. This skill
runs both and repeats until they do.

## 1. Gates

```bash
harness/bin/verify
```

It runs four gates and records each as pass, fail or skip:

| Gate             | Command             |
| ---------------- | ------------------- |
| `gate.typecheck` | `npm run typecheck` |
| `gate.lint`      | `npm run lint`      |
| `gate.test`      | `npm test`          |
| `gate.e2e`       | `npm run test:e2e`  |

If the change touches `supabase/` (migrations, policies, functions), also run
the database gate. It needs Docker and a running local stack
(`npm run db:start`):

```bash
harness/bin/verify --db
```

Full output of each gate is in `.harness/logs/<gate>.log`.

### When a gate fails

- Fix the cause. Never weaken a check to get a pass: no deleting or skipping
  tests, no `any`, no `eslint-disable`, no loosening an RLS policy.
- Re-run `harness/bin/verify` until everything passes.

### When a gate is skipped

A skip is not a pass. Say which gate was skipped and why in your report, and
do not describe the skipped area as verified. `gate.db` skips when Docker is
not available; in that case the pull request's CI run is what verifies it.

## 2. Review

Once the gates pass:

```bash
harness/bin/lf-score phase review
```

Launch the `reviewer` subagent on the current change. Give it the issue id and
nothing about your own opinion of the change. It answers with a verdict:

- **APPROVED**: record it and continue to `/ship`.

  ```bash
  harness/bin/lf-score review APPROVED
  ```

- **CHANGES**: record the verdict and one more round of rework, fix every
  finding, then start this skill again from the gates.

  ```bash
  harness/bin/lf-score review CHANGES
  harness/bin/lf-score rework 1
  harness/bin/lf-score phase build
  ```

If the reviewer reports a **POLICY-GAP** (something that should be a rule but
is not in `POLICY.md`), add a note to the issue so it is not lost:

```bash
bd note <id> "POLICY-GAP: <the missing rule and where it showed up>"
```

Do not edit `POLICY.md` yourself in the same change. Policy changes are their
own `harness` issue.

## Rules

- Never claim a change is verified without having run the gates on the final
  version of the code. A change after the last run means running them again.
- Report results as they are: which gates passed, failed or were skipped.
