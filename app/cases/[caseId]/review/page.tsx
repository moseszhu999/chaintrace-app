import { notFound } from "next/navigation";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";
import { safeGetTradeCaseById, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export default async function CaseReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const [{ zh, workspace }, trade] = await Promise.all([getWorkspaceRouteContext(), safeGetTradeCaseById(caseId)]);
  if (!trade) notFound();

  const evidence = await safeListEvidenceRecords(trade.id);
  const receipts = evidence.records.flatMap((record) => record.reviewReceipts ?? []);

  return (
    <WorkspaceFrame
      zh={zh}
      active="professionalReview"
      workspace={workspace}
      header={{
        eyebrowZh: "Case Review",
        eyebrowEn: "Case Review",
        titleZh: "审查交接",
        titleEn: "Review handoff",
        subtitleZh: `${trade.id} · Pre-review only`,
        subtitleEn: `${trade.id} · Pre-review only`,
      }}
      action={{ href: `/cases/${trade.id}/handoff`, labelZh: "打开 JSON", labelEn: "Open JSON", variant: "secondary" }}
    >
      <div className="proof-flow-grid">
        <article className="proof-flow-card">
          <strong>{zh ? "证据数量" : "Evidence records"}</strong>
          <span>{evidence.records.length}</span>
        </article>
        <article className="proof-flow-card">
          <strong>{zh ? "Receipt 数量" : "Receipt count"}</strong>
          <span>{receipts.length}</span>
        </article>
        <article className="proof-flow-card">
          <strong>{zh ? "边界" : "Boundary"}</strong>
          <span>Pre-review only</span>
          <span>GATES_NOT_PASSED</span>
          <span>disbursementAllowed=false</span>
        </article>
      </div>
    </WorkspaceFrame>
  );
}
