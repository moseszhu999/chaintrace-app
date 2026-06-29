import { NextResponse } from "next/server";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { getLoanGateChecklist, getLoanGateSummary } from "@/lib/loan-gate-fixture";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export const dynamic = "force-static";

export async function GET() {
  const workspace = await getWorkspaceSnapshot();
  const trade = workspace.activeTrade;
  const gateChecklist = getLoanGateChecklist();
  const gateSummary = getLoanGateSummary();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-gates-v0.1",
    tradeId: trade.id,
    agent: agentRuns.find((run) => run.id === "gate-agent"),
    decision: {
      readinessScore: receivableReadinessReport.score,
      maxScore: receivableReadinessReport.maxScore,
      gatesPassed: gateSummary.passed,
      totalGates: gateSummary.total,
      preReviewAllowed: gateSummary.preReviewAllowed,
      disbursementAllowed: gateSummary.disbursementAllowed,
      blockerCode: gateSummary.blockerCode,
    },
    gates: gateChecklist,
    nextAgent: "/api/agents/gaps",
  });
}
