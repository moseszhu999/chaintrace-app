import { ReceivableReadinessView } from "@/components/workspace/ReceivableReadinessView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessReadinessPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="readiness" workspace={workspace} action={{ href: "/business-loan", labelZh: "贷款 Gate", labelEn: "Loan gates" }}>
      <ReceivableReadinessView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
