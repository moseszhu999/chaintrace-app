# ChainTrace Product-specific Five-layer Function and Data Architecture

## Architecture decision

This document uses the ChainTrace product-specific five-layer model, not a generic TOGAF layer list.

The purpose is to connect:

```text
product navigation
-> workspace pages
-> components and actions
-> local data objects
-> proof bundles / signatures / future chain commitments
```

Small entry:

```text
Upload trade documents -> get a verifiable Trade Evidence Passport.
```

Large product:

```text
A supply-chain fact and proof infrastructure for small exporters, buyers, logistics partners, financiers, marketplaces, and AI agents.
```

---

# Part I. Five-layer function architecture

The function architecture is a product decomposition from menu to action.

```text
F-L1 Product Domain / Primary Menu
F-L2 Business Capability / Secondary Module
F-L3 Workspace Page / Use Case
F-L4 Panel / Component / Tab
F-L5 Action / Field / State / Permission
```

This makes the architecture directly implementable.

---

## F-L1 Product Domain / Primary Menu

L1 is the top-level product domain. It should map to the main navigation and commercial product modules.

Current and target L1 domains:

1. Organization Network
2. Trade Case Workspace
3. Evidence Registry
4. AI Review Center
5. Trade Evidence Passport
6. Trust Page / Public Verify
7. Counterparty Confirmation
8. Scenario and Exception Engine
9. RWA / Funding Readiness
10. Oracle / IoT Event Layer
11. Audit Trail and Compliance Boundary
12. Platform Admin / Operator OS

Current implemented L1 subset:

```text
Organization Network
Trade Case Workspace
Evidence Registry
Trade Evidence Passport
Trust Page / Public Verify
```

---

## F-L2 Business Capability / Secondary Module

L2 is the business capability inside each L1 domain.

### Organization Network

- create local organization proof
- export Organization Recovery Kit
- import Organization Recovery Kit
- wallet-sign organization profile hash
- manage local organization identity

### Trade Case Workspace

- create local trade case
- generate case root hash
- export Case Kit
- import Case Kit
- bind case to seller organization hash

### Evidence Registry

- select trade case
- attach evidence metadata
- compute browser-local file SHA-256
- generate evidence hash
- generate evidence root hash
- export Evidence Kit
- import Evidence Kit

### AI Review Center

- extract document fields
- attach provenance to each extracted field
- compare invoice / PO / BL / packing list
- detect conflicts
- create review flags
- generate human-readable explanation

### Trade Evidence Passport

- collect organization proof
- collect case proof
- collect evidence proofs
- calculate evidence root hash
- calculate passport root hash
- wallet-sign passport root hash
- export Proof Pack

### Trust Page / Public Verify

- paste proof JSON
- recompute hash
- verify signature
- optional raw file re-verify
- show proof-safe result

### Counterparty Confirmation

- invite buyer / logistics / warehouse / inspection party
- sign confirmation
- bind confirmation to case root
- record acceptance / dispute

### Scenario and Exception Engine

- detect missing evidence
- detect inconsistent facts
- detect unsupported financing claims
- classify risk scenarios
- generate exception case

### RWA / Funding Readiness

- evaluate receivable candidate
- calculate readiness score
- classify RWA claim status
- enforce pre-review only boundary
- block disbursement claims

### Oracle / IoT Event Layer

- ingest external event hash
- bind logistics / warehouse / inspection events
- record source and timestamp
- create oracle event proof

### Audit Trail and Compliance Boundary

- record local actions
- record proof generation events
- record signature events
- record verification events
- preserve disclaimer records

### Platform Admin / Operator OS

- monitor product health
- manage feature flags
- manage partner configurations
- manage proof protocol versions
- inspect non-private operational metrics

---

## F-L3 Workspace Page / Use Case

L3 is the page or major use case.

Current L3 pages:

```text
/organization-network
/trade-cases
/evidence
/proof-packs
/verify/local
```

Target L3 pages:

```text
/start
/organization-network
/trade-cases
/trade-cases/[id]
/evidence
/ai-review
/proof-packs
/verify
/verify/local
/trust/[passportRootHash]
/confirm/[inviteId]
/finance-readiness
/oracle-events
/audit
/operator-os
```

The key public small-entry pages should be:

```text
/start
/verify
/trust/[passportRootHash]
```

The workspace pages can remain deeper for power users.

---

## F-L4 Panel / Component / Tab

L4 is the actual UI section inside a workspace.

Examples:

### Organization Network panels

- organization profile form
- proof summary card
- wallet signature panel
- Recovery Kit export / import panel

### Trade Case panels

- case form
- case proof summary
- Case Kit export / import panel
- case list

### Evidence panels

- case selector
- evidence type selector
- file picker
- SHA-256 result card
- evidence list
- Evidence Kit export / import panel

### Proof Pack panels

- case selector
- proof dependency summary
- evidence count summary
- passport root summary
- wallet signature panel
- Proof Pack export panel

### Verify panels

- JSON input
- optional raw file input
- recomputed hash summary
- signature verification result
- detailed check list
- boundary disclaimer

---

## F-L5 Action / Field / State / Permission

L5 is the smallest executable product unit.

Examples of L5 actions:

- create organization proof
- copy org profile hash
- connect wallet
- sign org profile hash
- download Recovery Kit
- import Recovery Kit
- create trade case
- copy case root hash
- download Case Kit
- upload local file
- compute file SHA-256
- download Evidence Kit
- generate Proof Pack
- sign passport root hash
- download Proof Pack
- paste proof JSON
- verify proof locally
- upload raw file for re-verification

Examples of L5 fields:

- organization name
- organization type
- country
- owner email
- case name
- buyer name
- amount
- currency
- goods description
- origin country
- destination country
- evidence type
- stage code
- file name
- file size
- file SHA-256

Examples of L5 states:

- LOCAL_ONLY
- NOT_COMMITTED
- COMMITTED
- NOT_SIGNED
- SIGNED
- VERIFIED
- FAILED
- WARN
- DRAFT
- PRE_REVIEW_ONLY
- GATES_NOT_PASSED

Examples of L5 permissions:

- local owner
- organization member
- signer
- invited verifier
- counterparty confirmer
- operator
- public verifier

---

# Part II. Five-layer data architecture

The data architecture is a decomposition from business data domain to proof commitment.

```text
D-L1 Data Domain
D-L2 Aggregate Root / Main Entity
D-L3 Child Entity / Relationship Entity
D-L4 Field / State / Event
D-L5 Proof / Hash / Signature / Version / Commitment
```

This makes the architecture directly mappable to localStorage, future database tables, API contracts, and chain registry contracts.

---

## D-L1 Data Domain

L1 is the major data domain.

Current and target D-L1 domains:

1. Organization Domain
2. Trade Case Domain
3. Evidence Domain
4. AI Review Domain
5. Passport Domain
6. Confirmation Domain
7. Oracle / IoT Domain
8. Exception Domain
9. RWA / Funding Domain
10. Audit / Compliance Domain
11. User / Permission Domain
12. Protocol / Version Domain

Current implemented D-L1 subset:

```text
Organization Domain
Trade Case Domain
Evidence Domain
Passport Domain
Audit / Compliance boundary text
Protocol / Version Domain
```

---

## D-L2 Aggregate Root / Main Entity

L2 is the aggregate root or main object in each domain.

### Organization Domain

- OrganizationProfile
- OrganizationRecord
- OrganizationMember
- OrganizationProofBundle

### Trade Case Domain

- TradeCase
- TradeCasePrivateData
- TradeCaseProofBundle
- TradeCaseStage
- TradeCaseTransition

### Evidence Domain

- EvidenceManifest
- EvidenceFileHash
- EvidenceProofBundle
- EvidenceSet

### AI Review Domain

- AIReviewRun
- ExtractedField
- FieldProvenance
- ConsistencyCheck
- RiskFlag

### Passport Domain

- TradeEvidencePassport
- ProofPack
- PassportRoot
- PassportSignature

### Confirmation Domain

- Invite
- Confirmation
- CounterpartySignature
- ConfirmationHash

### Oracle / IoT Domain

- OracleEvent
- EventSource
- EventPayloadHash
- EventTimestamp

### Exception Domain

- ExceptionCase
- ExceptionType
- ExceptionResolution

### RWA / Funding Domain

- ReceivableCandidate
- FundingReadinessSnapshot
- RWAClaim
- FundingGate

### Audit / Compliance Domain

- AuditEvent
- DisclaimerRecord
- PolicyBoundary

### User / Permission Domain

- User
- Role
- Permission
- Membership

### Protocol / Version Domain

- ProofVersion
- HashAlgorithm
- SignatureScheme
- RegistryVersion

---

## D-L3 Child Entity / Relationship Entity

L3 represents child objects or relationship objects.

Examples:

### Organization Domain

- member belongs to organization
- organization profile belongs to signer
- organization proof binds profile hash to local owner

### Trade Case Domain

- case belongs to seller organization proof
- case may reference buyer organization
- case has stages
- case has transitions
- case has evidence set

### Evidence Domain

- evidence belongs to case root
- evidence manifest references file SHA-256
- evidence belongs to trade stage
- evidence set belongs to case root

### Passport Domain

- passport contains organization proof
- passport contains case proof
- passport contains evidence proofs
- passport signature signs passport root hash

### Confirmation Domain

- confirmation belongs to passport root or case root
- confirmation belongs to counterparty
- confirmation signs acceptance / rejection / dispute

### RWA / Funding Domain

- receivable candidate references case root
- funding snapshot references evidence root
- RWA claim references passport root

---

## D-L4 Field / State / Event

L4 is the concrete data field, state, or event.

### Key fields

- organizationName
- orgType
- country
- ownerEmail
- orgProfileHash
- caseName
- buyerName
- amount
- currency
- goodsDescription
- originCountry
- destinationCountry
- paymentTerm
- expectedShipmentDate
- expectedDueDate
- caseRootHash
- evidenceType
- stageCode
- filename
- mimeType
- fileSize
- fileSha256
- evidenceHash
- evidenceRootHash
- passportRootHash
- signerAddress
- signature
- signedMessage
- signedAt

### Key states

- DRAFT
- LOCAL_ONLY
- NOT_COMMITTED
- COMMITTED
- NOT_SIGNED
- SIGNED
- VERIFIED
- FAILED
- WARN
- PRE_REVIEW_ONLY
- GATES_NOT_PASSED
- NOT_READY
- NOT_CREATED

### Key events

- organization proof generated
- organization proof signed
- case root generated
- evidence hash generated
- evidence root updated
- proof pack generated
- passport root signed
- proof verified
- raw file re-verified
- counterparty confirmed
- exception raised
- readiness snapshot generated

---

## D-L5 Proof / Hash / Signature / Version / Commitment

L5 is the verifiable data layer.

Current local proof versions:

```text
chaintrace-local-org-proof-v1
chaintrace-local-trade-case-v1
chaintrace-local-evidence-bundle-v1
chaintrace-local-proof-pack-v1
```

Current hashes:

```text
orgProfileHash = SHA-256(canonical privateProfile)
caseRootHash = SHA-256(canonical privateData)
fileSha256 = SHA-256(raw file bytes)
evidenceHash = SHA-256(canonical evidence manifest)
evidenceRootHash = SHA-256(sorted evidence hashes + case root)
passportRootHash = SHA-256(org hash + case root + evidence root + evidence hashes)
```

Current signatures:

```text
organization signature signs orgProfileHash
passport signature signs passportRootHash
```

Future chain commitments:

```text
OrganizationRegistry: orgProfileHash, signer, timestamp, version
CaseRegistry: caseRootHash, sellerOrgProfileHash, signer, timestamp, version
EvidenceRegistry: evidenceHash, evidenceRootHash, caseRootHash, signer, timestamp, version
PassportRegistry: passportRootHash, caseRootHash, evidenceRootHash, signer, timestamp, version
ConfirmationRegistry: confirmationHash, passportRootHash, confirmer, timestamp, version
```

---

# Part III. Function-to-data mapping

| Function L1 | Main Data L1 | Current implementation |
| --- | --- | --- |
| Organization Network | Organization Domain | local org proof, wallet signature, Recovery Kit |
| Trade Case Workspace | Trade Case Domain | local case root, Case Kit |
| Evidence Registry | Evidence Domain | file SHA-256, evidence hash, Evidence Kit |
| Trade Evidence Passport | Passport Domain | proof pack, passport root, wallet signature |
| Trust Page / Public Verify | Proof / Audit Domain | local verify, raw file re-verify |
| AI Review Center | AI Review Domain | not implemented |
| Counterparty Confirmation | Confirmation Domain | not implemented |
| Scenario and Exception Engine | Exception Domain | not implemented |
| RWA / Funding Readiness | RWA / Funding Domain | type fields only |
| Oracle / IoT Event Layer | Oracle / IoT Domain | type fields only |
| Audit Trail and Compliance Boundary | Audit / Compliance Domain | boundary text only |
| Platform Admin / Operator OS | Operator / Protocol Domain | not implemented in v2 local flow |

---

# Part IV. Current implementation coverage

## Already implemented

### Function layers

- F-L1 subset: Organization, Trade Case, Evidence, Passport, Verify
- F-L2 local capabilities for proof generation and verification
- F-L3 workspace pages
- F-L4 proof panels and verifier panels
- F-L5 actions: generate, sign, export, import, verify, raw file re-verify

### Data layers

- D-L1 Organization / Trade Case / Evidence / Passport domains
- D-L2 local proof bundles
- D-L3 object relationships through hash binding
- D-L4 states and fields
- D-L5 hashes, signatures, versions

## Not yet implemented

- AI Review Center
- ExtractedField and FieldProvenance
- ConsistencyCheck and RiskFlag
- CounterpartyConfirmation
- ExceptionCase
- FundingReadinessSnapshot UI
- ReceivableCandidate workflow
- OracleEvent workflow
- Public Trust Page
- One-click Start flow
- Chain registry commitment

---

# Part V. Correct product interpretation

The small product entry is not the whole architecture.

Small entry:

```text
Upload docs -> get verifiable passport.
```

Large product architecture:

```text
F-L1 menu domain
-> F-L2 business capability
-> F-L3 workspace
-> F-L4 component
-> F-L5 action / field / state
```

Large data architecture:

```text
D-L1 domain
-> D-L2 aggregate
-> D-L3 relationship
-> D-L4 field / state / event
-> D-L5 proof / hash / signature / commitment
```

This is the ChainTrace product-specific TOGAF skeleton.
