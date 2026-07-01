import { notFound } from "next/navigation";
import { TasksView } from "@/components/workspace/TasksView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";
import { safeGetTradeCaseById } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export default async function CaseTasksPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const [{ zh, workspace, role }, trade] = await Promise.all([getWorkspaceRouteContext(), safeGetTradeCaseById(caseId)]);
  if (!trade) notFound();

  return (
    <WorkspaceFrame
      zh={zh}
      active="tasks"
      workspace={workspace}
      header={{
        eyebrowZh: "Case Tasks",
        eyebrowEn: "Case Tasks",
        titleZh: "任务队列",
        titleEn: "Task queue",
        subtitleZh: `${trade.id} · ${trade.poNo}`,
        subtitleEn: `${trade.id} · ${trade.poNo}`,
      }}
      role={role}
      action={{ href: `/cases/${trade.id}/evidence`, labelZh: "返回证据", labelEn: "Back to evidence", variant: "secondary" }}
    >
      <TasksView zh={zh} workspace={workspace} role={role} />
    </WorkspaceFrame>
  );
}
