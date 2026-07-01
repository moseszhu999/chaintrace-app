import { apiError, apiSuccess } from "@/lib/api-response";
import { safeGetTradeCaseById } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const trade = await safeGetTradeCaseById(caseId);
  if (!trade) {
    return apiError("CASE_NOT_FOUND", `Case ${caseId} was not found.`, { status: 404 });
  }
  return apiSuccess({ case: trade });
}
