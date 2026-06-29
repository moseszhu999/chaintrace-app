import { BusinessArchitectureView } from "@/components/workspace/BusinessArchitectureView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessArchitecturePage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="architecture" workspace={workspace} action={{ href: "/business-readiness", labelZh: "融资评分", labelEn: "Readiness score" }}>
      <BusinessArchitectureView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
