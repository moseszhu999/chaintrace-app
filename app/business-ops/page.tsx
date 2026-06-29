import { AgentWorkbenchView } from "@/components/workspace/AgentWorkbenchView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessOpsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="business" workspace={workspace} action={{ href: "/business-readiness", labelZh: "融资评分", labelEn: "Readiness score" }}>
      <AgentWorkbenchView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
