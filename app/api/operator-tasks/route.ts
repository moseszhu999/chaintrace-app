import { apiSuccess } from "@/lib/api-response";
import { getAgentWorkflowPersistenceMode, getLatestAgentRunReceipt, listOperatorTasks, type AgentRunReceipt } from "@/lib/agent-workflow-store";
import { listEvidenceTasks, seedMissingEvidenceTasks } from "@/lib/evidence-task-store";
import { safeGetCurrentTradeCase, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const latestAgentRunReceipt: AgentRunReceipt | null = await getLatestAgentRunReceipt();
  const trade = await safeGetCurrentTradeCase();
  const evidence = await safeListEvidenceRecords(trade.id);
  seedMissingEvidenceTasks(trade.id, evidence.records);

  const [agentTasks, evidenceTasks] = await Promise.all([
    listOperatorTasks(),
    listEvidenceTasks(trade.id),
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
