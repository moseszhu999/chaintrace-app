import { ApprovalsView } from "@/components/workspace/ApprovalsView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export default async function AssistantApprovalsPage() {
  const zh = await getIsZhRequest();
  const workspace = await getWorkspaceSnapshot();

  return (
    <WorkspaceShell zh={zh} active="approvals" workspace={workspace} actionSlot={<a className="secondary-button" href="/assistant">{zh ? "返回助手" : "Back to assistant"}</a>}>
      <ApprovalsView zh={zh} workspace={workspace} />
    </WorkspaceShell>
  );
}
