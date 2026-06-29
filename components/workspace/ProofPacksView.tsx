import Link from "next/link";
import { getMissingEvidenceSlots, getReadyScore, getVerifiedEvidenceCount } from "@/lib/demo-workspace-data";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function severityClass(severity: string) {
  const normalized = severity.toLowerCase();
  if (normalized.includes("high")) return `${styles.statusChip} ${styles.statusHigh}`;
  if (normalized.includes("medium")) return `${styles.statusChip} ${styles.statusMedium}`;
  return `${styles.statusChip} ${styles.statusLow}`;
}

export function ProofPacksView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { businessContext, evidenceSlots, proofPack, riskGaps, shareLink } = workspace;
  const readyScore = getReadyScore(evidenceSlots);
  const verified = getVerifiedEvidenceCount(evidenceSlots);
  const missingSlots = getMissingEvidenceSlots(evidenceSlots);

  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <span>{t(zh, "证明 / 风控", "Proof & risk")}</span>
          <h2>{t(zh, "证明不是目的，是让业务继续走的信用材料。", "Proof is not the goal; it is trust material that keeps the deal moving.")}</h2>
          <p>{t(zh, "这里管理选择性证明、风险缺口和外部分享边界，用于收款、融资、验收、理赔和审计。", "Manage selective proof, risk gaps, and external sharing boundaries for collection, financing, acceptance, claims, and audit.")}</p>
        </div>
        <div className="pack-step-grid">
          <Link href="/business" className="pack-step-card"><span>{t(zh, "关联业务", "Linked deal")}</span><strong>{businessContext.name}</strong><p>{businessContext.batchNo}</p></Link>
          <Link href="/evidence" className="pack-step-card"><span>{t(zh, "文件完整度", "Document readiness")}</span><strong>{readyScore}%</strong><p>{verified}/{evidenceSlots.length} {t(zh, "项已验证", "verified")}</p></Link>
          <Link href="/tasks" className="pack-step-card"><span>{t(zh, "风险缺口", "Risk gaps")}</span><strong>{riskGaps.length}</strong><p>{missingSlots.length} {t(zh, "项文件缺失", "missing documents")}</p></Link>
          <Link href="/verify/uy-beef-cn-2026-0001" className="pack-step-card"><span>{t(zh, "外部验证", "External verification")}</span><strong>{t(zh, "选择性公开", "Selective share")}</strong><p>{t(zh, shareLink.scopeZh, shareLink.scopeEn)}</p></Link>
          <Link href="/assistant/approvals" className="pack-step-card"><span>{t(zh, "人工审批", "Human approval")}</span><strong>{t(zh, "必须确认", "Required")}</strong><p>{t(zh, "发送给买家、资金方前必须审批。", "Approve before sending to buyers or financiers.")}</p></Link>
          <Link href="/assistant" className="pack-step-card"><span>{t(zh, "业务助手", "Business assistant")}</span><strong>{t(zh, "准备材料", "Prepare actions")}</strong><p>{t(zh, "生成草稿、任务和风险说明。", "Generate drafts, tasks, and risk notes.")}</p></Link>
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading">
            <span>{t(zh, "当前证明状态", "Current proof state")}</span>
            <h2>{proofPack.title}</h2>
            <p>{t(zh, "同一套事实材料服务多个业务结果，不重复整理文件。", "One set of facts supports multiple business outcomes without reorganizing files repeatedly.")}</p>
          </div>
          <div className={styles.list}>
            <article className={styles.listRow}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, "收款 / 融资准备度", "Collection / financing readiness")}</h3>
                  <p className={styles.rowMeta}>{t(zh, "当前卡点来自入库记录和买家验收，补齐后才能进入更强的收款和融资说明。", "Current blockers are warehouse entry and buyer acceptance; complete them before stronger collection or financing notes.")}</p>
                </div>
                <span className={`${styles.statusChip} ${missingSlots.length > 0 ? styles.statusMissing : styles.statusVerified}`}>{readyScore}%</span>
              </div>
              <div className={styles.rowActions}>
                <Link className="primary-button" href="/evidence">{t(zh, "补齐文件", "Complete documents")}</Link>
                <Link className="secondary-button" href="/tasks">{t(zh, "查看风险任务", "View risk tasks")}</Link>
              </div>
            </article>
            <article className={styles.listRow}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, "外部分享边界", "External sharing boundary")}</h3>
                  <p className={styles.rowMeta}>{t(zh, shareLink.scopeZh, shareLink.scopeEn)} · {t(zh, "到期：", "Expires: ")}{shareLink.expiresAt}</p>
                </div>
                <span className={`${styles.statusChip} ${styles.statusLow}`}>{t(zh, "最小披露", "Minimal disclosure")}</span>
              </div>
              <div className={styles.rowActions}>
                <Link className="secondary-button" href="/verify/uy-beef-cn-2026-0001">{t(zh, "查看公开页", "View public page")}</Link>
                <Link className="secondary-button" href="/assistant/approvals">{t(zh, "审批发送", "Approve sending")}</Link>
              </div>
            </article>
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <span>{t(zh, "风险缺口", "Risk gaps")}</span>
            <h2>{t(zh, "风控不是单独审计，是业务推进的刹车和路标。", "Risk control is not a separate audit; it is the brake and roadmap for business progress.")}</h2>
          </div>
          <div className={styles.list}>
            {riskGaps.map((gap) => (
              <article className={styles.listRow} key={gap.id}>
                <div className={styles.rowHeader}>
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>{t(zh, gap.titleZh, gap.titleEn)}</h3>
                    <p className={styles.rowMeta}>{t(zh, gap.impactZh, gap.impactEn)}</p>
                    <p className={styles.rowMeta}>{t(zh, "负责人：", "Owner: ")}{t(zh, gap.ownerZh, gap.ownerEn)}</p>
                  </div>
                  <span className={severityClass(gap.severity)}>{gap.severity}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
