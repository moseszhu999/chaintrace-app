import { EvidenceView } from "@/components/workspace/EvidenceView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";

export default async function EvidencePage() {
  const zh = await getIsZhRequest();

  return (
    <WorkspaceShell zh={zh} active="evidence" actionSlot={<a className="secondary-button" href="/tasks">{zh ? "查看任务" : "View tasks"}</a>}>
      <EvidenceView zh={zh} />
    </WorkspaceShell>
  );
}
