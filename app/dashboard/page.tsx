import { DashboardOperatingSnapshotView } from "@/components/workspace/DashboardOperatingSnapshotView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getCaseOperatingSnapshot } from "@/lib/case-operating-snapshot";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function DashboardRoute() {
  const { zh, workspace } = await getWorkspaceRouteContext();
  const snapshot = await getCaseOperatingSnapshot();

  return (
    <WorkspaceFrame zh={zh} active="dashboard" workspace={workspace} action={{ href: `/cases/${snapshot.case.id}/evidence`, labelZh: "打开证据", labelEn: "Open evidence" }}>
      <DashboardOperatingSnapshotView zh={zh} workspace={workspace} snapshot={snapshot} />
    </WorkspaceFrame>
  );
}
