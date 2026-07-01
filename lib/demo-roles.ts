export const demoRoleCookieName = "chaintrace_role";
export const demoRoleHeaderName = "x-chaintrace-role";

export const demoRoles = ["sme_user", "operator", "professional_reviewer", "admin"] as const;

export type DemoRole = (typeof demoRoles)[number];

export type DemoPermission =
  | "case:create"
  | "case:view_own"
  | "evidence:add"
  | "evidence:review"
  | "task:create"
  | "task:transition"
  | "changes:request"
  | "handoff:prepare"
  | "handoff:view"
  | "professional_review:note"
  | "professional_review:exception"
  | "admin:reset_demo";

export const demoRoleLabels: Record<DemoRole, { zh: string; en: string }> = {
  sme_user: { zh: "SME 用户", en: "SME user" },
  operator: { zh: "操作员", en: "Operator" },
  professional_reviewer: { zh: "专业审查员", en: "Professional reviewer" },
  admin: { zh: "管理员", en: "Admin" },
};

export const demoRolePermissions: Record<DemoRole, DemoPermission[]> = {
  sme_user: ["case:create", "case:view_own", "evidence:add"],
  operator: ["evidence:review", "task:create", "task:transition", "changes:request", "handoff:prepare"],
  professional_reviewer: ["handoff:view", "professional_review:note", "professional_review:exception"],
  admin: [
    "case:create",
    "case:view_own",
    "evidence:add",
    "evidence:review",
    "task:create",
    "task:transition",
    "changes:request",
    "handoff:prepare",
    "handoff:view",
    "professional_review:note",
    "professional_review:exception",
    "admin:reset_demo",
  ],
};

export function normalizeDemoRole(value: string | null | undefined): DemoRole | null {
  const normalized = value?.trim().toLowerCase().replace(/[-\s]+/g, "_");
  return demoRoles.includes(normalized as DemoRole) ? (normalized as DemoRole) : null;
}

export function parseDemoRoleCookie(cookieHeader: string | null | undefined): DemoRole | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${demoRoleCookieName}=([^;]+)`));
  return normalizeDemoRole(match ? decodeURIComponent(match[1]) : undefined);
}

export function getDemoRoleFromHeaders(headers: Pick<Headers, "get">, fallback: DemoRole = "sme_user"): DemoRole {
  return normalizeDemoRole(headers.get(demoRoleHeaderName))
    ?? parseDemoRoleCookie(headers.get("cookie"))
    ?? fallback;
}

export function roleCan(role: DemoRole, permission: DemoPermission) {
  return demoRolePermissions[role].includes(permission);
}

export function roleCanAny(role: DemoRole, permissions: DemoPermission[]) {
  return permissions.some((permission) => roleCan(role, permission));
}

export function isRoleAllowed(role: DemoRole, allowedRoles: readonly DemoRole[]) {
  return allowedRoles.includes(role);
}

