import { EvidenceView } from "@/components/workspace/EvidenceView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";
import { getCurrentTradeCase, listEvidenceRecords } from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  const { zh, workspace } = await getWorkspaceRouteContext();
  const trade = await getCurrentTradeCase();
  const initialEvidenceRecords = await listEvidenceRecords(trade.id);

  return (
    <WorkspaceFrame zh={zh} active="evidence" workspace={workspace} action={{ href: "/tasks", labelZh: "查看任务", labelEn: "View tasks", variant: "secondary" }}>
      <EvidenceView zh={zh} workspace={workspace} initialEvidenceRecords={initialEvidenceRecords} />
    </WorkspaceFrame>
  );
}
