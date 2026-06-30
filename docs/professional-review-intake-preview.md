# Professional Review Intake Preview

This document summarizes the public converter handoff added for issue #43.

The public converter now presents a preview-only path:

```text
Pre-review Trust Pack
  -> Professional Review Intake preview
  -> Operator OS queue handoff preview
```

## Boundary

The preview is intentionally non-mutating:

- no actual submission
- no backend persistence
- no email or notification sending
- no reviewer assignment mutation
- no PDF upload
- no real LLM call
- no real wallet signature
- no transaction sending
- no RPC provider or secret
- no private key handling
- no legal opinion
- no credit approval

The only allowed action is:

```text
PROFESSIONAL_REVIEW_INTAKE_ONLY
```

The Vietnam Robusta coffee demo remains:

- `Pre-review only`
- `GATES_NOT_PASSED`
- `disbursementAllowed=false`
- `intakeStatus=draft_preview`
