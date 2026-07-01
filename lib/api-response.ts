import { NextResponse } from "next/server";

export const chaintraceApiBoundary = {
  mode: "pre_review_only",
  status: "Pre-review only",
  blockerCode: "GATES_NOT_PASSED",
  disbursementAllowed: false,
  agentDecisionAuthority: "none",
  legalOpinion: false,
  creditApproval: false,
  lendingApproval: false,
  rawDocumentStorage: "not_stored_by_default",
} as const;

export type ChainTraceApiBoundary = typeof chaintraceApiBoundary;

export function chaintraceGuardrails() {
  return {
    status: chaintraceApiBoundary.status,
    blockerCode: chaintraceApiBoundary.blockerCode,
    disbursementAllowed: chaintraceApiBoundary.disbursementAllowed,
    agentDecisionAuthority: chaintraceApiBoundary.agentDecisionAuthority,
  };
}

export function chaintraceApiOk<T extends Record<string, unknown>>(
  data: T,
  init?: ResponseInit,
) {
  return NextResponse.json({
    ok: true,
    data,
    boundary: chaintraceApiBoundary,
    ...data,
  }, init);
}

export function chaintraceApiError(
  error: string,
  message: string,
  init: ResponseInit & { status: number },
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json({
    ok: false,
    error,
    message,
    boundary: chaintraceApiBoundary,
    ...extra,
  }, init);
}
