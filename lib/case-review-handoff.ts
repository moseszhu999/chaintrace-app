import { getCaseOperatingSnapshot } from "@/lib/case-operating-snapshot";
import type { EvidenceRecord, EvidenceReviewReceipt } from "@/lib/repositories/chaintrace-repository";

function documentLabel(record: EvidenceRecord) {
  return record.documentType.replaceAll("_", " ");
}

function firstGateImpact(record: EvidenceRecord) {
  return record.gateImpacts[0];
}

function sortReceipts(receipts: EvidenceReviewReceipt[]) {
  return [...receipts].sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt));
}

function receiptTimeline(records: EvidenceRecord[]) {
  return sortReceipts(records.flatMap((record) => record.reviewReceipts ?? [])).map((receipt) => {
    const record = records.find((item) => item.id === receipt.evidenceId);
    return {
      ...receipt,
      documentType: record?.documentType ?? "other",
      documentNo: record?.documentNo ?? "unknown",
      fileName: record?.fileName ?? "unknown",
    };
  });
}

function missingEvidence(records: EvidenceRecord[]) {
  return records
    .filter((record) => ["missing", "rejected", "needs_agent_review"].includes(record.status))
    .map((record) => {
      const impact = firstGateImpact(record);
      return {
        evidenceId: record.id,
        documentType: record.documentType,
        documentNo: record.documentNo,
        status: record.status,
        gateId: impact?.gateId ?? "unmapped_evidence",
        reasonZh: impact?.noteZh ?? record.noteZh ?? "证据需要补充或重新审查。",
        reasonEn: impact?.noteEn ?? record.noteEn ?? "Evidence requires follow-up or review.",
      };
    });
}

function openExceptions(records: EvidenceRecord[]) {
  return records
    .filter((record) =>
      record.status !== "verified" ||
      record.gateImpacts.some((impact) => impact.status === "blocking_gap" || impact.status === "candidate_pending_gate"),
    )
    .map((record) => {
      const impact = firstGateImpact(record);
      return {
        id: `${record.id}:exception`,
        evidenceId: record.id,
        title: `${documentLabel(record)} · ${record.documentNo}`,
        status: record.status,
        gateId: impact?.gateId ?? "unmapped_evidence",
        reasonZh: impact?.noteZh ?? record.noteZh ?? "专业审查需确认该材料是否足以支持 gate。",
        reasonEn: impact?.noteEn ?? record.noteEn ?? "Professional review must confirm whether this evidence can support the gate.",
      };
    });
}

export async function getCaseReviewHandoffPack(caseId?: string) {
  const snapshot = await getCaseOperatingSnapshot(caseId);
  if (caseId && snapshot.case.id !== caseId) {
    throw new Error("CASE_NOT_FOUND");
  }

  const records = snapshot.evidenceRecords;
  const reviewReceiptTimeline = receiptTimeline(records);
  const blockedReasons = snapshot.gates.blocked.map((gate) => {
    const evidenceRecord = records.find((record) => record.id === gate.evidenceId);
    const gateImpact = evidenceRecord?.gateImpacts.find((impact) => impact.gateId === gate.id);
    return {
      gateId: gate.id,
      labelZh: gate.labelZh,
      labelEn: gate.labelEn,
      evidenceId: gate.evidenceId,
      sourceEvidenceIds: gate.sourceEvidenceIds,
      reasonZh: gateImpact?.noteZh ?? "该 gate 仍未满足，不能进入正式放款。",
      reasonEn: gateImpact?.noteEn ?? "This gate is still unmet and cannot support formal disbursement.",
    };
  });
  const missing = missingEvidence(records);
  const exceptions = openExceptions(records);
  const recommendedNextActions = [
    ...snapshot.tasks.latest
      .filter((task) => task.taskStatus !== "resolved" && task.taskStatus !== "cancelled")
      .map((task) => ({
        id: task.id,
        title: task.title,
        ownerRole: task.taskStatus === "blocked" ? "professional" : "operator",
        reason: task.reason,
        evidenceId: task.evidenceId,
        gateId: task.gateId ?? "unmapped_evidence",
      })),
    ...blockedReasons.slice(0, 2).map((gate) => ({
      id: `gate-action:${gate.gateId}`,
      title: `Resolve ${gate.labelEn}`,
      ownerRole: "professional",
      reason: gate.reasonEn,
      evidenceId: gate.evidenceId,
      gateId: gate.gateId,
    })),
  ].slice(0, 6);

  const boundaryStatement =
    "Pre-review handoff only; not approval, not a legal opinion, not lending approval, not credit approval, and not disbursement authorization.";

  return {
    version: "chaintrace-professional-review-handoff-v0.1",
    generatedAt: snapshot.generatedAt,
    caseSummary: {
      id: snapshot.case.id,
      titleZh: snapshot.case.titleZh,
      titleEn: snapshot.case.titleEn,
      poNo: snapshot.case.poNo,
      invoiceNo: snapshot.case.invoiceNo,
      totalAmount: snapshot.case.totalAmount,
      receivableAmount: snapshot.case.receivableAmount,
      requestedAdvance: snapshot.case.requestedAdvance,
    },
    evidenceSummary: {
      ...snapshot.evidenceSummary,
      records: records.map((record) => ({
        id: record.id,
        documentType: record.documentType,
        documentNo: record.documentNo,
        fileName: record.fileName,
        status: record.status,
        gateImpacts: record.gateImpacts,
      })),
      evidenceStore: snapshot.evidenceStore,
    },
    reviewReceiptTimeline,
    gateStatus: {
      summary: snapshot.gates.summary,
      blocked: snapshot.gates.blocked,
      pending: snapshot.gates.pending,
    },
    readiness: snapshot.readiness,
    taskSummary: snapshot.tasks,
    blockedReasons,
    missingEvidence: missing,
    openExceptions: exceptions,
    recommendedNextActions,
    boundary: {
      mode: "pre_review_only",
      blockerCode: snapshot.boundary.blockerCode,
      disbursementAllowed: false,
      statement: boundaryStatement,
      allowedAction: "PROFESSIONAL_REVIEW_HANDOFF_ONLY",
      notLegalOpinion: true,
      notLendingApproval: true,
      notCreditApproval: true,
      notDisbursementAuthorization: true,
    },
  };
}

export async function getCaseReviewSummary(caseId?: string) {
  const handoffPack = await getCaseReviewHandoffPack(caseId);

  return {
    version: "chaintrace-professional-review-summary-v0.1",
    generatedAt: handoffPack.generatedAt,
    caseSummary: handoffPack.caseSummary,
    evidenceSummary: {
      total: handoffPack.evidenceSummary.total,
      verified: handoffPack.evidenceSummary.verified,
      pending: handoffPack.evidenceSummary.pending,
      missingOrRejected: handoffPack.evidenceSummary.missingOrRejected,
    },
    reviewReceiptCount: handoffPack.reviewReceiptTimeline.length,
    latestReviewReceipt: handoffPack.reviewReceiptTimeline[0] ?? null,
    gateStatus: handoffPack.gateStatus.summary,
    blockedReasons: handoffPack.blockedReasons,
    missingEvidence: handoffPack.missingEvidence,
    recommendedNextActions: handoffPack.recommendedNextActions,
    boundary: handoffPack.boundary,
  };
}

export type CaseReviewHandoffPack = Awaited<ReturnType<typeof getCaseReviewHandoffPack>>;
export type CaseReviewSummary = Awaited<ReturnType<typeof getCaseReviewSummary>>;
