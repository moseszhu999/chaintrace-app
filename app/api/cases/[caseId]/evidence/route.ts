import { apiError, apiSuccess } from "@/lib/api-response";
import { safeGetCurrentTradeCase, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";
import { addEvidenceRecord, type EvidenceDocumentType } from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

type EvidencePayload = {
  documentType?: EvidenceDocumentType;
  documentNo?: string;
  issuer?: string;
  issuedAt?: string;
  amount?: string;
  hash?: string;
  fileName?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const trade = await safeGetCurrentTradeCase();
  const evidence = await safeListEvidenceRecords(trade.id);
  return apiSuccess({ caseId: trade.id, evidenceRecords: evidence.records, evidenceStore: evidence.store });
}

export async function POST(request: Request) {
  const trade = await safeGetCurrentTradeCase();
  const payload = (await request.json().catch(() => ({}))) as EvidencePayload;
  const documentNo = clean(payload.documentNo) || `META-${Date.now()}`;
  const documentType = payload.documentType ?? "other";

  if (!clean(payload.hash) && !clean(payload.fileName) && !clean(payload.documentNo)) {
    return apiError("INVALID_EVIDENCE_METADATA", "Evidence metadata requires documentNo, fileName, or hash.", { status: 400 });
  }

  try {
    const record = await addEvidenceRecord({
      tradeId: trade.id,
      documentType,
      fileName: clean(payload.fileName) || `${documentNo}.metadata.json`,
      documentNo,
      issuerPartyId: clean(payload.issuer) || "metadata_issuer",
      issuedAt: clean(payload.issuedAt) || new Date().toISOString(),
      status: "needs_agent_review",
      hash: clean(payload.hash) || undefined,
      amount: clean(payload.amount) || undefined,
      noteZh: "新增证据等待审查。",
      noteEn: "New evidence is awaiting review.",
      gateImpacts: [{
        gateId: "unmapped_evidence",
        status: "candidate_pending_gate",
        noteZh: "新增证据尚未映射到具体 gate。",
        noteEn: "New evidence has not yet been mapped to a gate.",
      }],
    });

    return apiSuccess({ caseId: trade.id, evidenceRecord: record }, { status: 201 });
  } catch (error) {
    return apiError(
      "EVIDENCE_CREATE_FAILED",
      error instanceof Error ? error.message : "Could not create evidence metadata.",
      { status: 500 },
    );
  }
}
