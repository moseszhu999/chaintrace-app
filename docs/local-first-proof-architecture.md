# ChainTrace Local-first Proof Architecture

## Decision

Do not treat a server database as the source of trust.

Organization details stay local by default.

```text
Browser-local organization profile
→ canonical JSON
→ SHA-256 profile hash
→ optional wallet signature
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
- timestamp
- chain commitment tx, when enabled

## Trust model

Do not trust the ChainTrace database.

Trust:

- file hashes
- local profile hashes
- wallet signatures
- counterparty confirmations
- audit hash chains
- chain commitments

## Recovery model

Local-first does not mean no backup.

It means ChainTrace must not store plaintext organization details as the trust source.

The recovery options are:

1. Browser localStorage for daily use.
2. Downloadable Recovery Kit for user-controlled backup.
3. Future encrypted cloud backup, where the server stores only ciphertext.
4. Chain commitment for proof anchoring, not plaintext recovery.

## Recovery Kit

The Recovery Kit is a JSON file containing:

```text
version
organization
membership
privateProfile
proof.orgProfileHash
proof.algorithm
proof.chainCommitStatus
```

Import must verify:

```text
SHA-256(canonical privateProfile) == proof.orgProfileHash
```

If the hash does not match, the kit must be rejected.

## Current v2 rule

Database schema files may remain as implementation notes, but runtime product flow must not require a database for organization identity.

The current organization flow is:

```text
Create local organization profile
→ store private details in browser localStorage
→ generate org profile hash
→ download Recovery Kit
→ optionally sign proof with wallet
→ optionally commit hash on-chain
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

It must not store full organization details.
