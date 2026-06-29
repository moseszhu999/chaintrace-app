# Contributing to ChainTrace

ChainTrace is an AI-agent-driven cross-border trade-finance evidence operating system. It turns trade documents, logistics evidence, quality records, signatures, and payment conditions into a financing-ready receivable package.

## Start here

Before implementing or reviewing work, read these GitHub issues:

- #11 — project background and guardrails
- #12 — PR review checklist and merge blockers
- #13 — canonical task order for Codex work

## Current demo guardrails

The current Vietnam Robusta coffee demo must remain conservative unless the underlying evidence and gate data are explicitly changed:

- Readiness Score: `62/100`
- Loan gates: `6/12 passed`
- Status: `Pre-review only`
- Blocker: `GATES_NOT_PASSED`
- `disbursementAllowed: false`

Do not describe the current demo as an approved loan, real regulated lending, guaranteed financing, or automatic disbursement.

## Preferred work style

- Prefer one pull request per issue.
- Keep UI, API, contract, and documentation changes separate unless the issue explicitly asks for a combined change.
- Use the PR template and fill out the guardrail confirmation.
- Keep wording centered on SME cross-border trade finance, evidence operations, Agent pre-check, professional exception review, and gate-based execution.

## Suggested task order

1. Product flow wiring: #1, #4
2. API and fixture hardening: #9, #7, #5
3. Contract hardening and documentation: #8, #10

## Required checks

Run the checks relevant to your change:

```bash
npm run build
npm run contracts:compile
npm run contracts:test
```

For documentation-only changes, `npm run build` is usually enough if the change affects Markdown or GitHub metadata only.

## Merge blockers

Do not merge a PR that:

- says or implies the current Vietnam coffee case is approved
- sets `disbursementAllowed` to `true`
- removes `GATES_NOT_PASSED` without changing the underlying evidence and gates
- weakens `ReceivableLoan` gate checks
- presents ChainTrace as a live regulated lending platform
- claims banks, law firms, or factors are fully replaced

Banks, law firms, and factors should be described as moving from repetitive checking to underwriting, compliance, legal structure, dispute handling, and major exception review.
