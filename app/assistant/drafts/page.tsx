import { ApprovalsView } from "@/components/workspace/ApprovalsView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";

export default async function AssistantDraftsPage() {
  const zh = await getIsZhRequest();

  return (
    <WorkspaceShell zh={zh} active="approvals" actionSlot={<a className="secondary-button" href="/assistant">{zh ? "返回助手" : "Back to assistant"}</a>}>
      <ApprovalsView zh={zh} />
    </WorkspaceShell>
  );
}
