import { ApprovalsView } from "@/components/workspace/ApprovalsView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function AssistantDraftsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="approvals" workspace={workspace} actionSlot={<a className="secondary-button" href="/assistant">{zh ? "返回助手" : "Back to assistant"}</a>}>
      <ApprovalsView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
