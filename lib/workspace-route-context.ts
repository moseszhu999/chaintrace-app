import { cookies, headers } from "next/headers";
import { demoRoleCookieName, demoRoleHeaderName, normalizeDemoRole } from "@/lib/demo-roles";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export async function getWorkspaceRouteContext() {
  const [zh, workspace, cookieStore, headerStore] = await Promise.all([
    getIsZhRequest(),
    getWorkspaceSnapshot(),
    cookies(),
    headers(),
  ]);
  const role = normalizeDemoRole(headerStore.get(demoRoleHeaderName))
    ?? normalizeDemoRole(cookieStore.get(demoRoleCookieName)?.value)
    ?? "sme_user";

  return { zh, workspace, role };
}
