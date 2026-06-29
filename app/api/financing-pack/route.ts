import { NextResponse } from "next/server";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-financing-pack-v0.1",
    purpose: "SME trade-finance pre-review pack",
    report: receivableReadinessReport,
    machineDecision: {
      tradeId: receivableReadinessReport.tradeId,
      readinessScore: receivableReadinessReport.score,
      maxScore: receivableReadinessReport.maxScore,
      status: receivableReadinessReport.statusEn,
      disbursementAllowed: false,
      preReviewAllowed: true,
      requiredBeforeDisbursement: receivableReadinessReport.financierMemo.approvalConditionsEn,
      riskFlags: receivableReadinessReport.financierMemo.riskFlagsEn,
    },
  });
}
