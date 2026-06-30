import { NextRequest, NextResponse } from "next/server";
import { buildFinancingPack, type GeneratedFinancingPack } from "@/lib/financing-pack-builder";

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

function buildLoanRequestDraft(financingPack: GeneratedFinancingPack, payload: PreReviewPayload = {}) {
  const memo = financingPack.financierMemo;

  return {
    tradeId: payload.tradeId ?? financingPack.tradeId,
    borrowerWallet: payload.borrowerWallet ?? "0xBorrowerWalletMock",
    beneficiaryWallet: payload.beneficiaryWallet ?? "0xExporterBeneficiaryMock",
    asset: payload.asset ?? "USDC",
    receivableAmount: financingPack.case.receivableAmount,
    requestedAdvance: payload.requestedAdvance ?? financingPack.case.requestedAdvance,
    readinessScore: financingPack.readiness.readinessScore,
    maxScore: financingPack.readiness.maxScore,
    evidencePackURI: payload.evidencePackURI ?? financingPack.evidencePackURI,
    evidencePackHash: payload.evidencePackHash ?? financingPack.evidencePackHash,
    status: "PreReview",
    blockerCode: financingPack.readiness.blockerCode,
    disbursementAllowed: financingPack.readiness.disbursementAllowed,
    preReviewAllowed: financingPack.readiness.preReviewAllowed,
    riskFlags: memo.riskFlagsEn,
    approvalConditions: memo.approvalConditionsEn,
    contractTarget: "LoanRequestRegistry.submitPreReviewRequest",
  };
}

export async function GET() {
  const financingPack = await buildFinancingPack();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-loan-request-pre-review-v0.1",
    case: {
      titleZh: financingPack.case.titleZh,
      titleEn: financingPack.case.titleEn,
      poNo: financingPack.case.poNo,
      invoiceNo: financingPack.case.invoiceNo,
    },
    financingPack: {
      evidencePackURI: financingPack.evidencePackURI,
      evidencePackHash: financingPack.evidencePackHash,
      evidencePackHashAlgorithm: financingPack.evidencePackHashAlgorithm,
    },
    loanRequestDraft: buildLoanRequestDraft(financingPack),
    nextContractStep: "Submit the request to LoanRequestRegistry; do not deploy or disburse a ReceivableLoan until review approval.",
  });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as PreReviewPayload;
  const financingPack = await buildFinancingPack();
  const draft = buildLoanRequestDraft(financingPack, payload);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-loan-request-pre-review-v0.1",
    accepted: true,
    financingPack: {
      evidencePackURI: financingPack.evidencePackURI,
      evidencePackHash: financingPack.evidencePackHash,
      evidencePackHashAlgorithm: financingPack.evidencePackHashAlgorithm,
    },
    loanRequestDraft: draft,
    guardrails: {
      formalDisbursementBlocked: true,
      reason: draft.blockerCode,
      allowedAction: "PRE_REVIEW_ONLY",
    },
    nextContractStep: "Call LoanRequestRegistry.submitPreReviewRequest with this draft after wallet addresses and evidence pack hash are finalized.",
  });
}
