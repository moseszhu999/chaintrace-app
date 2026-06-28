# On-chain Setup

This app can anchor generated file hashes to `ProofRegistry` on Base Sepolia.

## 1. Deploy ProofRegistry

Use the contracts repository:

```text
https://github.com/moseszhu999/chaintrace-contracts
```

Deploy:

```text
contracts/ProofRegistry.sol
```

Recommended first test network:

```text
Base Sepolia
Chain ID: 84532
Explorer: https://sepolia.basescan.org
RPC: https://sepolia.base.org
```

## 2. Configure Vercel

After deployment, copy the deployed contract address.

In Vercel:

```text
Project Settings
  → Environment Variables
  → Add NEXT_PUBLIC_PROOF_REGISTRY_ADDRESS
```

Example:

```text
NEXT_PUBLIC_PROOF_REGISTRY_ADDRESS=0xYourDeployedProofRegistryAddress
```

Redeploy the app after saving the variable.

## 3. User Flow

```text
Upload evidence file
        ↓
Browser generates SHA-256 hash
        ↓
Connect wallet
        ↓
Switch to Base Sepolia
        ↓
Call ProofRegistry.registerProof
        ↓
Show transaction hash and BaseScan link
```

## 4. Notes

- The app does not upload the file to a server yet.
- The app does not store sensitive documents on-chain.
- The current on-chain call only anchors the file hash, proof type, optional URI, and metadata hash.
- IPFS upload and persistent proof pages are later milestones.
