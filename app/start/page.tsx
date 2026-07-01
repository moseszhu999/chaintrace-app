import { StartProofPackFlowSkeleton } from "@/components/v2/StartProofPackFlowSkeleton";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const context = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={context.zh}
      active="start"
      workspace={context.workspace}
      role={context.role}
      action={{ href: "/verify/local", labelZh: "验证 Proof", labelEn: "Verify Proof" }}
      header={{
        eyebrowZh: "small entry",
        eyebrowEn: "small entry",
        titleZh: "Start Proof Pack",
        titleEn: "Start Proof Pack",
        subtitleZh: "从一个简单入口开始，逐步生成可验证的 Trade Evidence Passport。",
        subtitleEn: "Start from one simple entry and generate a verifiable Trade Evidence Passport step by step.",
      }}
    >
      <StartProofPackFlowSkeleton zh={context.zh} />
    </WorkspaceFrame>
  );
}
