import { createHash, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { getCurrentV2OrganizationContext, getOrCreateV2User } from "@/lib/repositories/v2-organization-repository";
import { tradeStages, type CaseStatus, type CreateTradeCaseInputV2, type TradeCaseRecordV2, type TradeCaseStageRecordV2, type TradeCaseStateTransitionRecordV2, type TradeCaseWorkspaceV2, type TradeStage } from "@/lib/v2/trade-case-types";

type TradeCasePersistenceMode = "neon_v2_trade_case_store" | "runtime_v2_trade_case_store";

type TradeCaseRepository = {
  createTradeCase(input: CreateTradeCaseInputV2): Promise<TradeCaseWorkspaceV2>;
  listTradeCasesForOrganization(organizationId: string): Promise<TradeCaseRecordV2[]>;
  getTradeCaseWorkspace(caseId: string, organizationId?: string): Promise<TradeCaseWorkspaceV2 | null>;
  transitionTradeCaseState(input: { caseId: string; toState: CaseStatus; trigger: string; actorUserId?: string; reason?: string }): Promise<TradeCaseWorkspaceV2>;
};

function nowIso() {
  return new Date().toISOString();
}

function clean(value: string | undefined) {
  const next = value?.trim();
  return next || undefined;
}

function hashJson(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function nextCaseNo() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `CT-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured for the v2 trade case store.");
  return url;
}

export function getTradeCasePersistenceMode(): TradeCasePersistenceMode {
  return process.env.DATABASE_URL ? "neon_v2_trade_case_store" : "runtime_v2_trade_case_store";
}

const runtimeTradeCases = new Map<string, TradeCaseRecordV2>();
const runtimeStages = new Map<string, TradeCaseStageRecordV2[]>();
const runtimeTransitions = new Map<string, TradeCaseStateTransitionRecordV2[]>();

function cloneCase(record: TradeCaseRecordV2): TradeCaseRecordV2 {
  return { ...record };
}

function cloneStage(record: TradeCaseStageRecordV2): TradeCaseStageRecordV2 {
  return { ...record };
}

function cloneTransition(record: TradeCaseStateTransitionRecordV2): TradeCaseStateTransitionRecordV2 {
  return { ...record };
}

function createInitialStages(caseId: string): TradeCaseStageRecordV2[] {
  return tradeStages.map((stageCode) => ({
    id: randomUUID(),
    caseId,
    stageCode,
    status: stageCode === "S1_CONTRACT" ? "ACTIVE" : "PENDING",
    completedAt: null,
    stageStateHash: null,
  }));
}

function createRuntimeTradeCaseRepository(): TradeCaseRepository {
  return {
    async createTradeCase(input) {
      const user = await getOrCreateV2User(input.userEmail, input.userName);
      const createdAt = nowIso();
      const id = randomUUID();
      const record: TradeCaseRecordV2 = {
        id,
        caseNo: nextCaseNo(),
        caseName: input.caseName.trim(),
        sellerOrgId: input.sellerOrgId,
        buyerOrgId: clean(input.buyerOrgId) ?? null,
        buyerName: clean(input.buyerName) ?? null,
        amount: clean(input.amount) ?? null,
        currency: clean(input.currency) ?? "USD",
        goodsDescription: clean(input.goodsDescription) ?? null,
        originCountry: clean(input.originCountry) ?? null,
        destinationCountry: clean(input.destinationCountry) ?? null,
        paymentTerm: clean(input.paymentTerm) ?? null,
        expectedShipmentDate: clean(input.expectedShipmentDate) ?? null,
        expectedDueDate: clean(input.expectedDueDate) ?? null,
        status: "DRAFT",
        currentStage: "S1_CONTRACT",
        createdBy: user.id,
        createdAt,
        updatedAt: createdAt,
        caseRootHash: null,
        receivableCandidateStatus: "NOT_EVALUATED",
        fundingReadinessScore: null,
        rwaClaimStatus: "NOT_ENABLED_V2_1",
        oracleEventCount: 0,
        proofCommitStatus: "NOT_ENABLED_V2_1",
      };
      record.caseRootHash = hashJson(record);
      const stages = createInitialStages(record.id);
      const transition: TradeCaseStateTransitionRecordV2 = {
        id: randomUUID(),
        caseId: record.id,
        fromState: null,
        toState: "DRAFT",
        trigger: "CASE_CREATED",
        actorUserId: user.id,
        reason: "Created real v2 trade case.",
        transitionHash: hashJson({ caseId: record.id, toState: "DRAFT", trigger: "CASE_CREATED", createdAt }),
        createdAt,
      };
      runtimeTradeCases.set(record.id, record);
      runtimeStages.set(record.id, stages);
      runtimeTransitions.set(record.id, [transition]);
      return { case: cloneCase(record), stages: stages.map(cloneStage), transitions: [cloneTransition(transition)] };
    },
    async listTradeCasesForOrganization(organizationId) {
      return Array.from(runtimeTradeCases.values())
        .filter((record) => record.sellerOrgId === organizationId || record.buyerOrgId === organizationId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(cloneCase);
    },
    async getTradeCaseWorkspace(caseId, organizationId) {
      const record = runtimeTradeCases.get(caseId);
      if (!record) return null;
      if (organizationId && record.sellerOrgId !== organizationId && record.buyerOrgId !== organizationId) return null;
      return {
        case: cloneCase(record),
        stages: (runtimeStages.get(caseId) ?? []).map(cloneStage),
        transitions: (runtimeTransitions.get(caseId) ?? []).map(cloneTransition),
      };
    },
    async transitionTradeCaseState(input) {
      const existing = runtimeTradeCases.get(input.caseId);
      if (!existing) throw new Error("TRADE_CASE_NOT_FOUND");
      const createdAt = nowIso();
      const next: TradeCaseRecordV2 = { ...existing, status: input.toState, updatedAt: createdAt };
      runtimeTradeCases.set(next.id, next);
      const transition: TradeCaseStateTransitionRecordV2 = {
        id: randomUUID(),
        caseId: next.id,
        fromState: existing.status,
        toState: input.toState,
        trigger: input.trigger,
        actorUserId: input.actorUserId ?? null,
        reason: input.reason ?? null,
        transitionHash: hashJson({ caseId: next.id, fromState: existing.status, toState: input.toState, trigger: input.trigger, createdAt }),
        createdAt,
      };
      const transitions = [transition, ...(runtimeTransitions.get(next.id) ?? [])];
      runtimeTransitions.set(next.id, transitions);
      return {
        case: cloneCase(next),
        stages: (runtimeStages.get(next.id) ?? []).map(cloneStage),
        transitions: transitions.map(cloneTransition),
      };
    },
  };
}

type TradeCaseRow = {
  id: string;
  case_no: string;
  case_name: string;
  seller_org_id: string | null;
  buyer_org_id: string | null;
  buyer_name: string | null;
  amount: string | null;
  currency: string | null;
  goods_description: string | null;
  origin_country: string | null;
  destination_country: string | null;
  payment_term: string | null;
  expected_shipment_date: string | null;
  expected_due_date: string | null;
  status: CaseStatus;
  current_stage: TradeStage;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  case_root_hash: string | null;
  receivable_candidate_status: string;
  funding_readiness_score: number | null;
  rwa_claim_status: string;
  oracle_event_count: number;
  proof_commit_status: string;
};

type StageRow = {
  id: string;
  case_id: string;
  stage_code: TradeStage;
  status: string;
  completed_at: string | null;
  stage_state_hash: string | null;
};

type TransitionRow = {
  id: string;
  case_id: string;
  from_state: CaseStatus | null;
  to_state: CaseStatus;
  trigger: string;
  actor_user_id: string | null;
  reason: string | null;
  transition_hash: string | null;
  created_at: string;
};

function mapTradeCase(row: TradeCaseRow): TradeCaseRecordV2 {
  return {
    id: row.id,
    caseNo: row.case_no,
    caseName: row.case_name,
    sellerOrgId: row.seller_org_id,
    buyerOrgId: row.buyer_org_id,
    buyerName: row.buyer_name,
    amount: row.amount,
    currency: row.currency,
    goodsDescription: row.goods_description,
    originCountry: row.origin_country,
    destinationCountry: row.destination_country,
    paymentTerm: row.payment_term,
    expectedShipmentDate: row.expected_shipment_date,
    expectedDueDate: row.expected_due_date,
    status: row.status,
    currentStage: row.current_stage,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    caseRootHash: row.case_root_hash,
    receivableCandidateStatus: row.receivable_candidate_status,
    fundingReadinessScore: row.funding_readiness_score,
    rwaClaimStatus: row.rwa_claim_status,
    oracleEventCount: row.oracle_event_count,
    proofCommitStatus: row.proof_commit_status,
  };
}

function mapStage(row: StageRow): TradeCaseStageRecordV2 {
  return {
    id: row.id,
    caseId: row.case_id,
    stageCode: row.stage_code,
    status: row.status,
    completedAt: row.completed_at,
    stageStateHash: row.stage_state_hash,
  };
}

function mapTransition(row: TransitionRow): TradeCaseStateTransitionRecordV2 {
  return {
    id: row.id,
    caseId: row.case_id,
    fromState: row.from_state,
    toState: row.to_state,
    trigger: row.trigger,
    actorUserId: row.actor_user_id,
    reason: row.reason,
    transitionHash: row.transition_hash,
    createdAt: row.created_at,
  };
}

function createNeonTradeCaseRepository(): TradeCaseRepository {
  const sql = neon(getDatabaseUrl());

  async function loadWorkspace(caseId: string, organizationId?: string): Promise<TradeCaseWorkspaceV2 | null> {
    const rows = await sql`
      select id, case_no, case_name, seller_org_id, buyer_org_id, buyer_name, amount::text, currency, goods_description, origin_country, destination_country, payment_term, expected_shipment_date::text, expected_due_date::text, status, current_stage, created_by, created_at::text, updated_at::text, case_root_hash, receivable_candidate_status, funding_readiness_score, rwa_claim_status, oracle_event_count, proof_commit_status
      from trade_cases
      where id = ${caseId}
      limit 1;
    ` as TradeCaseRow[];
    if (!rows[0]) return null;
    const record = mapTradeCase(rows[0]);
    if (organizationId && record.sellerOrgId !== organizationId && record.buyerOrgId !== organizationId) return null;
    const stageRows = await sql`
      select id, case_id, stage_code, status, completed_at::text, stage_state_hash
      from trade_case_stages
      where case_id = ${caseId}
      order by array_position(enum_range(null::trade_stage), stage_code);
    ` as StageRow[];
    const transitionRows = await sql`
      select id, case_id, from_state, to_state, trigger, actor_user_id, reason, transition_hash, created_at::text
      from trade_case_state_transitions
      where case_id = ${caseId}
      order by created_at desc;
    ` as TransitionRow[];
    return {
      case: record,
      stages: stageRows.map(mapStage),
      transitions: transitionRows.map(mapTransition),
    };
  }

  return {
    async createTradeCase(input) {
      const user = await getOrCreateV2User(input.userEmail, input.userName);
      const caseNo = nextCaseNo();
      const caseRootHash = hashJson({ caseNo, ...input, createdBy: user.id });
      const rows = await sql`
        insert into trade_cases (
          case_no, case_name, seller_org_id, buyer_org_id, buyer_name, amount, currency, goods_description, origin_country, destination_country, payment_term, expected_shipment_date, expected_due_date, created_by, case_root_hash
        ) values (
          ${caseNo}, ${input.caseName.trim()}, ${input.sellerOrgId}, ${clean(input.buyerOrgId) ?? null}, ${clean(input.buyerName) ?? null}, ${clean(input.amount) ?? null}, ${clean(input.currency) ?? "USD"}, ${clean(input.goodsDescription) ?? null}, ${clean(input.originCountry) ?? null}, ${clean(input.destinationCountry) ?? null}, ${clean(input.paymentTerm) ?? null}, ${clean(input.expectedShipmentDate) ?? null}, ${clean(input.expectedDueDate) ?? null}, ${user.id}, ${caseRootHash}
        )
        returning id, case_no, case_name, seller_org_id, buyer_org_id, buyer_name, amount::text, currency, goods_description, origin_country, destination_country, payment_term, expected_shipment_date::text, expected_due_date::text, status, current_stage, created_by, created_at::text, updated_at::text, case_root_hash, receivable_candidate_status, funding_readiness_score, rwa_claim_status, oracle_event_count, proof_commit_status;
      ` as TradeCaseRow[];
      const record = mapTradeCase(rows[0]);
      await Promise.all(tradeStages.map((stageCode) => sql`
        insert into trade_case_stages (case_id, stage_code, status)
        values (${record.id}, ${stageCode}::trade_stage, ${stageCode === "S1_CONTRACT" ? "ACTIVE" : "PENDING"})
        on conflict (case_id, stage_code) do nothing;
      `));
      const transitionHash = hashJson({ caseId: record.id, toState: "DRAFT", trigger: "CASE_CREATED", createdAt: record.createdAt });
      await sql`
        insert into trade_case_state_transitions (case_id, from_state, to_state, trigger, actor_user_id, reason, transition_hash)
        values (${record.id}, null, ${"DRAFT"}::case_status, ${"CASE_CREATED"}, ${user.id}, ${"Created real v2 trade case."}, ${transitionHash});
      `;
      const workspace = await loadWorkspace(record.id, input.sellerOrgId);
      if (!workspace) throw new Error("TRADE_CASE_NOT_FOUND_AFTER_CREATE");
      return workspace;
    },
    async listTradeCasesForOrganization(organizationId) {
      const rows = await sql`
        select id, case_no, case_name, seller_org_id, buyer_org_id, buyer_name, amount::text, currency, goods_description, origin_country, destination_country, payment_term, expected_shipment_date::text, expected_due_date::text, status, current_stage, created_by, created_at::text, updated_at::text, case_root_hash, receivable_candidate_status, funding_readiness_score, rwa_claim_status, oracle_event_count, proof_commit_status
        from trade_cases
        where seller_org_id = ${organizationId} or buyer_org_id = ${organizationId}
        order by updated_at desc;
      ` as TradeCaseRow[];
      return rows.map(mapTradeCase);
    },
    getTradeCaseWorkspace: loadWorkspace,
    async transitionTradeCaseState(input) {
      const currentRows = await sql`
        select status from trade_cases where id = ${input.caseId} limit 1;
      ` as Array<{ status: CaseStatus }>;
      if (!currentRows[0]) throw new Error("TRADE_CASE_NOT_FOUND");
      const transitionHash = hashJson(input);
      await sql`
        update trade_cases set status = ${input.toState}::case_status, updated_at = now()
        where id = ${input.caseId};
      `;
      await sql`
        insert into trade_case_state_transitions (case_id, from_state, to_state, trigger, actor_user_id, reason, transition_hash)
        values (${input.caseId}, ${currentRows[0].status}::case_status, ${input.toState}::case_status, ${input.trigger}, ${input.actorUserId ?? null}, ${input.reason ?? null}, ${transitionHash});
      `;
      const workspace = await loadWorkspace(input.caseId);
      if (!workspace) throw new Error("TRADE_CASE_NOT_FOUND_AFTER_TRANSITION");
      return workspace;
    },
  };
}

const runtimeRepository = createRuntimeTradeCaseRepository();

function createTradeCaseRepository(): TradeCaseRepository {
  return getTradeCasePersistenceMode() === "neon_v2_trade_case_store"
    ? createNeonTradeCaseRepository()
    : runtimeRepository;
}

async function withRuntimeFallback<T>(operation: (repository: TradeCaseRepository) => Promise<T>): Promise<T> {
  const repository = createTradeCaseRepository();
  try {
    return await operation(repository);
  } catch (error) {
    if (getTradeCasePersistenceMode() === "runtime_v2_trade_case_store") throw error;
    console.error("v2 trade case Neon store failed; using runtime fallback.", error);
    return operation(runtimeRepository);
  }
}

export async function createV2TradeCase(input: CreateTradeCaseInputV2) {
  return withRuntimeFallback((repository) => repository.createTradeCase(input));
}

export async function listV2TradeCasesForCurrentOrganization(userEmail: string, userName?: string) {
  const context = await getCurrentV2OrganizationContext(userEmail, userName);
  if (!context.organization) return { context, cases: [] as TradeCaseRecordV2[] };
  const cases = await withRuntimeFallback((repository) => repository.listTradeCasesForOrganization(context.organization!.id));
  return { context, cases };
}

export async function getV2TradeCaseWorkspace(caseId: string, userEmail: string, userName?: string) {
  const context = await getCurrentV2OrganizationContext(userEmail, userName);
  if (!context.organization) return { context, workspace: null };
  const workspace = await withRuntimeFallback((repository) => repository.getTradeCaseWorkspace(caseId, context.organization!.id));
  return { context, workspace };
}

export async function transitionV2TradeCaseState(caseId: string, toState: CaseStatus, trigger: string, userEmail: string, reason?: string, userName?: string) {
  const context = await getCurrentV2OrganizationContext(userEmail, userName);
  if (!context.user) throw new Error("USER_NOT_FOUND");
  const workspace = await withRuntimeFallback((repository) => repository.transitionTradeCaseState({ caseId, toState, trigger, actorUserId: context.user.id, reason }));
  return { context, workspace };
}
