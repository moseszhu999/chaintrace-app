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
