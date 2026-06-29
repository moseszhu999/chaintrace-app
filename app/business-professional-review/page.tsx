import { ProfessionalReviewView } from "@/components/workspace/ProfessionalReviewView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessProfessionalReviewPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

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
      action={{ href: "/business-ops", labelZh: "Agent 工作台", labelEn: "Agent workbench" }}
    >
      <ProfessionalReviewView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
