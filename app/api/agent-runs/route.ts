import { NextResponse } from "next/server";
import { agentRunReceiptStore, createAgentRunReceipt, listAgentRunReceipts } from "@/lib/agent-workflow-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const receipts = await listAgentRunReceipts();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-run-receipts-v0.1",
    persistenceMode: "runtime_workflow_store",
    store: agentRunReceiptStore,
    latestAgentRunReceipt: receipts[0] ?? null,
    receipts,
  });
}

export async function POST() {
  const { receipt, tasks } = await createAgentRunReceipt();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    accepted: true,
    version: "chaintrace-agent-run-receipts-v0.1",
    persistenceMode: "runtime_workflow_store",
    store: agentRunReceiptStore,
    agentRunReceipt: receipt,
    operatorTasks: tasks,
  }, { status: 201 });
}
