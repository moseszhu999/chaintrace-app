import { apiError, apiSuccess, apiUnknownError } from "@/lib/api-response";
import { transitionV2TradeCaseState } from "@/lib/repositories/v2-trade-case-repository";
import { resolveRequestIdentity } from "@/lib/v2/request-identity";
import { isCaseStatus } from "@/lib/v2/trade-case-types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type StateTransitionPayload = {
  userEmail?: string;
  userName?: string;
  toState?: string;
  trigger?: string;
  reason?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as StateTransitionPayload;
    const identity = resolveRequestIdentity(request, payload as Record<string, unknown>);
    const toState = clean(payload.toState);
    const trigger = clean(payload.trigger) || "MANUAL_STATE_TRANSITION";

    if (!isCaseStatus(toState)) return apiError("INVALID_CASE_STATUS", "A valid toState is required.", { status: 400 });

    const result = await transitionV2TradeCaseState(id, toState, trigger, identity.email, clean(payload.reason) || undefined, identity.name);
    return apiSuccess({ mode: "v2_trade_case_workspace", ...result });
  } catch (error) {
    return apiUnknownError(error, "Failed to transition v2 trade case state.");
  }
}
