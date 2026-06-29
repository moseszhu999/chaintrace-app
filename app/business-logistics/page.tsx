import { LogisticsControlView } from "@/components/workspace/LogisticsControlView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessLogisticsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="logistics" workspace={workspace} action={{ href: "/business-loan", labelZh: "贷款 Gate", labelEn: "Loan gates" }}>
      <LogisticsControlView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
