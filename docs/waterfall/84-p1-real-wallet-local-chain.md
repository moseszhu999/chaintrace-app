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

The Vercel preview should remain in mock mode so it does not require a local RPC node or browser wallet.

## Modes

```env
NEXT_PUBLIC_CHAINTRACE_MODE=mock
```

`mock` is the safe default for Vercel preview. Browser storage is only a mock chain cache / draft cache / display cache.

```env
NEXT_PUBLIC_CHAINTRACE_MODE=local-chain
```

`local-chain` is for local Hardhat testing. It requires:

```env
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS=0x...
```

The P1 shell displays the current mode, chain id, and registry address so reviewers can see whether they are in preview mock mode or local-chain mode.

## Local runbook

Terminal 1:

```bash
npx hardhat node
```

Terminal 2:

```bash
npm run contracts:deploy:local
```

Copy the deployed address into `.env.local`:

```env
NEXT_PUBLIC_CHAINTRACE_MODE=local-chain
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAINTRACE_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_APP_MODE="p1-contract"
```

Terminal 3:

```bash
npm run dev
```

Then open:

```text
http://127.0.0.1:3000/login
```

## Data boundary

The existing P1 invariant is unchanged:

```text
disbursementAllowed=false
```

Raw documents never leave the browser.

Plaintext commercial metadata is not written on chain.

The chain receives only:

```text
caseCommitment
documentHash
metadataHash
documentKind
msg.sender
block data
contract events
```

Display-only data may stay in browser cache:

```text
buyerName
amount
currency
description
fileName
fileType
fileSize
```

Display cache is not the authority. The authority for role, case, document proof, audit log, and state machine is the contract record/event stream.

## Adapter status

P1.2.1 introduces a `P1RegistryAdapter` interface so pages can move away from direct localStorage calls.

Current adapter modes:

```text
mock        -> Vercel-safe cache-backed preview
local-chain -> requires registry configuration and is prepared for real chain reads/writes
```

The next implementation slice should replace the local-chain adapter fallback methods with direct viem `readContract`, `writeContract`, and `getContractEvents` calls.

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
