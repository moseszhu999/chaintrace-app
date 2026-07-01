import { evaluateLoanGates } from "@/lib/gate-evaluator";
import { evaluateReadiness } from "@/lib/readiness-evaluator";
import { listEvidenceTasks, seedMissingEvidenceTasks } from "@/lib/evidence-task-store";
import { safeGetCurrentTradeCase, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export async function getCaseOperatingSnapshot(caseId?: string) {
  const trade = await safeGetCurrentTradeCase();
  const evidence = await safeListEvidenceRecords(caseId ?? trade.id);
  seedMissingEvidenceTasks(trade.id, evidence.records);
  const evidenceTasks = await listEvidenceTasks(trade.id);
  const gates = evaluateLoanGates(evidence.records);
  const readiness = evaluateReadiness(trade, gates.summary);
  const reviewReceipts = evidence.records.flatMap((record) => record.reviewReceipts ?? []);
  const openTasks = evidenceTasks.filter((task) => task.taskStatus !== "resolved" && task.taskStatus !== "cancelled");
  const blockedGates = gates.checklist.filter((gate) => gate.status === "blocked");
  const pendingGates = gates.checklist.filter((gate) => gate.status === "pending");

  return {
    generatedAt: new Date().toISOString(),
    case: trade,
    evidenceStore: evidence.store,
    evidenceSummary: {
      total: evidence.records.length,
      verified: evidence.records.filter((record) => record.status === "verified").length,
      pending: evidence.records.filter((record) => record.status === "uploaded_pending_verification" || record.status === "needs_agent_review").length,
      missingOrRejected: evidence.records.filter((record) => record.status === "missing" || record.status === "rejected").length,
    },
    gates: {
      summary: gates.summary,
      blocked: blockedGates.slice(0, 5),
      pending: pendingGates.slice(0, 5),
    },
    readiness,
    tasks: {
      total: evidenceTasks.length,
      open: openTasks.length,
      resolved: evidenceTasks.filter((task) => task.taskStatus === "resolved").length,
      latest: evidenceTasks.slice(0, 5),
    },
    reviewReceipts: {
      total: reviewReceipts.length,
      latest: reviewReceipts.slice(0, 5),
    },
    nextHumanAction: openTasks[0]?.title ?? blockedGates[0]?.id ?? "Review case handoff pack.",
    boundary: {
      mode: "pre_review_only",
      blockerCode: "GATES_NOT_PASSED",
      disbursementAllowed: false,
    },
  };
}

export type CaseOperatingSnapshot = Awaited<ReturnType<typeof getCaseOperatingSnapshot>>;
