# 84 — P1 Real Wallet + Local Chain Deployment

P1.2 keeps ChainTrace on the frontend plus smart contract path.

No Prisma, PostgreSQL, Supabase, server actions, API routes, or backend persistence are introduced.

The intended local flow is:

```text
Hardhat local node
-> deploy ChainTraceP1Registry
-> configure the frontend with the deployed contract address
-> browser wallet sends registry transactions
-> frontend rebuilds proof graph, state machine, and audit log from contract events
```

The Vercel preview should remain in mock mode so it does not require a local RPC node.

Local development can use this mode value:

```env
NEXT_PUBLIC_CHAINTRACE_MODE=local-chain
```

The existing P1 invariant is unchanged:

```text
disbursementAllowed=false
```

Raw documents never leave the browser. Plaintext commercial metadata is not written on chain. The chain receives only commitments, hashes, document kind, sender, block data, and events.

## Local runbook

```bash
npx hardhat node
npx hardhat run scripts/deploy-p1-registry.ts --network localhost
npm run dev
```

Then open:

```text
http://127.0.0.1:3000/login
```

## Verification

```bash
npm run test
npm run typecheck
npm run build
npx hardhat compile
npx hardhat test
npm audit
```

## Boundary preserved

`docs/prototypes/p0` is not part of this change.
