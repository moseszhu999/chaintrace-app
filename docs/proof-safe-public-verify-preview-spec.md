# Proof-safe Public Verify Preview Spec

## Goal

Create a public, database-free verification preview for local ChainTrace proof bundles.

The page must verify proof bundles without asking users to trust a ChainTrace server database.

```text
Recovery Kit / Case Kit JSON
→ browser-local verification
→ hash recomputation
→ optional wallet signature recovery
→ proof-safe result display
```

## Route

```text
/verify/local
```

## Inputs

The verifier accepts pasted JSON for:

1. Organization Recovery Kit
2. Trade Case Kit

File upload can be added later. First version uses paste-only JSON to keep the surface simple.

## Organization Kit verification

Supported version:

```text
chaintrace-local-org-proof-v1
```

Required checks:

```text
SHA-256(canonical privateProfile) == proof.orgProfileHash
organization.orgRegistryHash == proof.orgProfileHash
```

Optional wallet-signature checks, when signature fields exist:

```text
recoverAddress(proof.signedMessage, proof.signature) == proof.signerAddress
proof.signedMessage contains proof.orgProfileHash
```

## Trade Case Kit verification

Supported version:

```text
chaintrace-local-trade-case-v1
```

Required checks:

```text
SHA-256(canonical privateData) == proof.caseRootHash
case.caseRootHash == proof.caseRootHash
```

Optional organization linkage check:

```text
privateData.sellerOrgProfileHash == proof.sellerOrgProfileHash
```

## Output

The verifier displays only proof-safe summary fields:

- kit type
- verification status
- hash algorithm
- recomputed hash
- claimed hash
- signer address, if present
- signature verification result, if present
- chain commitment status

It must not publish or send private profile or trade case details to a server.

## Non-goals

This first preview does not:

- upload JSON to ChainTrace
- store verification history
- commit anything on-chain
- verify legal identity
- verify credit quality
- verify shipment truth beyond supplied proofs

## Security boundary

The page is a local verifier only.

It can say:

```text
This bundle is internally consistent.
```

It cannot say:

```text
This company legally exists.
This trade is true.
This invoice is financeable.
```

## Product rule

The verifier must reinforce:

```text
Do not trust our database. Verify the proof.
```
