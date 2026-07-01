import { apiError, apiSuccess } from "@/lib/api-response";
import { requireDemoRole } from "@/lib/demo-role-api";
import { agentRunReceiptStore, createAgentRunReceipt, getAgentWorkflowPersistenceMode, listAgentRunReceipts } from "@/lib/agent-workflow-store";
import { safeGetTradeCaseById } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const trade = await safeGetTradeCaseById(caseId);
  if (!trade) {
    return apiError("CASE_NOT_FOUND", `Case ${caseId} was not found.`, { status: 404 });
  }

  const receipts = (await listAgentRunReceipts()).filter((receipt) => receipt.tradeId === caseId);
  return apiSuccess({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-case-agent-run-receipts-v0.1",
    caseId,
    persistenceMode: getAgentWorkflowPersistenceMode(),
    store: agentRunReceiptStore,
    latestAgentRunReceipt: receipts[0] ?? null,
    receipts,
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const roleGuard = requireDemoRole(request, ["operator", "admin"], "task:create");
  if (!roleGuard.ok) return roleGuard.response;

  const { caseId } = await params;
  const trade = await safeGetTradeCaseById(caseId);
  if (!trade) {
    return apiError("CASE_NOT_FOUND", `Case ${caseId} was not found.`, { status: 404 });
  }

  const { receipt, tasks } = await createAgentRunReceipt(caseId);
  return apiSuccess({
    generatedAt: new Date().toISOString(),
    accepted: true,
    version: "chaintrace-case-agent-run-receipts-v0.1",
    caseId,
    persistenceMode: getAgentWorkflowPersistenceMode(),
    store: agentRunReceiptStore,
    agentRunReceipt: receipt,
    operatorTasks: tasks,
  }, { status: 201 });
}

