# ChainTrace TOGAF Five-layer Function and Data Architecture

## Positioning

ChainTrace is not just a local proof tool.

The small entry is:

```text
Upload trade documents -> generate a verifiable Trade Evidence Passport.
```

The large product is:

```text
A local-first, proof-first trade evidence infrastructure for small exporters, buyers, financiers, platforms, and AI agents.
```

This document restores the missing enterprise architecture backbone: five functional layers and five data layers.

---

## Five-layer functional architecture

### F1. Business capability layer

Purpose: define what business capabilities ChainTrace provides to the market.

Core capabilities:

- exporter organization proof
- trade case creation
- trade evidence passport generation
- proof-safe sharing
- external verification
- buyer / counterparty confirmation
- finance-readiness pre-review
- reputation accumulation
- AI-agent-readable trade fact layer

User-facing meaning:

```text
Small exporters can turn messy trade records into verifiable business evidence.
```

---

### F2. Business process layer

Purpose: define the end-to-end operating flow.

Current local-first flow:

```text
Create Organization Proof
-> Create Trade Case Proof
-> Attach Evidence Hashes
-> Generate Proof Pack / Passport
-> Sign Passport Root
-> Share Proof Pack
-> External Local Verify
-> Optional Raw File Re-Verify
```

Future network flow:

```text
Buyer confirmation
-> Logistics confirmation
-> Platform confirmation
-> Funder review
-> Risk exception handling
-> Chain commitment
-> Reputation update
```

---

### F3. Application function layer

Purpose: define product modules and screens.

Current modules:

- `/organization-network`: local organization proof
- `/trade-cases`: local trade case proof
- `/evidence`: local evidence hash workspace
- `/proof-packs`: proof pack / passport generator
- `/verify/local`: browser-local verifier

Next modules:

- `/start`: one-click proof pack flow
- `/verify`: public lightweight verifier
- `/trust/:id`: public proof-safe trust page
- `/confirm`: counterparty confirmation flow
- `/finance-readiness`: pre-financing evidence review
- `/agent-api`: AI-agent-readable proof interface

---

### F4. Trust protocol layer

Purpose: define why nobody needs to trust the ChainTrace database.

Trust primitives:

- canonical JSON
- SHA-256 profile hash
- case root hash
- file SHA-256
- evidence hash
- evidence root hash
- passport root hash
- wallet signature
- signed message binding
- optional chain commitment
- local verification
- raw file byte-level re-verification

Trust principle:

```text
Do not trust ChainTrace storage.
Verify the proof.
```

---

### F5. Ecosystem integration layer

Purpose: define how ChainTrace grows from tool into infrastructure.

External actors:

- small exporters
- buyers
- trading companies
- logistics providers
- warehouses
- inspection companies
- banks
- factoring companies
- insurers
- marketplaces
- customs / compliance partners
- third-party AI agents

Integration patterns:

- exported Proof Pack JSON
- public verifier
- signed passport root
- optional on-chain registry
- partner confirmation
- API / agent-readable proof summary
- encrypted cloud backup without plaintext trust

---

## Five-layer data architecture

### D1. Raw evidence data layer

Purpose: preserve the real-world source materials without making ChainTrace the trust source.

Examples:

- contract PDF
- purchase order
- invoice
- packing list
- bill of lading
- warehouse receipt
- QC report
- buyer acceptance
- payment proof
- photos / scans / attachments

Current rule:

```text
Raw files stay user-local by default.
ChainTrace stores or shares only file hash and metadata unless the user explicitly shares the file.
```

---

### D2. Extracted fact data layer

Purpose: convert documents into business facts.

Examples:

- buyer name
- seller name
- invoice number
- PO number
- amount
- currency
- goods description
- shipment date
- destination
- payment term
- due date
- quantity
- acceptance status

Current status:

```text
Partly manual in the local proof flow.
Future step: AI extraction with confidence and field provenance.
```

---

### D3. Structured trade object layer

Purpose: organize facts into business objects.

Objects:

- Organization Profile
- Trade Case
- Evidence Manifest
- Evidence Set
- Proof Pack / Trade Evidence Passport
- Confirmation Record
- Exception Case
- Funding Readiness Snapshot

Current local storage keys:

```text
chaintrace_v2_current_org
chaintrace_v2_trade_cases
chaintrace_v2_evidence_bundles
chaintrace_v2_proof_packs
```

---

### D4. Proof and commitment data layer

Purpose: create verifiable, portable proof objects.

Proof data:

- orgProfileHash
- caseRootHash
- fileSha256
- evidenceHash
- evidenceRootHash
- passportRootHash
- signerAddress
- signature
- signedMessage
- signedAt
- chainCommitStatus
- future transaction hash

Current proof versions:

```text
chaintrace-local-org-proof-v1
chaintrace-local-trade-case-v1
chaintrace-local-evidence-bundle-v1
chaintrace-local-proof-pack-v1
```

---

### D5. Network intelligence and decision data layer

Purpose: convert verified facts into network value.

Future data products:

- buyer confirmation graph
- supplier reliability history
- document consistency score
- dispute / exception history
- finance-readiness score
- receivable candidate status
- RWA claim status
- oracle event count
- platform trust score
- AI-agent trust summary

Important boundary:

```text
Decision data must be derived from verifiable lower-layer facts, not from opaque database claims.
```

---

## Cross-map: function layer to data layer

| Function layer | Main data dependency | Product meaning |
| --- | --- | --- |
| F1 Business capability | D3 + D5 | What ChainTrace sells as business value |
| F2 Business process | D1 + D2 + D3 | How users complete a trade evidence workflow |
| F3 Application function | D3 + D4 | What screens and modules manipulate |
| F4 Trust protocol | D4 | Why the proof is verifiable without database trust |
| F5 Ecosystem integration | D4 + D5 | How ChainTrace becomes infrastructure |

---

## Current implementation coverage

Implemented now:

- F2 local proof process
- F3 local organization / case / evidence / proof pack / verifier modules
- F4 hash, signature, and raw file re-verification primitives
- D1 raw file local rule
- D3 structured local objects
- D4 portable proof bundles

Still missing:

- F1 polished business capability map in product UI
- F5 partner / agent / finance integration
- D2 AI extraction and provenance
- D5 decision intelligence and reputation layer

---

## Product direction

The small entry must stay simple:

```text
Upload docs -> get verifiable passport.
```

The large product must be architected as:

```text
Raw evidence
-> extracted facts
-> structured trade objects
-> cryptographic proof
-> network intelligence
```

This is the actual ChainTrace moat.
