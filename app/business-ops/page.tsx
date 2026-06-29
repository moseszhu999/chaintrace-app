import { AgentWorkbenchView } from "@/components/workspace/AgentWorkbenchView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessOpsPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={zh}
      active="business"
      workspace={workspace}
      header={{
        eyebrowZh: "Agent 工作台",
        eyebrowEn: "Agent workbench",
        titleZh: "Agent 驱动的证据运营",
        titleEn: "Agent-driven evidence operations",
        subtitleZh: "单证分类、Gate 匹配、缺口追踪、Memo 生成",
        subtitleEn: "Document triage, gate matching, gap tracking, memo generation",
      }}
      action={{ href: "/business-readiness", labelZh: "融资评分", labelEn: "Readiness score" }}
    >
      <AgentWorkbenchView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
