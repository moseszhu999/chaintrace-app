# ChainTrace

ChainTrace turns cross-border trade PDFs into browser-hashed, wallet-signed, on-chain receivable financing candidates.

It is now moving from a presentation demo toward a case-centered working site. The public converter creates a pre-review case from metadata/hash-only evidence, the workspace reviews evidence and tasks under that case, and professional review/handoff reads the same operating state. It does not promise financing eligibility; incomplete gates remain blocked until evidence and professional approval are complete.

## Current Demo Case

The main demo is a Vietnam Robusta coffee export to Singapore:

- Trade value: USD 52,800
- Blocked 70% balance receivable: USD 36,960
- Requested advance: USDC 29,500
- Readiness Score: 62/100
- Loan gates: 6/12 passed
- Status: Pre-review only
- Blocker code: GATES_NOT_PASSED

The evidence is not complete. Final on-board bill of lading, Singapore import permit final confirmation, warehouse receipt, arrival QC dispute closure, buyer acceptance decision, and financier multisig authorization are still open or blocked.

## Safety Guardrail

This demo does not approve real financing and does not perform real regulated lending. Formal disbursement is blocked until evidence gates pass and professional compliance, legal, and underwriting review is complete.

Use this wording:

- Pre-review only
- formal disbursement blocked
- evidence operating system
- browser-hashed receivable financing candidate
- Agent pre-check + professional exception review
- gate-based execution

Avoid language that implies an approved loan, guaranteed financing, or automatic disbursement.

## Product Flow

```text
Select trade PDF in browser
        ↓
Browser calculates SHA-256 and creates ReceivableCandidate JSON/hash
        ↓
Create pre-review case without storing raw PDF
        ↓
Operator reviews metadata/hash evidence and generates review receipts
        ↓
Evidence tasks, gates, readiness, dashboard, and handoff read the same case state
        ↓
Professional review decides blocked / approved / rejected outside automated execution
        ↓
ReceivableLoan conversion is possible only after approval and complete gates
```

## Primary Working-Site Routes

Use these as the main path when testing or demoing the product as a working site:

- `/` - public converter and case creation entry
- `/login` - demo role selection and working-site entry
- `/cases` - case list / active case entry
- `/cases/[caseId]` - case overview
- `/cases/[caseId]/evidence` - case-scoped evidence review
- `/cases/[caseId]/tasks` - case-scoped task queue
- `/cases/[caseId]/review` - case-scoped professional review surface
- `/cases/[caseId]/handoff` - case-scoped handoff / Trust Pack JSON preview
- `/dashboard` - active case command center from `getCaseOperatingSnapshot(caseId)`

## Active-Case Shortcuts

These routes exist only as compatibility shortcuts and redirect/resolve to the active case path:

- `/evidence` -> `/cases/[activeCaseId]/evidence`
- `/tasks` -> `/cases/[activeCaseId]/tasks`
- `/business-professional-review` -> `/cases/[activeCaseId]/review`

## Reference / Demo Routes

These are still useful for explanation and regression checks, but they are not the primary user path:

- `/agent` - public story page
- `/business-ops` - Agent reference workbench
- `/business-architecture` - consulting-grade architecture reference
- `/business-flows` - four-flow reference view
- `/business-readiness` - readiness reference view
- `/business-contracts` - smart contract reference console
- `/business-wallet` - wallet reference view
- `/proof-packs` - proof pack reference view

## API Routes

Working-site APIs:

- `POST /api/cases` - create a pre-review case from public converter metadata/hash without storing raw PDFs
- `GET /api/cases` - list cases / active case
- `GET /api/cases/[caseId]` - read case state
- `GET /api/cases/[caseId]/evidence` - read case evidence
- `POST /api/cases/[caseId]/evidence` - add metadata/hash evidence
- `POST /api/evidence/[evidenceId]/review` - Operator/Admin evidence review transition
- `GET /api/cases/[caseId]/tasks` - read case-scoped evidence tasks
- `POST /api/tasks/[taskId]/transition` - Operator/Admin evidence-linked task transition
- `GET /api/cases/[caseId]/operating-snapshot` - dashboard operating snapshot
- `GET /api/cases/[caseId]/handoff` - professional review handoff pack from the operating snapshot
- `GET /api/cases/[caseId]/review-summary` - lightweight professional review summary from the same handoff pack
- `POST /api/cases/[caseId]/professional-review` - Professional reviewer/Admin note and exception status action
- `POST /api/admin/reset-demo` - Admin-only runtime demo reset

Legacy/demo mock APIs kept for regression and reference:

- `GET /api/agents/run`
- `GET /api/agents/evidence`
- `GET /api/agents/gates`
- `GET /api/agents/gaps`
- `GET /api/agents/risk-memo`
- `POST /api/evidence/upload` - mocked evidence upload classification
- `GET /api/financing-pack` - fixture-style financier evidence pack
- `GET /api/professional-review` - professional exception review queue fixture
- `GET /api/loan-requests/pre-review`
- `POST /api/loan-requests/pre-review`

## Demo Roles

The working site uses a minimal demo role selector, not enterprise auth. The selected role is stored in the `chaintrace_role` cookie, and mutation APIs also accept `x-chaintrace-role`.

- `sme_user` can create a pre-review case, add evidence metadata, and view own case surfaces.
- `operator` can review evidence, create/run operator workflow tasks, request changes, and prepare handoff work.
- `professional_reviewer` can record professional review notes and exception status.
- `admin` can perform all protected actions and reset runtime demo state.

Denied role transitions return structured JSON with `error=ROLE_NOT_ALLOWED` and the pre-review boundary object.

## Contract Map

- `LoanRequestRegistry` - pre-review financing request entry point; records readiness score, evidence pack URI/hash, blocker code, and review status.
- `TradeSigningRegistry` - signing gates for PO, invoice, QC, bill of lading, warehouse receipt, buyer acceptance, and multisig.
- `LogisticsEvidenceRegistry` - logistics and quality evidence gates.
- `FinancierPool` - financier liquidity route into the bank vault.
- `BankVault` - supported assets, liquidity, credit lines, loan whitelist, disbursement, and repayment records.
- `ReceivableLoan` - actual loan state machine; must not disburse unless all required gates pass.
- `RestrictedReceivableToken` - controlled RWA or receivable token representation.
- `MockStablecoin` - test stablecoin for local and CI flows.

## Architecture Direction

The recommended core architecture is frontend + blockchain plus a case-centered operating read model:

- Frontend: local PDF hashing, ReceivableCandidate JSON/hash, wallet signature, case workspace.
- Case workspace: evidence metadata/hash, review receipts, task queue, dashboard snapshot, professional handoff.
- Blockchain: `TradeSigningRegistry`, `LogisticsEvidenceRegistry`, `LoanRequestRegistry`, `ReceivableLoan`, and `RestrictedReceivableToken`.
- Read model: frontend reads contract state/events and case state through guarded APIs.
- Demo mocks: older API routes remain fixtures only, not the primary product path.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build:

```bash
npm run build
```

Validate mocked API contracts:

```bash
npm run api:validate
```

Run smoke checks:

```bash
npm run smoke:evidence
npm run smoke:case
npm run smoke:handoff
npm run smoke:production-fallback
```

With a running app, set `CHAINTRACE_SMOKE_BASE_URL` to exercise real HTTP workflow smoke:

```bash
CHAINTRACE_SMOKE_BASE_URL=http://localhost:3000 npm run smoke:evidence
```

Try the mock POST APIs:

[docs/api-examples.md](docs/api-examples.md)

Compile and test contracts:

```bash
npm run contracts:compile
npm run contracts:test
```

## Current Operating Contract

The Vietnam coffee case must stay:

- `Pre-review only`
- `readinessScore = 62`
- `loan gates = 6/12 passed`
- `blockerCode = GATES_NOT_PASSED`
- `disbursementAllowed = false`

Any UI, API, README, script, or test change that turns this case into a disbursable or formally approved financing state is a product and compliance regression.
