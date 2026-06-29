# ChainTrace Financing Evidence OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement GitHub issues #2, #3, #6, #8, and #10 while preserving the ChainTrace pre-review-only financing guardrails from issue #11.

**Architecture:** Keep the app mock-driven and fixture-backed. Add UI panels through existing workspace primitives, validate API contracts with one lightweight Node script, harden existing Hardhat tests, and update README copy without changing Solidity behavior.

**Tech Stack:** Next.js, React, TypeScript, Node.js, Hardhat, Solidity, Chai.

## Global Constraints

- Current case status must remain `Pre-review only`.
- Formal disbursement must remain blocked.
- Blocker code must remain `GATES_NOT_PASSED`.
- Loan gates must remain `6/12 passed`.
- Readiness Score must remain `62/100`.
- `disbursementAllowed` must remain `false` for the Vietnam coffee case.
- Do not write copy that implies approved loan, real lending, guaranteed financing, or automatic disbursement.
- Do not weaken gate, compliance, or disbursement guardrails.

---

### Task 1: Readiness UI Pre-Review Handoff

**Files:**
- Modify: `components/workspace/ReceivableReadinessView.tsx`

**Interfaces:**
- Consumes: `DecisionPanel`, `StatusList`, `WorkspaceHero` actions from `components/workspace/WorkspacePrimitives.tsx`.
- Produces: visible `/api/loan-requests/pre-review` link and decision panel text for `/business-readiness`.

- [ ] Add the pre-review API action to `WorkspaceHero.actions`.
- [ ] Add a `DecisionPanel` after the existing financier conclusion that lists Financing Pack API -> Pre-review API -> `LoanRequestRegistry.submitPreReviewRequest` -> blocked formal disbursement.
- [ ] Run `npm run build` after all UI/doc tasks.

### Task 2: Contract Console Lifecycle Panel

**Files:**
- Modify: `components/workspace/ContractConsoleView.tsx`

**Interfaces:**
- Consumes: local `MetricCard`, `styles.list`, and `styles.listRow`.
- Produces: lifecycle panel showing `PreReview`, `ReviewBlocked`, `Approved`, `ConvertedToLoan`, plus current Vietnam coffee state.

- [ ] Add a panel before the contract layers panel.
- [ ] Show `LoanRequestRegistry` as the entry point before `ReceivableLoan`.
- [ ] Show current state: `PreReview`, `62/100`, `GATES_NOT_PASSED`, and formal disbursement blocked.
- [ ] Run `npm run build` after all UI/doc tasks.

### Task 3: API Contract Validation

**Files:**
- Create: `scripts/validate-api-contracts.js`
- Modify: `package.json`

**Interfaces:**
- Produces command: `npm run api:validate`.
- Validates responses from:
  - `app/api/agents/run/route.ts`
  - `app/api/agents/gates/route.ts`
  - `app/api/loan-requests/pre-review/route.ts`

- [ ] Create a Node validation script that imports route handlers dynamically.
- [ ] Assert agent pipeline keys exist.
- [ ] Assert gates stay `6/12`, `GATES_NOT_PASSED`, and not disbursable.
- [ ] Assert pre-review draft stays `PreReview`, score `62`, pre-review allowed, and not disbursable.
- [ ] Add `api:validate` script to `package.json`.
- [ ] Run `npm run api:validate` and confirm it passes.

### Task 4: LoanRequestRegistry Test Hardening

**Files:**
- Modify: `test/LoanRequestRegistry.test.js`
- Modify: `scripts/deploy-vn-coffee-case.js`

**Interfaces:**
- Consumes: existing `LoanRequestRegistry` Solidity API.
- Produces: Hardhat coverage for evidence updates, cancel, owner-only review, conversion precondition, unknown request reverts.

- [ ] Add test helper for submitting the Vietnam coffee pre-review request.
- [ ] Add tests for `updateEvidencePack`.
- [ ] Add tests for `cancel`.
- [ ] Add tests that non-owner cannot approve or reject.
- [ ] Add tests that conversion requires `Approved`.
- [ ] Add tests that unknown request IDs revert.
- [ ] Tighten `deploy-vn-coffee-case.js` next-step wording to require professional review and all gates before conversion/disbursement.
- [ ] Run `npm run contracts:compile`.
- [ ] Run `npm run contracts:test`.

### Task 5: Product README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: issue #11 product position and guardrails.
- Produces: reviewer-ready product documentation.

- [ ] Replace old proof-page MVP positioning with ChainTrace financing evidence OS positioning.
- [ ] Include Vietnam coffee demo facts.
- [ ] Include key UI and API routes.
- [ ] Include Agent/API chain.
- [ ] Include contract map.
- [ ] Include safety guardrails and local commands.
- [ ] Run `rg -n "approved loan|real lending|guaranteed financing|automatic disbursement|automatic financing" README.md components app lib scripts test contracts` and review any hits for guardrail violations.

### Task 6: Final Verification

**Files:**
- Read all touched paths through `git diff --check` and targeted command output.

**Interfaces:**
- Produces final evidence for completion.

- [ ] Run `npm run api:validate`.
- [ ] Run `npm run build`.
- [ ] Run `npm run contracts:compile`.
- [ ] Run `npm run contracts:test`.
- [ ] Run `git diff --check`.
- [ ] Run `git status --short`.
