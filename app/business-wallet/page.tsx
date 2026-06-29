import { WalletView } from "@/components/workspace/WalletView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessWalletPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="wallet" workspace={workspace} action={{ href: "/business-funds", labelZh: "资金管理", labelEn: "Funds" }}>
      <WalletView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
