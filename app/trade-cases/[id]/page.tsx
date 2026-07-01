import Link from "next/link";
import { TradeCaseWorkspaceView } from "@/components/v2/TradeCaseWorkspaceView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getV2TradeCaseWorkspace } from "@/lib/repositories/v2-trade-case-repository";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TradeCaseWorkspaceRoute({ params }: PageProps) {
  const [{ id }, ctx] = await Promise.all([params, getWorkspaceRouteContext()]);
  const result = await getV2TradeCaseWorkspace(id, ctx.organizationContext.user.email, ctx.organizationContext.user.name ?? undefined);

  return (
    <WorkspaceFrame
      zh={ctx.zh}
      active="cases"
      workspace={ctx.workspace}
      role={ctx.role}
      header={{
        eyebrowZh: "v2 Case Workspace",
        eyebrowEn: "v2 Case Workspace",
        titleZh: result.workspace?.case.caseName ?? "Case not found",
        titleEn: result.workspace?.case.caseName ?? "Case not found",
      }}
    >
      {result.workspace ? (
        <TradeCaseWorkspaceView zh={ctx.zh} workspace={result.workspace} />
      ) : (
        <div className="empty-state-card">
          <strong>{ctx.zh ? "Case 不存在或无权限" : "Case not found or not accessible"}</strong>
          <Link className="primary-button" href="/trade-cases">{ctx.zh ? "返回 Case 列表" : "Back to cases"}</Link>
        </div>
      )}
    </WorkspaceFrame>
  );
}
