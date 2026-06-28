import { AssistantView } from "@/components/workspace/AssistantView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function CustomerAssistantPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="assistant" workspace={workspace} actionSlot={<a className="primary-button" href="/assistant/approvals">{zh ? "进入审批" : "Open approvals"}</a>}>
      <AssistantView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
