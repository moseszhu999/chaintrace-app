import { ProfessionalReviewView } from "@/components/workspace/ProfessionalReviewView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getCaseReviewHandoffPack } from "@/lib/case-review-handoff";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function BusinessProfessionalReviewPage() {
  const [{ zh, workspace }, handoffPack] = await Promise.all([
    getWorkspaceRouteContext(),
    getCaseReviewHandoffPack(),
  ]);

  return (
    <WorkspaceFrame
      zh={zh}
      active="professionalReview"
      workspace={workspace}
      header={{
        eyebrowZh: "专业审查视图",
        eyebrowEn: "Professional review",
        titleZh: "银行 / 律所例外审查",
        titleEn: "Bank / law firm exception review",
        subtitleZh: "授信、合规、法律结构、争议和重大例外",
        subtitleEn: "Underwriting, compliance, legal structure, disputes, and material exceptions",
      }}
      action={{ href: `/api/cases/${handoffPack.caseSummary.id}/handoff`, labelZh: "打开 JSON", labelEn: "Open JSON", variant: "secondary" }}
    >
      <ProfessionalReviewView zh={zh} workspace={workspace} handoffPack={handoffPack} />
    </WorkspaceFrame>
  );
}
