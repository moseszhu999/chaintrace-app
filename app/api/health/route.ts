import { apiError, apiSuccess } from "@/lib/api-response";
import { safeGetCurrentTradeCase, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trade = await safeGetCurrentTradeCase();
    const evidence = await safeListEvidenceRecords(trade.id);

    return apiSuccess({
      status: evidence.store.fallbackActive ? "degraded" : "ok",
      checkedAt: new Date().toISOString(),
      caseId: trade.id,
      evidenceCount: evidence.records.length,
      evidenceStore: evidence.store,
      routes: ["/", "/dashboard", "/evidence", "/tasks", "/business-professional-review"],
    });
  } catch (error) {
    return apiError(
      "HEALTH_CHECK_FAILED",
      error instanceof Error ? error.message : "Unknown health check error.",
      { status: 500 },
    );
  }
}
