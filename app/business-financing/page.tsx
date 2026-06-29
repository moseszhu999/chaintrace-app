import { FinancingView } from "@/components/workspace/FinancingView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessFinancingPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="approvals" workspace={workspace} action={{ href: "/evidence", labelZh: "补齐文件", labelEn: "Complete documents" }}>
      <FinancingView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
