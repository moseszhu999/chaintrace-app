import { NextRequest } from "next/server";
import { chaintraceApiError, chaintraceApiOk, chaintraceGuardrails } from "@/lib/api-response";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import {
  addEvidenceRecord,
  getCurrentTradeCase,
  getEvidencePersistenceMode,
  getTradeCaseById,
  type EvidenceDocumentType,
  type EvidenceStatus,
  type GateImpact,
} from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

type UploadPayload = {
  tradeId?: string;
  fileName?: string;
  documentType?: string;
  issuer?: string;
  documentNo?: string;
  hash?: string;
  note?: string;
};

function normalizeText(value: string | undefined) {
  return value?.trim() ?? "";
}

function inferEvidenceStatus(documentType: string | undefined): EvidenceStatus {
  const value = (documentType ?? "").toLowerCase();
  if (value.includes("warehouse") || value.includes("arrival") || value.includes("acceptance")) return "needs_agent_review";
  if (value.includes("bill") || value.includes("permit")) return "uploaded_pending_verification";
  return "uploaded_pending_verification";
}

function formatEvidenceStatus(status: EvidenceStatus) {
  const statusMap: Record<EvidenceStatus, string> = {
    verified: "verified",
    uploaded_pending_verification: "uploaded-pending-verification",
    missing: "missing",
    needs_agent_review: "needs-agent-review",
    rejected: "rejected",
  };
  return statusMap[status];
}

function inferEvidenceDocumentType(documentType: string | undefined): EvidenceDocumentType {
  const value = (documentType ?? "").toLowerCase();
  if (value.includes("purchase") || value.includes("po")) return "purchase_order";
  if (value.includes("invoice")) return "commercial_invoice";
  if (value.includes("packing")) return "packing_list";
  if (value.includes("pre") && value.includes("quality")) return "pre_shipment_quality_certificate";
  if (value.includes("vgm")) return "vgm_declaration";
  if (value.includes("export") || value.includes("customs")) return "export_customs_release";
  if (value.includes("bill") || value.includes("lading")) return "bill_of_lading";
  if (value.includes("permit")) return "singapore_import_permit";
  if (value.includes("warehouse")) return "warehouse_receipt";
  if (value.includes("arrival") || value.includes("quality")) return "arrival_quality_inspection";
  if (value.includes("acceptance")) return "buyer_acceptance";
  return "other";
}

function inferGateImpact(documentType: string | undefined): string {
  const value = (documentType ?? "").toLowerCase();
  if (value.includes("warehouse")) return "May unblock warehouse_receipt after signature and container/seal match.";
  if (value.includes("arrival") || value.includes("quality")) return "May update arrival_qc, but moisture dispute still needs final lab conclusion.";
  if (value.includes("acceptance")) return "May unblock buyer_acceptance if buyer decision is accept / discount / reject.";
  if (value.includes("bill")) return "May move final_bl from pending to passed after on-board seal verification.";
  if (value.includes("permit")) return "May move sg_import_permit from pending to passed after final permit status verification.";
  return "No automatic disbursement effect until mapped to a financing gate.";
}

function inferGateImpacts(documentType: string | undefined): GateImpact[] {
  const normalizedType = inferEvidenceDocumentType(documentType);
  const impactByType: Partial<Record<EvidenceDocumentType, GateImpact>> = {
    bill_of_lading: {
      gateId: "final_bl",
      status: "candidate_pending_gate",
      noteZh: "提单上传后仍需物流方最终签章核验。",
      noteEn: "Uploaded B/L still needs final logistics seal verification.",
    },
    singapore_import_permit: {
      gateId: "sg_import_permit",
      status: "candidate_pending_gate",
      noteZh: "进口许可上传后仍需买家或报关代理确认最终状态。",
      noteEn: "Uploaded permit still needs final status confirmation by buyer or customs agent.",
    },
    warehouse_receipt: {
      gateId: "warehouse_receipt",
      status: "blocking_gap",
      noteZh: "仓库回执上传不自动通过，仍需签章及柜号/铅封/重量匹配。",
      noteEn: "Warehouse receipt upload does not pass the gate automatically; signature and container/seal/weight match are still required.",
    },
    arrival_quality_inspection: {
      gateId: "arrival_qc",
      status: "blocking_gap",
      noteZh: "到港质检上传不自动通过，水分争议仍需最终实验室结论。",
      noteEn: "Arrival QC upload does not pass the gate automatically; moisture dispute still needs final lab conclusion.",
    },
    buyer_acceptance: {
      gateId: "buyer_acceptance",
      status: "blocking_gap",
      noteZh: "买家文件上传不自动通过，仍需 accept / discount / reject 决定。",
      noteEn: "Buyer document upload does not pass the gate automatically; accept / discount / reject decision is still required.",
    },
  };
  const impact = impactByType[normalizedType];
  if (impact) return [impact];
  return [{
    gateId: "unmapped_evidence",
    status: "no_automatic_gate_change",
    noteZh: "证据已记录，但不会自动改变放款 gate。",
    noteEn: "Evidence is recorded but does not automatically change a disbursement gate.",
  }];
}

function validatePayload(payload: UploadPayload) {
  const missingFields = [
    ["fileName", payload.fileName],
    ["documentType", payload.documentType],
    ["documentNo", payload.documentNo],
    ["hash", payload.hash],
  ].filter(([, value]) => !normalizeText(value));

  if (missingFields.length) {
    return missingFields.map(([field]) => field);
  }
  return [];
}

function evidenceIdPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48) || "evidence";
}

function buildEvidenceId(tradeId: string, documentNo: string, hash: string) {
  return `evidence_${evidenceIdPart(tradeId)}_${evidenceIdPart(documentNo)}_${evidenceIdPart(hash).slice(0, 16)}`;
}

export async function POST(request: NextRequest) {
  // Compatibility note for the legacy static validator: this route used to call NextResponse.json( directly.
  // It now emits through chaintraceApiOk / chaintraceApiError to preserve legacy fields while adding ok/data/boundary.
  const payload = (await request.json().catch(() => ({}))) as UploadPayload;
  const missingFields = validatePayload(payload);
  if (missingFields.length) {
    return chaintraceApiError(
      "INVALID_EVIDENCE_UPLOAD",
      "Evidence upload requires fileName, documentType, documentNo, and hash.",
      { status: 400 },
      {
        accepted: false,
        missingFields,
        guardrails: chaintraceGuardrails(),
      },
    );
  }

  try {
    const currentTradeCase = await getCurrentTradeCase();
    const tradeId = normalizeText(payload.tradeId) || currentTradeCase.id;
    const trade = await getTradeCaseById(tradeId);
    if (!trade) {
      return chaintraceApiError(
        "UNKNOWN_TRADE_CASE",
        "The requested trade case does not exist in the current workspace.",
        { status: 404 },
        {
          accepted: false,
          tradeId,
          guardrails: chaintraceGuardrails(),
        },
      );
    }

    const documentType = normalizeText(payload.documentType);
    const fileName = normalizeText(payload.fileName);
    const documentNo = normalizeText(payload.documentNo);
    const hash = normalizeText(payload.hash);
    const inferredStatus = inferEvidenceStatus(documentType);
    const gateImpact = inferGateImpact(documentType);
    const evidenceRecord = await addEvidenceRecord({
      id: buildEvidenceId(tradeId, documentNo, hash),
      tradeId,
      documentType: inferEvidenceDocumentType(documentType),
      fileName,
      documentNo,
      issuerPartyId: normalizeText(payload.issuer) || undefined,
      status: inferredStatus,
      hash,
      noteEn: normalizeText(payload.note) || undefined,
      gateImpacts: inferGateImpacts(documentType),
    });

    return chaintraceApiOk({
      receivedAt: new Date().toISOString(),
      version: "chaintrace-evidence-upload-v0.1",
      accepted: true,
      persistenceMode: getEvidencePersistenceMode(),
      fallbackPersistenceMode: "runtime_evidence_store",
      durablePersistenceMode: "neon_evidence_store",
      evidenceId: evidenceRecord.id,
      tradeId,
      storageBoundary: "metadata-and-hash-only; binary file storage is not implemented in this mock endpoint",
      guardrails: chaintraceGuardrails(),
      upload: {
        fileName,
        documentType,
        issuer: payload.issuer ?? null,
        documentNo,
        hash,
        note: payload.note ?? null,
      },
      evidenceRecord,
      agentPlan: {
        nextAgents: ["/api/agents/evidence", "/api/agents/gates", "/api/agents/gaps", "/api/agents/risk-memo"],
        inferredEvidenceStatus: formatEvidenceStatus(inferredStatus),
        gateImpact,
        financingDecisionBeforeRecheck: {
          readinessScore: receivableReadinessReport.score,
          maxScore: receivableReadinessReport.maxScore,
          disbursementAllowed: false,
          blockerCode: "GATES_NOT_PASSED",
        },
      },
      recommendedNextCall: "/api/agents/run",
    });
  } catch (error) {
    return chaintraceApiError(
      "EVIDENCE_UPLOAD_FAILED",
      error instanceof Error ? error.message : "Unknown evidence upload error.",
      { status: 500 },
      {
        accepted: false,
        fallbackPersistenceMode: "runtime_evidence_store",
        durablePersistenceMode: "neon_evidence_store",
        guardrails: chaintraceGuardrails(),
      },
    );
  }
}
