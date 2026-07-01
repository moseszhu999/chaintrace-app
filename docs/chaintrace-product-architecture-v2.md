# ChainTrace Product Architecture v2.0

This document is the authoritative product architecture for the v2 real-platform rebuild.

It replaces earlier demo/story-first assumptions.

## Core rule

```text
Small Entry, Big Product.
Function Architecture → Frontend Menu
Data Architecture → Database Schema
Proof Architecture → Smart Contracts
```

## Product entry

```text
AI Trade Evidence Passport
```

The first real user path is:

```text
Organization
→ Trade Case
→ Evidence Upload
→ SHA-256
→ AI Extraction
→ Consistency Check
→ Evidence Passport
→ Trust Page
→ Counterparty Confirmation
→ Audit Trail
```

## L1 function architecture

1. Organization Network
2. Trade Case Workspace
3. Evidence Registry
4. AI Review Center
5. Trade Evidence Passport
6. Trust Page and Viral Distribution
7. Counterparty Confirmation
8. Scenario and Exception Engine
9. RWA Candidate and Funding Readiness
10. Oracle / IoT Layer
11. Audit Trail and Compliance Boundary
12. Platform Admin

## L1 data architecture

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

## Frontend menu mapping

```text
1. Organization Network
   1.1 My Organization
   1.2 Members
   1.3 Roles
   1.4 External Invites

2. Trade Cases
   2.1 Case List
   2.2 Create Case
   2.3 Case Workspace
   2.4 Case Stages

3. Evidence Registry
   3.1 Upload Evidence
   3.2 Evidence List
   3.3 Hash Records
   3.4 Evidence Status

4. AI Review
   4.1 Extraction Runs
   4.2 Consistency Checks
   4.3 Risk Flags
   4.4 Human Corrections

5. Evidence Passport
   5.1 Passport Preview
   5.2 Readiness Score
   5.3 Missing Items
   5.4 Export Report

6. Trust Page
   6.1 Public Page
   6.2 Share Link
   6.3 Evidence Badge
   6.4 Visibility Settings

7. Confirmations
   7.1 Buyer Confirmation
   7.2 Logistics Confirmation
   7.3 Warehouse Confirmation
   7.4 QC Confirmation
   7.5 Funder View

8. Scenarios & Exceptions
   8.1 Scenario Catalog
   8.2 Exception Cases
   8.3 Human Tasks
   8.4 Review Receipts

9. RWA / Funding Readiness
   9.1 Receivable Candidate
   9.2 RWA Claim Draft
   9.3 Funding Snapshot
   9.4 Funder Export

10. Oracle / IoT
    10.1 Oracle Sources
    10.2 Oracle Events
    10.3 Device Registry
    10.4 Conflicts

11. Audit Trail
    11.1 Case Timeline
    11.2 Evidence Audit
    11.3 AI Audit
    11.4 Compliance Logs

12. Platform Admin
    12.1 Organizations
    12.2 Cases
    12.3 Evidence Types
    12.4 Stage / Scenario Config
```

## Smart contract proof architecture

Do not put full business data on-chain.

Off-chain stores:

- raw PDFs
- full organization profiles
- full trade case data
- AI extraction bodies
- private commercial terms
- full audit bodies

On-chain stores:

- hash
- signature
- timestamp
- state commitment
- event commitment
- version commitment
- public index
- proof root

Contract layer:

1. OrganizationRegistry
2. ActorRegistry
3. CaseRegistry
4. EvidenceRegistry
5. PassportCommitment
6. ConfirmationRegistry
7. OracleEventRegistry
8. ReceivableCandidateRegistry
9. RWAClaimRegistry
10. AuditCommitment

## v2.1 implementation slice

Must build first:

1. Real Auth
2. Real Organization
3. Real Organization Member / Role
4. Real Trade Case
5. Real Evidence Upload
6. Real SHA-256
7. Real AI Extraction
8. Real Consistency Check
9. Real Evidence Passport
10. Real Trust Page
11. Real Counterparty Invite
12. Real Confirmation / Rejection
13. Real Audit Timeline

Reserved but structurally present:

1. RWA Candidate
2. Funding Readiness Snapshot
3. Oracle Event
4. Exception Case
5. Smart Contract Proof Layer

## Forbidden demo patterns

- fake dashboard
- mock-only data
- role-cookie demo
- button without persistence
- landing-page-first development
- financing claim without evidence layer
- raw PDF public exposure by default

## Definition of done

A feature is not done unless:

- data persists after refresh
- users belong to real organizations
- organization permissions are enforced
- every evidence file has a real SHA-256 hash
- AI extraction is based on a real uploaded file
- passport is generated from real case data
- trust page opens by share link
- invite link allows confirmation or rejection
- audit timeline records every important action
- no unsupported legal / credit / disbursement claim is made
