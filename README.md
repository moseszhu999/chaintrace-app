# ChainTrace App

**Proof Page MVP for the ChainTrace Protocol.**

This repository contains the first user-facing ChainTrace application.

The goal is simple:

> Let a small business create a verifiable proof page for a product, shipment, invoice, or trade record in minutes.

## Product Flow

```text
Upload evidence
        ↓
Generate SHA-256 hash in the browser
        ↓
Create proof metadata
        ↓
Preview a public proof page
        ↓
Later: anchor hash on-chain and share QR code
```

## Current Scope

This is an early MVP frontend.

The first version focuses on:

- file upload
- browser-side hash generation
- proof metadata input
- proof preview
- simple Business Passport direction
- future blockchain anchoring placeholder

## Not Yet Included

- smart contract calls
- wallet connection
- IPFS upload
- production database
- AI agent backend
- stablecoin or financial features

Those will be added after the proof-page user experience is validated.

## Tech Stack

- Next.js
- React
- TypeScript
- Browser Web Crypto API
- Plain CSS

## Run Locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Related Repository

Protocol repository:

```text
https://github.com/moseszhu999/chaintrace-protocol
```

## Principle

Not total transparency.  
Selective proof.

Make honesty cheaper.  
Make fraud more expensive.
