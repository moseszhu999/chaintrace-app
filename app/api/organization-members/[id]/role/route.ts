import { apiError, apiSuccess, apiUnknownError } from "@/lib/api-response";
import { safeUpdateV2OrganizationMemberRole } from "@/lib/repositories/safe-v2-organization-repository";
import { isMemberRole } from "@/lib/v2/organization-types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateRolePayload = {
  role?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as UpdateRolePayload;
    const role = clean(payload.role);

    if (!isMemberRole(role)) return apiError("INVALID_MEMBER_ROLE", "A valid member role is required.", { status: 400 });

    const member = await safeUpdateV2OrganizationMemberRole({ membershipId: id, role });
    return apiSuccess({ mode: "v2_organization_network", member });
  } catch (error) {
    return apiUnknownError(error, "Failed to update organization member role.");
  }
}
