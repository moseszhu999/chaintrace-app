# ChainTrace

ChainTrace turns cross-border trade PDFs and logistics evidence into finance-ready receivables for Agent pre-check and professional review.

It is an AI-agent-driven cross-border trade-finance evidence operating system. The product organizes purchase orders, invoices, bills of lading, permits, warehouse receipts, quality reports, signatures, and payment conditions into a financing evidence pack that banks, factors, law firms, and risk teams can review faster.

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
- financing-ready receivable package
- Agent pre-check + professional exception review
- gate-based execution

Avoid language that implies an approved loan, guaranteed financing, or automatic disbursement.

## Product Flow

```text
Upload evidence
        ↓
AI Agent classifies documents and extracts metadata
        ↓
Agent checks evidence, gate status, gaps, and risk memo
        ↓
Financing Pack API returns a financier-facing evidence pack
        ↓
Pre-review loan request API creates a LoanRequestRegistry draft
        ↓
Professional review decides blocked / approved / rejected
        ↓
ReceivableLoan conversion is possible only after approval and complete gates
```

## Key App Routes

- `/business-architecture` - consulting-grade business and architecture blueprint
- `/business-ops` - Agent workbench for evidence operations
- `/business-readiness` - financier readiness view and pre-review handoff
- `/business-professional-review` - bank, law-firm, and exception review queue
- `/business-contracts` - smart contract console and LoanRequestRegistry lifecycle

## Key API Routes

- `GET /api/agents/run` - aggregate Agent pipeline output
- `GET /api/agents/evidence` - evidence metadata and open/verified counts
- `GET /api/agents/gates` - 12 gate statuses; current case remains 6/12 passed
- `GET /api/agents/gaps` - missing evidence and next actions
- `GET /api/agents/risk-memo` - risk flags, approval conditions, financier memo
- `POST /api/evidence/upload` - mocked evidence upload classification
- `GET /api/financing-pack` - financier-facing evidence and memo pack
- `GET /api/professional-review` - professional exception review queue
- `GET /api/loan-requests/pre-review` - pre-review request draft
- `POST /api/loan-requests/pre-review` - mocked pre-review request creation

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
