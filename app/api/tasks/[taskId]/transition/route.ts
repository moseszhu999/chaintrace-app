import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { allowedEvidenceTaskActions, transitionEvidenceTask, type EvidenceTaskAction } from "@/lib/evidence-task-store";

export const dynamic = "force-dynamic";

type TransitionPayload = {
  action?: string;
};

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as TransitionPayload;
  const action = payload.action as EvidenceTaskAction | undefined;

  if (!action || !allowedEvidenceTaskActions.includes(action)) {
    return apiError("UNSUPPORTED_TASK_ACTION", "Unsupported evidence task action.", { status: 400 });
  }

  try {
    const task = await transitionEvidenceTask(decodeURIComponent(taskId), action);
    return apiSuccess({ accepted: true, task });
  } catch (error) {
    return apiError(
      "TASK_TRANSITION_FAILED",
      error instanceof Error ? error.message : "Failed to transition task.",
      { status: 400 },
    );
  }
}
