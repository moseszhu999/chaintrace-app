import { notFound } from "next/navigation";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";
import { safeGetTradeCaseById, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export default async function CaseHandoffPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const [{ zh, workspace }, trade] = await Promise.all([getWorkspaceRouteContext(), safeGetTradeCaseById(caseId)]);
  if (!trade) notFound();

  const evidence = await safeListEvidenceRecords(trade.id);
  const pack = {
    version: "chaintrace-case-handoff-v0.1",
    case: trade,
    evidenceSummary: {
      total: evidence.records.length,
      verified: evidence.records.filter((record) => record.status === "verified").length,
      missingOrBlocked: evidence.records.filter((record) => record.status === "missing" || record.status === "rejected").length,
    },
    receiptTimeline: evidence.records.flatMap((record) => record.reviewReceipts ?? []),
    evidenceStore: evidence.store,
    boundary: {
      mode: "pre_review_only",
      blockerCode: "GATES_NOT_PASSED",
      disbursementAllowed: false,
    },
  };

  return (
    <WorkspaceFrame
      zh={zh}
      active="professionalReview"
      workspace={workspace}
      header={{
        eyebrowZh: "Case Handoff",
        eyebrowEn: "Case Handoff",
        titleZh: "Handoff JSON",
        titleEn: "Handoff JSON",
        subtitleZh: `${trade.id} · JSON / Trust Pack preview`,
        subtitleEn: `${trade.id} · JSON / Trust Pack preview`,
      }}
      action={{ href: `/api/cases/${trade.id}/handoff`, labelZh: "打开 API JSON", labelEn: "Open API JSON", variant: "secondary" }}
    >
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(pack, null, 2)}
      </pre>
    </WorkspaceFrame>
  );
}
