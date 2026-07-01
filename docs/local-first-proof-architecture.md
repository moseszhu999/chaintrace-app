# ChainTrace Local-first Proof Architecture

## Decision

Do not treat a server database as the source of trust.

Organization and trade case details stay local by default.

```text
Browser-local organization profile
→ canonical JSON
→ SHA-256 profile hash
→ wallet signature
→ optional chain commitment
```

```text
Browser-local trade case
→ canonical JSON
→ SHA-256 case root hash
→ evidence hashes attach later
→ optional chain commitment
```

## Organization data split

### Local-only details

These stay in the user's browser unless the user explicitly exports or shares them:

- organization name
- website
- country / region
- contact details
- members
- internal roles
- documents
- private business relationships

### Public / chain proof

Only proof-safe fields are exposed:

- org_profile_hash
- proof algorithm
- DID hint
- signer address, when wallet signature is enabled
- wallet signature
- signed message
- timestamp
- chain commitment tx, when enabled

## Trade case data split

### Local-only case details

These stay in the user's browser unless explicitly exported or shared:

- buyer name
- amount
- currency
- goods description
- origin and destination
- payment term
- expected shipment date
- expected due date

### Public / chain proof

Only proof-safe fields are exposed:

- case_root_hash
- seller_org_profile_hash
- proof algorithm
- future evidence root
- future passport root
- future signer address
- future chain commitment tx

## Trust model

Do not trust the ChainTrace database.

Trust:

- file hashes
- local profile hashes
- local case root hashes
- wallet signatures
- counterparty confirmations
- audit hash chains
- chain commitments

## Wallet signature

The wallet signature binds a signer address to an organization profile hash without publishing the full organization profile.

The signed message includes:

```text
ChainTrace Organization Proof
Organization
Organization Type
Org Profile Hash
DID Hint
Created At
control statement
```

The Recovery Kit stores:

```text
proof.signerAddress
proof.signature
proof.signedMessage
proof.signedAt
```

Verification later should check:

```text
1. SHA-256(canonical privateProfile) == proof.orgProfileHash
2. recoverAddress(proof.signedMessage, proof.signature) == proof.signerAddress
3. chain commitment, if present, matches proof.orgProfileHash and signer
```

## Local trade case proof bundle

The Case Kit stores:

```text
version
case
privateData
proof.caseRootHash
proof.sellerOrgProfileHash
proof.algorithm
proof.chainCommitStatus
```

Import must verify:

```text
SHA-256(canonical privateData) == proof.caseRootHash
```

The case root should later become the parent anchor for:

```text
evidence_hashes
evidence_root_hash
passport_root_hash
confirmation_hashes
audit_root_hash
```

## Recovery model

Local-first does not mean no backup.

It means ChainTrace must not store plaintext details as the trust source.

The recovery options are:

1. Browser localStorage for daily use.
2. Downloadable Recovery Kit / Case Kit for user-controlled backup.
3. Future encrypted cloud backup, where the server stores only ciphertext.
4. Chain commitment for proof anchoring, not plaintext recovery.

## Recovery Kit

The Organization Recovery Kit is a JSON file containing:

```text
version
organization
membership
privateProfile
proof.orgProfileHash
proof.algorithm
proof.signerAddress
proof.signature
proof.signedMessage
proof.signedAt
proof.chainCommitStatus
```

Import must verify:

```text
SHA-256(canonical privateProfile) == proof.orgProfileHash
```

If the hash does not match, the kit must be rejected.

## Current v2 rule

Database schema files may remain as implementation notes, but runtime product flow must not require a database for organization identity or trade case creation.

The current organization flow is:

```text
Create local organization profile
→ store private details in browser localStorage
→ generate org profile hash
→ sign proof with wallet
→ download Recovery Kit
→ optionally commit hash on-chain
```

The current trade case flow is:

```text
Create local trade case
→ store private case details in browser localStorage
→ generate case root hash
→ download Case Kit
→ attach evidence hashes later
→ optionally commit root on-chain
```

## Future chain layer

Later, `OrganizationRegistry` should commit only:

```text
org_profile_hash
org_type
signer
status
timestamp
version
```

Later, `CaseRegistry` should commit only:

```text
case_root_hash
seller_org_profile_hash
signer
status
timestamp
version
```

It must not store full organization or trade case details.
