import { FourFlowView } from "@/components/workspace/FourFlowView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessFlowsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="flows" workspace={workspace} action={{ href: "/business-ops", labelZh: "具体业务", labelEn: "Concrete trade" }}>
      <FourFlowView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
