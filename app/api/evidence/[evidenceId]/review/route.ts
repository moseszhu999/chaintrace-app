import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { buildFinancingPack } from "@/lib/financing-pack-builder";
import { safeReviewEvidenceRecord } from "@/lib/repositories/safe-chaintrace-repository";
import {
  type EvidenceReviewAction,
  type EvidenceReviewerRole,
} from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

type ReviewPayload = {
  action?: string;
  reviewerRole?: string;
  reviewerName?: string;
  reason?: string;
};

const allowedActions = new Set<EvidenceReviewAction>(["verify", "reject", "request_more_evidence"]);
const allowedReviewerRoles = new Set<EvidenceReviewerRole>(["operator", "professional"]);

function normalize(value: string | undefined) {
  return value?.trim() ?? "";
}

function parseAction(value: string | undefined): EvidenceReviewAction | null {
  const normalized = normalize(value) as EvidenceReviewAction;
  return allowedActions.has(normalized) ? normalized : null;
}

function parseReviewerRole(value: string | undefined): EvidenceReviewerRole | null {
  const normalized = normalize(value) as EvidenceReviewerRole;
  return allowedReviewerRoles.has(normalized) ? normalized : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  const { evidenceId } = await params;
  const payload = (await request.json().catch(() => ({}))) as ReviewPayload;
  const action = parseAction(payload.action);
  const reviewerRole = parseReviewerRole(payload.reviewerRole);
  const reason = normalize(payload.reason);

  if (!action || !reviewerRole || !reason) {
    const missingFields = [
      !action ? "action" : null,
      !reviewerRole ? "reviewerRole" : null,
      !reason ? "reason" : null,
    ].filter(Boolean);

    return apiError(
      "INVALID_EVIDENCE_REVIEW",
      `Evidence review requires action, reviewerRole, and reason. Missing/invalid: ${missingFields.join(", ") || "none"}.`,
      { status: 400 },
    );
  }

  try {
    const { evidenceRecord, reviewReceipt, store } = await safeReviewEvidenceRecord(evidenceId, {
      action,
      reviewerRole,
      reviewerName: normalize(payload.reviewerName) || undefined,
      reason,
    });
    const financingPack = await buildFinancingPack();

    return apiSuccess({
      accepted: true,
      version: "chaintrace-evidence-review-v0.1",
      reviewReceipt,
      evidenceRecord,
      gateSummary: financingPack.gates.summary,
      readiness: financingPack.readiness,
      evidencePackHash: financingPack.evidencePackHash,
      evidencePackURI: financingPack.evidencePackURI,
      evidenceStore: store,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EVIDENCE_NOT_FOUND") {
      return apiError("EVIDENCE_NOT_FOUND", `Evidence record ${evidenceId} was not found.`, { status: 404 });
    }

    return apiError(
      "EVIDENCE_REVIEW_FAILED",
      error instanceof Error ? error.message : "Unknown evidence review error.",
      { status: 500 },
    );
  }
}
