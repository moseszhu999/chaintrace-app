import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { requireDemoRole } from "@/lib/demo-role-api";
import { allowedHumanActions, getAgentWorkflowPersistenceMode, transitionOperatorTask, type HumanAction } from "@/lib/agent-workflow-store";

export const dynamic = "force-dynamic";

type TransitionPayload = {
  action?: string;
};

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const roleGuard = requireDemoRole(request, ["operator", "admin"], "task:transition");
  if (!roleGuard.ok) return roleGuard.response;

  const { taskId } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as TransitionPayload;
  const action = payload.action as HumanAction | undefined;

  if (!action || !allowedHumanActions.includes(action)) {
    return apiError("UNSUPPORTED_OPERATOR_TASK_ACTION", "Unsupported human operator action.", { status: 400 });
  }

  try {
    const task = await transitionOperatorTask(taskId, action);
    return apiSuccess({
      generatedAt: new Date().toISOString(),
      accepted: true,
      persistenceMode: getAgentWorkflowPersistenceMode(),
      humanActionRequired: true,
      allowedHumanActions: task.allowedHumanActions,
      task,
    });
  } catch (error) {
    return apiError(
      "OPERATOR_TASK_TRANSITION_FAILED",
      error instanceof Error ? error.message : "Failed to transition operator task.",
      { status: 400 },
    );
  }
}
