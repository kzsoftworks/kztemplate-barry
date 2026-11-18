---
name: intent
description: Capture or update why the product exists and what a request is for, in INTENT.md. Use at the start of a new product, a new feature or epic, or whenever the user describes a goal, an audience, a constraint or a non-goal that is not yet written down. First step of the harness process (intent → plan → build → verify → review → ship).
---

# /intent

`INTENT.md` is the single place that says **why** the product exists and what
each request is meant to achieve. Plans, issues and reviews are judged against
it. This skill keeps it current.

## Steps

1. Mark the phase:

   ```bash
   harness/bin/lf-score phase intent
   ```

2. Read `INTENT.md`. If it still has the template placeholders, this is the
   first run: fill in every section. Otherwise change only what the new request
   affects.

3. Get what you need from the user. Ask only for what you cannot infer, in one
   round, and prefer concrete questions:
   - Who is this for, and what are they trying to get done?
   - What does success look like? How would we notice it worked?
   - What is explicitly out of scope?
   - Any constraint that limits the solution (deadline, budget, compliance,
     existing data, integrations)?

4. Write the result into `INTENT.md`:
   - Product-level sections (problem, audience, principles, non-goals) change
     rarely. Edit them in place; do not append history.
   - Add or update one entry under **Current requests** for this request:
     outcome, success signal, non-goals, constraints, open questions.
   - Write outcomes, not solutions. "A member can export their invoices" is
     intent; "add a CSV endpoint" is a plan.

5. Show the user the diff of `INTENT.md` and get their confirmation before
   planning. If open questions remain that would change the plan, stop here.

## Rules

- `INTENT.md` holds why. How we work goes in `CLAUDE.md` and `POLICY.md`; the
  work itself goes in beads. Do not mix them.
- No implementation detail, file names or task lists in `INTENT.md`.
- Never invent a success signal the user did not agree to.

Next step: `/plan-to-beads`.
