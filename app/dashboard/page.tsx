import { DashboardView } from "@/components/workspace/DashboardView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function DashboardRoute() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="dashboard" workspace={workspace} actionSlot={<a className="primary-button" href="/evidence">{zh ? "处理下一个缺口" : "Resolve next gap"}</a>}>
      <DashboardView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
