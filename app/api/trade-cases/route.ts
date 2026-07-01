import { apiError, apiSuccess, apiUnknownError } from "@/lib/api-response";
import { createV2TradeCase, listV2TradeCasesForCurrentOrganization } from "@/lib/repositories/v2-trade-case-repository";
import { resolveRequestIdentity } from "@/lib/v2/request-identity";

export const dynamic = "force-dynamic";

type CreateTradeCasePayload = {
  userEmail?: string;
  userName?: string;
  caseName?: string;
  buyerName?: string;
  buyerOrgId?: string;
  amount?: string;
  currency?: string;
  goodsDescription?: string;
  originCountry?: string;
  destinationCountry?: string;
  paymentTerm?: string;
  expectedShipmentDate?: string;
  expectedDueDate?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  try {
    const identity = resolveRequestIdentity(request);
    const result = await listV2TradeCasesForCurrentOrganization(identity.email, identity.name);
    return apiSuccess({ mode: "v2_trade_case_workspace", ...result });
  } catch (error) {
    return apiUnknownError(error, "Failed to list v2 trade cases.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as CreateTradeCasePayload;
    const identity = resolveRequestIdentity(request, payload as Record<string, unknown>);
    const current = await listV2TradeCasesForCurrentOrganization(identity.email, identity.name);
    const organization = current.context.organization;

    if (!organization) return apiError("ORGANIZATION_REQUIRED", "Create an organization before creating a trade case.", { status: 400 });
    if (!clean(payload.caseName)) return apiError("INVALID_TRADE_CASE", "caseName is required.", { status: 400 });

    const workspace = await createV2TradeCase({
      userEmail: identity.email,
      userName: identity.name,
      sellerOrgId: organization.id,
      caseName: clean(payload.caseName),
      buyerName: clean(payload.buyerName) || undefined,
      buyerOrgId: clean(payload.buyerOrgId) || undefined,
      amount: clean(payload.amount) || undefined,
      currency: clean(payload.currency) || "USD",
      goodsDescription: clean(payload.goodsDescription) || undefined,
      originCountry: clean(payload.originCountry) || undefined,
      destinationCountry: clean(payload.destinationCountry) || undefined,
      paymentTerm: clean(payload.paymentTerm) || undefined,
      expectedShipmentDate: clean(payload.expectedShipmentDate) || undefined,
      expectedDueDate: clean(payload.expectedDueDate) || undefined,
    });

    return apiSuccess({ mode: "v2_trade_case_workspace", context: current.context, workspace, nextPath: `/trade-cases/${workspace.case.id}` }, { status: 201 });
  } catch (error) {
    return apiUnknownError(error, "Failed to create v2 trade case.");
  }
}
