import { neon } from "@neondatabase/serverless";
import { concreteTradeCase, type TradeDocument, type TradeDocumentStatus } from "@/lib/concrete-trade-fixture";

export type EvidenceStatus =
  | "verified"
  | "uploaded_pending_verification"
  | "missing"
  | "needs_agent_review"
  | "rejected";

export type EvidenceDocumentType =
  | "purchase_order"
  | "commercial_invoice"
  | "packing_list"
  | "pre_shipment_quality_certificate"
  | "vgm_declaration"
  | "export_customs_release"
  | "bill_of_lading"
  | "singapore_import_permit"
  | "warehouse_receipt"
  | "arrival_quality_inspection"
  | "buyer_acceptance"
  | "other";

export type GateImpact = {
  gateId: string;
  status: "supports_passed_gate" | "candidate_pending_gate" | "blocking_gap" | "no_automatic_gate_change";
  noteZh: string;
  noteEn: string;
};

export type EvidenceReviewAction = "verify" | "reject" | "request_more_evidence";

export type EvidenceReviewerRole = "operator" | "professional";

export type EvidenceReviewReceipt = {
  id: string;
  evidenceId: string;
  action: EvidenceReviewAction;
  reviewerRole: EvidenceReviewerRole;
  reviewerName?: string;
  reason: string;
  beforeStatus: EvidenceStatus;
  afterStatus: EvidenceStatus;
  reviewedAt: string;
  blockerCode: "GATES_NOT_PASSED";
  disbursementAllowed: false;
  agentDecisionAuthority: "none";
};

export type CaseAuditTrailEntry = {
  id: string;
  action: "created_from_public_converter";
  actorRole: "sme_user";
  createdAt: string;
  summary: string;
  rawPdfPolicy: "raw PDF stays browser-local / off-chain";
};

export type TradeCaseInitialSnapshot = {
  capturedAt: string;
  evidencePackHash: string;
  gates: {
    passed: number;
    pending: number;
    blocked: number;
    total: number;
    blockerCode: "GATES_NOT_PASSED";
    disbursementAllowed: false;
  };
  readiness: {
    readinessScore: number;
    maxScore: number;
    blockerCode: "GATES_NOT_PASSED";
    disbursementAllowed: false;
    preReviewAllowed: true;
  };
};

export type TradeCaseRecord = {
  id: string;
  titleZh: string;
  titleEn: string;
  poNo: string;
  invoiceNo: string;
  totalAmount: string;
  requestedAdvance: string;
  receivableAmount: string;
  readinessScore: number;
  readinessMaxScore: number;
  gateBlockerCode: "GATES_NOT_PASSED";
  disbursementAllowed: false;
  createdAt: string;
  source: "seeded_demo_case" | "public_converter";
  initialSnapshot: TradeCaseInitialSnapshot;
  caseAuditTrail: CaseAuditTrailEntry[];
};

export type EvidenceRecord = {
  id: string;
  tradeId: string;
  documentType: EvidenceDocumentType;
  fileName: string;
  documentNo: string;
  issuerPartyId?: string;
  issuedAt?: string;
  status: EvidenceStatus;
  hash?: string;
  rawDocumentStorage: "not_stored";
  amount?: string;
  noteZh?: string;
  noteEn?: string;
  gateImpacts: GateImpact[];
  reviewReceipts: EvidenceReviewReceipt[];
  createdAt: string;
  updatedAt: string;
};

export type AddEvidenceRecordInput = Omit<EvidenceRecord, "id" | "createdAt" | "updatedAt" | "reviewReceipts" | "rawDocumentStorage"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  rawDocumentStorage?: "not_stored";
  reviewReceipts?: EvidenceReviewReceipt[];
};

export type EvidencePersistenceMode = "runtime_evidence_store" | "neon_evidence_store";

export type ReviewEvidenceRecordInput = {
  action: EvidenceReviewAction;
  reviewerRole: EvidenceReviewerRole;
  reason: string;
  reviewerName?: string;
  reviewedAt?: string;
};

export type CreatePreReviewCaseInput = {
  source: "public_converter";
  candidateHash: string;
  documentHash: string;
  fileName: string;
  documentType: string;
  documentNo?: string;
  tradeId?: string;
  titleZh?: string;
  titleEn?: string;
  poNo?: string;
  invoiceNo?: string;
  totalAmount?: string;
  receivableAmount?: string;
  requestedAdvance?: string;
};

const currentTradeCase: TradeCaseRecord = {
  id: concreteTradeCase.id,
  titleZh: concreteTradeCase.titleZh,
  titleEn: concreteTradeCase.titleEn,
  poNo: concreteTradeCase.poNo,
  invoiceNo: concreteTradeCase.invoiceNo,
  totalAmount: concreteTradeCase.totalAmount,
  requestedAdvance: "USDC 29,500",
  receivableAmount: "USD 36,960",
  readinessScore: 62,
  readinessMaxScore: 100,
  gateBlockerCode: "GATES_NOT_PASSED",
  disbursementAllowed: false,
  createdAt: "2026-01-15T00:00:00.000Z",
  source: "seeded_demo_case",
  initialSnapshot: {
    capturedAt: "2026-01-15T00:00:00.000Z",
    evidencePackHash: "seeded-demo-case",
    gates: {
      passed: 6,
      pending: 2,
      blocked: 4,
      total: 12,
      blockerCode: "GATES_NOT_PASSED",
      disbursementAllowed: false,
    },
    readiness: {
      readinessScore: 62,
      maxScore: 100,
      blockerCode: "GATES_NOT_PASSED",
      disbursementAllowed: false,
      preReviewAllowed: true,
    },
  },
  caseAuditTrail: [{
    id: "audit_seeded_demo_case",
    action: "created_from_public_converter",
    actorRole: "sme_user",
    createdAt: "2026-01-15T00:00:00.000Z",
    summary: "Seeded demo case loaded for ChainTrace public workflow.",
    rawPdfPolicy: "raw PDF stays browser-local / off-chain",
  }],
};

const documentTypeById: Record<string, EvidenceDocumentType> = {
  doc_po: "purchase_order",
  doc_invoice: "commercial_invoice",
  doc_packing: "packing_list",
  doc_quality: "pre_shipment_quality_certificate",
  doc_vgm: "vgm_declaration",
  doc_export_customs: "export_customs_release",
  doc_bl: "bill_of_lading",
  doc_sg_permit: "singapore_import_permit",
  doc_warehouse: "warehouse_receipt",
  doc_arrival_qc: "arrival_quality_inspection",
  doc_acceptance: "buyer_acceptance",
};

const gateImpactsByDocumentId: Record<string, GateImpact[]> = {
  doc_po: [{ gateId: "po_signed", status: "supports_passed_gate", noteZh: "采购订单已核验。", noteEn: "Purchase order is verified." }],
  doc_invoice: [{ gateId: "invoice_matched", status: "supports_passed_gate", noteZh: "发票与 PO 匹配。", noteEn: "Invoice matches the purchase order." }],
  doc_packing: [{ gateId: "packing_verified", status: "supports_passed_gate", noteZh: "装箱单已绑定柜号。", noteEn: "Packing list is tied to the container." }],
  doc_quality: [{ gateId: "pre_qc_passed", status: "supports_passed_gate", noteZh: "装运前质检已通过。", noteEn: "Pre-shipment QC has passed." }],
  doc_vgm: [{ gateId: "vgm_verified", status: "supports_passed_gate", noteZh: "VGM 已核验。", noteEn: "VGM is verified." }],
  doc_export_customs: [{ gateId: "export_released", status: "supports_passed_gate", noteZh: "越南出口已放行。", noteEn: "Vietnam export release is verified." }],
  doc_bl: [{ gateId: "final_bl", status: "candidate_pending_gate", noteZh: "提单已上传但最终签章未核验。", noteEn: "B/L is uploaded but final seal is not verified." }],
  doc_sg_permit: [{ gateId: "sg_import_permit", status: "candidate_pending_gate", noteZh: "进口许可已上传但最终状态未确认。", noteEn: "Import permit is uploaded but final status is not confirmed." }],
  doc_warehouse: [{ gateId: "warehouse_receipt", status: "blocking_gap", noteZh: "仓库回执缺失。", noteEn: "Warehouse receipt is missing." }],
  doc_arrival_qc: [{ gateId: "arrival_qc", status: "blocking_gap", noteZh: "到港质检争议未闭合。", noteEn: "Arrival QC dispute remains open." }],
  doc_acceptance: [{ gateId: "buyer_acceptance", status: "blocking_gap", noteZh: "买家验收决定缺失。", noteEn: "Buyer acceptance decision is missing." }],
};

function mapEvidenceStatus(status: TradeDocumentStatus): EvidenceStatus {
  const statusMap: Record<TradeDocumentStatus, EvidenceStatus> = {
    verified: "verified",
    uploaded: "uploaded_pending_verification",
    missing: "missing",
    rejected: "rejected",
  };
  return statusMap[status];
}

function toEvidenceRecord(document: TradeDocument): EvidenceRecord {
  return {
    id: document.id,
    tradeId: concreteTradeCase.id,
    documentType: documentTypeById[document.id] ?? "other",
    fileName: document.fileName,
    documentNo: document.documentNo,
    issuerPartyId: document.issuerPartyId,
    issuedAt: document.issuedAt,
    status: mapEvidenceStatus(document.status),
    hash: document.hash,
    rawDocumentStorage: "not_stored",
    amount: document.amount,
    noteZh: document.noteZh,
    noteEn: document.noteEn,
    gateImpacts: gateImpactsByDocumentId[document.id] ?? [],
    reviewReceipts: [],
    createdAt: document.issuedAt,
    updatedAt: document.issuedAt,
  };
}

const seededCaseEvidence = concreteTradeCase.documents.map(toEvidenceRecord);

const tradeCasesById = new Map<string, TradeCaseRecord>([
  [currentTradeCase.id, currentTradeCase],
]);

const evidenceRecordsByTradeId = new Map<string, EvidenceRecord[]>([
  [currentTradeCase.id, seededCaseEvidence],
]);

export function resetRuntimeEvidenceRepository() {
  tradeCasesById.clear();
  tradeCasesById.set(currentTradeCase.id, currentTradeCase);
  evidenceRecordsByTradeId.clear();
  evidenceRecordsByTradeId.set(currentTradeCase.id, seededCaseEvidence.map(cloneEvidenceRecord));
}

function cloneEvidenceRecord(record: EvidenceRecord): EvidenceRecord {
  return {
    ...record,
    gateImpacts: record.gateImpacts.map((impact) => ({ ...impact })),
    reviewReceipts: (record.reviewReceipts ?? []).map((receipt) => ({ ...receipt })),
  };
}

function cloneTradeCase(record: TradeCaseRecord): TradeCaseRecord {
  return {
    ...record,
    initialSnapshot: {
      ...record.initialSnapshot,
      gates: { ...record.initialSnapshot.gates },
      readiness: { ...record.initialSnapshot.readiness },
    },
    caseAuditTrail: record.caseAuditTrail.map((entry) => ({ ...entry })),
  };
}

function nextEvidenceId(tradeId: string) {
  const currentCount = evidenceRecordsByTradeId.get(tradeId)?.length ?? 0;
  return `evidence_${tradeId}_${String(currentCount + 1).padStart(4, "0")}`;
}

function slugPart(value: string | undefined, fallback: string) {
  const slug = (value ?? "")
    .toLowerCase()
    .replace(/^0x/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

function publicConverterCaseId(input: CreatePreReviewCaseInput) {
  const hashPart = slugPart(input.candidateHash, "candidate").slice(0, 18);
  const filePart = slugPart(input.fileName, "document").slice(0, 24);
  return `case_pre_review_${filePart}_${hashPart}`;
}

function publicConverterDocumentType(value: string): EvidenceDocumentType {
  if (value === "invoice") return "commercial_invoice";
  if (value === "quality_report") return "arrival_quality_inspection";
  if (value === "purchase_order") return "purchase_order";
  if (value === "bill_of_lading") return "bill_of_lading";
  if (value === "warehouse_receipt") return "warehouse_receipt";
  if (value === "buyer_acceptance") return "buyer_acceptance";
  return "other";
}

function gateImpactForCreatedDocument(documentType: EvidenceDocumentType): GateImpact[] {
  const gateByType: Partial<Record<EvidenceDocumentType, GateImpact>> = {
    purchase_order: {
      gateId: "po_signed",
      status: "candidate_pending_gate",
      noteZh: "公开转换器创建了采购订单 metadata/hash，仍需 SME 或 operator 审查。",
      noteEn: "The public converter created purchase-order metadata/hash; SME or operator review is still required.",
    },
    commercial_invoice: {
      gateId: "invoice_matched",
      status: "candidate_pending_gate",
      noteZh: "公开转换器创建了发票 metadata/hash，仍需与 PO 匹配核验。",
      noteEn: "The public converter created invoice metadata/hash; PO matching still requires review.",
    },
    bill_of_lading: {
      gateId: "final_bl",
      status: "candidate_pending_gate",
      noteZh: "公开转换器创建了提单 metadata/hash，仍需最终签章核验。",
      noteEn: "The public converter created B/L metadata/hash; final seal review is still required.",
    },
    warehouse_receipt: {
      gateId: "warehouse_receipt",
      status: "candidate_pending_gate",
      noteZh: "公开转换器创建了仓库回执 metadata/hash，仍需柜号、铅封和重量核验。",
      noteEn: "The public converter created warehouse-receipt metadata/hash; container, seal, and weight still require review.",
    },
    arrival_quality_inspection: {
      gateId: "arrival_qc",
      status: "candidate_pending_gate",
      noteZh: "公开转换器创建了质检 metadata/hash，仍需争议和实验室结论审查。",
      noteEn: "The public converter created QC metadata/hash; dispute and lab conclusions still require review.",
    },
    buyer_acceptance: {
      gateId: "buyer_acceptance",
      status: "candidate_pending_gate",
      noteZh: "公开转换器创建了买家验收 metadata/hash，仍需验收/扣款/拒收决定审查。",
      noteEn: "The public converter created buyer-acceptance metadata/hash; accept, discount, or reject decision still requires review.",
    },
  };
  const impact = gateByType[documentType];
  if (impact) return [impact];
  return [{
    gateId: "unmapped_evidence",
    status: "no_automatic_gate_change",
    noteZh: "公开转换器创建了 metadata/hash，但不会自动改变 gate。",
    noteEn: "The public converter created metadata/hash, but it does not automatically change a gate.",
  }];
}

type EvidenceRepository = {
  listEvidenceRecords(tradeId: string): Promise<EvidenceRecord[]>;
  findEvidenceById(evidenceId: string): Promise<EvidenceRecord | null>;
  addEvidenceRecord(input: AddEvidenceRecordInput): Promise<EvidenceRecord>;
  reviewEvidenceRecord(evidenceId: string, input: ReviewEvidenceRecordInput): Promise<{ evidenceRecord: EvidenceRecord; reviewReceipt: EvidenceReviewReceipt }>;
};

export function getEvidencePersistenceMode(): EvidencePersistenceMode {
  return process.env.DATABASE_URL ? "neon_evidence_store" : "runtime_evidence_store";
}

function createRuntimeEvidenceRepository(): EvidenceRepository {
  return {
    async listEvidenceRecords(tradeId) {
      return (evidenceRecordsByTradeId.get(tradeId) ?? []).map(cloneEvidenceRecord);
    },
    async findEvidenceById(evidenceId) {
      for (const records of evidenceRecordsByTradeId.values()) {
        const record = records.find((item) => item.id === evidenceId);
        if (record) return cloneEvidenceRecord(record);
      }
      return null;
    },
    async addEvidenceRecord(input) {
      const now = new Date().toISOString();
      const record: EvidenceRecord = {
        ...input,
        id: input.id ?? nextEvidenceId(input.tradeId),
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
        rawDocumentStorage: input.rawDocumentStorage ?? "not_stored",
        gateImpacts: input.gateImpacts.map((impact) => ({ ...impact })),
        reviewReceipts: input.reviewReceipts ?? [],
      };
      const records = evidenceRecordsByTradeId.get(input.tradeId) ?? [];
      const nextRecords = [record, ...records.filter((item) => item.id !== record.id)];
      evidenceRecordsByTradeId.set(input.tradeId, nextRecords);
      return cloneEvidenceRecord(record);
    },
    async reviewEvidenceRecord(evidenceId, input) {
      const existing = await this.findEvidenceById(evidenceId);
      if (!existing) throw new Error("EVIDENCE_NOT_FOUND");
      const { evidenceRecord, reviewReceipt } = applyEvidenceReview(existing, input);
      const records = evidenceRecordsByTradeId.get(evidenceRecord.tradeId) ?? [];
      const nextRecords = [evidenceRecord, ...records.filter((item) => item.id !== evidenceRecord.id)];
      evidenceRecordsByTradeId.set(evidenceRecord.tradeId, nextRecords);
      return { evidenceRecord: cloneEvidenceRecord(evidenceRecord), reviewReceipt: { ...reviewReceipt } };
    },
  };
}

function statusAfterReviewAction(action: EvidenceReviewAction): EvidenceStatus {
  if (action === "verify") return "verified";
  if (action === "reject") return "rejected";
  return "needs_agent_review";
}

function gateImpactAfterReviewAction(impact: GateImpact, action: EvidenceReviewAction): GateImpact {
  if (impact.gateId === "unmapped_evidence") return { ...impact };
  if (action === "verify") {
    return {
      ...impact,
      status: "supports_passed_gate",
      noteZh: "人工或专业审查已确认该证据可支持 gate。",
      noteEn: "Human or professional review confirmed this evidence supports the gate.",
    };
  }
  if (action === "request_more_evidence") {
    return {
      ...impact,
      status: "candidate_pending_gate",
      noteZh: "审查要求补充证据，gate 仍处于待确认状态。",
      noteEn: "Review requested more evidence; the gate remains pending.",
    };
  }
  return {
    ...impact,
    status: "blocking_gap",
    noteZh: "审查拒绝该证据，gate 仍被阻断。",
    noteEn: "Review rejected this evidence; the gate remains blocked.",
  };
}

function reviewReceiptId(evidenceId: string, reviewedAt: string, action: EvidenceReviewAction) {
  return `review_${evidenceId}_${action}_${reviewedAt.replace(/[^0-9a-z]/gi, "").slice(0, 20)}`;
}

function applyEvidenceReview(record: EvidenceRecord, input: ReviewEvidenceRecordInput) {
  const reviewedAt = input.reviewedAt ?? new Date().toISOString();
  const beforeStatus = record.status;
  const afterStatus = statusAfterReviewAction(input.action);
  const reviewReceipt: EvidenceReviewReceipt = {
    id: reviewReceiptId(record.id, reviewedAt, input.action),
    evidenceId: record.id,
    action: input.action,
    reviewerRole: input.reviewerRole,
    reviewerName: input.reviewerName,
    reason: input.reason,
    beforeStatus,
    afterStatus,
    reviewedAt,
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    agentDecisionAuthority: "none",
  };
  const evidenceRecord: EvidenceRecord = {
    ...record,
    status: afterStatus,
    updatedAt: reviewedAt,
    gateImpacts: record.gateImpacts.map((impact) => gateImpactAfterReviewAction(impact, input.action)),
    reviewReceipts: [reviewReceipt, ...(record.reviewReceipts ?? [])],
  };
  return { evidenceRecord, reviewReceipt };
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured for the Neon evidence store.");
  return url;
}

function createNeonEvidenceRepository(): EvidenceRepository {
  const sql = neon(getDatabaseUrl());

  async function persistEvidenceRecord(record: EvidenceRecord) {
    await sql`
      insert into evidence_records (
        id,
        trade_id,
        document_type,
        evidence_status,
        file_name,
        document_no,
        file_hash,
        raw_document_storage,
        blocker_code,
        disbursement_allowed,
        created_at,
        updated_at,
        evidence_payload
      ) values (
        ${record.id},
        ${record.tradeId},
        ${record.documentType},
        ${record.status},
        ${record.fileName},
        ${record.documentNo},
        ${record.hash ?? null},
        ${"not_stored"},
        ${"GATES_NOT_PASSED"},
        ${false},
        ${record.createdAt},
        ${record.updatedAt},
        ${JSON.stringify(record)}::jsonb
      )
      on conflict (id) do update set
        evidence_status = excluded.evidence_status,
        file_name = excluded.file_name,
        document_no = excluded.document_no,
        file_hash = excluded.file_hash,
        updated_at = excluded.updated_at,
        evidence_payload = excluded.evidence_payload;
    `;
  }

  return {
    async listEvidenceRecords(tradeId) {
      const rows = await sql`
        select evidence_payload
        from evidence_records
        where trade_id = ${tradeId}
        order by updated_at desc;
      ` as Array<{ evidence_payload: EvidenceRecord }>;
      const uploaded = rows.map((row) => cloneEvidenceRecord(row.evidence_payload));
      const uploadedIds = new Set(uploaded.map((record) => record.id));
      const seeded = seededCaseEvidence
        .filter((record) => record.tradeId === tradeId && !uploadedIds.has(record.id))
        .map(cloneEvidenceRecord);
      return [...uploaded, ...seeded];
    },
    async findEvidenceById(evidenceId) {
      const rows = await sql`
        select evidence_payload
        from evidence_records
        where id = ${evidenceId}
        limit 1;
      ` as Array<{ evidence_payload: EvidenceRecord }>;
      if (rows[0]?.evidence_payload) return cloneEvidenceRecord(rows[0].evidence_payload);
      const seeded = seededCaseEvidence.find((record) => record.id === evidenceId);
      return seeded ? cloneEvidenceRecord(seeded) : null;
    },
    async addEvidenceRecord(input) {
      const now = new Date().toISOString();
      const record: EvidenceRecord = {
        ...input,
        id: input.id ?? nextEvidenceId(input.tradeId),
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
        rawDocumentStorage: input.rawDocumentStorage ?? "not_stored",
        gateImpacts: input.gateImpacts.map((impact) => ({ ...impact })),
        reviewReceipts: input.reviewReceipts ?? [],
      };
      await persistEvidenceRecord(record);
      return cloneEvidenceRecord(record);
    },
    async reviewEvidenceRecord(evidenceId, input) {
      const existing = await this.findEvidenceById(evidenceId);
      if (!existing) throw new Error("EVIDENCE_NOT_FOUND");
      const { evidenceRecord, reviewReceipt } = applyEvidenceReview(existing, input);
      await persistEvidenceRecord(evidenceRecord);
      return { evidenceRecord: cloneEvidenceRecord(evidenceRecord), reviewReceipt: { ...reviewReceipt } };
    },
  };
}

function createEvidenceRepository(): EvidenceRepository {
  return getEvidencePersistenceMode() === "neon_evidence_store"
    ? createNeonEvidenceRepository()
    : createRuntimeEvidenceRepository();
}

export async function getCurrentTradeCase(): Promise<TradeCaseRecord> {
  return cloneTradeCase(currentTradeCase);
}

export async function getTradeCaseById(tradeId: string): Promise<TradeCaseRecord | null> {
  const tradeCase = tradeCasesById.get(tradeId);
  return tradeCase ? cloneTradeCase(tradeCase) : null;
}

export async function listTradeCases(): Promise<TradeCaseRecord[]> {
  return Array.from(tradeCasesById.values()).map(cloneTradeCase);
}

export async function createPreReviewCase(input: CreatePreReviewCaseInput): Promise<{ tradeCase: TradeCaseRecord; evidenceRecords: EvidenceRecord[]; auditTrail: CaseAuditTrailEntry[] }> {
  const now = new Date().toISOString();
  const id = input.tradeId ? slugPart(input.tradeId, "case") : publicConverterCaseId(input);
  const documentType = publicConverterDocumentType(input.documentType);
  const documentNo = input.documentNo?.trim() || `PUBLIC-${slugPart(input.candidateHash, "candidate").slice(0, 12).toUpperCase()}`;
  const evidenceRecord: EvidenceRecord = {
    id: `evidence_${slugPart(id, "case")}_${slugPart(documentNo, "document")}`,
    tradeId: id,
    documentType,
    fileName: input.fileName,
    documentNo,
    status: "uploaded_pending_verification",
    hash: input.documentHash,
    rawDocumentStorage: "not_stored",
    noteEn: "Created from public converter metadata/hash only; raw PDF stays browser-local.",
    noteZh: "由公开转换器创建，仅保存 metadata/hash；PDF 原文留在浏览器本地。",
    gateImpacts: gateImpactForCreatedDocument(documentType),
    reviewReceipts: [],
    createdAt: now,
    updatedAt: now,
  };
  const initialSnapshot: TradeCaseInitialSnapshot = {
    capturedAt: now,
    evidencePackHash: input.candidateHash,
    gates: {
      passed: 0,
      pending: 1,
      blocked: 11,
      total: 12,
      blockerCode: "GATES_NOT_PASSED",
      disbursementAllowed: false,
    },
    readiness: {
      readinessScore: 20,
      maxScore: 100,
      blockerCode: "GATES_NOT_PASSED",
      disbursementAllowed: false,
      preReviewAllowed: true,
    },
  };
  const caseAuditTrail: CaseAuditTrailEntry[] = [{
    id: `audit_${id}_created`,
    action: "created_from_public_converter",
    actorRole: "sme_user",
    createdAt: now,
    summary: "Created pre-review case from public converter candidate preview; raw PDF was not uploaded.",
    rawPdfPolicy: "raw PDF stays browser-local / off-chain",
  }];
  const tradeCase: TradeCaseRecord = {
    id,
    titleZh: input.titleZh?.trim() || "公开转换器预审 Case",
    titleEn: input.titleEn?.trim() || "Public converter pre-review case",
    poNo: input.poNo?.trim() || "PO-PENDING",
    invoiceNo: input.invoiceNo?.trim() || documentNo,
    totalAmount: input.totalAmount?.trim() || "USD 52,800",
    requestedAdvance: input.requestedAdvance?.trim() || "USDC 29,500",
    receivableAmount: input.receivableAmount?.trim() || "USD 36,960",
    readinessScore: initialSnapshot.readiness.readinessScore,
    readinessMaxScore: initialSnapshot.readiness.maxScore,
    gateBlockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    createdAt: now,
    source: "public_converter",
    initialSnapshot,
    caseAuditTrail,
  };

  tradeCasesById.set(tradeCase.id, tradeCase);
  evidenceRecordsByTradeId.set(tradeCase.id, [evidenceRecord]);
  return {
    tradeCase: cloneTradeCase(tradeCase),
    evidenceRecords: [cloneEvidenceRecord(evidenceRecord)],
    auditTrail: caseAuditTrail.map((entry) => ({ ...entry })),
  };
}

export async function listEvidenceRecords(tradeId: string): Promise<EvidenceRecord[]> {
  return createEvidenceRepository().listEvidenceRecords(tradeId);
}

export async function findEvidenceById(evidenceId: string): Promise<EvidenceRecord | null> {
  return createEvidenceRepository().findEvidenceById(evidenceId);
}

export async function addEvidenceRecord(input: AddEvidenceRecordInput): Promise<EvidenceRecord> {
  return createEvidenceRepository().addEvidenceRecord(input);
}

export async function reviewEvidenceRecord(evidenceId: string, input: ReviewEvidenceRecordInput): Promise<{ evidenceRecord: EvidenceRecord; reviewReceipt: EvidenceReviewReceipt }> {
  return createEvidenceRepository().reviewEvidenceRecord(evidenceId, input);
}
