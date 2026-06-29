import { NextResponse } from "next/server";
import { agentRuns } from "@/lib/agent-workbench-fixture";
import { receivableReadinessReport } from "@/lib/receivable-readiness-fixture";

export const dynamic = "force-static";

export function GET() {
  const gaps = receivableReadinessReport.categories.flatMap((category) =>
    category.missingEn.map((missing, index) => ({
      id: `${category.id}-${index + 1}`,
      categoryId: category.id,
      categoryZh: category.titleZh,
      categoryEn: category.titleEn,
      gapZh: category.missingZh[index],
      gapEn: missing,
      severity: category.status === "blocked" ? "blocking" : "follow-up",
      responsibleRoleZh: category.id === "quality" ? "仓库 / 第三方实验室 / 买家" : category.id === "finance" ? "资金方 / 合约多签" : "贸易参与方",
      responsibleRoleEn: category.id === "quality" ? "Warehouse / third-party lab / buyer" : category.id === "finance" ? "Financier / contract multisig" : "Trade counterparty",
    })),
  );

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    version: "chaintrace-agent-gaps-v0.1",
    tradeId: receivableReadinessReport.tradeId,
    agent: agentRuns.find((run) => run.id === "gap-agent"),
    summary: {
      blockerCode: "GATES_NOT_PASSED",
      totalGaps: gaps.length,
      blockingGaps: gaps.filter((gap) => gap.severity === "blocking").length,
      nextActionsZh: receivableReadinessReport.nextActionsZh,
      nextActionsEn: receivableReadinessReport.nextActionsEn,
    },
    gaps,
    nextAgent: "/api/agents/risk-memo",
  });
}
