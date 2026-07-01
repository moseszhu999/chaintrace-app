# ChainTrace Agent Native Waterfall Redesign

This branch is a clean waterfall redesign branch for ChainTrace.

## Branch rule

This branch does not continue the previous demo/dashboard/page codebase.

Old product code is intentionally not used as the foundation of this branch.

## Current scope

No code implementation yet.
No pre-login marketing/display page yet.

The first deliverables are business requirements, role definitions, registration/login rules, and role-specific workflows.

## Product positioning

ChainTrace is an Agent Native + Crypto Native supply-chain-finance system.

It is not only a front-office intake layer. It includes exporter workflows, optional bank / funding-provider workflows, third-party fact-provider workflows, platform operation, AI Agent operation, and the DeFi smart-contract financial execution layer.

Different scenarios can use different execution paths. Some scenarios require bank review. Some scenarios can be executed directly by DeFi smart contracts after Agent and rule checks. Some low-human-touch legal or operational scenarios may need only AI Agents and smart contracts, with humans handling exceptions, disputes, and high-risk authorization.

The system starts from real business roles and financing outcomes:

- funding demander / exporter
- funding provider / bank / factoring institution, when the scenario requires a bank-side decision
- inspection party
- platform / contract operator
- DeFi smart-contract financial execution layer
- logistics party
- customs / declaration data party
- insurance company
- buyer / importer / payer

Each wallet registers one permanent business role. After registration, the wallet enters only that role's workspace.

## Explicitly deferred

- Pre-login display/marketing page
- UI component design
- implementation code
- database design
- hash/proof/wallet-signature implementation details
- DeFi smart-contract implementation details
