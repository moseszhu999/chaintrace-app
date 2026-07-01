import { NextResponse } from "next/server";
import { buildFinancingPack } from "@/lib/financing-pack-builder";
import { getCurrentTradeCase, listEvidenceRecords } from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const trade = await getCurrentTradeCase();
  const evidenceRecords = await listEvidenceRecords(trade.id);
  const pack = await buildFinancingPack();
  const reviewReceipts = evidenceRecords
    .flatMap((record) => (record.reviewReceipts ?? []).map((receipt) => ({
      id: receipt.id,
      evidenceId: receipt.evidenceId,
      documentType: record.documentType,
      documentNo: record.documentNo,
      fileName: record.fileName,
      action: receipt.action,
      beforeStatus: receipt.beforeStatus,
      afterStatus: receipt.afterStatus,
      reviewerRole: receipt.reviewerRole,
      reviewerName: receipt.reviewerName ?? null,
      reviewedAt: receipt.reviewedAt,
      gateImpacts: record.gateImpacts,
      reason: receipt.reason,
    })))
    .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt));

  return NextResponse.json({
    version: "chaintrace-review-handoff-v0.1",
    generatedAt: new Date().toISOString(),
    tradeId: trade.id,
    case: pack.case,
    evidencePackHash: pack.evidencePackHash,
    gates: pack.gates.summary,
    readiness: pack.readiness,
    reviewReceipts: {
      total: reviewReceipts.length,
      records: reviewReceipts,
    },
    boundary: {
      mode: "handoff_json_only",
      status: "Pre-review only",
      blockerCode: pack.readiness.blockerCode,
      disbursementAllowed: pack.readiness.disbursementAllowed,
      agentDecisionAuthority: "none",
    },
  });
}
