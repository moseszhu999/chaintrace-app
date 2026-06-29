import { DashboardView } from "@/components/workspace/DashboardView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function AppDemoPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="dashboard" workspace={workspace} action={{ href: "/evidence", labelZh: "处理下一个缺口", labelEn: "Resolve next gap" }}>
      <DashboardView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
