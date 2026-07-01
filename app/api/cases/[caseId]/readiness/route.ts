import { apiSuccess } from "@/lib/api-response";
import { safeGetCurrentTradeCase } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const trade = await safeGetCurrentTradeCase();
  return apiSuccess({
    caseId: trade.id,
    readiness: {
      score: trade.readinessScore,
      maxScore: trade.readinessMaxScore,
      blockerCode: trade.gateBlockerCode,
      disbursementAllowed: trade.disbursementAllowed,
    },
  });
}
