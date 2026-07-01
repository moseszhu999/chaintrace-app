import type { DemoRole } from "@/lib/demo-roles";

export type ProfessionalExceptionStatus = "exception_noted" | "professional_blocked" | "exception_cleared";

export type ProfessionalReviewActionReceipt = {
  id: string;
  caseId: string;
  professionalReviewNote: string;
  exceptionStatus: ProfessionalExceptionStatus;
  reviewerRole: Extract<DemoRole, "professional_reviewer" | "admin">;
  reviewedAt: string;
  blockerCode: "GATES_NOT_PASSED";
  disbursementAllowed: false;
  boundary: "pre_review_only";
};

type ProfessionalReviewActionState = {
  receipts: ProfessionalReviewActionReceipt[];
};

const professionalReviewGlobal = globalThis as typeof globalThis & {
  __chaintraceProfessionalReviewActionState?: ProfessionalReviewActionState;
};

function getState(): ProfessionalReviewActionState {
  if (!professionalReviewGlobal.__chaintraceProfessionalReviewActionState) {
    professionalReviewGlobal.__chaintraceProfessionalReviewActionState = { receipts: [] };
  }
  return professionalReviewGlobal.__chaintraceProfessionalReviewActionState;
}

function receiptId(caseId: string, reviewedAt: string) {
  return `professional-review:${caseId}:${reviewedAt.replace(/[^0-9a-z]/gi, "").slice(0, 20)}`;
}

export function listProfessionalReviewActions(caseId?: string) {
  return getState().receipts
    .filter((receipt) => !caseId || receipt.caseId === caseId)
    .map((receipt) => ({ ...receipt }));
}

export function addProfessionalReviewAction(input: {
  caseId: string;
  professionalReviewNote: string;
  exceptionStatus: ProfessionalExceptionStatus;
  reviewerRole: Extract<DemoRole, "professional_reviewer" | "admin">;
}) {
  const reviewedAt = new Date().toISOString();
  const receipt: ProfessionalReviewActionReceipt = {
    id: receiptId(input.caseId, reviewedAt),
    caseId: input.caseId,
    professionalReviewNote: input.professionalReviewNote,
    exceptionStatus: input.exceptionStatus,
    reviewerRole: input.reviewerRole,
    reviewedAt,
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    boundary: "pre_review_only",
  };
  const state = getState();
  state.receipts = [receipt, ...state.receipts];
  return { ...receipt };
}

export function resetProfessionalReviewActions() {
  professionalReviewGlobal.__chaintraceProfessionalReviewActionState = { receipts: [] };
}

