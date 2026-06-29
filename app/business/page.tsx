import { BusinessFlowView } from "@/components/workspace/BusinessFlowView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="business" workspace={workspace} action={{ href: "/tasks", labelZh: "查看任务", labelEn: "View tasks" }}>
      <BusinessFlowView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
