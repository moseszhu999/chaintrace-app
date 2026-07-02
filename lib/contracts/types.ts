export type ContractRole =
  | "EXPORTER"
  | "BUYER"
  | "LOGISTICS"
  | "INSPECTOR"
  | "BANK"
  | "OPERATOR"
  | "AUDITOR";

export type ContractDocumentKind =
  | "PO"
  | "INVOICE"
  | "PACKING_LIST"
  | "BILL_OF_LADING"
  | "INSPECTION_REPORT"
  | "OTHER";

export type ContractCaseState =
  | "DRAFT_INTENT"
  | "PRE_REVIEW"
  | "PROOF_COLLECTED"
  | "GATES_NOT_PASSED";

export type Hex32 = `0x${string}`;

export type ChainTraceContractEvent =
  | {
      type: "RoleRegistered";
      blockNumber: bigint;
      transactionHash: string;
      wallet: string;
      role: ContractRole;
    }
  | {
      type: "CaseCreated";
      blockNumber: bigint;
      transactionHash: string;
      caseId: Hex32;
      creator: string;
      caseCommitment: string;
    }
  | {
      type: "DocumentProofAdded";
      blockNumber: bigint;
      transactionHash: string;
      caseId: Hex32;
      documentHash: Hex32;
      metadataHash: Hex32;
      kind: ContractDocumentKind;
    }
  | {
      type: "GateEvaluated";
      blockNumber: bigint;
      transactionHash: string;
      caseId: Hex32;
      gateHash: string;
      passed: boolean;
    }
  | {
      type: "CaseStateTransitioned";
      blockNumber: bigint;
      transactionHash: string;
      caseId: Hex32;
      fromState: ContractCaseState;
      toState: ContractCaseState;
    };

export interface ContractProofGraphNode {
  id: string;
  caseId: Hex32;
  proofType: "DOCUMENT_PROOF";
  documentHash: Hex32;
  metadataHash: Hex32;
  kind: ContractDocumentKind;
  status: "PASSED";
  transactionHash: string;
  blockNumber: bigint;
}

export interface ContractProofGraph {
  caseId: Hex32;
  nodes: ContractProofGraphNode[];
}

export interface ContractAuditLogEntry {
  id: string;
  caseId: Hex32;
  actor: string;
  action: "CASE_CREATED" | "DOCUMENT_PROOF_ADDED" | "GATE_EVALUATED" | "CASE_STATE_TRANSITIONED";
  targetType: "CASE" | "DOCUMENT_PROOF" | "GATE" | "CASE_STATE";
  targetId: string;
  summary: string;
  transactionHash: string;
  blockNumber: bigint;
}

export interface ContractGate {
  id: string;
  caseId: Hex32;
  gateType:
    | "TRADE_EVIDENCE_GATE"
    | "BUYER_OBLIGATION_GATE"
    | "GOODS_CHAIN_GATE"
    | "BANK_REVIEW_GATE"
    | "FUNDING_EXECUTION_GATE";
  status: "PASSED" | "BLOCKED";
  reason: string;
  disbursementAllowed: false;
}

export interface ContractDerivedCaseState {
  caseId: Hex32;
  state: ContractCaseState;
  explanation: string;
  canExecuteFunding: false;
  disbursementAllowed: false;
}
