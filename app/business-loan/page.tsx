import { LoanContractView } from "@/components/workspace/LoanContractView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessLoanPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="loan" workspace={workspace} action={{ href: "/business-signing", labelZh: "签章 Gate", labelEn: "Signing gates" }}>
      <LoanContractView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
