# ChainTrace API Examples

These examples are for the local mock API only. They help developers exercise the Vietnam Robusta coffee pre-review flow without guessing request payloads.

The current demo case remains:

- Readiness Score: `62/100`
- Loan gates: `6/12 passed`
- Status: `Pre-review only`
- Blocker code: `GATES_NOT_PASSED`
- Formal disbursement: `disbursementAllowed: false`

Start the app before running the examples:

```bash
npm run dev
```

The examples below assume the app is available at `http://localhost:3000`.

## Upload Warehouse Receipt Metadata

This records warehouse receipt metadata and a supplied document hash. It does not automatically pass the warehouse receipt gate.

```bash
curl -sS -X POST http://localhost:3000/api/evidence/upload \
  -H "content-type: application/json" \
  -d '{
    "tradeId": "trade_vn_coffee_sg_2026_0007",
    "fileName": "VN-Robusta-Warehouse-Receipt-WR-2026-031.pdf",
    "documentType": "warehouse_receipt",
    "issuer": "Singapore bonded warehouse operator",
    "documentNo": "WR-2026-031",
    "hash": "0x7f5a8e1c3d2b9a4066c7f887e1432f5a7d2c88b6d0fd5a4b227a0a96f2f54031",
    "note": "Warehouse receipt metadata for the Vietnam Robusta coffee shipment."
  }'
```

Expected response fields:

```json
{
  "accepted": true,
  "tradeId": "trade_vn_coffee_sg_2026_0007",
  "agentPlan": {
    "financingDecisionBeforeRecheck": {
      "blockerCode": "GATES_NOT_PASSED",
      "disbursementAllowed": false
    }
  }
}
```

The returned `evidenceId` is deterministic for the submitted `tradeId`, `documentNo`, and `hash`.

## Review Evidence Metadata

This records a human or professional review receipt for an evidence record. It can move an uploaded evidence item to `verified`, `rejected`, or `needs_agent_review`. It does not store raw PDFs, sign a wallet message, send a transaction, or allow disbursement.

```bash
curl -sS -X POST http://localhost:3000/api/evidence/evidence_trade_vn_coffee_sg_2026_0007_wr_2026_031_0x7f5a8e1c3d2b9/review \
  -H "content-type: application/json" \
  -d '{
    "action": "verify",
    "reviewerRole": "operator",
    "reviewerName": "ChainTrace Operator",
    "reason": "Warehouse receipt metadata matches the case and can support the warehouse_receipt gate."
  }'
```

Expected response fields:

```json
{
  "accepted": true,
  "reviewReceipt": {
    "action": "verify",
    "reviewerRole": "operator",
    "beforeStatus": "needs_agent_review",
    "afterStatus": "verified",
    "agentDecisionAuthority": "none"
  },
  "gateSummary": {
    "blockerCode": "GATES_NOT_PASSED",
    "disbursementAllowed": false
  },
  "guardrails": {
    "status": "Pre-review only",
    "blockerCode": "GATES_NOT_PASSED",
    "disbursementAllowed": false
  }
}
```

Supported actions are `verify`, `reject`, and `request_more_evidence`. Supported reviewer roles are `operator` and `professional`.

## Upload Arrival QC Report Metadata

This records arrival quality inspection metadata. It does not automatically resolve the moisture dispute or pass the arrival QC gate.

```bash
curl -sS -X POST http://localhost:3000/api/evidence/upload \
  -H "content-type: application/json" \
  -d '{
    "tradeId": "trade_vn_coffee_sg_2026_0007",
    "fileName": "VN-Robusta-Arrival-QC-AQC-2026-019.pdf",
    "documentType": "arrival_quality_inspection",
    "issuer": "Independent QC laboratory",
    "documentNo": "AQC-2026-019",
    "hash": "0x0b8d2a7c9e1f4b6532c8aa9d7e6f0145b9d94e0a6c2f72f66d83e124cc9a5017",
    "note": "Arrival QC metadata; final moisture conclusion still needs review."
  }'
```

Expected response fields:

```json
{
  "accepted": true,
  "tradeId": "trade_vn_coffee_sg_2026_0007",
  "agentPlan": {
    "financingDecisionBeforeRecheck": {
      "blockerCode": "GATES_NOT_PASSED",
      "disbursementAllowed": false
    }
  }
}
```

## Create Pre-Review Loan Request Draft

This creates a mock pre-review draft for `LoanRequestRegistry`. It is not a loan approval and it does not create a disbursable `ReceivableLoan`.

```bash
curl -sS -X POST http://localhost:3000/api/loan-requests/pre-review \
  -H "content-type: application/json" \
  -d '{
    "tradeId": "trade_vn_coffee_sg_2026_0007",
    "borrowerWallet": "0xBorrowerWalletMock",
    "beneficiaryWallet": "0xExporterBeneficiaryMock",
    "asset": "USDC",
    "requestedAdvance": "USDC 29,500",
    "evidencePackURI": "ipfs://chaintrace/vn-coffee/financing-pack-v0.1.json",
    "evidencePackHash": "0xmock_financing_pack_hash"
  }'
```

Expected response fields:

```json
{
  "accepted": true,
  "loanRequestDraft": {
    "status": "PreReview",
    "blockerCode": "GATES_NOT_PASSED",
    "disbursementAllowed": false,
    "preReviewAllowed": true,
    "contractTarget": "LoanRequestRegistry.submitPreReviewRequest"
  },
  "guardrails": {
    "formalDisbursementBlocked": true,
    "reason": "GATES_NOT_PASSED",
    "allowedAction": "PRE_REVIEW_ONLY"
  }
}
```

The only allowed action at this stage is `PRE_REVIEW_ONLY`. Professional review and complete evidence gates are still required before any later conversion to `ReceivableLoan`.
