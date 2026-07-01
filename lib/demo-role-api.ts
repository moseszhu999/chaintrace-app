import { apiError } from "@/lib/api-response";
import { demoRoleHeaderName, demoRoleLabels, getDemoRoleFromHeaders, isRoleAllowed, type DemoRole } from "@/lib/demo-roles";

// apiError preserves the boundary object on denied role responses.
export type DemoRoleGuard =
  | { ok: true; role: DemoRole }
  | { ok: false; role: DemoRole; response: Response };

export function requireDemoRole(request: Request, allowedRoles: readonly DemoRole[], action: string): DemoRoleGuard {
  const role = getDemoRoleFromHeaders(request.headers);
  if (isRoleAllowed(role, allowedRoles)) return { ok: true, role };

  const allowedLabels = allowedRoles.map((allowedRole) => demoRoleLabels[allowedRole].en).join(", ");
  return {
    ok: false,
    role,
    response: apiError(
      "ROLE_NOT_ALLOWED",
      `Role ${demoRoleLabels[role].en} cannot perform ${action}. Required role: ${allowedLabels}. Use ${demoRoleHeaderName} or the ${"chaintrace_role"} cookie in this demo session.`,
      { status: 403 },
    ),
  };
}
