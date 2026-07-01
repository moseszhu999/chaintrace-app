export const tradeStages = [
  "S1_CONTRACT",
  "S2_SHIPMENT",
  "S3_LOGISTICS",
  "S4_WAREHOUSE",
  "S5_QC",
  "S6_RECEIVABLE",
  "S7_FUNDING_READINESS",
  "S8_AUDIT",
] as const;

export type TradeStage = typeof tradeStages[number];

export const caseStatuses = [
  "DRAFT",
  "EVIDENCE_PENDING",
  "AI_REVIEWING",
  "PASSPORT_READY",
  "CONFIRMATION_PENDING",
  "CONFIRMED",
  "EXCEPTION",
  "ARCHIVED",
] as const;

export type CaseStatus = typeof caseStatuses[number];

export type TradeCaseRecordV2 = {
  id: string;
  caseNo: string;
  caseName: string;
  sellerOrgId?: string | null;
  buyerOrgId?: string | null;
  buyerName?: string | null;
  amount?: string | null;
  currency?: string | null;
  goodsDescription?: string | null;
  originCountry?: string | null;
  destinationCountry?: string | null;
  paymentTerm?: string | null;
  expectedShipmentDate?: string | null;
  expectedDueDate?: string | null;
  status: CaseStatus;
  currentStage: TradeStage;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  caseRootHash?: string | null;
  receivableCandidateStatus: string;
  fundingReadinessScore?: number | null;
  rwaClaimStatus: string;
  oracleEventCount: number;
  proofCommitStatus: string;
};

export type TradeCaseStageRecordV2 = {
  id: string;
  caseId: string;
  stageCode: TradeStage;
  status: string;
  completedAt?: string | null;
  stageStateHash?: string | null;
};

export type TradeCaseStateTransitionRecordV2 = {
  id: string;
  caseId: string;
  fromState?: CaseStatus | null;
  toState: CaseStatus;
  trigger: string;
  actorUserId?: string | null;
  reason?: string | null;
  transitionHash?: string | null;
  createdAt: string;
};

export type TradeCaseWorkspaceV2 = {
  case: TradeCaseRecordV2;
  stages: TradeCaseStageRecordV2[];
  transitions: TradeCaseStateTransitionRecordV2[];
};

export type CreateTradeCaseInputV2 = {
  userEmail: string;
  userName?: string;
  sellerOrgId: string;
  caseName: string;
  buyerName?: string;
  buyerOrgId?: string;
  amount?: string;
  currency?: string;
  goodsDescription?: string;
  originCountry?: string;
  destinationCountry?: string;
  paymentTerm?: string;
  expectedShipmentDate?: string;
  expectedDueDate?: string;
};

export function isCaseStatus(value: unknown): value is CaseStatus {
  return typeof value === "string" && (caseStatuses as readonly string[]).includes(value);
}

export function isTradeStage(value: unknown): value is TradeStage {
  return typeof value === "string" && (tradeStages as readonly string[]).includes(value);
}

export function stageLabel(stage: TradeStage) {
  const labels: Record<TradeStage, string> = {
    S1_CONTRACT: "S1 Contract",
    S2_SHIPMENT: "S2 Shipment",
    S3_LOGISTICS: "S3 Logistics",
    S4_WAREHOUSE: "S4 Warehouse",
    S5_QC: "S5 QC",
    S6_RECEIVABLE: "S6 Receivable",
    S7_FUNDING_READINESS: "S7 Funding Readiness",
    S8_AUDIT: "S8 Audit",
  };
  return labels[stage];
}
