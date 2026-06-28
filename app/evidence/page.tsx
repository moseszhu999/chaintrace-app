import { EvidenceView } from "@/components/workspace/EvidenceView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function EvidencePage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="evidence" workspace={workspace} actionSlot={<a className="secondary-button" href="/tasks">{zh ? "查看任务" : "View tasks"}</a>}>
      <EvidenceView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
