import { ProfessionalReviewView } from "@/components/workspace/ProfessionalReviewView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessProfessionalReviewPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="professionalReview" workspace={workspace} action={{ href: "/business-ops", labelZh: "Agent 工作台", labelEn: "Agent workbench" }}>
      <ProfessionalReviewView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
