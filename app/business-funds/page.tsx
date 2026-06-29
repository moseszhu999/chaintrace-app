import { FundsView } from "@/components/workspace/FundsView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessFundsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="funds" workspace={workspace} action={{ href: "/business-financing", labelZh: "融资 / RWA", labelEn: "Financing / RWA" }}>
      <FundsView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
