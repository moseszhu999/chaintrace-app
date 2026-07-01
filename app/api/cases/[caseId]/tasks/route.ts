import { apiSuccess } from "@/lib/api-response";
import { listEvidenceTasks, seedMissingEvidenceTasks } from "@/lib/evidence-task-store";
import { safeGetCurrentTradeCase, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const trade = await safeGetCurrentTradeCase();
  const evidence = await safeListEvidenceRecords(trade.id);
  seedMissingEvidenceTasks(trade.id, evidence.records);
  const evidenceTasks = await listEvidenceTasks(trade.id);

  return apiSuccess({
    caseId: trade.id,
    evidenceTasks,
    openTasks: evidenceTasks.filter((task) => task.taskStatus === "open").length,
    resolvedTasks: evidenceTasks.filter((task) => task.taskStatus === "resolved").length,
  });
}
