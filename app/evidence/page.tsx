import { EvidenceView } from "@/components/workspace/EvidenceView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function EvidencePage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="evidence" workspace={workspace} action={{ href: "/tasks", labelZh: "查看任务", labelEn: "View tasks", variant: "secondary" }}>
      <EvidenceView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
