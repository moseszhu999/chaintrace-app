import { NextResponse } from "next/server";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";

export const dynamic = "force-static";

export function GET() {
  const memo = receivableReadinessReport.financierMemo;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-risk-memo-v0.1",
    tradeId: receivableReadinessReport.tradeId,
    agent: agentRuns.find((run) => run.id === "risk-agent"),
    memo,
    machineDecision: {
      readinessScore: receivableReadinessReport.score,
      maxScore: receivableReadinessReport.maxScore,
      recommendationZh: receivableReadinessReport.statusZh,
      recommendationEn: receivableReadinessReport.statusEn,
      preReviewAllowed: true,
      disbursementAllowed: false,
      requestedAdvance: "USDC 29,500",
      blockerCode: "GATES_NOT_PASSED",
      riskFlagsZh: memo.riskFlagsZh,
      riskFlagsEn: memo.riskFlagsEn,
      approvalConditionsZh: memo.approvalConditionsZh,
      approvalConditionsEn: memo.approvalConditionsEn,
    },
    nextStep: "/api/professional-review",
  });
}
