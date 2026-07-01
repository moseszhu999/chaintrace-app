import { NextResponse } from "next/server";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { getCurrentTradeCase, listEvidenceRecords } from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const trade = await getCurrentTradeCase();
  const evidenceRecords = await listEvidenceRecords(trade.id);
  const verified = evidenceRecords.filter((record) => record.status === "verified");
  const open = evidenceRecords.filter((record) => record.status !== "verified");

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
        requestedAdvance: trade.requestedAdvance,
      },
      filesReceived: evidenceRecords.length,
    },
    output: {
      evidenceItems: evidenceRecords.map((record) => ({
        id: record.id,
        documentType: record.documentType,
        fileName: record.fileName,
        documentNo: record.documentNo,
        status: record.status,
        issuedAt: record.issuedAt ?? null,
        amount: record.amount ?? null,
        hash: record.hash ?? null,
        noteZh: record.noteZh ?? null,
        noteEn: record.noteEn ?? null,
        gateImpacts: record.gateImpacts,
      })),
      verifiedCount: verified.length,
      openCount: open.length,
      preReviewUsableEvidenceIds: verified.map((document) => document.id),
      openEvidenceIds: open.map((document) => document.id),
    },
    nextAgent: "/api/agents/gates",
  });
}
