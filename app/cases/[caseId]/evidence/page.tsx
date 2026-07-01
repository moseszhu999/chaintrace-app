import { notFound } from "next/navigation";
import { EvidenceView } from "@/components/workspace/EvidenceView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";
import { safeGetTradeCaseById, safeListEvidenceRecords } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export default async function CaseEvidencePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const [{ zh, workspace, role }, trade] = await Promise.all([getWorkspaceRouteContext(), safeGetTradeCaseById(caseId)]);
  if (!trade) notFound();

  const evidence = await safeListEvidenceRecords(trade.id);

  return (
    <WorkspaceFrame
      zh={zh}
      active="evidence"
      workspace={workspace}
      header={{
        eyebrowZh: "Case Evidence",
        eyebrowEn: "Case Evidence",
        titleZh: "证据审查工作区",
        titleEn: "Evidence review workspace",
        subtitleZh: `${trade.id} · ${trade.poNo}`,
        subtitleEn: `${trade.id} · ${trade.poNo}`,
      }}
      role={role}
      action={{ href: `/cases/${trade.id}/tasks`, labelZh: "查看 Case 任务", labelEn: "View case tasks", variant: "secondary" }}
    >
      <EvidenceView zh={zh} workspace={workspace} role={role} initialEvidenceRecords={evidence.records} />
    </WorkspaceFrame>
  );
}
