# ChainTrace Financing Evidence OS Design

## Context

ChainTrace is an AI-agent-driven cross-border trade-finance evidence operating system, not a generic supply-chain blockchain demo. The current demo case is Vietnam Robusta coffee exported to Singapore:

- Trade value: USD 52,800
- Blocked 70% receivable: USD 36,960
- Requested advance: USDC 29,500
- Readiness Score: 62/100
- Loan gates: 6/12 passed
- Current status: Pre-review only
- Blocker code: GATES_NOT_PASSED

The product path is: upload evidence -> AI Agent metadata/gates/gaps/risk memo -> Financing Pack API -> pre-review loan request API -> LoanRequestRegistry -> professional review -> ReceivableLoan only after approval and complete gates.

## Guardrails

- The demo must not imply an approved loan, real regulated lending, guaranteed financing, or automatic disbursement.
- `disbursementAllowed` must remain `false` for the Vietnam coffee case.
- `GATES_NOT_PASSED`, `62/100`, `6/12`, and `Pre-review only` must remain visible and stable unless the evidence fixture intentionally changes.
- Banks, law firms, and factors remain in the workflow as professional reviewers for underwriting, compliance, legal structure, disputes, and material exceptions.

## Design

### Readiness UI

Add a visible `/api/loan-requests/pre-review` action to `/business-readiness` and a decision panel that explains the handoff:

1. Financing Pack API produces evidence and risk memo output.
2. Pre-review API turns the pack into a `LoanRequestRegistry.submitPreReviewRequest` draft.
3. Formal disbursement remains blocked until gates pass and professional review approves.

The existing financing-pack link stays in place. The new language must preserve the current blocked state.

### Contract Console

Add a `LoanRequestRegistry` lifecycle panel to `/business-contracts`:

`PreReview -> ReviewBlocked / Approved -> ConvertedToLoan`

The panel shows the current Vietnam coffee state as `PreReview`, `62/100`, `GATES_NOT_PASSED`, and formal disbursement blocked. It must make clear that `LoanRequestRegistry` is the request entry point before `ReceivableLoan`.

### API Contract Validation

Add a lightweight Node validation script instead of a new test framework. It should validate route handlers or shared fixture outputs locally and fail if the core operating contract drifts:

- Agent pipeline includes `tradeId`, `pipeline`, `evidence`, `gates`, `riskMemo`, `professionalReview`, and `machineDecision`.
- Gate result remains passed `6`, total `12`, blocker `GATES_NOT_PASSED`, and `disbursementAllowed: false`.
- Loan pre-review draft remains `PreReview`, readiness score `62`, `preReviewAllowed: true`, and `disbursementAllowed: false`.

Expose it as `npm run api:validate`.

### Contract Tests And Deployment Record

Keep Solidity unchanged unless tests expose a real bug. Harden `LoanRequestRegistry` coverage for:

- `updateEvidencePack`
- `cancel`
- non-owner cannot approve/reject
- conversion blocked unless request is `Approved`
- unknown request reverts

Tighten the Vietnam coffee deployment record wording so conversion and disbursement are described as post-review and post-gate actions only.

### README

Replace the stale proof-page MVP README with product documentation that explains:

- one-sentence positioning
- Vietnam coffee demo story
- app routes and API routes
- Agent/API flow
- smart-contract map
- local build/test commands
- safety and lending guardrails

## Verification

Run:

- `npm run api:validate`
- `npm run build`
- `npm run contracts:compile`
- `npm run contracts:test`
