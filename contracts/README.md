# ChainTrace smart contract prototype

This directory contains a prototype contract suite for ChainTrace's four-flow supply-chain financing model.

> Status: prototype only. These contracts are not audited and must not be used with real funds before legal review, security audit, KYC/AML design, oracle design, and jurisdiction-specific compliance review.

## Core idea

ChainTrace aligns four flows for a concrete trade:

1. Commercial flow: PO, invoice, contract terms, acceptance conditions.
2. Logistics flow: container, seal, packing list, VGM, export clearance, B/L, import permit, warehouse receipt, QC, buyer acceptance.
3. Funds flow: financier liquidity, vault funding, credit line, receivable, loan disbursement, repayment, default.
4. Information flow: document hashes, signing/seal status, logistics evidence status, audit trail, proof pack, agent actions.

The contracts do not put raw trade documents on-chain. They store hashes, signing states, logistics evidence gates, role constraints, credit rules, funding events, and financing events.

## Financial architecture

The lender side is intentionally split into three layers:

```text
FinancierPool
  -> collects controlled lender liquidity and mints internal pool shares
BankVault
  -> holds funded liquidity, borrower credit lines, and approved loan-contract permissions
ReceivableLoan
  -> single-trade loan state machine that checks signing + logistics gates before disbursement
```

This keeps lender accounting separate from loan execution and trade-evidence verification.

## Contracts

### `TradeSigningRegistry.sol`

Stores signature/seal slots for the four flows.

Examples:

- Buyer PO signature.
- Exporter invoice seal.
- Quality certificate seal.
- Logistics bill-of-lading seal.
- Warehouse entry seal.
- Buyer acceptance signature.
- RWA issuance multisig gate.

Raw documents stay off-chain. The registry stores:

- `tradeId`
- `slotId`
- flow type
- required signer
- role hash
- document hash
- status
- timestamp
- version
- optional URI

### `LogisticsEvidenceRegistry.sol`

Stores logistics evidence gates that should be readable by financing contracts.

Examples:

- Container / empty-release evidence.
- Packing completion.
- Seal and photo hash.
- VGM submission.
- Vietnam export customs release.
- Singapore import permit / TradeNet URN reference.
- Warehouse receipt.
- Arrival QC report.
- Buyer acceptance / rejection decision.

The registry does not verify real-world facts by itself. It records which party is allowed to verify a specific evidence gate and stores the resulting hash/status.

Raw logistics documents, photos, reports, and permit screenshots stay off-chain. The registry stores:

- `tradeId`
- `evidenceId`
- evidence type
- required verifier
- role hash
- document hash
- status
- timestamp
- version
- optional URI

### `FinancierPool.sol`

Acts as the lender-side liquidity pool prototype.

It manages:

- financier deposits,
- internal pool-share accounting,
- idle liquidity redemption,
- funding liquidity into `BankVault`,
- configuring the vault-supported asset,
- approving loan contracts through the vault,
- granting borrower credit lines through the vault.

In the current prototype, pool shares are simple 1:1 accounting shares for controlled test liquidity. They are not public LP tokens and should not be treated as securities or offered publicly.

### `BankVault.sol`

Acts as the bank-like vault contract.

It manages:

- supported stablecoin assets,
- liquidity deposits,
- owner withdrawals,
- borrower credit lines,
- approved loan contracts,
- loan disbursement,
- repayment recording,
- loss reserve events.

Only approved loan contracts can call `disburseLoan()` and `recordRepayment()`.

In the intended flow, `FinancierPool` owns `BankVault`, so the pool can configure supported assets, approve loan contracts, and grant credit lines under controlled risk rules.

### `ReceivableLoan.sol`

A concrete receivable financing loan contract.

It binds:

- trade ID,
- borrower,
- financier,
- stablecoin asset,
- receivable amount,
- principal,
- fee,
- maturity,
- required signing slots,
- required logistics evidence gates.

Flow:

1. Read commercial/signature gates from `TradeSigningRegistry`.
2. Read logistics/QC gates from `LogisticsEvidenceRegistry`.
3. If all required signing and logistics gates pass, status can move from `Gated` to `Ready`.
4. Financier/owner calls `disburse()`.
5. Loan contract calls `BankVault.disburseLoan()`.
6. Borrower receives USDC.
7. Buyer repayment can be routed to the vault.
8. The contract records repayment and closes when principal + fee are paid.
9. If overdue, financier/owner can mark default.

This is what makes the loan state machine more realistic: PO and invoice alone are not enough. The contract can also require packing/VGM/export clearance, final B/L, import permit, warehouse receipt, arrival QC, and buyer acceptance gates.

### `RestrictedReceivableToken.sol`

A restricted RWA token for receivable-backed rights.

It is not a public token offering. It includes:

- whitelist transfers,
- freeze control,
- transfer pause,
- redemption,
- maturity burn,
- trade ID binding,
- receivable hash binding.

This token should only be issued after the signing, logistics, loan, legal-assignment, and KYC gates satisfy the relevant legal and business conditions.

## CI deployment modes

### Hardhat dev chain

Command:

```bash
npm run contracts:deploy:dev
```

This deploys to an ephemeral in-memory Hardhat chain. It needs no RPC URL, no private key, and no testnet ETH. GitHub Actions runs this automatically after compilation and uploads:

```text
deployments/hardhat-dev.json
```

The addresses in this file are CI validation addresses only. They are not persistent.

### Base Sepolia

Command:

```bash
npm run contracts:deploy:base-sepolia
```

This deploys to Base Sepolia and needs:

```text
BASE_SEPOLIA_RPC_URL
DEPLOYER_PRIVATE_KEY
```

The deployer wallet also needs Base Sepolia ETH for gas. If the wallet has 0 ETH, deployment will fail with `insufficient funds for gas * price + value`.

## Suggested call sequence for the Vietnam coffee trade

1. Deploy `TradeSigningRegistry`.
2. Deploy `LogisticsEvidenceRegistry`.
3. Deploy `BankVault`.
4. Deploy `FinancierPool` with the bank vault and stablecoin asset.
5. Transfer `BankVault` ownership to `FinancierPool`.
6. Financier deposits test stablecoin into `FinancierPool`.
7. `FinancierPool` configures the vault-supported asset.
8. `FinancierPool` funds `BankVault`.
9. `FinancierPool` grants the borrower credit line through `BankVault`.
10. Create signing slots for PO, invoice, quality certificate, bill of lading, warehouse entry, buyer acceptance, and financing multisig.
11. Create logistics evidence gates for packing, VGM, export customs release, Singapore import permit, warehouse receipt, and arrival QC.
12. Sign/seal PO, invoice, and pre-shipment quality certificate.
13. Verify packing list, seal/VGM, and export customs release.
14. Keep B/L final seal and Singapore permit status pending until the logistics provider / buyer updates them.
15. Keep warehouse receipt and arrival QC blocked until the warehouse and lab evidence arrive.
16. Keep buyer acceptance blocked until the buyer signs accept, discount, or reject.
17. Deploy `ReceivableLoan` with required signing slot IDs and required logistics evidence IDs.
18. Approve the loan contract through `FinancierPool`.
19. Loan contract checks both signing and logistics gates.
20. If only early gates pass, financier can do pre-review but cannot execute disbursement.
21. When all gates pass, loan contract disburses USDC from `BankVault` to the exporter.
22. Buyer balance payment enters repayment flow.
23. Loan closes when principal + fee are repaid.
24. Optional: issue restricted `RestrictedReceivableToken` if the permitted jurisdiction and KYC/whitelist transfer requirements are satisfied.

## Risk boundaries

The contracts intentionally do not:

- verify real-world goods by themselves,
- validate legal enforceability,
- custody user private keys,
- bypass KYC/AML,
- offer tokens to the public,
- replace official customs or food-safety systems,
- replace off-chain legal assignment or recourse documents,
- make pool shares publicly tradable investment products.

Those controls must be handled by legal wrappers, regulated partners, KYC providers, attestation/oracle systems, and audited operational workflows.
