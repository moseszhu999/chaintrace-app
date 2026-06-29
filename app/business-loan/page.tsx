import { LoanContractView } from "@/components/workspace/LoanContractView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessLoanPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="loan" workspace={workspace} action={{ href: "/business-logistics", labelZh: "物流 Gate", labelEn: "Logistics gates" }}>
      <LoanContractView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
