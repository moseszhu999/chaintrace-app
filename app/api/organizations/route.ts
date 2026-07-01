import { apiError, apiSuccess, apiUnknownError } from "@/lib/api-response";
import { createV2Organization, listV2OrganizationsForUser } from "@/lib/repositories/v2-organization-repository";
import { resolveRequestIdentity } from "@/lib/v2/request-identity";
import { isOrganizationType } from "@/lib/v2/organization-types";

export const dynamic = "force-dynamic";

type CreateOrganizationPayload = {
  userEmail?: string;
  userName?: string;
  name?: string;
  orgType?: string;
  country?: string;
  website?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  try {
    const identity = resolveRequestIdentity(request);
    const organizations = await listV2OrganizationsForUser(identity.email);
    return apiSuccess({ mode: "v2_organization_network", userEmail: identity.email, organizations });
  } catch (error) {
    return apiUnknownError(error, "Failed to list organizations.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as CreateOrganizationPayload;
    const identity = resolveRequestIdentity(request, payload as Record<string, unknown>);
    const name = clean(payload.name);
    const orgType = clean(payload.orgType);

    if (!name) return apiError("INVALID_ORGANIZATION", "Organization name is required.", { status: 400 });
    if (!isOrganizationType(orgType)) return apiError("INVALID_ORGANIZATION_TYPE", "A valid organization type is required.", { status: 400 });

    const result = await createV2Organization({
      userEmail: identity.email,
      userName: identity.name,
      name,
      orgType,
      country: clean(payload.country) || undefined,
      website: clean(payload.website) || undefined,
    });

    return apiSuccess({ mode: "v2_organization_network", ...result }, { status: 201 });
  } catch (error) {
    return apiUnknownError(error, "Failed to create organization.");
  }
}
