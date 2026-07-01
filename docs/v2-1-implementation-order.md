# ChainTrace v2.1 Implementation Order

Parent epic: #95

## Current branch

```text
v2-real-platform
```

## Branch status

This branch is now ahead of `main` with the initial v2.1 foundation commits.

Added:

- `docs/chaintrace-product-architecture-v2.md`
- `docs/v2-1-implementation-order.md`
- `database/schema-v2.1.sql`
- `database/README.md`

Updated:

- `package.json` product description to v2 real-platform positioning

## Development order

1. #96 schema foundation
2. #97 organization network
3. #98 trade case workspace
4. #99 evidence upload and SHA-256 registry
5. #100 AI extraction pipeline based on real uploaded files
6. #101 consistency check engine
7. #102 evidence passport generation
8. #103 public trust page
9. #104 counterparty invite / confirmation / rejection
10. #105 audit timeline
11. #106 reserved RWA / Funding / Oracle / Smart Contract placeholders
12. #107 remove old demo narrative and mock dashboard assumptions

## Critical repository finding

The current v2-real-platform branch still contains demo assumptions that must be replaced:

- `lib/workspace-route-context.ts` reads demo role cookie/header.
- `lib/workspace-repository.ts` returns `demoWorkspace` directly.
- `lib/repositories/chaintrace-repository.ts` still seeds a demo case and only persists part of the evidence flow.

## v2.1 first replacement target

Replace demo workspace with real repositories:

```text
workspace-repository
→ organization repository
→ trade case repository
→ evidence repository
→ passport repository
→ invite repository
→ audit repository
```

## Non-negotiable rule

No fake dashboard or mock-only data may be presented as production workflow.
