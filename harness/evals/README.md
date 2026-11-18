# Evals

Empty on purpose. Evals for the harness come from real work, not from guesses.

An eval is a past request that the harness should handle at least as well after
a change as before it. Candidates are the closed issues labelled
`eval-candidate` (added by `/ship`):

```bash
bd list --status=closed --label eval-candidate
```

When there are enough of them to be representative, each eval gets a directory
here:

```
harness/evals/<issue-id>/
  prompt.md      the request as the user gave it
  setup.md       the commit to start from and any fixture
  checks.md      what must be true afterwards (gates, acceptance criteria)
```

Until then, harness changes are made by hand and justified in
`harness/CHANGELOG.md` (phase 1). See the phases described there.
