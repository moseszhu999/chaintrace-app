import { NextRequest, NextResponse } from "next/server";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

type PreReviewPayload = {
  tradeId?: string;
  evidencePackURI?: string;
  evidencePackHash?: string;
  requestedAdvance?: string;
  borrowerWallet?: string;
  beneficiaryWallet?: string;
  asset?: string;
};

function buildLoanRequestDraft(payload: PreReviewPayload = {}) {
  const memo = receivableReadinessReport.financierMemo;

  return {
    tradeId: payload.tradeId ?? receivableReadinessReport.tradeId,
    borrowerWallet: payload.borrowerWallet ?? "0xBorrowerWalletMock",
    beneficiaryWallet: payload.beneficiaryWallet ?? "0xExporterBeneficiaryMock",
    asset: payload.asset ?? "USDC",
    receivableAmount: "USD 36,960",
    requestedAdvance: payload.requestedAdvance ?? "USDC 29,500",
    readinessScore: receivableReadinessReport.score,
    maxScore: receivableReadinessReport.maxScore,
    evidencePackURI: payload.evidencePackURI ?? "ipfs://chaintrace/vn-coffee/financing-pack-v0.1.json",
    evidencePackHash: payload.evidencePackHash ?? "0xmock_financing_pack_hash",
    status: "PreReview",
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    preReviewAllowed: true,
    riskFlags: memo.riskFlagsEn,
    approvalConditions: memo.approvalConditionsEn,
    contractTarget: "LoanRequestRegistry.submitPreReviewRequest",
  };
}

export async function GET() {
  const workspace = await getWorkspaceSnapshot();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-loan-request-pre-review-v0.1",
    case: {
      titleZh: workspace.activeTrade.titleZh,
      titleEn: workspace.activeTrade.titleEn,
      poNo: workspace.activeTrade.poNo,
      invoiceNo: workspace.activeTrade.invoiceNo,
    },
    loanRequestDraft: buildLoanRequestDraft(),
    nextContractStep: "Submit the request to LoanRequestRegistry; do not deploy or disburse a ReceivableLoan until review approval.",
  });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as PreReviewPayload;
  const draft = buildLoanRequestDraft(payload);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-loan-request-pre-review-v0.1",
    accepted: true,
    loanRequestDraft: draft,
    guardrails: {
      formalDisbursementBlocked: true,
      reason: "GATES_NOT_PASSED",
      allowedAction: "PRE_REVIEW_ONLY",
    },
    nextContractStep: "Call LoanRequestRegistry.submitPreReviewRequest with this draft after wallet addresses and evidence pack hash are finalized.",
  });
}
