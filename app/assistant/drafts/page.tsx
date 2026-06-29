import { ApprovalsView } from "@/components/workspace/ApprovalsView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function AssistantDraftsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="approvals" workspace={workspace} action={{ href: "/assistant", labelZh: "返回助手", labelEn: "Back to assistant", variant: "secondary" }}>
      <ApprovalsView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
