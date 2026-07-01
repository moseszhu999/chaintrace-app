import { notFound } from "next/navigation";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getCaseReviewSummary } from "@/lib/case-review-handoff";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function CaseReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const { zh, workspace } = await getWorkspaceRouteContext();
  const reviewSummary = await getCaseReviewSummary(caseId).catch((error) => {
    if (error instanceof Error && error.message === "CASE_NOT_FOUND") return null;
    throw error;
  });
  if (!reviewSummary) notFound();

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
        subtitleZh: `${reviewSummary.caseSummary.id} · Pre-review only`,
        subtitleEn: `${reviewSummary.caseSummary.id} · Pre-review only`,
      }}
      action={{ href: `/cases/${reviewSummary.caseSummary.id}/handoff`, labelZh: "打开 JSON", labelEn: "Open JSON", variant: "secondary" }}
    >
      <div className="proof-flow-grid">
        <article className="proof-flow-card">
          <strong>{zh ? "证据数量" : "Evidence records"}</strong>
          <span>{reviewSummary.evidenceSummary.total}</span>
        </article>
        <article className="proof-flow-card">
          <strong>{zh ? "Receipt 数量" : "Receipt count"}</strong>
          <span>{reviewSummary.reviewReceiptCount}</span>
        </article>
        <article className="proof-flow-card">
          <strong>{zh ? "边界" : "Boundary"}</strong>
          <span>mode={reviewSummary.boundary.mode}</span>
          <span>{reviewSummary.boundary.blockerCode}</span>
          <span>disbursementAllowed={String(reviewSummary.boundary.disbursementAllowed)}</span>
        </article>
      </div>
    </WorkspaceFrame>
  );
}
