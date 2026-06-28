import { AssistantView } from "@/components/workspace/AssistantView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export default async function AssistantPage() {
  const zh = await getIsZhRequest();
  const workspace = await getWorkspaceSnapshot();

  return (
    <WorkspaceShell zh={zh} active="assistant" workspace={workspace} actionSlot={<a className="primary-button" href="/assistant/approvals">{zh ? "进入审批" : "Open approvals"}</a>}>
      <AssistantView zh={zh} workspace={workspace} />
    </WorkspaceShell>
  );
}
