import { NextResponse } from "next/server";
import { professionalReviewItems, professionalReviewMetrics } from "@/lib/professional-review-fixture";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";

export const dynamic = "force-static";

export function GET() {
  const blocked = professionalReviewItems.filter((item) => item.status === "blocked");
  const needsReview = professionalReviewItems.filter((item) => item.status === "needs-review");

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-professional-review-v0.1",
    tradeId: receivableReadinessReport.tradeId,
    metrics: professionalReviewMetrics,
    queueSummary: {
      totalItems: professionalReviewItems.length,
      blocked: blocked.length,
      needsReview: needsReview.length,
      autoCleared: professionalReviewItems.filter((item) => item.status === "auto-cleared").length,
      recommendedOperatingModel: "Agent pre-check + professional exception review",
    },
    items: professionalReviewItems,
    decisionBoundary: {
      bankAndFinancier: "Underwriting, compliance, final gate review, and disbursement authorization.",
      lawFirm: "Receivable assignment, buyer-defense clauses, dispute handling, and material exceptions.",
      chaintraceAgent: "Evidence triage, gap detection, gate mapping, memo draft, and follow-up task generation.",
      smartContracts: "Gate-based execution control; current formal disbursement remains blocked.",
    },
  });
}
