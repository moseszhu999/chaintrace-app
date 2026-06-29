import { NextResponse } from "next/server";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export const dynamic = "force-static";

export async function GET() {
  const workspace = await getWorkspaceSnapshot();
  const trade = workspace.activeTrade;
  const documents = trade.documents;
  const verified = documents.filter((document) => document.status === "verified");
  const open = documents.filter((document) => document.status !== "verified");

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-evidence-v0.1",
    tradeId: trade.id,
    agent: agentRuns.find((run) => run.id === "evidence-agent"),
    input: {
      trade: {
        titleZh: trade.titleZh,
        titleEn: trade.titleEn,
        poNo: trade.poNo,
        invoiceNo: trade.invoiceNo,
        totalAmount: trade.totalAmount,
        containerNo: trade.containerNo,
      },
      filesReceived: documents.length,
    },
    output: {
      evidenceItems: documents.map((document) => ({
        id: document.id,
        typeZh: document.typeZh,
        typeEn: document.typeEn,
        fileName: document.fileName,
        documentNo: document.documentNo,
        status: document.status,
        issuedAt: document.issuedAt,
        amount: document.amount ?? null,
        hash: document.hash ?? null,
        noteZh: document.noteZh,
        noteEn: document.noteEn,
      })),
      verifiedCount: verified.length,
      openCount: open.length,
      preReviewUsableEvidenceIds: verified.map((document) => document.id),
      openEvidenceIds: open.map((document) => document.id),
    },
    nextAgent: "/api/agents/gates",
  });
}
