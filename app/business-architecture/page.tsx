import { BusinessArchitectureView } from "@/components/workspace/BusinessArchitectureView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessArchitecturePage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={zh}
      active="architecture"
      workspace={workspace}
      header={{
        eyebrowZh: "咨询方案级总览",
        eyebrowEn: "Consulting-grade blueprint",
        titleZh: "BLM 到技术架构",
        titleEn: "From BLM to technical architecture",
        subtitleZh: "BLM · 业务架构 · 应用架构 · 数据架构 · 技术架构",
        subtitleEn: "BLM · business architecture · application architecture · data architecture · technical architecture",
      }}
      action={{ href: "/business-readiness", labelZh: "融资评分", labelEn: "Readiness score" }}
    >
      <BusinessArchitectureView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
