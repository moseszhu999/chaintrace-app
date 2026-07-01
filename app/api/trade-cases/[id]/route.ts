import { apiError, apiSuccess, apiUnknownError } from "@/lib/api-response";
import { getV2TradeCaseWorkspace } from "@/lib/repositories/v2-trade-case-repository";
import { resolveRequestIdentity } from "@/lib/v2/request-identity";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const identity = resolveRequestIdentity(request);
    const result = await getV2TradeCaseWorkspace(id, identity.email, identity.name);
    if (!result.workspace) return apiError("TRADE_CASE_NOT_FOUND", "Trade case not found or not accessible for current organization.", { status: 404 });
    return apiSuccess({ mode: "v2_trade_case_workspace", ...result });
  } catch (error) {
    return apiUnknownError(error, "Failed to load v2 trade case.");
  }
}
