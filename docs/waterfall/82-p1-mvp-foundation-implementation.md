# 82 P1 MVP Foundation Implementation

## Scope Implemented

This document records the first usable P1 app skeleton built after the P0 sales-demo prototype.

P0 static prototype files under `docs/prototypes/p0/` remain unchanged and continue to serve as sales-demo and visual reference material.

The new P1 implementation adds a real Next.js App Router application with:

- Mock wallet login at `/login`
- One-wallet-one-role registration at `/register-role`
- Role-bound dashboard at `/dashboard`
- Exporter workspace at `/exporter/dashboard`
- Exporter case creation at `/exporter/cases/new`
- Exporter case detail and document metadata entry at `/exporter/cases/[caseId]`
- Case proof graph at `/cases/[caseId]/proof-graph`
- Case state machine at `/cases/[caseId]/state-machine`
- Case audit log at `/cases/[caseId]/audit-log`

## Persistence Boundary

The first P1 skeleton uses browser `localStorage` for mock persistence so the workflow is usable without a backend service.

The target PostgreSQL schema is recorded in `prisma/schema.prisma` for the next backend implementation step. Runtime code does not yet connect to PostgreSQL, Supabase, Prisma Client, or object storage.

## Product Boundary Preserved

P1 is review-assistant software only.

The implementation keeps the following disabled:

- Real wallet signature
- Chain write
- Pool transaction
- USDC transfer
- Real disbursement
- Bank core API
- KYB API
- Insurance API
- Customs API
- Legal filing or legal advice

All case state outputs keep `disbursementAllowed=false`.

## Domain Rules Implemented

The tested domain layer in `lib/p1-domain.ts` currently covers:

- First wallet registration locks a single business role
- Re-registering the same wallet under a different role fails with `WALLET_ROLE_LOCKED`
- Exporter case creation starts at `DRAFT_INTENT`
- Exporter-created cases always have `disbursementAllowed=false`
- Adding trade document metadata creates a local SHA-256 proof record
- Document and proof creation write audit log entries
- Proof graph derives from case documents and proof nodes
- Gate checklist blocks buyer, goods-chain, bank-review, and funding-execution gates until later P1 stages add those proofs
- Case state advances from `DRAFT_INTENT` to `EVIDENCE_PACKAGED` after exporter evidence exists

## Verification

The implementation was verified with:

- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm audit`
- HTTP smoke checks against `/login`, `/register-role`, `/exporter/cases/new`, and `/cases/case_0001/proof-graph` on the local dev server

## Next Implementation Step

The next P1 slice should replace local mock persistence with a real backend boundary:

1. Add PostgreSQL or Supabase runtime persistence.
2. Move case/document/proof mutations behind Server Actions or API routes.
3. Keep the existing domain tests as the rule baseline.
4. Add buyer acknowledgment, logistics or inspector proof, and bank review mutations.
5. Keep `disbursementAllowed=false` until an explicitly approved funding-execution phase.
