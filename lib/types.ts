export type ProofType = "product" | "shipment" | "invoice" | "inspection" | "delivery" | "acceptance";

export type ProofDraft = {
  proofType: ProofType;
  title: string;
  businessName: string;
  batchId: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  note: string;
  createdAt: string;
};
