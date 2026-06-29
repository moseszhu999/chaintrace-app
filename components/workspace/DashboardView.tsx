import Link from "next/link";
import { getBlockerText, getMissingEvidenceSlots, getReadyScore, getVerifiedEvidenceCount } from "@/lib/demo-workspace-data";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function DashboardView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { businessContext, businessModules, businessStages, evidenceSlots, operatingSummary, proofPack } = workspace;
  const verified = getVerifiedEvidenceCount(evidenceSlots);
  const missing = getMissingEvidenceSlots(evidenceSlots).length;
  const readyScore = getReadyScore(evidenceSlots);
  const blockerText = getBlockerText(zh, evidenceSlots);
  const blockedStages = businessStages.filter((stage) => stage.status === "blocked").length;
  const workingStages = businessStages.filter((stage) => stage.status === "working" || stage.status === "blocked").length;

  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <span>{t(zh, "经营工作台", "Operating workspace")}</span>
          <h2>{t(zh, operatingSummary.headlineZh, operatingSummary.headlineEn)}</h2>
          <p>{t(zh, operatingSummary.promiseZh, operatingSummary.promiseEn)}</p>
        </div>
        <div className="pack-step-grid">
          {businessModules.map((module) => (
            <Link href={module.entryHref} className="pack-step-card" key={module.id}>
              <span>{t(zh, module.titleZh, module.titleEn)}</span>
              <strong>{t(zh, module.statusZh, module.statusEn)}</strong>
              <p>{t(zh, module.descriptionZh, module.descriptionEn)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "当前业务", "Current business")}</span><h2>{t(zh, "先让小微企业把这单生意做完。", "Help the SME finish this deal first.")}</h2></div>
          <div className={styles.list}>
            <article className={styles.listRow}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{businessContext.name}</h3>
                  <p className={styles.rowMeta}>{t(zh, operatingSummary.activeDealZh, operatingSummary.activeDealEn)}</p>
                </div>
                <span className={`${styles.statusChip} ${blockedStages > 0 ? styles.statusHigh : styles.statusLow}`}>{blockedStages > 0 ? t(zh, "有卡点", "Blocked") : t(zh, "正常", "Normal")}</span>
              </div>
            </article>
            <article className={styles.listRow}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, "业务流程进度", "Business flow progress")}</h3>
                  <p className={styles.rowMeta}>{workingStages}/{businessStages.length} {t(zh, "个环节正在推进；当前卡点：", "stages need attention; blockers: ")}{blockerText}</p>
                </div>
                <Link className="primary-button" href="/business">{t(zh, "打开业务流程", "Open business flow")}</Link>
              </div>
            </article>
          </div>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "证明只是能力之一", "Proof is one capability")}</span><h2>{t(zh, "用事实链服务收款、融资、验收和纠纷，而不是只做溯源页面。", "Use the fact trail for collection, financing, acceptance, and disputes — not just traceability pages.")}</h2></div>
          <div className={styles.list}>
            <article className={styles.listRow}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{proofPack.title}</h3>
                  <p className={styles.rowMeta}>{proofPack.status} · Ready {readyScore}% · {verified}/{evidenceSlots.length} {t(zh, "项文件已验证", "documents verified")}</p>
                </div>
                <span className={`${styles.statusChip} ${missing > 0 ? styles.statusMissing : styles.statusVerified}`}>{missing} {t(zh, "缺口", "gaps")}</span>
              </div>
              <div className={styles.rowActions}>
                <Link className="secondary-button" href="/evidence">{t(zh, "补文件", "Complete docs")}</Link>
                <Link className="secondary-button" href="/tasks">{t(zh, "看任务", "View tasks")}</Link>
                <Link className="secondary-button" href="/assistant">{t(zh, "问助手", "Ask assistant")}</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
