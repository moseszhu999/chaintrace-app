import { EvidenceView } from "@/components/workspace/EvidenceView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getFallbackEvidenceRecords } from "@/lib/evidence-fallback";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";
import { getCurrentTradeCase, listEvidenceRecords } from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

async function getInitialEvidenceRecords() {
  try {
    const trade = await getCurrentTradeCase();
    return await listEvidenceRecords(trade.id);
  } catch (error) {
    console.error("Falling back to seeded evidence records for /evidence", error);
    return getFallbackEvidenceRecords();
  }
}

export default async function EvidencePage() {
  const { zh, workspace } = await getWorkspaceRouteContext();
  const initialEvidenceRecords = await getInitialEvidenceRecords();

  return (
    <WorkspaceFrame zh={zh} active="evidence" workspace={workspace} action={{ href: "/tasks", labelZh: "查看任务", labelEn: "View tasks", variant: "secondary" }}>
      <EvidenceView zh={zh} workspace={workspace} initialEvidenceRecords={initialEvidenceRecords} />
    </WorkspaceFrame>
  );
}
