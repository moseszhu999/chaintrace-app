import { apiSuccess } from "@/lib/api-response";
import { requireDemoRole } from "@/lib/demo-role-api";
import { agentRunReceiptStore, createAgentRunReceipt, getAgentWorkflowPersistenceMode, listAgentRunReceipts } from "@/lib/agent-workflow-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const receipts = await listAgentRunReceipts();
  return apiSuccess({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-run-receipts-v0.1",
    persistenceMode: getAgentWorkflowPersistenceMode(),
    fallbackPersistenceMode: "runtime_workflow_store",
    durablePersistenceMode: "neon_workflow_store",
    store: agentRunReceiptStore,
    latestAgentRunReceipt: receipts[0] ?? null,
    receipts,
  });
}

export async function POST(request: Request) {
  const roleGuard = requireDemoRole(request, ["operator", "admin"], "task:create");
  if (!roleGuard.ok) return roleGuard.response;

  const { receipt, tasks } = await createAgentRunReceipt();
  return apiSuccess({
    generatedAt: new Date().toISOString(),
    accepted: true,
    version: "chaintrace-agent-run-receipts-v0.1",
    persistenceMode: getAgentWorkflowPersistenceMode(),
    fallbackPersistenceMode: "runtime_workflow_store",
    durablePersistenceMode: "neon_workflow_store",
    store: agentRunReceiptStore,
    agentRunReceipt: receipt,
    operatorTasks: tasks,
  }, { status: 201 });
}
