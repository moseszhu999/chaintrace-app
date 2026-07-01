import { apiSuccess } from "@/lib/api-response";
import { getAgentWorkflowPersistenceMode, getLatestAgentRunReceipt, listOperatorTasks, type AgentRunReceipt } from "@/lib/agent-workflow-store";
import { listEvidenceTasks } from "@/lib/evidence-task-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const latestAgentRunReceipt: AgentRunReceipt | null = await getLatestAgentRunReceipt();
  const [agentTasks, evidenceTasks] = await Promise.all([
    listOperatorTasks(),
    listEvidenceTasks(),
  ]);

  return apiSuccess({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-operator-tasks-v0.2",
    persistenceMode: getAgentWorkflowPersistenceMode(),
    latestAgentRunReceipt,
    tasks: agentTasks,
    evidenceTasks,
    combinedTaskCount: agentTasks.length + evidenceTasks.length,
  });
}
