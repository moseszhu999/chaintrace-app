import { professionalReviewItems, professionalReviewMetrics, type ProfessionalReviewStatus } from "@/lib/professional-review-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import { DecisionPanel, MetricCard, MetricGrid, StatusList, WorkspaceHero } from "./WorkspacePrimitives";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: ProfessionalReviewStatus) {
  const map: Record<ProfessionalReviewStatus, string> = {
    "auto-cleared": styles.statusVerified,
    "needs-review": styles.statusOpen,
    blocked: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

export function ProfessionalReviewView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;

  return (
    <section className="workspace">
      <WorkspaceHero
        eyebrow={t(zh, "专业审查视图", "Professional review view")}
        title={t(zh, "银行和律所不再从零翻材料，而是审查 Agent + 合约工作流筛出的例外。", "Banks and law firms no longer start from raw materials; they review exceptions surfaced by agent + contract workflows.")}
        subtitle={`${t(zh, activeTrade.titleZh, activeTrade.titleEn)} · ${activeTrade.poNo} · ${activeTrade.invoiceNo}`}
      >
        <MetricGrid>
          {professionalReviewMetrics.map((metric) => (
            <MetricCard
              key={metric.labelEn}
              label={t(zh, metric.labelZh, metric.labelEn)}
              value={t(zh, metric.valueZh, metric.valueEn)}
              note={t(zh, metric.noteZh, metric.noteEn)}
            />
          ))}
        </MetricGrid>
      </WorkspaceHero>

      <DecisionPanel
        eyebrow={t(zh, "例外审查队列", "Exception review queue")}
        title={t(zh, "中介机构的数量级弱化，不是消失；它们从重复核验退到高价值判断节点。", "Order-of-magnitude intermediary compression does not mean disappearance; intermediaries move from repetitive verification to high-value judgment points.")}
      >
        <StatusList
          items={professionalReviewItems.map((item) => ({
            id: item.id,
            title: `${t(zh, item.areaZh, item.areaEn)} · ${t(zh, item.ownerZh, item.ownerEn)}`,
            meta: [
              `${t(zh, "Agent 初筛：", "Agent pre-check: ")}${t(zh, item.agentPrecheckZh, item.agentPrecheckEn)}`,
              `${t(zh, "专业机构职责：", "Professional role: ")}${t(zh, item.professionalRoleZh, item.professionalRoleEn)}`,
              `${t(zh, "例外/风险：", "Exception/risk: ")}${t(zh, item.exceptionZh, item.exceptionEn)}`,
            ],
            status: item.status,
            statusClassName: statusClass(item.status),
          }))}
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "前端层定位", "Frontend-layer positioning")}
        title={t(zh, "Next.js / React / TypeScript 前端层现在覆盖：业务工作台、融资评分、Agent 工作台、合约控制台、资金方视图、专业审查视图。", "The Next.js / React / TypeScript frontend layer now covers: business workspace, readiness score, agent workbench, contract console, financier view, and professional review view.")}
        actions={[
          { href: "/business-ops", label: t(zh, "查看 Agent 工作台", "View Agent workbench"), primary: true },
          { href: "/business-readiness", label: t(zh, "查看融资评分", "View readiness score") },
          { href: "/business-architecture", label: t(zh, "查看业务架构", "View business architecture") },
        ]}
      />
    </section>
  );
}
