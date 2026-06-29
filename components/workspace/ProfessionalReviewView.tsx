import Link from "next/link";
import { professionalReviewItems, professionalReviewMetrics, type ProfessionalReviewStatus } from "@/lib/professional-review-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
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
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "专业审查视图", "Professional review view")}</span>
          <h2>{t(zh, "银行和律所不再从零翻材料，而是审查 Agent + 合约工作流筛出的例外。", "Banks and law firms no longer start from raw materials; they review exceptions surfaced by agent + contract workflows.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.poNo} · {activeTrade.invoiceNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {professionalReviewMetrics.map((metric) => (
            <article key={metric.labelEn} style={{ border: "1px solid var(--border)", borderRadius: 26, padding: 20 }}>
              <span style={{ color: "#18794e", fontWeight: 900, fontSize: 13 }}>{t(zh, metric.labelZh, metric.labelEn)}</span>
              <h3 className={styles.rowTitle}>{t(zh, metric.valueZh, metric.valueEn)}</h3>
              <p className={styles.rowMeta}>{t(zh, metric.noteZh, metric.noteEn)}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "例外审查队列", "Exception review queue")}</span>
          <h2>{t(zh, "中介机构的数量级弱化，不是消失；它们从重复核验退到高价值判断节点。", "Order-of-magnitude intermediary compression does not mean disappearance; intermediaries move from repetitive verification to high-value judgment points.")}</h2>
        </div>
        <div className={styles.list}>
          {professionalReviewItems.map((item) => (
            <article className={styles.listRow} key={item.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, item.areaZh, item.areaEn)} · {t(zh, item.ownerZh, item.ownerEn)}</h3>
                  <p className={styles.rowMeta}>{t(zh, "Agent 初筛：", "Agent pre-check: ")}{t(zh, item.agentPrecheckZh, item.agentPrecheckEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "专业机构职责：", "Professional role: ")}{t(zh, item.professionalRoleZh, item.professionalRoleEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "例外/风险：", "Exception/risk: ")}{t(zh, item.exceptionZh, item.exceptionEn)}</p>
                </div>
                <span className={statusClass(item.status)}>{item.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "前端层定位", "Frontend-layer positioning")}</span>
          <h2>{t(zh, "Next.js / React / TypeScript 前端层现在覆盖：业务工作台、融资评分、Agent 工作台、合约控制台、资金方视图、专业审查视图。", "The Next.js / React / TypeScript frontend layer now covers: business workspace, readiness score, agent workbench, contract console, financier view, and professional review view.")}</h2>
        </div>
        <div className={styles.rowActions}>
          <Link className="primary-button" href="/business-ops">{t(zh, "查看 Agent 工作台", "View Agent workbench")}</Link>
          <Link className="secondary-button" href="/business-readiness">{t(zh, "查看融资评分", "View readiness score")}</Link>
          <Link className="secondary-button" href="/business-architecture">{t(zh, "查看业务架构", "View business architecture")}</Link>
        </div>
      </div>
    </section>
  );
}
