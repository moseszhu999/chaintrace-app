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
  amount?: string;
  noteZh?: string;
  noteEn?: string;
  gateImpacts: GateImpact[];
  createdAt: string;
  updatedAt: string;
};

export type AddEvidenceRecordInput = Omit<EvidenceRecord, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type EvidencePersistenceMode = "runtime_evidence_store" | "neon_evidence_store";

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
    amount: document.amount,
    noteZh: document.noteZh,
    noteEn: document.noteEn,
    gateImpacts: gateImpactsByDocumentId[document.id] ?? [],
    createdAt: document.issuedAt,
    updatedAt: document.issuedAt,
  };
}

const seededCaseEvidence = concreteTradeCase.documents.map(toEvidenceRecord);

const evidenceRecordsByTradeId = new Map<string, EvidenceRecord[]>([
  [currentTradeCase.id, seededCaseEvidence],
]);

function cloneEvidenceRecord(record: EvidenceRecord): EvidenceRecord {
  return {
    ...record,
    gateImpacts: record.gateImpacts.map((impact) => ({ ...impact })),
  };
}

function cloneTradeCase(record: TradeCaseRecord): TradeCaseRecord {
  return { ...record };
}

function nextEvidenceId(tradeId: string) {
  const currentCount = evidenceRecordsByTradeId.get(tradeId)?.length ?? 0;
  return `evidence_${tradeId}_${String(currentCount + 1).padStart(4, "0")}`;
}

type EvidenceRepository = {
  listEvidenceRecords(tradeId: string): Promise<EvidenceRecord[]>;
  findEvidenceById(evidenceId: string): Promise<EvidenceRecord | null>;
  addEvidenceRecord(input: AddEvidenceRecordInput): Promise<EvidenceRecord>;
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
        gateImpacts: input.gateImpacts.map((impact) => ({ ...impact })),
      };
      const records = evidenceRecordsByTradeId.get(input.tradeId) ?? [];
      const nextRecords = [record, ...records.filter((item) => item.id !== record.id)];
      evidenceRecordsByTradeId.set(input.tradeId, nextRecords);
      return cloneEvidenceRecord(record);
    },
  };
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured for the Neon evidence store.");
  return url;
}

function createNeonEvidenceRepository(): EvidenceRepository {
  const sql = neon(getDatabaseUrl());

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
        gateImpacts: input.gateImpacts.map((impact) => ({ ...impact })),
      };
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
      return cloneEvidenceRecord(record);
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
  if (tradeId !== currentTradeCase.id) return null;
  return cloneTradeCase(currentTradeCase);
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
