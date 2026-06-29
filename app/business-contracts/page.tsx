import { ContractConsoleView } from "@/components/workspace/ContractConsoleView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessContractsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="contracts" workspace={workspace} action={{ href: "/business-loan", labelZh: "贷款合约", labelEn: "Loan contract" }}>
      <ContractConsoleView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
