import { NextRequest, NextResponse } from "next/server";
import { allowedHumanActions, transitionOperatorTask, type HumanAction } from "@/lib/agent-workflow-store";

export const dynamic = "force-dynamic";

type TransitionPayload = {
  action?: string;
};

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as TransitionPayload;
  const action = payload.action as HumanAction | undefined;

  if (!action || !allowedHumanActions.includes(action)) {
    return NextResponse.json({
      error: "Unsupported human operator action.",
      humanActionRequired: true,
      allowedHumanActions,
    }, { status: 400 });
  }

  try {
    const task = await transitionOperatorTask(taskId, action);
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      accepted: true,
      humanActionRequired: true,
      allowedHumanActions: task.allowedHumanActions,
      task,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to transition operator task.",
      humanActionRequired: true,
      allowedHumanActions,
    }, { status: 400 });
  }
}
