-- ChainTrace Agent workflow schema
-- Works with PostgreSQL-compatible services such as Neon.
-- Store workflow receipts and task audit metadata only. Do not store raw PDFs or private keys here.

create table if not exists agent_run_receipts (
  id text primary key,
  trade_id text not null,
  receipt_status text not null check (receipt_status in ('created')),
  readiness_score integer not null,
  gates_passed integer not null,
  blocker_code text not null default 'GATES_NOT_PASSED',
  disbursement_allowed boolean not null default false,
  agent_decision_authority text not null default 'none',
  created_at timestamptz not null,
  receipt_payload jsonb not null
);

create index if not exists agent_run_receipts_trade_created_idx
  on agent_run_receipts (trade_id, created_at desc);

create table if not exists operator_tasks (
  id text primary key,
  receipt_id text not null references agent_run_receipts(id) on delete cascade,
  trade_id text not null,
  task_kind text not null check (task_kind in (
    'MISSING_EVIDENCE_REQUEST',
    'PROFESSIONAL_REVIEW_INTAKE',
    'OPERATOR_DECISION_REQUIRED',
    'BLOCKED_CONTRACT_ACTION'
  )),
  task_status text not null check (task_status in (
    'open',
    'approved_draft',
    'changes_requested',
    'kept_blocked',
    'escalated_professional_review'
  )),
  owner_role text not null check (owner_role in ('operator', 'professional', 'contract')),
  blocker_code text not null default 'GATES_NOT_PASSED',
  disbursement_allowed boolean not null default false,
  agent_decision_authority text not null default 'none',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  task_payload jsonb not null
);

create index if not exists operator_tasks_receipt_idx
  on operator_tasks (receipt_id, created_at asc);

create index if not exists operator_tasks_trade_status_idx
  on operator_tasks (trade_id, task_status, updated_at desc);

create table if not exists operator_task_transitions (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references operator_tasks(id) on delete cascade,
  receipt_id text not null references agent_run_receipts(id) on delete cascade,
  action text not null check (action in (
    'approve_draft',
    'request_changes',
    'keep_blocked',
    'escalate_professional_review'
  )),
  result_status text not null check (result_status in (
    'approved_draft',
    'changes_requested',
    'kept_blocked',
    'escalated_professional_review'
  )),
  created_at timestamptz not null,
  transition_payload jsonb not null
);

create index if not exists operator_task_transitions_task_idx
  on operator_task_transitions (task_id, created_at desc);

create index if not exists operator_task_transitions_receipt_idx
  on operator_task_transitions (receipt_id, created_at desc);
