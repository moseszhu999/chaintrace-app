import { getFallbackEvidenceRecords } from "@/lib/evidence-fallback";
import {
  findEvidenceById,
  createPreReviewCase,
  getCurrentTradeCase,
  getEvidencePersistenceMode,
  getTradeCaseById,
  listTradeCases,
  listEvidenceRecords,
  reviewEvidenceRecord,
  type CreatePreReviewCaseInput,
  type EvidenceRecord,
  type EvidenceReviewAction,
  type EvidenceReviewReceipt,
  type GateImpact,
  type ReviewEvidenceRecordInput,
  type TradeCaseRecord,
} from "@/lib/repositories/chaintrace-repository";

export type SafeEvidenceStoreStatus = {
  mode: ReturnType<typeof getEvidencePersistenceMode>;
  fallbackActive: boolean;
  fallbackReason?: string;
};

function cloneEvidenceRecord(record: EvidenceRecord): EvidenceRecord {
  return {
    ...record,
    gateImpacts: record.gateImpacts.map((impact) => ({ ...impact })),
    reviewReceipts: (record.reviewReceipts ?? []).map((receipt) => ({ ...receipt })),
  };
}

function fallbackReason(error: unknown) {
  return error instanceof Error ? error.message : "Unknown evidence store error.";
}

function statusAfterReviewAction(action: EvidenceReviewAction) {
  if (action === "verify") return "verified" as const;
  if (action === "reject") return "rejected" as const;
  return "needs_agent_review" as const;
}

function gateImpactAfterReviewAction(impact: GateImpact, action: EvidenceReviewAction): GateImpact {
  if (impact.gateId === "unmapped_evidence") return { ...impact };
  if (action === "verify") {
    return {
      ...impact,
      status: "supports_passed_gate",
      noteZh: "Fallback 审查已生成临时 receipt；生产 DB 恢复后需要重新持久化确认。",
      noteEn: "Fallback review generated a temporary receipt; re-persist after the production DB recovers.",
    };
  }
  if (action === "request_more_evidence") {
    return {
      ...impact,
      status: "candidate_pending_gate",
      noteZh: "Fallback 审查要求补充证据，gate 仍处于待确认状态。",
      noteEn: "Fallback review requested more evidence; the gate remains pending.",
    };
  }
  return {
    ...impact,
    status: "blocking_gap",
    noteZh: "Fallback 审查拒绝该证据，gate 仍被阻断。",
    noteEn: "Fallback review rejected this evidence; the gate remains blocked.",
  };
}

function reviewReceiptId(evidenceId: string, reviewedAt: string, action: EvidenceReviewAction) {
  return `fallback_review_${evidenceId}_${action}_${reviewedAt.replace(/[^0-9a-z]/gi, "").slice(0, 20)}`;
}

function applyFallbackEvidenceReview(record: EvidenceRecord, input: ReviewEvidenceRecordInput) {
  const reviewedAt = input.reviewedAt ?? new Date().toISOString();
  const beforeStatus = record.status;
  const afterStatus = statusAfterReviewAction(input.action);
  const reviewReceipt: EvidenceReviewReceipt = {
    id: reviewReceiptId(record.id, reviewedAt, input.action),
    evidenceId: record.id,
    action: input.action,
    reviewerRole: input.reviewerRole,
    reviewerName: input.reviewerName,
    reason: input.reason,
    beforeStatus,
    afterStatus,
    reviewedAt,
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    agentDecisionAuthority: "none",
  };
  const evidenceRecord: EvidenceRecord = {
    ...record,
    status: afterStatus,
    updatedAt: reviewedAt,
    gateImpacts: record.gateImpacts.map((impact) => gateImpactAfterReviewAction(impact, input.action)),
    reviewReceipts: [reviewReceipt, ...(record.reviewReceipts ?? [])],
  };
  return { evidenceRecord, reviewReceipt };
}

export async function safeGetCurrentTradeCase(): Promise<TradeCaseRecord> {
  return getCurrentTradeCase();
}

export async function safeListTradeCases(): Promise<TradeCaseRecord[]> {
  return listTradeCases();
}

export async function safeGetTradeCaseById(tradeId: string): Promise<TradeCaseRecord | null> {
  return getTradeCaseById(tradeId);
}

export async function safeCreatePreReviewCase(input: CreatePreReviewCaseInput) {
  return createPreReviewCase(input);
}

export async function safeListEvidenceRecords(tradeId: string): Promise<{ records: EvidenceRecord[]; store: SafeEvidenceStoreStatus }> {
  try {
    return {
      records: await listEvidenceRecords(tradeId),
      store: { mode: getEvidencePersistenceMode(), fallbackActive: false },
    };
  } catch (error) {
    console.error("Evidence store list failed; using fallback evidence records.", error);
    return {
      records: getFallbackEvidenceRecords().filter((record) => record.tradeId === tradeId).map(cloneEvidenceRecord),
      store: { mode: getEvidencePersistenceMode(), fallbackActive: true, fallbackReason: fallbackReason(error) },
    };
  }
}

export async function safeFindEvidenceById(evidenceId: string): Promise<{ record: EvidenceRecord | null; store: SafeEvidenceStoreStatus }> {
  try {
    return {
      record: await findEvidenceById(evidenceId),
      store: { mode: getEvidencePersistenceMode(), fallbackActive: false },
    };
  } catch (error) {
    console.error("Evidence store lookup failed; using fallback evidence records.", error);
    return {
      record: getFallbackEvidenceRecords().find((record) => record.id === evidenceId) ?? null,
      store: { mode: getEvidencePersistenceMode(), fallbackActive: true, fallbackReason: fallbackReason(error) },
    };
  }
}

export async function safeReviewEvidenceRecord(
  evidenceId: string,
  input: ReviewEvidenceRecordInput,
): Promise<{ evidenceRecord: EvidenceRecord; reviewReceipt: EvidenceReviewReceipt; store: SafeEvidenceStoreStatus }> {
  try {
    const result = await reviewEvidenceRecord(evidenceId, input);
    return {
      ...result,
      store: { mode: getEvidencePersistenceMode(), fallbackActive: false },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "EVIDENCE_NOT_FOUND") throw error;

    console.error("Evidence store review failed; generating fallback review receipt.", error);
    const fallback = getFallbackEvidenceRecords().find((record) => record.id === evidenceId);
    if (!fallback) throw new Error("EVIDENCE_NOT_FOUND");

    const result = applyFallbackEvidenceReview(fallback, input);
    return {
      evidenceRecord: cloneEvidenceRecord(result.evidenceRecord),
      reviewReceipt: { ...result.reviewReceipt },
      store: { mode: getEvidencePersistenceMode(), fallbackActive: true, fallbackReason: fallbackReason(error) },
    };
  }
}
