-- ChainTrace v2.1 Real Platform Schema Foundation
-- Issue: #96
-- Purpose: replace demo-only workspace assumptions with real organization/case/evidence/passport/invite/audit data foundations.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

do $$ begin
  create type org_type as enum (
    'EXPORTER', 'BUYER', 'LOGISTICS', 'WAREHOUSE', 'QC', 'FUNDER', 'LEGAL', 'CUSTOMS', 'PLATFORM'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type member_role as enum (
    'ADMIN', 'OPERATOR', 'FINANCE', 'SIGNER', 'REVIEWER', 'VIEWER'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type member_status as enum ('PENDING', 'ACTIVE', 'SUSPENDED', 'REMOVED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type case_status as enum (
    'DRAFT', 'EVIDENCE_PENDING', 'AI_REVIEWING', 'PASSPORT_READY', 'CONFIRMATION_PENDING', 'CONFIRMED', 'EXCEPTION', 'ARCHIVED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type trade_stage as enum (
    'S1_CONTRACT', 'S2_SHIPMENT', 'S3_LOGISTICS', 'S4_WAREHOUSE', 'S5_QC', 'S6_RECEIVABLE', 'S7_FUNDING_READINESS', 'S8_AUDIT'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type evidence_type as enum (
    'CONTRACT', 'PO', 'INVOICE', 'PACKING_LIST', 'BILL_OF_LADING', 'WAREHOUSE_RECEIPT', 'QC_REPORT', 'BUYER_ACCEPTANCE', 'PAYMENT_PROOF', 'OTHER'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type evidence_status as enum (
    'UPLOADED', 'HASHED', 'EXTRACTED', 'VERIFIED', 'CONFIRMED', 'REJECTED', 'CONFLICT', 'NEEDS_CONFIRMATION', 'MISSING'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type visibility_scope as enum ('PRIVATE', 'ORG_ONLY', 'INVITED_ONLY', 'PUBLIC_SUMMARY', 'FUNDER_VIEW');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type ai_run_status as enum ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'NEEDS_MANUAL_REVIEW');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type ai_agent_type as enum ('DOCUMENT_EXTRACTION', 'DOCUMENT_MATCHING', 'RISK_FLAGGING', 'READINESS_SCORING');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type check_result as enum ('MATCHED', 'MISMATCH', 'MISSING', 'UNKNOWN', 'NEEDS_REVIEW');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type passport_status as enum ('DRAFT', 'GENERATED', 'PUBLISHED', 'EXPIRED', 'REVOKED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type invite_type as enum ('BUYER_CONFIRMATION', 'LOGISTICS_CONFIRMATION', 'WAREHOUSE_CONFIRMATION', 'QC_CONFIRMATION', 'FUNDER_VIEW');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type invite_status as enum ('CREATED', 'SENT', 'OPENED', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type confirmation_decision as enum ('CONFIRMED', 'REJECTED', 'NEEDS_CHANGE');
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- Organization Domain
-- -----------------------------------------------------------------------------

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_type org_type not null,
  country text,
  website text,
  verification_level text not null default 'UNVERIFIED',
  status text not null default 'ACTIVE',
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  org_registry_hash text,
  org_did text
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role member_role not null default 'VIEWER',
  status member_status not null default 'ACTIVE',
  invited_by uuid references users(id),
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- -----------------------------------------------------------------------------
-- Trade Case Domain
-- -----------------------------------------------------------------------------

create table if not exists trade_cases (
  id uuid primary key default gen_random_uuid(),
  case_no text unique not null,
  case_name text not null,
  seller_org_id uuid references organizations(id),
  buyer_org_id uuid references organizations(id),
  buyer_name text,
  amount numeric(18, 2),
  currency text,
  goods_description text,
  origin_country text,
  destination_country text,
  payment_term text,
  expected_shipment_date date,
  expected_due_date date,
  status case_status not null default 'DRAFT',
  current_stage trade_stage not null default 'S1_CONTRACT',
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  case_root_hash text,
  receivable_candidate_status text not null default 'NOT_EVALUATED',
  funding_readiness_score integer,
  rwa_claim_status text not null default 'NOT_ENABLED_V2_1',
  oracle_event_count integer not null default 0,
  proof_commit_status text not null default 'NOT_ENABLED_V2_1'
);

create table if not exists trade_case_stages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  stage_code trade_stage not null,
  status text not null default 'PENDING',
  completed_at timestamptz,
  stage_state_hash text,
  unique (case_id, stage_code)
);

create table if not exists trade_case_state_transitions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  from_state case_status,
  to_state case_status not null,
  trigger text not null,
  actor_user_id uuid references users(id),
  reason text,
  transition_hash text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Evidence Domain
-- -----------------------------------------------------------------------------

create table if not exists evidences (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  evidence_type evidence_type not null,
  stage_code trade_stage not null,
  owner_org_id uuid references organizations(id),
  issuer_org_id uuid references organizations(id),
  status evidence_status not null default 'UPLOADED',
  visibility_scope visibility_scope not null default 'PRIVATE',
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  evidence_hash text,
  evidence_registry_event text
);

create table if not exists evidence_files (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references evidences(id) on delete cascade,
  filename text not null,
  mime_type text,
  file_size bigint,
  storage_uri text not null,
  sha256 text not null,
  uploaded_by uuid references users(id),
  uploaded_at timestamptz not null default now(),
  file_hash_commitment text,
  storage_pointer_hash text
);

create table if not exists evidence_hashes (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references evidences(id) on delete cascade,
  algorithm text not null default 'SHA-256',
  hash_value text not null,
  calculated_at timestamptz not null default now(),
  calculated_by uuid references users(id),
  onchain_hash text,
  hash_registry_tx text
);

create table if not exists evidence_status_history (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references evidences(id) on delete cascade,
  from_status evidence_status,
  to_status evidence_status not null,
  reason text,
  changed_by uuid references users(id),
  status_hash text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- AI Review Domain
-- -----------------------------------------------------------------------------

create table if not exists ai_review_runs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  evidence_id uuid references evidences(id) on delete cascade,
  agent_type ai_agent_type not null,
  model_name text,
  prompt_version text,
  status ai_run_status not null default 'PENDING',
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  ai_run_hash text,
  prompt_version_hash text
);

create table if not exists ai_extracted_fields (
  id uuid primary key default gen_random_uuid(),
  review_run_id uuid references ai_review_runs(id) on delete cascade,
  case_id uuid not null references trade_cases(id) on delete cascade,
  evidence_id uuid references evidences(id) on delete cascade,
  field_name text not null,
  field_value text,
  confidence numeric(5, 4),
  source_location text,
  extraction_result_hash text,
  extraction_version text,
  created_at timestamptz not null default now()
);

create table if not exists consistency_checks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  rule_code text not null,
  left_evidence_id uuid references evidences(id),
  right_evidence_id uuid references evidences(id),
  left_value text,
  right_value text,
  result check_result not null,
  severity text not null default 'INFO',
  message text,
  check_result_hash text,
  rule_version_hash text,
  created_at timestamptz not null default now()
);

create table if not exists risk_flags (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  evidence_id uuid references evidences(id),
  flag_type text not null,
  severity text not null default 'INFO',
  reason text,
  status text not null default 'OPEN',
  risk_flag_hash text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Passport / Trust Page Domain
-- -----------------------------------------------------------------------------

create table if not exists trade_evidence_passports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  version integer not null default 1,
  summary jsonb not null default '{}'::jsonb,
  readiness_score integer,
  status passport_status not null default 'DRAFT',
  generated_at timestamptz,
  generated_by uuid references users(id),
  passport_root_hash text,
  unique (case_id, version)
);

create table if not exists passport_evidence_items (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references trade_evidence_passports(id) on delete cascade,
  evidence_id uuid references evidences(id),
  evidence_type evidence_type not null,
  status evidence_status not null,
  hash_value text,
  issuer text,
  public_visible boolean not null default false,
  evidence_summary_hash text
);

create table if not exists trust_pages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  passport_id uuid references trade_evidence_passports(id) on delete set null,
  public_token text unique not null,
  visibility_scope visibility_scope not null default 'PUBLIC_SUMMARY',
  status text not null default 'ACTIVE',
  expires_at timestamptz,
  trust_page_hash text,
  public_snapshot_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  passport_id uuid references trade_evidence_passports(id) on delete set null,
  completeness_score integer,
  consistency_score integer,
  confirmation_score integer,
  risk_score integer,
  readiness_hash text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Confirmation Domain
-- -----------------------------------------------------------------------------

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  evidence_id uuid references evidences(id) on delete set null,
  target_org_type org_type,
  target_email text,
  target_org_id uuid references organizations(id),
  invite_type invite_type not null,
  token text unique not null,
  status invite_status not null default 'CREATED',
  expires_at timestamptz,
  created_by uuid references users(id),
  invite_hash text,
  created_at timestamptz not null default now()
);

create table if not exists confirmations (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references invites(id) on delete set null,
  case_id uuid not null references trade_cases(id) on delete cascade,
  evidence_id uuid references evidences(id) on delete set null,
  confirmed_by_name text,
  confirmed_by_email text,
  actor_id uuid,
  decision confirmation_decision not null,
  comment text,
  signature_text text,
  confirmation_hash text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Reserved Architecture Domains
-- -----------------------------------------------------------------------------

create table if not exists oracle_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references trade_cases(id) on delete cascade,
  evidence_id uuid references evidences(id) on delete set null,
  source_type text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  payload_hash text,
  signer text,
  confidence numeric(5, 4),
  created_at timestamptz not null default now()
);

create table if not exists exception_cases (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  exception_type text not null,
  severity text not null default 'MEDIUM',
  status text not null default 'OPEN',
  assigned_to uuid references users(id),
  exception_case_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists receivable_candidates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  debtor_org_id uuid references organizations(id),
  creditor_org_id uuid references organizations(id),
  amount numeric(18, 2),
  currency text,
  due_date date,
  status text not null default 'DRAFT',
  receivable_claim_hash text,
  created_at timestamptz not null default now()
);

create table if not exists funding_readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references trade_cases(id) on delete cascade,
  readiness_score integer,
  missing_requirements jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  funding_snapshot_hash text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Audit / Compliance Domain
-- -----------------------------------------------------------------------------

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  case_id uuid references trade_cases(id) on delete cascade,
  actor_user_id uuid references users(id) on delete set null,
  actor_type text,
  action text not null,
  object_type text not null,
  object_id text,
  before_json jsonb,
  after_json jsonb,
  ip_address text,
  audit_event_hash text,
  created_at timestamptz not null default now()
);

create table if not exists disclaimer_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  case_id uuid references trade_cases(id) on delete cascade,
  disclaimer_type text not null,
  version text not null,
  acknowledged_at timestamptz not null default now(),
  disclaimer_ack_hash text
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_organization_members_org on organization_members(organization_id);
create index if not exists idx_trade_cases_seller_org on trade_cases(seller_org_id);
create index if not exists idx_trade_cases_buyer_org on trade_cases(buyer_org_id);
create index if not exists idx_evidences_case on evidences(case_id);
create index if not exists idx_evidence_files_evidence on evidence_files(evidence_id);
create index if not exists idx_ai_extracted_fields_case on ai_extracted_fields(case_id);
create index if not exists idx_consistency_checks_case on consistency_checks(case_id);
create index if not exists idx_trust_pages_token on trust_pages(public_token);
create index if not exists idx_invites_token on invites(token);
create index if not exists idx_confirmations_case on confirmations(case_id);
create index if not exists idx_audit_events_case on audit_events(case_id, created_at desc);
