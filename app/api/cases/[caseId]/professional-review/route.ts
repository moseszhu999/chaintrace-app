import { apiError, apiSuccess } from "@/lib/api-response";
import { requireDemoRole } from "@/lib/demo-role-api";
import { addProfessionalReviewAction, listProfessionalReviewActions, type ProfessionalExceptionStatus } from "@/lib/professional-review-actions";
import { safeGetTradeCaseById } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

type ProfessionalReviewPayload = {
  professionalReviewNote?: string;
  exceptionStatus?: string;
};

const allowedExceptionStatuses: ProfessionalExceptionStatus[] = ["exception_noted", "professional_blocked", "exception_cleared"];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseExceptionStatus(value: unknown): ProfessionalExceptionStatus | null {
  const status = clean(value) as ProfessionalExceptionStatus;
  return allowedExceptionStatuses.includes(status) ? status : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return apiSuccess({
    caseId,
    professionalReviewReceipts: listProfessionalReviewActions(caseId),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const roleGuard = requireDemoRole(request, ["professional_reviewer", "admin"], "professional_review:note");
  if (!roleGuard.ok) return roleGuard.response;

  const { caseId } = await params;
  const tradeCase = await safeGetTradeCaseById(caseId);
  if (!tradeCase) {
    return apiError("CASE_NOT_FOUND", `Case ${caseId} was not found.`, { status: 404 });
  }

  const payload = (await request.json().catch(() => ({}))) as ProfessionalReviewPayload;
  const professionalReviewNote = clean(payload.professionalReviewNote);
  const exceptionStatus = parseExceptionStatus(payload.exceptionStatus);

  if (!professionalReviewNote || !exceptionStatus) {
    return apiError(
      "INVALID_PROFESSIONAL_REVIEW_ACTION",
      "Professional review action requires professionalReviewNote and exceptionStatus.",
      { status: 400 },
    );
  }

  const professionalReviewReceipt = addProfessionalReviewAction({
    caseId,
    professionalReviewNote,
    exceptionStatus,
    reviewerRole: roleGuard.role as "professional_reviewer" | "admin",
  });

  return apiSuccess({
    accepted: true,
    version: "chaintrace-professional-review-action-v0.1",
    caseId,
    professionalReviewNote,
    exceptionStatus,
    professionalReviewReceipt,
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
  }, { status: 201 });
}
