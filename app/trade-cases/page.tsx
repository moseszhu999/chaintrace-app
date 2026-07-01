import { TradeCasesClient } from "@/components/v2/TradeCasesClient";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { listV2TradeCasesForCurrentOrganization } from "@/lib/repositories/v2-trade-case-repository";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function TradeCasesRoute() {
  const ctx = await getWorkspaceRouteContext();
  const result = await listV2TradeCasesForCurrentOrganization(ctx.organizationContext.user.email, ctx.organizationContext.user.name ?? undefined);

  return (
    <WorkspaceFrame
      zh={ctx.zh}
      active="cases"
      workspace={ctx.workspace}
      role={ctx.role}
      header={{
        eyebrowZh: "v2 真实底座",
        eyebrowEn: "v2 real foundation",
        titleZh: "Trade Cases",
        titleEn: "Trade Cases",
        subtitleZh: "真实 Case 是后续证据和护照的业务容器。",
        subtitleEn: "Real cases are the container for evidence and passport.",
      }}
    >
      <TradeCasesClient zh={ctx.zh} context={result.context} initialCases={result.cases} />
    </WorkspaceFrame>
  );
}
