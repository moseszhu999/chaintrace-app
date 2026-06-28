-- ChainTrace Proof Index schema
-- Works with PostgreSQL-compatible services such as Neon or Supabase.
-- This stores public proof metadata only. Do not store sensitive business files here.

create table if not exists proofs (
  id uuid primary key default gen_random_uuid(),
  proof_mode text not null check (proof_mode in ('demo', 'onchain')),
  proof_type text not null,
  title text not null,
  business_name text not null,
  batch_id text not null,
  file_name text not null,
  file_hash text not null,
  note text,
  wallet_address text,
  chain_id integer,
  contract_address text,
  transaction_hash text,
  onchain_proof_id text,
  demo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proofs_business_name_idx on proofs (business_name);
create index if not exists proofs_wallet_address_idx on proofs (wallet_address);
create index if not exists proofs_file_hash_idx on proofs (file_hash);
create index if not exists proofs_created_at_idx on proofs (created_at desc);

-- Future table for public business profiles.
create table if not exists business_passports (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  wallet_address text,
  public_slug text unique,
  description text,
  website text,
  country text,
  industry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_passports_wallet_idx on business_passports (wallet_address);
create index if not exists business_passports_name_idx on business_passports (business_name);
