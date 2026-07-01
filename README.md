# ChainTrace

ChainTrace turns cross-border trade PDFs into browser-hashed, wallet-signed, on-chain receivable financing candidates.

It is a frontend + blockchain trade-finance protocol demo. The browser hashes purchase orders, invoices, bills of lading, permits, warehouse receipts, quality reports, signatures, and payment conditions locally, then wallet signatures bind those facts into contract registries and a pre-review LoanRequestRegistry draft. It does not promise financing eligibility; incomplete gates remain blocked until evidence and professional approval are complete.

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
Wallet signatures attest responsible facts to TradeSigningRegistry / LogisticsEvidenceRegistry
        ↓
LoanRequestRegistry records a pre-review request and evidence-pack hash
        ↓
Professional review decides blocked / approved / rejected from the same gate state
        ↓
ReceivableLoan conversion is possible only after approval and complete gates
```

## Key App Routes

- `/business-architecture` - consulting-grade business and architecture blueprint
- `/business-ops` - Agent workbench for evidence operations
- `/business-readiness` - financier readiness view and pre-review handoff
- `/business-professional-review` - bank, law-firm, and exception review queue
- `/business-contracts` - smart contract console and LoanRequestRegistry lifecycle

## Demo Mock API Routes

These routes are kept for the Vercel demo and regression validation. They are not the recommended production core architecture; the product direction is frontend-local proof creation plus smart-contract state.

- `GET /api/agents/run` - aggregate Agent pipeline output
- `GET /api/agents/evidence` - evidence metadata and open/verified counts
- `GET /api/agents/gates` - 12 gate statuses; current case remains 6/12 passed
- `GET /api/agents/gaps` - missing evidence and next actions
- `GET /api/agents/risk-memo` - risk flags, approval conditions, financier memo
- `POST /api/cases` - create a pre-review case from public converter metadata/hash without storing raw PDFs
- `POST /api/evidence/upload` - mocked evidence upload classification
- `GET /api/financing-pack` - financier-facing evidence and memo pack
- `GET /api/professional-review` - professional exception review queue
- `GET /api/cases/[caseId]/handoff` - professional review handoff pack from the operating snapshot
- `GET /api/cases/[caseId]/review-summary` - lightweight professional review summary from the same handoff pack
- `POST /api/evidence/[evidenceId]/review` - Operator/Admin evidence review transition
- `POST /api/tasks/[taskId]/transition` - Operator/Admin evidence-linked task transition
- `POST /api/operator-tasks/[taskId]/transition` - Operator/Admin workflow task transition
- `POST /api/cases/[caseId]/professional-review` - Professional reviewer/Admin note and exception status action
- `POST /api/admin/reset-demo` - Admin-only runtime demo reset
- `GET /api/loan-requests/pre-review` - pre-review request draft
- `POST /api/loan-requests/pre-review` - mocked pre-review request creation

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

## Consulting Architecture Flow

ChainTrace should be explained from business value down to technology:

```text
BLM including value chain
  -> business architecture / business process
  -> application architecture
  -> data architecture
  -> technical architecture
```

The system does not remove banks, law firms, or factors. It moves them from repetitive document checking to underwriting, compliance, legal structure, dispute handling, and material exception review.

## Architecture Direction

The recommended core architecture is frontend + blockchain:

- Frontend: local PDF hashing, ReceivableCandidate JSON/hash, wallet signature, contract read/write.
- Blockchain: `TradeSigningRegistry`, `LogisticsEvidenceRegistry`, `LoanRequestRegistry`, `ReceivableLoan`, and `RestrictedReceivableToken`.
- Read model: frontend reads contract state and events through wallet/RPC providers.
- Demo mocks: existing API routes remain fixtures only, not a production backend requirement.

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
