import { concreteTradeCase, type TradeDocument, type TradeDocumentStatus } from "@/lib/concrete-trade-fixture";
import type { EvidenceDocumentType, EvidenceRecord, EvidenceStatus, GateImpact } from "@/lib/repositories/chaintrace-repository";

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
  doc_bl: [{ gateId: "final_bl", status: "candidate_pending_gate", noteZh: "提单等待最终核验。", noteEn: "B/L is waiting for final verification." }],
  doc_sg_permit: [{ gateId: "sg_import_permit", status: "candidate_pending_gate", noteZh: "进口许可等待最终确认。", noteEn: "Import permit is waiting for final confirmation." }],
  doc_warehouse: [{ gateId: "warehouse_receipt", status: "blocking_gap", noteZh: "仓库回执缺失。", noteEn: "Warehouse receipt is missing." }],
  doc_arrival_qc: [{ gateId: "arrival_qc", status: "blocking_gap", noteZh: "到港质检争议未闭合。", noteEn: "Arrival QC dispute remains open." }],
  doc_acceptance: [{ gateId: "buyer_acceptance", status: "blocking_gap", noteZh: "买家验收决定缺失。", noteEn: "Buyer acceptance decision is missing." }],
};

function mapStatus(status: TradeDocumentStatus): EvidenceStatus {
  const statusMap: Record<TradeDocumentStatus, EvidenceStatus> = {
    verified: "verified",
    uploaded: "uploaded_pending_verification",
    missing: "missing",
    rejected: "rejected",
  };
  return statusMap[status];
}

function toFallbackEvidenceRecord(document: TradeDocument): EvidenceRecord {
  return {
    id: document.id,
    tradeId: concreteTradeCase.id,
    documentType: documentTypeById[document.id] ?? "other",
    fileName: document.fileName,
    documentNo: document.documentNo,
    issuerPartyId: document.issuerPartyId,
    issuedAt: document.issuedAt,
    status: mapStatus(document.status),
    hash: document.hash,
    amount: document.amount,
    noteZh: document.noteZh,
    noteEn: document.noteEn,
    gateImpacts: (gateImpactsByDocumentId[document.id] ?? []).map((impact) => ({ ...impact })),
    reviewReceipts: [],
    createdAt: document.issuedAt,
    updatedAt: document.issuedAt,
  };
}

export function getFallbackEvidenceRecords(): EvidenceRecord[] {
  return concreteTradeCase.documents.map(toFallbackEvidenceRecord);
}
