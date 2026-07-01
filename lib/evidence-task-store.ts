import type { EvidenceRecord, EvidenceReviewReceipt } from "@/lib/repositories/chaintrace-repository";

export type EvidenceTaskStatus = "open" | "in_progress" | "waiting_counterparty" | "resolved" | "blocked" | "cancelled";
export type EvidenceTaskAction = "assign_to_operator" | "request_changes" | "keep_blocked" | "mark_resolved" | "escalate_review";

export type EvidenceLinkedTaskTransition = {
  action: EvidenceTaskAction;
  at: string;
  resultStatus: EvidenceTaskStatus;
};

export type EvidenceLinkedTask = {
  id: string;
  caseId: string;
  evidenceId: string;
  documentNo: string;
  documentType: string;
  taskStatus: EvidenceTaskStatus;
  title: string;
  reason: string;
  gateId?: string;
  sourceReviewReceiptId?: string;
  allowedActions: EvidenceTaskAction[];
  blockerCode: "GATES_NOT_PASSED";
  createdAt: string;
  updatedAt: string;
  transitions: EvidenceLinkedTaskTransition[];
};

type EvidenceTaskState = { tasks: EvidenceLinkedTask[] };

const evidenceTaskGlobal = globalThis as typeof globalThis & {
  __chaintraceEvidenceTaskState?: EvidenceTaskState;
};

export const allowedEvidenceTaskActions: EvidenceTaskAction[] = [
  "assign_to_operator",
  "request_changes",
  "keep_blocked",
  "mark_resolved",
  "escalate_review",
];

function getState(): EvidenceTaskState {
  if (!evidenceTaskGlobal.__chaintraceEvidenceTaskState) {
    evidenceTaskGlobal.__chaintraceEvidenceTaskState = { tasks: [] };
  }
  return evidenceTaskGlobal.__chaintraceEvidenceTaskState;
}

function cloneTask(task: EvidenceLinkedTask): EvidenceLinkedTask {
  return {
    ...task,
    allowedActions: [...task.allowedActions],
    transitions: task.transitions.map((transition) => ({ ...transition })),
  };
}

function taskId(caseId: string, evidenceId: string) {
  return `evidence-task:${caseId}:${evidenceId}`;
}

function primaryGateId(record: EvidenceRecord) {
  return record.gateImpacts[0]?.gateId;
}

function statusForAction(action: EvidenceTaskAction): EvidenceTaskStatus {
  const statusMap: Record<EvidenceTaskAction, EvidenceTaskStatus> = {
    assign_to_operator: "in_progress",
    request_changes: "waiting_counterparty",
    keep_blocked: "blocked",
    mark_resolved: "resolved",
    escalate_review: "blocked",
  };
  return statusMap[action];
}

function upsertTask(record: EvidenceRecord, receipt: EvidenceReviewReceipt, reason: string) {
  const now = receipt.reviewedAt;
  const id = taskId(record.tradeId, record.id);
  const state = getState();
  const existing = state.tasks.find((task) => task.id === id);
  const nextTask: EvidenceLinkedTask = {
    id,
    caseId: record.tradeId,
    evidenceId: record.id,
    documentNo: record.documentNo,
    documentType: record.documentType,
    taskStatus: "open",
    title: `${record.documentType.replaceAll("_", " ")} evidence follow-up`,
    reason,
    gateId: primaryGateId(record),
    sourceReviewReceiptId: receipt.id,
    allowedActions: allowedEvidenceTaskActions,
    blockerCode: "GATES_NOT_PASSED",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    transitions: existing?.transitions ?? [],
  };
  state.tasks = [nextTask, ...state.tasks.filter((task) => task.id !== id)];
  return cloneTask(nextTask);
}

export async function syncEvidenceReviewTask(record: EvidenceRecord, receipt: EvidenceReviewReceipt) {
  if (receipt.action === "verify") {
    return transitionEvidenceTask(taskId(record.tradeId, record.id), "mark_resolved").catch(() => null);
  }
  if (receipt.action === "request_more_evidence") {
    return upsertTask(record, receipt, "More evidence requested for this record.");
  }
  if (receipt.action === "reject") {
    return upsertTask(record, receipt, "Evidence follow-up required after review.");
  }
  return null;
}

export async function listEvidenceTasks(caseId?: string): Promise<EvidenceLinkedTask[]> {
  return getState().tasks.filter((task) => !caseId || task.caseId === caseId).map(cloneTask);
}

export async function transitionEvidenceTask(taskIdValue: string, action: EvidenceTaskAction): Promise<EvidenceLinkedTask> {
  if (!allowedEvidenceTaskActions.includes(action)) throw new Error(`Unsupported evidence task action: ${action}`);
  const state = getState();
  const task = state.tasks.find((item) => item.id === taskIdValue);
  if (!task) throw new Error(`Evidence task not found: ${taskIdValue}`);
  const now = new Date().toISOString();
  const nextStatus = statusForAction(action);
  task.taskStatus = nextStatus;
  task.updatedAt = now;
  task.transitions = [...task.transitions, { action, at: now, resultStatus: nextStatus }];
  return cloneTask(task);
}

export function seedMissingEvidenceTasks(caseId: string, records: EvidenceRecord[]) {
  const now = new Date().toISOString();
  const state = getState();
  const existingIds = new Set(state.tasks.map((task) => task.id));
  const seeded = records
    .filter((record) => record.tradeId === caseId && (record.status === "missing" || record.status === "rejected" || record.status === "needs_agent_review"))
    .filter((record) => !existingIds.has(taskId(caseId, record.id)))
    .map((record) => ({
      id: taskId(caseId, record.id),
      caseId,
      evidenceId: record.id,
      documentNo: record.documentNo,
      documentType: record.documentType,
      taskStatus: "open" as const,
      title: `${record.documentType.replaceAll("_", " ")} evidence follow-up`,
      reason: record.noteEn ?? "Evidence gap requires follow-up.",
      gateId: primaryGateId(record),
      allowedActions: allowedEvidenceTaskActions,
      blockerCode: "GATES_NOT_PASSED" as const,
      createdAt: now,
      updatedAt: now,
      transitions: [],
    }));
  state.tasks = [...seeded, ...state.tasks];
  return seeded.map(cloneTask);
}
