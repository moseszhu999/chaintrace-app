# ChainTrace smart contract prototype

This directory contains a prototype contract suite for ChainTrace's four-flow supply-chain financing model.

> Status: prototype only. These contracts are not audited and must not be used with real funds before legal review, security audit, KYC/AML design, oracle design, and jurisdiction-specific compliance review.

## Core idea

ChainTrace aligns four flows for a concrete trade:

1. Commercial flow: PO, invoice, contract terms, acceptance conditions.
2. Logistics flow: shipment, bill of lading, container, warehouse entry, delivery, buyer acceptance.
3. Funds flow: deposit, receivable, payable, loan disbursement, repayment, default.
4. Information flow: document hashes, signing/seal status, audit trail, proof pack, agent actions.

The contracts do not put raw trade documents on-chain. They store hashes, signing states, role constraints, credit rules, and financing events.

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

### `BankVault.sol`

Acts as the bank-like contract.

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
- required signing slots.

Flow:

1. Read gates from `TradeSigningRegistry`.
2. If all required slots are signed, status can move from `Gated` to `Ready`.
3. Financier/owner calls `disburse()`.
4. Loan contract calls `BankVault.disburseLoan()`.
5. Borrower receives USDC.
6. Buyer repayment can be routed to the vault.
7. The contract records repayment and closes when principal + fee are paid.
8. If overdue, financier/owner can mark default.

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

This token should only be issued after the signing and loan gates satisfy the relevant legal and business conditions.

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
2. Create signing slots for PO, invoice, quality certificate, bill of lading, warehouse entry, buyer acceptance, and financing multisig.
3. Sign/seal PO, invoice, and quality certificate.
4. Keep bill of lading pending until logistics provider confirms.
5. Keep warehouse entry and buyer acceptance blocked until documents arrive.
6. Deploy `BankVault`.
7. Mark USDC as a supported asset.
8. Deposit USDC liquidity.
9. Grant borrower credit line.
10. Deploy `ReceivableLoan` with required signing slots.
11. Approve the loan contract in `BankVault`.
12. Loan contract checks signing gates.
13. When all gates pass, loan contract disburses USDC from `BankVault` to the exporter.
14. Buyer balance payment enters repayment flow.
15. Loan closes when principal + fee are repaid.
16. Optional: issue restricted `RestrictedReceivableToken` if the permitted jurisdiction and KYC/whitelist transfer requirements are satisfied.

## Risk boundaries

The contracts intentionally do not:

- verify real-world goods by themselves,
- validate legal enforceability,
- custody user private keys,
- bypass KYC/AML,
- offer tokens to the public,
- replace off-chain legal assignment or recourse documents.

Those controls must be handled by legal wrappers, regulated partners, KYC providers, attestation/oracle systems, and audited operational workflows.
