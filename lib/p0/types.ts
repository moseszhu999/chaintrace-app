export const userRoles = ["EXPORTER", "FUNDER", "PLATFORM", "INVESTOR"] as const;
export type UserRole = (typeof userRoles)[number];

export const caseStatuses = [
  "DRAFT",
  "DOCUMENTS_HASHED",
  "CANDIDATE_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED",
  "UNDER_REVIEW",
  "NEEDS_MORE_INFO",
  "APPROVED_FOR_PILOT",
  "REJECTED",
  "GATES_NOT_PASSED",
] as const;
export type CaseStatus = (typeof caseStatuses)[number];

export const documentTypes = ["CONTRACT", "PURCHASE_ORDER", "INVOICE", "BILL_OF_LADING", "PACKING_LIST", "QC_REPORT", "WAREHOUSE_RECEIPT", "BUYER_ACCEPTANCE", "OTHER"] as const;
export type TradeDocumentType = (typeof documentTypes)[number];

export type ChainTraceUser = { id: string; email: string; name: string; role: UserRole; organizationId: string; createdAt: string };
export type Organization = { id: string; name: string; role: UserRole; country?: string; createdAt: string };

export type TradeCase = {
  id: string;
  caseNo: string;
  title: string;
  exporterOrgId: string;
  funderOrgId?: string;
  buyerName: string;
  goodsDescription: string;
  originCountry: string;
  destinationCountry: string;
  amount: number;
  currency: string;
  dueDate?: string;
  status: CaseStatus;
  disbursementAllowed: false;
  blockerCode: "GATES_NOT_PASSED";
  pilotAllowed: boolean;
  caseRootHash?: string;
  gatesPassed: number;
  gatesTotal: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
