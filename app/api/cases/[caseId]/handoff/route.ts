import { apiSuccess } from "@/lib/api-response";
import { safeGetCurrentTradeCase, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const trade = await safeGetCurrentTradeCase();
  const evidence = await safeListEvidenceRecords(trade.id);
  const handoffPack = {
    version: "chaintrace-case-handoff-v0.1",
    case: trade,
    evidenceSummary: {
      total: evidence.records.length,
      verified: evidence.records.filter((record) => record.status === "verified").length,
      missingOrBlocked: evidence.records.filter((record) => record.status === "missing" || record.status === "rejected").length,
    },
    receiptTimeline: evidence.records.flatMap((record) => record.reviewReceipts ?? []),
    evidenceStore: evidence.store,
  };
  return apiSuccess({ handoffPack });
}
