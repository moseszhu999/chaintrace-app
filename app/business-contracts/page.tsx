import { ContractConsoleView } from "@/components/workspace/ContractConsoleView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessContractsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={zh}
      active="contracts"
      workspace={workspace}
      header={{
        eyebrowZh: "合约控制台",
        eyebrowEn: "Contract console",
        titleZh: "Gate-based execution",
        titleEn: "Gate-based execution",
        subtitleZh: "签章、物流、金库、资金池、贷款状态机",
        subtitleEn: "Signing, logistics, vault, pool, and loan state machine",
      }}
      action={{ href: "/business-loan", labelZh: "贷款合约", labelEn: "Loan contract" }}
    >
      <ContractConsoleView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
