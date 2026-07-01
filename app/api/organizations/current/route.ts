import { apiSuccess, apiUnknownError } from "@/lib/api-response";
import { safeGetCurrentV2OrganizationContext } from "@/lib/repositories/safe-v2-organization-repository";
import { resolveRequestIdentity } from "@/lib/v2/request-identity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const identity = resolveRequestIdentity(request);
    const context = await safeGetCurrentV2OrganizationContext(identity.email, identity.name);
    return apiSuccess({ mode: "v2_organization_network", context });
  } catch (error) {
    return apiUnknownError(error, "Failed to load current organization context.");
  }
}
