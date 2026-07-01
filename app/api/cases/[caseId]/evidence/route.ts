import { apiSuccess } from "@/lib/api-response";
import { safeGetCurrentTradeCase, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const trade = await safeGetCurrentTradeCase();
  const evidence = await safeListEvidenceRecords(trade.id);
  return apiSuccess({ caseId: trade.id, evidenceRecords: evidence.records, evidenceStore: evidence.store });
}
