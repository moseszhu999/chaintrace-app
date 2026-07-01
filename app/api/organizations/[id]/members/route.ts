import { apiError, apiSuccess, apiUnknownError } from "@/lib/api-response";
import { inviteV2OrganizationMember, listV2OrganizationMembers } from "@/lib/repositories/v2-organization-repository";
import { resolveRequestIdentity } from "@/lib/v2/request-identity";
import { isMemberRole } from "@/lib/v2/organization-types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type InviteMemberPayload = {
  userEmail?: string;
  userName?: string;
  email?: string;
  name?: string;
  role?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const members = await listV2OrganizationMembers(id);
    return apiSuccess({ mode: "v2_organization_network", organizationId: id, members });
  } catch (error) {
    return apiUnknownError(error, "Failed to list organization members.");
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as InviteMemberPayload;
    const identity = resolveRequestIdentity(request, payload as Record<string, unknown>);
    const email = clean(payload.email).toLowerCase();
    const role = clean(payload.role) || "VIEWER";

    if (!email) return apiError("INVALID_MEMBER_INVITE", "Member email is required.", { status: 400 });
    if (!isMemberRole(role)) return apiError("INVALID_MEMBER_ROLE", "A valid member role is required.", { status: 400 });

    const member = await inviteV2OrganizationMember({
      organizationId: id,
      email,
      name: clean(payload.name) || undefined,
      role,
      invitedByEmail: identity.email,
    });

    return apiSuccess({ mode: "v2_organization_network", organizationId: id, member }, { status: 201 });
  } catch (error) {
    return apiUnknownError(error, "Failed to invite organization member.");
  }
}
