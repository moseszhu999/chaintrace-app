import { NextResponse } from "next/server";
import { getLatestAgentRunReceipt, listOperatorTasks, type AgentRunReceipt } from "@/lib/agent-workflow-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const latestAgentRunReceipt: AgentRunReceipt | null = await getLatestAgentRunReceipt();
  const tasks = await listOperatorTasks();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-operator-tasks-v0.1",
    latestAgentRunReceipt,
    tasks,
  });
}
