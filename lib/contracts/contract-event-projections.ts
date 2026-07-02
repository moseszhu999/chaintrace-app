import {
  ChainTraceContractEvent,
  ContractAuditLogEntry,
  ContractCaseState,
  ContractDerivedCaseState,
  ContractGate,
  ContractProofGraph,
  Hex32
} from "@/lib/contracts/types";

export function buildProofGraphFromContractEvents(
  caseId: Hex32,
  events: ChainTraceContractEvent[]
): ContractProofGraph {
  return {
    caseId,
    nodes: events
      .filter(isDocumentProofForCase(caseId))
      .map((event) => ({
        id: `${caseId}:document:${event.documentHash}`,
        caseId,
        proofType: "DOCUMENT_PROOF" as const,
        documentHash: event.documentHash,
        metadataHash: event.metadataHash,
        kind: event.kind,
        status: "PASSED" as const,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      }))
  };
}

function isDocumentProofForCase(caseId: Hex32) {
  return (
    event: ChainTraceContractEvent
  ): event is Extract<ChainTraceContractEvent, { type: "DocumentProofAdded" }> =>
    event.type === "DocumentProofAdded" && event.caseId === caseId;
}

export function buildAuditLogFromContractEvents(
  caseId: Hex32,
  events: ChainTraceContractEvent[]
): ContractAuditLogEntry[] {
  return events
    .filter((event) => "caseId" in event && event.caseId === caseId)
    .map((event): ContractAuditLogEntry | null => {
      if (event.type === "CaseCreated") {
        return {
          id: `${event.transactionHash}:case-created`,
          caseId,
          actor: event.creator,
          action: "CASE_CREATED",
          targetType: "CASE",
          targetId: event.caseId,
          summary: "Case commitment registered on ChainTrace P1 registry.",
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        };
      }
      if (event.type === "DocumentProofAdded") {
        return {
          id: `${event.transactionHash}:document-proof`,
          caseId,
          actor: "contract",
          action: "DOCUMENT_PROOF_ADDED",
          targetType: "DOCUMENT_PROOF",
          targetId: event.documentHash,
          summary: `${event.kind} document proof hash recorded without raw file bytes.`,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        };
      }
      if (event.type === "GateEvaluated") {
        return {
          id: `${event.transactionHash}:gate`,
          caseId,
          actor: "contract",
          action: "GATE_EVALUATED",
          targetType: "GATE",
          targetId: event.gateHash,
          summary: `Gate evaluation recorded as ${event.passed ? "passed" : "blocked"}.`,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        };
      }
      if (event.type === "CaseStateTransitioned") {
        return {
          id: `${event.transactionHash}:case-state`,
          caseId,
          actor: "contract",
          action: "CASE_STATE_TRANSITIONED",
          targetType: "CASE_STATE",
          targetId: event.toState,
          summary: `Case state moved from ${event.fromState} to ${event.toState}.`,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        };
      }
      return null;
    })
    .filter((entry): entry is ContractAuditLogEntry => entry !== null);
}

export function evaluateP1ContractGates(
  caseId: Hex32,
  events: ChainTraceContractEvent[]
): ContractGate[] {
  const hasDocumentProof = events.some(
    (event) => event.type === "DocumentProofAdded" && event.caseId === caseId
  );
  const hasPassedGate = events.some(
    (event) => event.type === "GateEvaluated" && event.caseId === caseId && event.passed
  );

  return [
    gate(
      caseId,
      "TRADE_EVIDENCE_GATE",
      hasDocumentProof ? "PASSED" : "BLOCKED",
      hasDocumentProof
        ? "At least one document proof hash is registered on contract."
        : "Exporter must add a document proof hash."
    ),
    gate(
      caseId,
      "BUYER_OBLIGATION_GATE",
      "BLOCKED",
      "Buyer obligation proof is not part of the current P1.1 contract slice."
    ),
    gate(
      caseId,
      "GOODS_CHAIN_GATE",
      hasPassedGate ? "PASSED" : "BLOCKED",
      hasPassedGate
        ? "A non-funding gate has been evaluated on contract."
        : "Goods-chain proof gate has not been evaluated."
    ),
    gate(caseId, "BANK_REVIEW_GATE", "BLOCKED", "Bank review remains pre-funding and read-only in P1.1."),
    gate(
      caseId,
      "FUNDING_EXECUTION_GATE",
      "BLOCKED",
      "P1.1 forbids financing, disbursement, settlement, and fully-passed funding execution."
    )
  ];
}

export function buildCaseStateFromContractEvents(
  caseId: Hex32,
  events: ChainTraceContractEvent[]
): ContractDerivedCaseState {
  const latestTransition = events
    .filter((event) => event.type === "CaseStateTransitioned" && event.caseId === caseId)
    .at(-1);
  const state: ContractCaseState =
    latestTransition?.type === "CaseStateTransitioned"
      ? latestTransition.toState
      : events.some((event) => event.type === "DocumentProofAdded" && event.caseId === caseId)
        ? "PROOF_COLLECTED"
        : "DRAFT_INTENT";

  return {
    caseId,
    state,
    explanation: explanationForState(state),
    canExecuteFunding: false,
    disbursementAllowed: false
  };
}

function gate(
  caseId: Hex32,
  gateType: ContractGate["gateType"],
  status: ContractGate["status"],
  reason: string
): ContractGate {
  return {
    id: `${caseId}:${gateType}`,
    caseId,
    gateType,
    status,
    reason,
    disbursementAllowed: false
  };
}

function explanationForState(state: ContractCaseState): string {
  switch (state) {
    case "DRAFT_INTENT":
      return "Case commitment exists or draft cache exists, but contract proof collection has not started.";
    case "PRE_REVIEW":
      return "Case is in pre-review. Contract state is still before funding execution.";
    case "PROOF_COLLECTED":
      return "Document proof hashes are on contract. Funding execution remains blocked.";
    case "GATES_NOT_PASSED":
      return "One or more P1 gates are blocked. Financing and disbursement are unavailable.";
  }
}
