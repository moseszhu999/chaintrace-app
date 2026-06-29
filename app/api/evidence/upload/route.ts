import { NextRequest, NextResponse } from "next/server";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

type UploadPayload = {
  tradeId?: string;
  fileName?: string;
  documentType?: string;
  issuer?: string;
  documentNo?: string;
  hash?: string;
  note?: string;
};

function inferEvidenceStatus(documentType: string | undefined) {
  const value = (documentType ?? "").toLowerCase();
  if (value.includes("warehouse") || value.includes("arrival") || value.includes("acceptance")) return "needs-agent-review";
  if (value.includes("bill") || value.includes("permit")) return "uploaded-pending-verification";
  return "classified";
}

function inferGateImpact(documentType: string | undefined) {
  const value = (documentType ?? "").toLowerCase();
  if (value.includes("warehouse")) return "May unblock warehouse_receipt after signature and container/seal match.";
  if (value.includes("arrival") || value.includes("quality")) return "May update arrival_qc, but moisture dispute still needs final lab conclusion.";
  if (value.includes("acceptance")) return "May unblock buyer_acceptance if buyer decision is accept / discount / reject.";
  if (value.includes("bill")) return "May move final_bl from pending to passed after on-board seal verification.";
  if (value.includes("permit")) return "May move sg_import_permit from pending to passed after final permit status verification.";
  return "No automatic disbursement effect until mapped to a financing gate.";
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as UploadPayload;
  const workspace = await getWorkspaceSnapshot();
  const trade = workspace.activeTrade;
  const tradeId = payload.tradeId ?? trade.id;
  const documentType = payload.documentType ?? "unknown evidence";
  const fileName = payload.fileName ?? "uploaded-evidence.pdf";
  const inferredStatus = inferEvidenceStatus(documentType);

  return NextResponse.json({
    receivedAt: new Date().toISOString(),
    version: "chaintrace-evidence-upload-v0.1",
    accepted: true,
    tradeId,
    upload: {
      fileName,
      documentType,
      issuer: payload.issuer ?? null,
      documentNo: payload.documentNo ?? null,
      hash: payload.hash ?? "mock-hash-pending-object-storage",
      note: payload.note ?? null,
    },
    agentPlan: {
      nextAgents: ["/api/agents/evidence", "/api/agents/gates", "/api/agents/gaps", "/api/agents/risk-memo"],
      inferredEvidenceStatus: inferredStatus,
      gateImpact: inferGateImpact(documentType),
      financingDecisionBeforeRecheck: {
        readinessScore: receivableReadinessReport.score,
        maxScore: receivableReadinessReport.maxScore,
        disbursementAllowed: false,
        blockerCode: "GATES_NOT_PASSED",
      },
    },
    recommendedNextCall: "/api/agents/run",
  });
}
