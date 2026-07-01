import { NextRequest } from "next/server";
import { chaintraceApiError, chaintraceApiOk, chaintraceGuardrails } from "@/lib/api-response";
import { buildFinancingPack } from "@/lib/financing-pack-builder";
import {
  reviewEvidenceRecord,
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
    return chaintraceApiError(
      "INVALID_EVIDENCE_REVIEW",
      "Evidence review requires a valid action, reviewerRole, and reason.",
      { status: 400 },
      {
        accepted: false,
        allowedActions: ["verify", "reject", "request_more_evidence"],
        allowedReviewerRoles: ["operator", "professional"],
        missingFields: [
          !action ? "action" : null,
          !reviewerRole ? "reviewerRole" : null,
          !reason ? "reason" : null,
        ].filter(Boolean),
        guardrails: chaintraceGuardrails(),
      },
    );
  }

  try {
    const { evidenceRecord, reviewReceipt } = await reviewEvidenceRecord(evidenceId, {
      action,
      reviewerRole,
      reviewerName: normalize(payload.reviewerName) || undefined,
      reason,
    });
    const financingPack = await buildFinancingPack();

    return chaintraceApiOk({
      accepted: true,
      version: "chaintrace-evidence-review-v0.1",
      reviewReceipt,
      evidenceRecord,
      gateSummary: financingPack.gates.summary,
      readiness: financingPack.readiness,
      evidencePackHash: financingPack.evidencePackHash,
      evidencePackURI: financingPack.evidencePackURI,
      guardrails: {
        ...chaintraceGuardrails(),
        blockerCode: financingPack.readiness.blockerCode,
        disbursementAllowed: financingPack.readiness.disbursementAllowed,
      },
      contractBoundary: {
        target: "LoanRequestRegistry.submitPreReviewRequest",
        allowedAction: "EVIDENCE_REVIEW_RECEIPT_ONLY",
        noTransaction: true,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EVIDENCE_NOT_FOUND") {
      return chaintraceApiError(
        "EVIDENCE_NOT_FOUND",
        "The requested evidence record does not exist in the active evidence store.",
        { status: 404 },
        {
          accepted: false,
          evidenceId,
          guardrails: chaintraceGuardrails(),
        },
      );
    }

    return chaintraceApiError(
      "EVIDENCE_REVIEW_FAILED",
      error instanceof Error ? error.message : "Unknown evidence review error.",
      { status: 500 },
      {
        accepted: false,
        evidenceId,
        guardrails: chaintraceGuardrails(),
      },
    );
  }
}
