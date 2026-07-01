# /verify/local Implementation Plan

## Slice

Build a browser-only proof verifier for local ChainTrace kits.

```text
/verify/local
```

## Files

Add:

```text
components/v2/LocalVerifyClient.tsx
app/verify/local/page.tsx
```

## Client responsibilities

`LocalVerifyClient` should:

1. Accept pasted JSON.
2. Detect kit type by `version`.
3. Recompute canonical SHA-256 in the browser.
4. Compare recomputed hash with claimed proof hash.
5. Verify wallet signature when present using `viem`.
6. Display proof-safe summary only.
7. Never call an API.
8. Never store the pasted kit.

## Supported kits

Organization:

```text
chaintrace-local-org-proof-v1
```

Trade Case:

```text
chaintrace-local-trade-case-v1
```

## Verification functions

Shared local helpers inside the client:

```text
stableStringify(value)
sha256Hex(text)
verifyOrganizationKit(input)
verifyTradeCaseKit(input)
```

## Signature verification

Use `viem`:

```text
verifyMessage({ address, message, signature })
```

Signature is optional. A kit without signature can still pass hash verification but must show:

```text
Signature: not provided
```

## UI sections

1. Input panel
2. Result summary
3. Check list
4. Proof-safe fields
5. Boundary disclaimer

## Done criteria

The route is done when:

- valid org kit passes hash verification
- tampered org kit fails hash verification
- valid case kit passes hash verification
- tampered case kit fails hash verification
- wallet signature shows verified / failed / not provided
- no server API is called
