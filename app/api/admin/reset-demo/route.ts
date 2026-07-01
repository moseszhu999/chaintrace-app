import { apiSuccess } from "@/lib/api-response";
import { requireDemoRole } from "@/lib/demo-role-api";
import { resetDemoWorkspace } from "@/lib/demo-workspace-reset";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const roleGuard = requireDemoRole(request, ["admin"], "admin:reset_demo");
  if (!roleGuard.ok) return roleGuard.response;

  return apiSuccess({
    accepted: true,
    version: "chaintrace-admin-demo-reset-v0.1",
    resetDemoWorkspace: resetDemoWorkspace(),
  });
}

