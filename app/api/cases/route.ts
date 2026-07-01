import { apiError, apiSuccess } from "@/lib/api-response";
import { requireDemoRole } from "@/lib/demo-role-api";
import { safeCreatePreReviewCase, safeGetCurrentTradeCase, safeListTradeCases } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

type CreatePreReviewCasePayload = {
  source?: string;
  candidateHash?: string;
  documentHash?: string;
  fileName?: string;
  documentType?: string;
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

function normalized(value: string | undefined) {
  return value?.trim() ?? "";
}

export async function GET() {
  const [activeCase, cases] = await Promise.all([safeGetCurrentTradeCase(), safeListTradeCases()]);
  return apiSuccess({ cases, activeCaseId: activeCase.id });
}

export async function POST(request: Request) {
  const roleGuard = requireDemoRole(request, ["sme_user", "admin"], "case:create");
  if (!roleGuard.ok) return roleGuard.response;

  const payload = (await request.json().catch(() => ({}))) as CreatePreReviewCasePayload;
  const missingFields = [
    ["source", payload.source],
    ["candidateHash", payload.candidateHash],
    ["documentHash", payload.documentHash],
    ["fileName", payload.fileName],
    ["documentType", payload.documentType],
  ].filter(([, value]) => !normalized(value));

  if (missingFields.length) {
    return apiError("INVALID_PRE_REVIEW_CASE", `Missing required fields: ${missingFields.map(([field]) => field).join(", ")}`, { status: 400 });
  }

  if (payload.source !== "public_converter") {
    return apiError("INVALID_PRE_REVIEW_CASE_SOURCE", "Only public_converter can create a public pre-review case here.", { status: 400 });
  }

  const result = await safeCreatePreReviewCase({
    source: "public_converter",
    candidateHash: normalized(payload.candidateHash),
    documentHash: normalized(payload.documentHash),
    fileName: normalized(payload.fileName),
    documentType: normalized(payload.documentType),
    documentNo: normalized(payload.documentNo) || undefined,
    tradeId: normalized(payload.tradeId) || undefined,
    titleZh: normalized(payload.titleZh) || undefined,
    titleEn: normalized(payload.titleEn) || undefined,
    poNo: normalized(payload.poNo) || undefined,
    invoiceNo: normalized(payload.invoiceNo) || undefined,
    totalAmount: normalized(payload.totalAmount) || undefined,
    receivableAmount: normalized(payload.receivableAmount) || undefined,
    requestedAdvance: normalized(payload.requestedAdvance) || undefined,
  });

  return apiSuccess({
    version: "chaintrace-public-pre-review-case-v0.1",
    accepted: true,
    caseId: result.tradeCase.id,
    case: result.tradeCase,
    evidenceRecords: result.evidenceRecords,
    initialSnapshot: result.tradeCase.initialSnapshot,
    auditTrail: result.auditTrail,
    storageBoundary: "metadata-and-hash-only; rawDocumentStorage=not_stored; raw PDF stays browser-local / off-chain",
    rawDocumentStorage: "not_stored",
    nextPath: `/cases/${result.tradeCase.id}`,
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
  }, { status: 201 });
}
