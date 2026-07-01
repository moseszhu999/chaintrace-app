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

## Current v2 rule

Database schema files may remain as implementation notes, but runtime product flow must not require a database for organization identity.

The current organization flow is:

```text
Create local organization profile
→ store private details in browser localStorage
→ generate org profile hash
→ show proof-ready commitment
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
