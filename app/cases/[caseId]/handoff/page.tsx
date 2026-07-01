import { notFound } from "next/navigation";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getCaseReviewHandoffPack } from "@/lib/case-review-handoff";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function CaseHandoffPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const { zh, workspace } = await getWorkspaceRouteContext();
  const pack = await getCaseReviewHandoffPack(caseId).catch((error) => {
    if (error instanceof Error && error.message === "CASE_NOT_FOUND") return null;
    throw error;
  });
  if (!pack) notFound();

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
        subtitleZh: `${pack.caseSummary.id} · JSON / Trust Pack preview`,
        subtitleEn: `${pack.caseSummary.id} · JSON / Trust Pack preview`,
      }}
      action={{ href: `/api/cases/${pack.caseSummary.id}/handoff`, labelZh: "打开 API JSON", labelEn: "Open API JSON", variant: "secondary" }}
    >
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(pack, null, 2)}
      </pre>
    </WorkspaceFrame>
  );
}
