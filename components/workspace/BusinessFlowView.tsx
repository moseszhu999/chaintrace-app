import Link from "next/link";
import type { BusinessStageStatus } from "@/lib/sme-business-model";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusLabel(status: BusinessStageStatus, zh: boolean) {
  const map: Record<BusinessStageStatus, { zh: string; en: string }> = {
    ready: { zh: "已就绪", en: "Ready" },
    working: { zh: "处理中", en: "Working" },
    blocked: { zh: "卡住", en: "Blocked" },
    waiting: { zh: "等待", en: "Waiting" },
  };
  return zh ? map[status].zh : map[status].en;
}

function statusClass(status: BusinessStageStatus) {
  const map: Record<BusinessStageStatus, string> = {
    ready: styles.statusVerified,
    working: styles.statusOpen,
    blocked: styles.statusRejected,
    waiting: styles.statusMissing,
  };
  return `${styles.statusChip} ${map[status]}`;
}

export function BusinessFlowView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { businessModules, businessStages, operatingSummary } = workspace;

  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <span>{t(zh, "交易 Agent", "Trade agent")}</span>
          <h2>{t(zh, operatingSummary.headlineZh, operatingSummary.headlineEn)}</h2>
          <p>{t(zh, operatingSummary.promiseZh, operatingSummary.promiseEn)}</p>
        </div>
        <div className="pack-step-grid">
          {businessModules.map((module) => (
            <Link className="pack-step-card" href={module.entryHref} key={module.id}>
              <span>{t(zh, module.titleZh, module.titleEn)}</span>
              <strong>{t(zh, module.statusZh, module.statusEn)}</strong>
              <p>{t(zh, module.descriptionZh, module.descriptionEn)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading">
            <span>{t(zh, "完整交易流程", "End-to-end trade flow")}</span>
            <h2>{t(zh, "小微企业不是来做溯源演示，是让 Agent 把生意推进到验收和收款。", "SMEs are not here for traceability demos; they need agents to move trades to acceptance and collection.")}</h2>
            <p>{t(zh, operatingSummary.activeDealZh, operatingSummary.activeDealEn)}</p>
          </div>
          <div className={styles.list}>
            {businessStages.map((stage) => (
              <article className={styles.listRow} key={stage.id}>
                <div className={styles.rowHeader}>
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>{stage.order}. {t(zh, stage.titleZh, stage.titleEn)}</h3>
                    <p className={styles.rowMeta}>{t(zh, "负责人：", "Owner: ")}{t(zh, stage.ownerZh, stage.ownerEn)}</p>
                    <p className={styles.rowMeta}>{t(zh, stage.outcomeZh, stage.outcomeEn)}</p>
                  </div>
                  <span className={statusClass(stage.status)}>{statusLabel(stage.status, zh)}</span>
                </div>
                <p className={styles.rowMeta}>{t(zh, "关键文件：", "Key docs: ")}{(zh ? stage.primaryDocsZh : stage.primaryDocsEn).join(" / ")}</p>
                <div className={styles.rowActions}>
                  <Link className="secondary-button" href="/evidence">{t(zh, "查看文件", "View documents")}</Link>
                  <Link className="secondary-button" href="/tasks">{t(zh, "查看任务", "View tasks")}</Link>
                  {stage.status === "blocked" && <Link className="primary-button" href="/assistant">{t(zh, "让 Agent 处理缺口", "Ask agent to handle gap")}</Link>}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <span>{t(zh, "产品边界", "Product boundary")}</span>
            <h2>{t(zh, "ChainTrace 应该是交易 Agent，不是飞书式协作套件。", "ChainTrace should be a trade agent, not a Feishu-like collaboration suite.")}</h2>
          </div>
          <div className={styles.list}>
            <article className={styles.listRow}>
              <h3 className={styles.rowTitle}>{t(zh, "能做", "Does")}</h3>
              <p className={styles.rowMeta}>{t(zh, "整理文件、发现缺口、生成任务、准备草稿、维护选择性证明、推动收款和融资准备。", "Organizes files, finds gaps, creates tasks, prepares drafts, maintains selective proof, and supports collection and financing readiness.")}</p>
            </article>
            <article className={styles.listRow}>
              <h3 className={styles.rowTitle}>{t(zh, "不能越权", "Does not overstep")}</h3>
              <p className={styles.rowMeta}>{t(zh, "不自动发送关键邮件，不替用户确认验收、付款、法律责任或融资结果。", "Does not automatically send critical messages or confirm acceptance, payment, legal responsibility, or financing outcomes for the user.")}</p>
            </article>
            <article className={styles.listRow}>
              <h3 className={styles.rowTitle}>{t(zh, "为什么还需要证明", "Why proof still matters")}</h3>
              <p className={styles.rowMeta}>{t(zh, "证明不是产品终点，而是让小微企业更容易被买家、资金方、物流商和合作伙伴信任的基础设施。", "Proof is not the endpoint; it is infrastructure that helps SMEs be trusted by buyers, financiers, logistics providers, and partners.")}</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
