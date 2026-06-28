import { EvidenceView } from "@/components/workspace/EvidenceView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export default async function EvidencePage() {
  const zh = await getIsZhRequest();
  const workspace = await getWorkspaceSnapshot();

  return (
    <WorkspaceShell zh={zh} active="evidence" workspace={workspace} actionSlot={<a className="secondary-button" href="/tasks">{zh ? "查看任务" : "View tasks"}</a>}>
      <EvidenceView zh={zh} workspace={workspace} />
    </WorkspaceShell>
  );
}
