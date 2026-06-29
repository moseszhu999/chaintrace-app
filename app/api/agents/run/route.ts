import { NextResponse } from "next/server";
import { agentApiEndpoints } from "@/lib/agent-api-fixture";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { getLoanGateChecklist, getLoanGateSummary } from "@/lib/loan-gate-fixture";
import { professionalReviewItems } from "@/lib/professional-review-fixture";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export const dynamic = "force-static";

export async function GET() {
  const workspace = await getWorkspaceSnapshot();
  const trade = workspace.activeTrade;
  const documents = trade.documents;
  const verified = documents.filter((document) => document.status === "verified");
  const gateChecklist = getLoanGateChecklist().map(({ id, status, evidenceId }) => ({ id, status, evidenceId }));
  const gateSummary = getLoanGateSummary();
  const memo = receivableReadinessReport.financierMemo;

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
      requestedAdvance: "USDC 29,500",
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
      filesReceived: documents.length,
      verifiedCount: verified.length,
      openCount: documents.length - verified.length,
      preReviewUsableEvidenceIds: verified.map((document) => document.id),
    },
    gates: {
      passed: gateSummary.passed,
      total: gateSummary.total,
      checklist: gateChecklist,
      blockerCode: gateSummary.blockerCode,
      disbursementAllowed: gateSummary.disbursementAllowed,
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
      readinessScore: receivableReadinessReport.score,
      maxScore: receivableReadinessReport.maxScore,
      status: receivableReadinessReport.statusEn,
      preReviewAllowed: gateSummary.preReviewAllowed,
      disbursementAllowed: gateSummary.disbursementAllowed,
      blockerCode: gateSummary.blockerCode,
    },
  });
}
