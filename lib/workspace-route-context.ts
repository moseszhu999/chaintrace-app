import { cookies, headers } from "next/headers";
import { demoRoleCookieName, demoRoleHeaderName, normalizeDemoRole } from "@/lib/demo-roles";
import { getIsZhRequest } from "@/lib/request-locale";
import { getCurrentV2OrganizationContext } from "@/lib/repositories/v2-organization-repository";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

function clean(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function resolveServerIdentity(headerStore: Awaited<ReturnType<typeof headers>>) {
  const email = clean(headerStore.get("x-chaintrace-user-email"))
    || clean(process.env.CHAINTRACE_DEV_USER_EMAIL)
    || "founder@chaintrace.local";
  const name = clean(headerStore.get("x-chaintrace-user-name"))
    || clean(process.env.CHAINTRACE_DEV_USER_NAME)
    || undefined;
  return { email: email.toLowerCase(), name };
}

export async function getWorkspaceRouteContext() {
  const [zh, workspace, cookieStore, headerStore] = await Promise.all([
    getIsZhRequest(),
    getWorkspaceSnapshot(),
    cookies(),
    headers(),
  ]);
  const identity = resolveServerIdentity(headerStore);
  const organizationContext = await getCurrentV2OrganizationContext(identity.email, identity.name);

  // Transitional compatibility only: legacy workspace components still accept DemoRole.
  // v2 pages must prefer organizationContext.membership.role and organization_id scope.
  const role = normalizeDemoRole(headerStore.get(demoRoleHeaderName))
    ?? normalizeDemoRole(cookieStore.get(demoRoleCookieName)?.value)
    ?? "sme_user";

  return { zh, workspace, role, organizationContext };
}
