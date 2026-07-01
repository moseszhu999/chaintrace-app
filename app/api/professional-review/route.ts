import { NextResponse } from "next/server";
import { getCaseReviewHandoffPack } from "@/lib/case-review-handoff";

export const dynamic = "force-dynamic";

export async function GET() {
  const handoffPack = await getCaseReviewHandoffPack();
  const blocked = handoffPack.openExceptions.filter((item) => item.status === "missing" || item.status === "rejected");
  const needsReview = handoffPack.openExceptions.filter((item) => item.status === "uploaded_pending_verification" || item.status === "needs_agent_review");

  return NextResponse.json({
    generatedAt: handoffPack.generatedAt,
    version: "chaintrace-professional-review-v0.2",
    tradeId: handoffPack.caseSummary.id,
    metrics: [
      { labelEn: "Readiness", valueEn: `${handoffPack.readiness.readinessScore}/${handoffPack.readiness.maxScore}` },
      { labelEn: "Gates", valueEn: `${handoffPack.gateStatus.summary.passed}/${handoffPack.gateStatus.summary.total}` },
      { labelEn: "Receipts", valueEn: `${handoffPack.reviewReceiptTimeline.length}` },
    ],
    queueSummary: {
      totalItems: handoffPack.openExceptions.length,
      blocked: blocked.length,
      needsReview: needsReview.length,
      autoCleared: handoffPack.evidenceSummary.verified,
      recommendedOperatingModel: "Agent pre-check + professional exception review",
    },
    items: handoffPack.openExceptions,
    handoffPack,
    decisionBoundary: {
      statement: handoffPack.boundary.statement,
      mode: handoffPack.boundary.mode,
      disbursementAllowed: handoffPack.boundary.disbursementAllowed,
      bankAndFinancier: "Underwriting, compliance, and final gate review. No lending approval or disbursement authorization is created here.",
      lawFirm: "Receivable assignment, buyer-defense clauses, dispute handling, and material exceptions. This is not a legal opinion.",
      chaintraceAgent: "Evidence triage, gap detection, gate mapping, memo draft, and follow-up task generation.",
      smartContracts: "Gate-based execution control; current formal disbursement remains blocked.",
    },
  });
}
