import { NextResponse } from "next/server";
import { agentApiEndpoints } from "@/lib/agent-api-fixture";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { professionalReviewItems } from "@/lib/professional-review-fixture";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export const dynamic = "force-static";

const gateChecklist = [
  { id: "po_signed", status: "passed", evidenceId: "doc_po" },
  { id: "invoice_matched", status: "passed", evidenceId: "doc_invoice" },
  { id: "packing_verified", status: "passed", evidenceId: "doc_packing" },
  { id: "pre_qc_passed", status: "passed", evidenceId: "doc_quality" },
  { id: "vgm_verified", status: "passed", evidenceId: "doc_vgm" },
  { id: "export_released", status: "passed", evidenceId: "doc_export_customs" },
  { id: "final_bl", status: "pending", evidenceId: "doc_bl" },
  { id: "sg_import_permit", status: "pending", evidenceId: "doc_sg_permit" },
  { id: "warehouse_receipt", status: "blocked", evidenceId: "doc_warehouse" },
  { id: "arrival_qc", status: "blocked", evidenceId: "doc_arrival_qc" },
  { id: "buyer_acceptance", status: "blocked", evidenceId: "doc_acceptance" },
  { id: "financier_multisig", status: "blocked", evidenceId: "loan_receivable_vn_sg_0007" },
] as const;

export async function GET() {
  const workspace = await getWorkspaceSnapshot();
  const trade = workspace.activeTrade;
  const documents = trade.documents;
  const verified = documents.filter((document) => document.status === "verified");
  const passed = gateChecklist.filter((gate) => gate.status === "passed").length;
  const memo = receivableReadinessReport.financierMemo;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-pipeline-v0.1",
    tradeId: trade.id,
    case: {
      titleZh: trade.titleZh,
      titleEn: trade.titleEn,
      poNo: trade.poNo,
      invoiceNo: trade.invoiceNo,
      totalAmount: trade.totalAmount,
      requestedAdvance: "USDC 29,500",
    },
    endpoints: agentApiEndpoints,
    pipeline: agentRuns.map((run) => ({
      id: run.id,
      agentZh: run.agentZh,
      agentEn: run.agentEn,
      status: run.status,
      outputZh: run.outputZh,
      outputEn: run.outputEn,
    })),
    evidence: {
      filesReceived: documents.length,
      verifiedCount: verified.length,
      openCount: documents.length - verified.length,
      preReviewUsableEvidenceIds: verified.map((document) => document.id),
    },
    gates: {
      passed,
      total: gateChecklist.length,
      checklist: gateChecklist,
      blockerCode: "GATES_NOT_PASSED",
      disbursementAllowed: false,
    },
    gaps: {
      nextActionsZh: receivableReadinessReport.nextActionsZh,
      nextActionsEn: receivableReadinessReport.nextActionsEn,
    },
    riskMemo: {
      executiveDecisionZh: memo.executiveDecisionZh,
      executiveDecisionEn: memo.executiveDecisionEn,
      riskFlagsZh: memo.riskFlagsZh,
      riskFlagsEn: memo.riskFlagsEn,
      approvalConditionsZh: memo.approvalConditionsZh,
      approvalConditionsEn: memo.approvalConditionsEn,
    },
    professionalReview: {
      blocked: professionalReviewItems.filter((item) => item.status === "blocked").length,
      needsReview: professionalReviewItems.filter((item) => item.status === "needs-review").length,
      autoCleared: professionalReviewItems.filter((item) => item.status === "auto-cleared").length,
      queue: professionalReviewItems,
    },
    machineDecision: {
      readinessScore: receivableReadinessReport.score,
      maxScore: receivableReadinessReport.maxScore,
      status: receivableReadinessReport.statusEn,
      preReviewAllowed: true,
      disbursementAllowed: false,
      blockerCode: "GATES_NOT_PASSED",
    },
  });
}
