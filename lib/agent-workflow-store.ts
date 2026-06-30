import { createHash } from "crypto";
import { evaluateLoanGates } from "@/lib/gate-evaluator";
import { evaluateReadiness } from "@/lib/readiness-evaluator";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import { getCurrentTradeCase, listEvidenceRecords, type EvidenceRecord } from "@/lib/repositories/chaintrace-repository";

export const agentRunReceiptStore = "runtime_workflow_store";

export type HumanAction = "approve_draft" | "request_changes" | "keep_blocked" | "escalate_professional_review";
export type OperatorTaskKind =
  | "MISSING_EVIDENCE_REQUEST"
  | "PROFESSIONAL_REVIEW_INTAKE"
  | "OPERATOR_DECISION_REQUIRED"
  | "BLOCKED_CONTRACT_ACTION";
export type OperatorTaskStatus = "open" | "approved_draft" | "changes_requested" | "kept_blocked" | "escalated_professional_review";

export type ExtractedField = {
  label: string;
  value: string;
  confidence: "high" | "medium" | "blocked";
  source: string;
};

export type GateReasoningItem = {
  gateId: string;
  status: string;
  reason: string;
  nextAction: string;
};

export type MissingEvidenceItem = {
  evidenceId: string;
  documentType: string;
  fileName: string;
  status: string;
  ownerRole: string;
  reason: string;
};

export type AgentRunReceipt = {
  id: string;
  receiptVersion: "agent-run-receipt.v0.1";
  receiptStatus: "created";
  tradeId: string;
  createdAt: string;
  source: "operator_started_agent_workflow";
  persistenceMode: typeof agentRunReceiptStore;
  modelExecutionMode: "deterministic_no_llm_call";
  agentDecisionAuthority: "none";
  humanReviewRequired: true;
  professionalReviewRequired: true;
  readinessScore: number;
  maxScore: number;
  gatesPassed: number;
  totalGates: number;
  blockerCode: "GATES_NOT_PASSED";
  disbursementAllowed: false;
  extractedFields: ExtractedField[];
  gateReasoningTrace: GateReasoningItem[];
  missingEvidence: MissingEvidenceItem[];
  draftActions: string[];
  generatedTaskIds: string[];
  auditTrail: string[];
};

export type OperatorTaskTransition = {
  action: HumanAction;
  at: string;
  resultStatus: OperatorTaskStatus;
};

export type OperatorTask = {
  id: string;
  receiptId: string;
  tradeId: string;
  taskKind: OperatorTaskKind;
  taskStatus: OperatorTaskStatus;
  title: string;
  ownerRole: "operator" | "professional" | "contract";
  humanActionRequired: true;
  allowedHumanActions: HumanAction[];
  blockerCode: "GATES_NOT_PASSED";
  disbursementAllowed: false;
  agentDecisionAuthority: "none";
  details: string[];
  transitions: OperatorTaskTransition[];
  createdAt: string;
  updatedAt: string;
};

type WorkflowState = {
  receipts: AgentRunReceipt[];
  tasks: OperatorTask[];
  sequence: number;
};

const globalWorkflowState = globalThis as typeof globalThis & {
  __chaintraceAgentWorkflowState?: WorkflowState;
};

export const allowedHumanActions: HumanAction[] = [
  "approve_draft",
  "request_changes",
  "keep_blocked",
  "escalate_professional_review",
];

function getState(): WorkflowState {
  if (!globalWorkflowState.__chaintraceAgentWorkflowState) {
    globalWorkflowState.__chaintraceAgentWorkflowState = {
      receipts: [],
      tasks: [],
      sequence: 0,
    };
  }
  return globalWorkflowState.__chaintraceAgentWorkflowState;
}

function cloneReceipt(receipt: AgentRunReceipt): AgentRunReceipt {
  return {
    ...receipt,
    extractedFields: receipt.extractedFields.map((field) => ({ ...field })),
    gateReasoningTrace: receipt.gateReasoningTrace.map((item) => ({ ...item })),
    missingEvidence: receipt.missingEvidence.map((item) => ({ ...item })),
    draftActions: [...receipt.draftActions],
    generatedTaskIds: [...receipt.generatedTaskIds],
    auditTrail: [...receipt.auditTrail],
  };
}

function cloneTask(task: OperatorTask): OperatorTask {
  return {
    ...task,
    allowedHumanActions: [...task.allowedHumanActions],
    details: [...task.details],
    transitions: task.transitions.map((transition) => ({ ...transition })),
  };
}

function shortHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function documentLabel(record: EvidenceRecord) {
  return record.documentType.replaceAll("_", " ");
}

function ownerRole(record: EvidenceRecord) {
  if (record.documentType.includes("quality")) return "QC provider / warehouse / buyer";
  if (record.documentType.includes("acceptance")) return "buyer";
  if (record.documentType.includes("warehouse")) return "warehouse operator";
  if (record.documentType.includes("bill") || record.documentType.includes("permit")) return "logistics / customs agent";
  return "trade counterparty";
}

function missingEvidenceReason(record: EvidenceRecord) {
  const gateNote = record.gateImpacts.find((impact) => impact.status === "blocking_gap" || impact.status === "candidate_pending_gate");
  return gateNote?.noteEn ?? record.noteEn ?? "Evidence needs operator verification before any financing action.";
}

function buildMissingEvidence(evidenceRecords: EvidenceRecord[]): MissingEvidenceItem[] {
  return evidenceRecords
    .filter((record) => record.status !== "verified")
    .map((record) => ({
      evidenceId: record.id,
      documentType: documentLabel(record),
      fileName: record.fileName,
      status: record.status,
      ownerRole: ownerRole(record),
      reason: missingEvidenceReason(record),
    }));
}

function buildTasks(receipt: AgentRunReceipt): OperatorTask[] {
  const now = receipt.createdAt;
  const common = {
    receiptId: receipt.id,
    tradeId: receipt.tradeId,
    taskStatus: "open" as const,
    humanActionRequired: true as const,
    blockerCode: "GATES_NOT_PASSED" as const,
    disbursementAllowed: false as const,
    agentDecisionAuthority: "none" as const,
    transitions: [],
    createdAt: now,
    updatedAt: now,
  };

  return [
    {
      ...common,
      id: `${receipt.id}:missing-evidence-request`,
      taskKind: "MISSING_EVIDENCE_REQUEST",
      title: "Approve or revise missing evidence request draft",
      ownerRole: "operator",
      allowedHumanActions: ["approve_draft", "request_changes", "keep_blocked"],
      details: receipt.missingEvidence.map((item) => `${item.documentType}: ${item.reason}`),
    },
    {
      ...common,
      id: `${receipt.id}:professional-review-intake`,
      taskKind: "PROFESSIONAL_REVIEW_INTAKE",
      title: "Escalate blocked case to professional review",
      ownerRole: "professional",
      allowedHumanActions: ["escalate_professional_review", "request_changes", "keep_blocked"],
      details: [
        "Bank / legal / factor review is required before formal financing action.",
        "Trust pack remains pre-review only while gates fail.",
      ],
    },
    {
      ...common,
      id: `${receipt.id}:operator-decision-required`,
      taskKind: "OPERATOR_DECISION_REQUIRED",
      title: "Record operator decision before external action",
      ownerRole: "operator",
      allowedHumanActions,
      details: [
        "Operator must choose whether to chase evidence, request changes, keep the case blocked, or escalate.",
        "Agent cannot approve, send, sign, or disburse.",
      ],
    },
    {
      ...common,
      id: `${receipt.id}:blocked-contract-action`,
      taskKind: "BLOCKED_CONTRACT_ACTION",
      title: "Keep contract action blocked until gates complete",
      ownerRole: "contract",
      allowedHumanActions: ["keep_blocked", "escalate_professional_review"],
      details: [
        "LoanRequestRegistry handoff remains pre-review only.",
        "GATES_NOT_PASSED prevents restricted receivable token / loan conversion.",
      ],
    },
  ];
}

function statusForAction(action: HumanAction): OperatorTaskStatus {
  const statusMap: Record<HumanAction, OperatorTaskStatus> = {
    approve_draft: "approved_draft",
    request_changes: "changes_requested",
    keep_blocked: "kept_blocked",
    escalate_professional_review: "escalated_professional_review",
  };
  return statusMap[action];
}

export async function createAgentRunReceipt(): Promise<{ receipt: AgentRunReceipt; tasks: OperatorTask[] }> {
  const state = getState();
  const trade = await getCurrentTradeCase();
  const evidenceRecords = await listEvidenceRecords(trade.id);
  const gateResult = evaluateLoanGates(evidenceRecords);
  const readiness = evaluateReadiness(trade, gateResult.summary);
  const missingEvidence = buildMissingEvidence(evidenceRecords);
  const receiptInputHash = shortHash(JSON.stringify({
    tradeId: trade.id,
    evidenceIds: evidenceRecords.map((record) => `${record.id}:${record.status}:${record.updatedAt}`),
    gatesPassed: gateResult.summary.passed,
    blockerCode: gateResult.summary.blockerCode,
  }));
  state.sequence += 1;
  const now = new Date().toISOString();
  const receiptId = `agent-run-${receiptInputHash}-${String(state.sequence).padStart(3, "0")}`;

  const receipt: AgentRunReceipt = {
    id: receiptId,
    receiptVersion: "agent-run-receipt.v0.1",
    receiptStatus: "created",
    tradeId: trade.id,
    createdAt: now,
    source: "operator_started_agent_workflow",
    persistenceMode: agentRunReceiptStore,
    modelExecutionMode: "deterministic_no_llm_call",
    agentDecisionAuthority: "none",
    humanReviewRequired: true,
    professionalReviewRequired: true,
    readinessScore: readiness.readinessScore,
    maxScore: readiness.maxScore,
    gatesPassed: gateResult.summary.passed,
    totalGates: gateResult.summary.total,
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    extractedFields: [
      { label: "tradeId", value: trade.id, confidence: "high", source: "current trade case" },
      { label: "tradeValue", value: trade.totalAmount, confidence: "high", source: "current trade case" },
      { label: "blockedReceivable", value: trade.receivableAmount, confidence: "blocked", source: "gate evaluation" },
      { label: "requestedAdvance", value: trade.requestedAdvance, confidence: "medium", source: "operator workflow" },
      { label: "readiness", value: `${readiness.readinessScore}/${readiness.maxScore}`, confidence: "high", source: "readiness evaluator" },
      { label: "gates", value: `${gateResult.summary.passed}/${gateResult.summary.total}`, confidence: "high", source: "gate evaluator" },
    ],
    gateReasoningTrace: gateResult.checklist.map((gate) => ({
      gateId: gate.id,
      status: gate.status,
      reason: gate.sourceEvidenceIds.length > 0 ? `Mapped evidence: ${gate.sourceEvidenceIds.join(", ")}` : "No verified evidence mapped to this gate.",
      nextAction: gate.status === "passed" ? "No operator action required." : "Operator must resolve evidence or escalate professional review.",
    })),
    missingEvidence,
    draftActions: [
      ...receivableReadinessReport.nextActionsEn,
      "Prepare financier memo with blocker rationale.",
      "Keep wallet signing and contract conversion blocked until human and professional review pass.",
    ],
    generatedTaskIds: [],
    auditTrail: [
      "AgentRunReceipt created from current evidence and gate evaluators.",
      "modelExecutionMode=deterministic_no_llm_call",
      "agentDecisionAuthority=none",
      "Pre-review only / GATES_NOT_PASSED / disbursementAllowed=false",
    ],
  };
  const tasks = buildTasks(receipt);
  receipt.generatedTaskIds = tasks.map((task) => task.id);

  state.receipts = [receipt, ...state.receipts];
  state.tasks = [...tasks, ...state.tasks.filter((task) => task.receiptId !== receipt.id)];

  return {
    receipt: cloneReceipt(receipt),
    tasks: tasks.map(cloneTask),
  };
}

export async function listAgentRunReceipts(): Promise<AgentRunReceipt[]> {
  return getState().receipts.map(cloneReceipt);
}

export async function getLatestAgentRunReceipt(): Promise<AgentRunReceipt | null> {
  const [latest] = await listAgentRunReceipts();
  return latest ?? null;
}

export async function listOperatorTasks(receiptId?: string): Promise<OperatorTask[]> {
  const state = getState();
  const targetReceiptId = receiptId ?? state.receipts[0]?.id;
  if (!targetReceiptId) return [];
  return state.tasks.filter((task) => task.receiptId === targetReceiptId).map(cloneTask);
}

export async function transitionOperatorTask(taskId: string, action: HumanAction): Promise<OperatorTask> {
  const state = getState();
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) {
    throw new Error(`Operator task not found: ${taskId}`);
  }
  if (!task.allowedHumanActions.includes(action)) {
    throw new Error(`Action ${action} is not allowed for task ${taskId}`);
  }
  const now = new Date().toISOString();
  const taskStatus = statusForAction(action);
  task.taskStatus = taskStatus;
  task.updatedAt = now;
  task.transitions = [
    ...task.transitions,
    {
      action,
      at: now,
      resultStatus: taskStatus,
    },
  ];
  return cloneTask(task);
}
