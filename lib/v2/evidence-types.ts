export const evidenceTypes = [
  "CONTRACT",
  "PO",
  "INVOICE",
  "PACKING_LIST",
  "BILL_OF_LADING",
  "WAREHOUSE_RECEIPT",
  "QC_REPORT",
  "BUYER_ACCEPTANCE",
  "PAYMENT_PROOF",
  "OTHER",
] as const;

export type EvidenceTypeV2 = typeof evidenceTypes[number];

export const evidenceStatuses = [
  "UPLOADED",
  "HASHED",
  "EXTRACTED",
  "VERIFIED",
  "CONFIRMED",
  "REJECTED",
  "CONFLICT",
  "NEEDS_CONFIRMATION",
  "MISSING",
] as const;

export type EvidenceStatusV2 = typeof evidenceStatuses[number];

export type VisibilityScopeV2 = "PRIVATE" | "ORG_ONLY" | "INVITED_ONLY" | "PUBLIC_SUMMARY" | "FUNDER_VIEW";

export type EvidenceRecordV2 = {
  id: string;
  caseId: string;
  evidenceType: EvidenceTypeV2;
  stageCode: string;
  ownerOrgId?: string | null;
  issuerOrgId?: string | null;
  status: EvidenceStatusV2;
  visibilityScope: VisibilityScopeV2;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  evidenceHash?: string | null;
  evidenceRegistryEvent?: string | null;
};

export type EvidenceFileRecordV2 = {
  id: string;
  evidenceId: string;
  filename: string;
  mimeType?: string | null;
  fileSize?: number | null;
  storageUri: string;
  sha256: string;
  uploadedBy?: string | null;
  uploadedAt: string;
  fileHashCommitment?: string | null;
  storagePointerHash?: string | null;
};

export type EvidenceWorkspaceV2 = {
  evidence: EvidenceRecordV2;
  file: EvidenceFileRecordV2;
};

export type EvidenceListItemV2 = EvidenceRecordV2 & {
  file?: EvidenceFileRecordV2 | null;
};

export type CreateEvidenceUploadInputV2 = {
  userEmail: string;
  userName?: string;
  caseId: string;
  organizationId: string;
  evidenceType: EvidenceTypeV2;
  stageCode: string;
  filename: string;
  mimeType?: string;
  fileSize: number;
  sha256: string;
};

export function isEvidenceType(value: unknown): value is EvidenceTypeV2 {
  return typeof value === "string" && (evidenceTypes as readonly string[]).includes(value);
}
