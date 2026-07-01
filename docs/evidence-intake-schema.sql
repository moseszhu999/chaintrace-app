-- ChainTrace evidence intake schema
-- Works with PostgreSQL-compatible services such as Neon.
-- This stores evidence metadata and hashes only. Raw commercial documents are not stored here.

create table if not exists evidence_records (
  id text primary key,
  trade_id text not null,
  document_type text not null,
  evidence_status text not null check (evidence_status in (
    'verified',
    'uploaded_pending_verification',
    'missing',
    'needs_agent_review',
    'rejected'
  )),
  file_name text not null,
  document_no text not null,
  file_hash text,
  raw_document_storage text not null default 'not_stored',
  blocker_code text not null default 'GATES_NOT_PASSED',
  disbursement_allowed boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  evidence_payload jsonb not null
);

create index if not exists evidence_records_trade_updated_idx
  on evidence_records (trade_id, updated_at desc);

create index if not exists evidence_records_hash_idx
  on evidence_records (file_hash);

create index if not exists evidence_records_status_idx
  on evidence_records (trade_id, evidence_status);
