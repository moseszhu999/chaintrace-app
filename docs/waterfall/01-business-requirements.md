# 01 Business Requirements

## Core principle

ChainTrace is not a traditional manual workflow system, and it is not a supply-chain-finance front office.

It is an Agent Native + Crypto Native supply-chain-finance system.

It includes exporter workflows, optional bank / funding-provider workflows, third-party fact-provider workflows, platform operation, AI Agent operation, and the DeFi smart-contract execution layer.

At the business level, ChainTrace should be understood as:

> A supply-chain-finance system whose financing workflows are coordinated by role-specific agents and whose core financial execution can be performed or constrained by DeFi smart contracts.

Not every scenario requires a bank. ChainTrace must support multiple execution paths:

| Execution path | Meaning |
|---|---|
| Bank-assisted financing | A bank / funding provider reviews the case and authorizes financing before DeFi execution. |
| Pure DeFi financing | Smart contracts execute or block financing according to predefined rules, pools, collateral, and verified facts, without a bank-side approval step. |
| Agent + smart-contract minimal-human workflow | AI Agents coordinate facts, tasks, legal/business checks, and smart contracts execute rule-bound actions; humans mainly handle exceptions, disputes, and high-risk authorization. |

Normal cases should be advanced mostly by agents and rule execution. Human users should mainly handle authorization, exceptions, disputes, and high-value judgment.

## Work modes available to every role

| Mode | Meaning |
|---|---|
| Full manual confirmation | Every step asks the user before continuing. |
| Semi-automatic agent custody | The agent advances routine steps and asks the user only at key points or exceptions. |
| Full automatic agent mode | The agent advances within authorization boundaries and alerts users when exceptions appear. |

## Business target

Approximately 70% of normal cases should proceed with little or no human operation.

No more than approximately 30% of cases should require human handling due to missing materials, risk, dispute, unusual amount, rule exception, or operational abnormality.

## Roles

| Role | Business goal | Desired result |
|---|---|---|
| Funding demander / exporter | Use trade evidence to obtain financing. | Know whether financing is possible, how much can be borrowed, and whether funds arrived. |
| Funding provider / bank / factoring institution | Review financing cases and decide lending actions when the scenario requires bank participation. | Know authenticity, evidence completeness, risk threshold result, and whether lending is safe. |
| Inspection party | Provide reliable inspection facts and conclusions. | Know tasks, required evidence, and whether the inspection conclusion is accepted. |
| Platform / contract operator | Keep pools, rules, contract state, and exceptions under control. | Know whether the pool and contract are safe, which cases are abnormal, and whether to pause/upgrade. |
| Logistics party | Provide shipping and delivery facts. | Confirm logistics facts without joining financial approval. |
| Customs / declaration data party | Provide trade authenticity and clearance facts. | Confirm declaration/clearance status and regulatory abnormalities. |
| Insurance company | Provide underwriting, claim, and risk mitigation judgment. | Know whether to cover, add premium, reject, request materials, or process claims. |
| Buyer / importer / payer | Confirm trade relevance, receipt, dispute, and payment responsibility. | Know what to confirm and whether payment responsibility exists. |
| DeFi smart contract layer | Execute or block rule-bound financial actions, enforce pool constraints, and record settlement states. | Know whether execution is allowed, blocked, waiting, failed, or completed, with or without a bank path depending on scenario. |

## Boundary

This document intentionally does not define pages, components, hashes, proofs, wallet signatures, database tables, Solidity, ABI, or deployment implementation.
