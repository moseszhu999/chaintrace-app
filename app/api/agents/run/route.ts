import { NextResponse } from "next/server";
import { agentApiEndpoints } from "@/lib/agent-api-fixture";
import { listAgentRunReceipts, listOperatorTasks } from "@/lib/agent-workflow-store";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { evaluateLoanGates } from "@/lib/gate-evaluator";
import { professionalReviewItems } from "@/lib/professional-review-fixture";
import { evaluateReadiness } from "@/lib/readiness-evaluator";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import { getCurrentTradeCase, listEvidenceRecords } from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-static";

export async function GET() {
  const trade = await getCurrentTradeCase();
  const evidenceRecords = await listEvidenceRecords(trade.id);
  const verified = evidenceRecords.filter((record) => record.status === "verified");
  const gateResult = evaluateLoanGates(evidenceRecords);
  const gateChecklist = gateResult.checklist.map(({ id, status, evidenceId }) => ({ id, status, evidenceId }));
  const readiness = evaluateReadiness(trade, gateResult.summary);
  const memo = receivableReadinessReport.financierMemo;
  const receipts = await listAgentRunReceipts();
  const operatorTasks = await listOperatorTasks();
  const latestAgentRunReceipt = receipts[0] ?? null;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-pipeline-v0.1",
    tradeId: trade.id,
    case: {
      titleZh: trade.titleZh,
      titleEn: trade.titleEn,
      poNo: trade.poNo,
      invoiceNo: trade.invoiceNo,
      totalAmount: trade.totalAmount,
      requestedAdvance: trade.requestedAdvance,
    },
    endpoints: agentApiEndpoints,
    pipeline: agentRuns.map((run) => ({
      id: run.id,
      agentZh: run.agentZh,
      agentEn: run.agentEn,
      status: run.status,
      outputZh: run.outputZh,
      outputEn: run.outputEn,
    })),
    evidence: {
      filesReceived: evidenceRecords.length,
      verifiedCount: verified.length,
      openCount: evidenceRecords.length - verified.length,
      preReviewUsableEvidenceIds: verified.map((record) => record.id),
    },
    gates: {
      passed: gateResult.summary.passed,
      total: gateResult.summary.total,
      checklist: gateChecklist,
      blockerCode: gateResult.summary.blockerCode,
      disbursementAllowed: gateResult.summary.disbursementAllowed,
    },
    gaps: {
      nextActionsZh: receivableReadinessReport.nextActionsZh,
      nextActionsEn: receivableReadinessReport.nextActionsEn,
    },
    riskMemo: {
      executiveDecisionZh: memo.executiveDecisionZh,
      executiveDecisionEn: memo.executiveDecisionEn,
      riskFlagsZh: memo.riskFlagsZh,
      riskFlagsEn: memo.riskFlagsEn,
      approvalConditionsZh: memo.approvalConditionsZh,
      approvalConditionsEn: memo.approvalConditionsEn,
    },
    professionalReview: {
      blocked: professionalReviewItems.filter((item) => item.status === "blocked").length,
      needsReview: professionalReviewItems.filter((item) => item.status === "needs-review").length,
      autoCleared: professionalReviewItems.filter((item) => item.status === "auto-cleared").length,
      queue: professionalReviewItems,
    },
    machineDecision: {
      readinessScore: readiness.readinessScore,
      maxScore: readiness.maxScore,
      status: readiness.statusEn,
      preReviewAllowed: readiness.preReviewAllowed,
      disbursementAllowed: readiness.disbursementAllowed,
      blockerCode: readiness.blockerCode,
    },
    workflowState: {
      latestAgentRunReceipt,
      operatorTasks,
      createReceiptEndpoint: "POST /api/agent-runs",
    },
  });
}
