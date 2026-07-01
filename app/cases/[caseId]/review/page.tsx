import { notFound } from "next/navigation";
import { ProfessionalReviewView } from "@/components/workspace/ProfessionalReviewView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getCaseReviewHandoffPack } from "@/lib/case-review-handoff";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function CaseReviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const [{ zh, workspace, role }, handoffPack] = await Promise.all([
    getWorkspaceRouteContext(),
    getCaseReviewHandoffPack(caseId).catch((error) => {
      if (error instanceof Error && error.message === "CASE_NOT_FOUND") return null;
      throw error;
    }),
  ]);
  if (!handoffPack) notFound();

  return (
    <WorkspaceFrame
      zh={zh}
      active="professionalReview"
      workspace={workspace}
      header={{
        eyebrowZh: "Case Review",
        eyebrowEn: "Case Review",
        titleZh: "专业审查交接",
        titleEn: "Professional review handoff",
        subtitleZh: `${handoffPack.caseSummary.id} · Pre-review only`,
        subtitleEn: `${handoffPack.caseSummary.id} · Pre-review only`,
      }}
      role={role}
      action={{ href: `/cases/${handoffPack.caseSummary.id}/handoff`, labelZh: "打开 Handoff", labelEn: "Open handoff", variant: "secondary" }}
    >
      <ProfessionalReviewView zh={zh} workspace={workspace} role={role} handoffPack={handoffPack} />
    </WorkspaceFrame>
  );
}
