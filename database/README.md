# ChainTrace Database

## v2.1 schema

The v2.1 real-platform schema lives in:

```text
database/schema-v2.1.sql
```

It creates the data foundation for:

- Organization Domain
- Trade Case Domain
- Evidence Domain
- AI Review Domain
- Passport Domain
- Confirmation Domain
- Oracle / IoT reserved layer
- Exception reserved layer
- RWA / Funding reserved layer
- Audit / Compliance Domain

## Rule

```text
Off-chain stores full business data.
On-chain stores proof commitments only.
```

## Automatic deployment migration

The migration script is:

```text
scripts/apply-v2-schema.mjs
```

The build command now runs the v2 schema step before `next build`.

To disable the schema step temporarily, set:

```text
CHAINTRACE_SKIP_V2_SCHEMA_MIGRATION=true
```

## Manual migration

For local development, run the schema file against the target Neon/Postgres database with your own local connection settings.

Do not expose raw evidence files publicly by default.
