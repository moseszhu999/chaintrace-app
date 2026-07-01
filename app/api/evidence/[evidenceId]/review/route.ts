import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({
      accepted: false,
      error: "INVALID_EVIDENCE_REVIEW",
      allowedActions: ["verify", "reject", "request_more_evidence"],
      allowedReviewerRoles: ["operator", "professional"],
      missingFields: [
        !action ? "action" : null,
        !reviewerRole ? "reviewerRole" : null,
        !reason ? "reason" : null,
      ].filter(Boolean),
      guardrails: {
        status: "Pre-review only",
        blockerCode: "GATES_NOT_PASSED",
        disbursementAllowed: false,
      },
    }, { status: 400 });
  }

  try {
    const { evidenceRecord, reviewReceipt } = await reviewEvidenceRecord(evidenceId, {
      action,
      reviewerRole,
      reviewerName: normalize(payload.reviewerName) || undefined,
      reason,
    });
    const financingPack = await buildFinancingPack();

    return NextResponse.json({
      accepted: true,
      version: "chaintrace-evidence-review-v0.1",
      reviewReceipt,
      evidenceRecord,
      gateSummary: financingPack.gates.summary,
      readiness: financingPack.readiness,
      evidencePackHash: financingPack.evidencePackHash,
      evidencePackURI: financingPack.evidencePackURI,
      guardrails: {
        status: "Pre-review only",
        blockerCode: financingPack.readiness.blockerCode,
        disbursementAllowed: financingPack.readiness.disbursementAllowed,
        agentDecisionAuthority: "none",
      },
      contractBoundary: {
        target: "LoanRequestRegistry.submitPreReviewRequest",
        allowedAction: "EVIDENCE_REVIEW_RECEIPT_ONLY",
        noTransaction: true,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EVIDENCE_NOT_FOUND") {
      return NextResponse.json({
        accepted: false,
        error: "EVIDENCE_NOT_FOUND",
        evidenceId,
        guardrails: {
          status: "Pre-review only",
          blockerCode: "GATES_NOT_PASSED",
          disbursementAllowed: false,
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      accepted: false,
      error: "EVIDENCE_REVIEW_FAILED",
      message: error instanceof Error ? error.message : "Unknown evidence review error.",
      guardrails: {
        status: "Pre-review only",
        blockerCode: "GATES_NOT_PASSED",
        disbursementAllowed: false,
      },
    }, { status: 500 });
  }
}
