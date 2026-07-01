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

## Apply manually

For Neon/Postgres development, run the schema against the target database before enabling v2.1 persistence.

Example:

```bash
psql "$DATABASE_URL" -f database/schema-v2.1.sql
```

Do not expose raw evidence files publicly by default.
