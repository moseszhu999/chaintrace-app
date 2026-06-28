# ChainTrace Proof Index API

The Proof Index is the lightweight off-chain layer that turns individual proof pages into Business Passport history.

## Why this layer exists

The blockchain should store hashes, signatures, timestamps, and verifiable facts. The app still needs a fast index for:

- proof history
- business profile pages
- search and filtering
- QR sharing
- public metadata
- future AI risk summaries

The Proof Index does not replace the chain. It makes proof records easy to find and display.

## MVP API

### Create proof metadata

```http
POST /api/proofs
```

Request:

```json
{
  "proofMode": "demo",
  "proofType": "product",
  "title": "Vietnam Coffee Batch Proof",
  "businessName": "Example Small Exporter",
  "batchId": "COFFEE-VN-2026-0001",
  "fileName": "quality-report.pdf",
  "fileHash": "0x...",
  "note": "Public note",
  "walletAddress": "0x...",
  "chainId": 11155111,
  "contractAddress": "0x...",
  "transactionHash": "0x...",
  "onchainProofId": "1",
  "demoUrl": "/demo-proof?..."
}
```

Response:

```json
{
  "id": "uuid",
  "publicUrl": "/proof-index/uuid"
}
```

### List proofs for a business

```http
GET /api/proofs?businessName=Example%20Small%20Exporter
```

or:

```http
GET /api/proofs?walletAddress=0x...
```

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "proofMode": "demo",
      "proofType": "product",
      "title": "Vietnam Coffee Batch Proof",
      "businessName": "Example Small Exporter",
      "batchId": "COFFEE-VN-2026-0001",
      "fileHash": "0x...",
      "createdAt": "2026-06-28T00:00:00.000Z"
    }
  ]
}
```

## Business Passport

Future route:

```text
/passport/[walletAddress]
```

or:

```text
/passport/[publicSlug]
```

Passport fields:

- business name
- wallet address
- proof count
- proof type breakdown
- latest proofs
- verified on-chain proofs
- demo proofs
- file hash verification entry
- public share link

## Implementation options

### Option A: Neon

Use PostgreSQL and serverless SQL client.

Environment variable:

```text
DATABASE_URL=postgresql://...
```

### Option B: Supabase

Use Supabase Postgres and serverless API routes.

Environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Privacy rule

Only store public metadata. Never store the original file, private contracts, personal IDs, bank information, or unencrypted sensitive business data.

ChainTrace principle:

```text
Proof, not exposure.
```
