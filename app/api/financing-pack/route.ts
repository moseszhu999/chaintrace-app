import { NextResponse } from "next/server";
import { buildFinancingPack } from "@/lib/financing-pack-builder";

export const dynamic = "force-dynamic";

export async function GET() {
  const financingPack = await buildFinancingPack();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: financingPack.version,
    purpose: "SME trade-finance pre-review pack",
    tradeId: financingPack.tradeId,
    evidencePackURI: financingPack.evidencePackURI,
    evidencePackHash: financingPack.evidencePackHash,
    evidencePackHashAlgorithm: financingPack.evidencePackHashAlgorithm,
    storageBoundary: financingPack.storageBoundary,
    case: financingPack.case,
    evidence: financingPack.evidence,
    gates: financingPack.gates,
    readiness: financingPack.readiness,
    report: financingPack.report,
    financingPack: financingPack.financingPack,
    financierMemo: financingPack.financierMemo,
    contractAnchor: financingPack.contractAnchor,
    machineDecision: {
      tradeId: financingPack.tradeId,
      readinessScore: financingPack.readiness.readinessScore,
      maxScore: financingPack.readiness.maxScore,
      status: financingPack.readiness.statusEn,
      disbursementAllowed: financingPack.readiness.disbursementAllowed,
      preReviewAllowed: financingPack.readiness.preReviewAllowed,
      blockerCode: financingPack.readiness.blockerCode,
      requiredBeforeDisbursement: financingPack.financierMemo.approvalConditionsEn,
      riskFlags: financingPack.financierMemo.riskFlagsEn,
    },
  });
}
