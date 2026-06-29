import { ReceivableReadinessView } from "@/components/workspace/ReceivableReadinessView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function BusinessReadinessPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={zh}
      active="readiness"
      workspace={workspace}
      header={{
        eyebrowZh: "资金方视图",
        eyebrowEn: "Financier view",
        titleZh: "融资评分与预审 Memo",
        titleEn: "Readiness score and pre-review memo",
        subtitleZh: "62/100 · 仅可预审 · GATES_NOT_PASSED",
        subtitleEn: "62/100 · Pre-review only · GATES_NOT_PASSED",
      }}
      action={{ href: "/business-loan", labelZh: "贷款 Gate", labelEn: "Loan gates" }}
    >
      <ReceivableReadinessView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
