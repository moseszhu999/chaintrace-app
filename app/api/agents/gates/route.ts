import { NextResponse } from "next/server";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { evaluateLoanGates } from "@/lib/gate-evaluator";
import { evaluateReadiness } from "@/lib/readiness-evaluator";
import { getCurrentTradeCase, listEvidenceRecords } from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const trade = await getCurrentTradeCase();
  const evidenceRecords = await listEvidenceRecords(trade.id);
  const gateResult = evaluateLoanGates(evidenceRecords);
  const readiness = evaluateReadiness(trade, gateResult.summary);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-gates-v0.1",
    tradeId: trade.id,
    agent: agentRuns.find((run) => run.id === "gate-agent"),
    decision: {
      readinessScore: readiness.readinessScore,
      maxScore: readiness.maxScore,
      gatesPassed: gateResult.summary.passed,
      totalGates: gateResult.summary.total,
      preReviewAllowed: readiness.preReviewAllowed,
      disbursementAllowed: readiness.disbursementAllowed,
      blockerCode: readiness.blockerCode,
    },
    gates: gateResult.checklist,
    nextAgent: "/api/agents/gaps",
  });
}
