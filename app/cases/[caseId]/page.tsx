import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";
import { safeGetTradeCaseById, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export default async function CaseOverviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const [{ zh, workspace }, trade] = await Promise.all([getWorkspaceRouteContext(), safeGetTradeCaseById(caseId)]);
  if (!trade) notFound();

  const evidence = await safeListEvidenceRecords(trade.id);
  const verified = evidence.records.filter((record) => record.status === "verified").length;
  const blocked = evidence.records.filter((record) => record.status === "missing" || record.status === "rejected").length;

  return (
    <WorkspaceFrame
      zh={zh}
      active="dashboard"
      workspace={workspace}
      header={{
        eyebrowZh: "Case 主线",
        eyebrowEn: "Case spine",
        titleZh: trade.titleZh,
        titleEn: trade.titleEn,
        subtitleZh: `${trade.id} · Pre-review only`,
        subtitleEn: `${trade.id} · Pre-review only`,
      }}
      action={{ href: `/cases/${trade.id}/evidence`, labelZh: "审查证据", labelEn: "Review evidence" }}
    >
      <div className="proof-flow-grid">
        <article className="proof-flow-card">
          <strong>{zh ? "Case 状态" : "Case status"}</strong>
          <span>{zh ? "当前阶段：预审事实工作台" : "Current phase: pre-review facts workspace"}</span>
          <span>{zh ? "Gate：GATES_NOT_PASSED" : "Gate: GATES_NOT_PASSED"}</span>
          <span>disbursementAllowed=false</span>
        </article>
        <article className="proof-flow-card">
          <strong>{zh ? "贸易摘要" : "Trade summary"}</strong>
          <span>PO: {trade.poNo}</span>
          <span>Invoice: {trade.invoiceNo}</span>
          <span>{trade.totalAmount}</span>
        </article>
        <article className="proof-flow-card">
          <strong>{zh ? "证据状态" : "Evidence state"}</strong>
          <span>{zh ? `已验证：${verified}` : `Verified: ${verified}`}</span>
          <span>{zh ? `阻断/缺失：${blocked}` : `Blocked/missing: ${blocked}`}</span>
          <span>{zh ? `总数：${evidence.records.length}` : `Total: ${evidence.records.length}`}</span>
          {evidence.store.fallbackActive ? <span>{zh ? "Fallback evidence store active" : "Fallback evidence store active"}</span> : null}
        </article>
      </div>

      <div className="hero-actions" style={{ marginTop: "24px" }}>
        <Link className="primary-button" href={`/cases/${trade.id}/evidence`}>{zh ? "Evidence" : "Evidence"}</Link>
        <Link className="secondary-button" href={`/cases/${trade.id}/tasks`}>{zh ? "Tasks" : "Tasks"}</Link>
        <Link className="secondary-button" href={`/cases/${trade.id}/review`}>{zh ? "Professional review" : "Professional review"}</Link>
        <Link className="secondary-button" href={`/cases/${trade.id}/handoff`}>{zh ? "Handoff JSON" : "Handoff JSON"}</Link>
      </div>
    </WorkspaceFrame>
  );
}
