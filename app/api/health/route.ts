import { chaintraceApiOk } from "@/lib/api-response";
import { getFallbackEvidenceRecords } from "@/lib/evidence-fallback";
import {
  getCurrentTradeCase,
  getEvidencePersistenceMode,
  listEvidenceRecords,
} from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

type HealthCheck = {
  name: string;
  status: "pass" | "degraded";
  message: string;
  details?: Record<string, unknown>;
};

export async function GET() {
  const checkedAt = new Date().toISOString();
  const checks: HealthCheck[] = [];
  const persistenceMode = getEvidencePersistenceMode();

  let evidenceCount = 0;
  let fallbackEvidenceCount = 0;

  try {
    const trade = await getCurrentTradeCase();
    checks.push({
      name: "trade_case_fixture",
      status: "pass",
      message: "Current demo trade case can be loaded.",
      details: {
        tradeId: trade.id,
        blockerCode: trade.gateBlockerCode,
        disbursementAllowed: trade.disbursementAllowed,
      },
    });

    try {
      const records = await listEvidenceRecords(trade.id);
      evidenceCount = records.length;
      checks.push({
        name: "evidence_store",
        status: "pass",
        message: "Evidence store can be read.",
        details: { persistenceMode, evidenceCount },
      });
    } catch (error) {
      const fallback = getFallbackEvidenceRecords();
      fallbackEvidenceCount = fallback.length;
      checks.push({
        name: "evidence_store",
        status: "degraded",
        message: "Evidence store read failed, but seeded fallback evidence is available.",
        details: {
          persistenceMode,
          fallbackEvidenceCount,
          error: error instanceof Error ? error.message : "Unknown evidence store error.",
        },
      });
    }
  } catch (error) {
    const fallback = getFallbackEvidenceRecords();
    fallbackEvidenceCount = fallback.length;
    checks.push({
      name: "trade_case_fixture",
      status: "degraded",
      message: "Current trade case read failed, but seeded fallback evidence is available.",
      details: {
        fallbackEvidenceCount,
        error: error instanceof Error ? error.message : "Unknown trade case error.",
      },
    });
  }

  const degraded = checks.some((check) => check.status === "degraded");

  return chaintraceApiOk({
    service: "chaintrace-working-site",
    version: "working-site-stability-v0.1",
    checkedAt,
    overallStatus: degraded ? "degraded" : "pass",
    persistenceMode,
    fallbackReady: true,
    evidenceCount,
    fallbackEvidenceCount,
    protectedRoutes: ["/", "/dashboard", "/evidence", "/tasks", "/business-professional-review"],
    checks,
  });
}
