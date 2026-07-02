import { ContractCaseState, ContractDocumentKind, ContractRole } from "@/lib/contracts/types";

export const ROLE_TO_CONTRACT_VALUE: Record<ContractRole, number> = {
  EXPORTER: 1,
  BUYER: 2,
  LOGISTICS: 3,
  INSPECTOR: 4,
  BANK: 5,
  OPERATOR: 6,
  AUDITOR: 7
};

export const DOCUMENT_KIND_TO_CONTRACT_VALUE: Record<ContractDocumentKind, number> = {
  PO: 0,
  INVOICE: 1,
  PACKING_LIST: 2,
  BILL_OF_LADING: 3,
  INSPECTION_REPORT: 4,
  OTHER: 5
};

export const CASE_STATE_TO_CONTRACT_VALUE: Record<ContractCaseState, number> = {
  DRAFT_INTENT: 0,
  PRE_REVIEW: 1,
  PROOF_COLLECTED: 2,
  GATES_NOT_PASSED: 3
};

export function contractValueToRole(value: number | bigint): ContractRole | null {
  switch (Number(value)) {
    case 1:
      return "EXPORTER";
    case 2:
      return "BUYER";
    case 3:
      return "LOGISTICS";
    case 4:
      return "INSPECTOR";
    case 5:
      return "BANK";
    case 6:
      return "OPERATOR";
    case 7:
      return "AUDITOR";
    default:
      return null;
  }
}

export function contractValueToDocumentKind(value: number | bigint): ContractDocumentKind {
  switch (Number(value)) {
    case 0:
      return "PO";
    case 1:
      return "INVOICE";
    case 2:
      return "PACKING_LIST";
    case 3:
      return "BILL_OF_LADING";
    case 4:
      return "INSPECTION_REPORT";
    default:
      return "OTHER";
  }
}

export function contractValueToCaseState(value: number | bigint): ContractCaseState {
  switch (Number(value)) {
    case 1:
      return "PRE_REVIEW";
    case 2:
      return "PROOF_COLLECTED";
    case 3:
      return "GATES_NOT_PASSED";
    default:
      return "DRAFT_INTENT";
  }
}
