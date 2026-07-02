# 83 P1 Frontend Contract Persistence

## Direction Correction

P1.1 is not a server persistence cutover.

The corrected name is:

> P1.1 Frontend + Smart Contract Persistence Cutover

The product reason is simple: a database creates platform trust, while ChainTrace needs a public facts layer. Browser state can cache drafts and display hints, but the authoritative P1 records should be contract state and contract events.

## What Is Not Used

The P1.1 implementation does not add:

- Prisma
- PostgreSQL
- Supabase
- Server Actions
- API routes
- Node backend persistence
- Database seed data

The previous `prisma/schema.prisma` file has been removed from the active implementation path.

## Contract Records

The P1.1 registry contract is `contracts/ChainTraceP1Registry.sol`.

The contract records:

- Wallet role registration
- Case commitment
- Document proof hash
- Metadata hash
- Document kind
- Gate evaluation result
- P1 pre-funding case state

The contract does not record:

- Raw PDF or original document bytes
- Plaintext commercial metadata
- Buyer-facing commercial details in full
- Financing execution status
- Disbursement status
- Settlement status

## Browser-Only Data

Browser storage can hold:

- Draft form values
- Last selected wallet
- Local display labels
- Demo metadata needed to render a readable UI before a richer indexing layer exists

Browser storage is not the source of truth for P1.1 proof, audit, or state records. The pages derive proof graph, gate checklist, state machine, and audit log from contract-style records and events.

## Events As Audit Log

The audit log is generated from contract events:

- `RoleRegistered`
- `CaseCreated`
- `DocumentProofAdded`
- `GateEvaluated`
- `CaseStateTransitioned`

The frontend projection layer is in `lib/contracts/contract-event-projections.ts`.

## Proof Graph From Registry Events

The proof graph is built from `DocumentProofAdded` events. Each proof node contains:

- `caseId`
- `documentHash`
- `metadataHash`
- `documentKind`
- transaction hash
- block number

This keeps the proof graph anchored to public registry facts while avoiding raw document upload.

## P1 Funding Boundary

P1.1 remains pre-funding software.

`disbursementAllowed` is always false. The contract exposes `disbursementAllowed(bytes32)` as a pure false result, and the frontend gate projection always blocks `FUNDING_EXECUTION_GATE`.

The contract has no disbursed, financed, settled, transferred, or paid state.

## Local Run

Install dependencies and run:

```bash
npm run test
npm run typecheck
npm run build
npm audit
npx hardhat compile
npx hardhat test
```

For a local app preview:

```bash
npm run dev
```

## Contract Configuration

Use public frontend variables only:

```env
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS=
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_APP_MODE="p1-contract"
```

Do not add `DATABASE_URL`, `SUPABASE_URL`, or server-side persistence secrets.

## Next Route

The corrected roadmap is:

1. P1.1 Frontend + Smart Contract Persistence
2. P1.2 Wallet Binding + Role Lock Contract
3. P1.3 Exporter Case Registry Contract
4. P1.4 Document Proof / Audit Event Graph
5. P1.5 Funder / Investor Read-only Verification View
