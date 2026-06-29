import { DashboardView } from "@/components/workspace/DashboardView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function DashboardRoute() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="dashboard" workspace={workspace} action={{ href: "/business-ops", labelZh: "打开 Agent", labelEn: "Open agent" }}>
      <DashboardView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
