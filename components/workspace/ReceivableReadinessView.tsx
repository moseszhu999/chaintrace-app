import Link from "next/link";
import { receivableReadinessReport, type ReadinessStatus } from "@/lib/receivable-readiness-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: ReadinessStatus) {
  const map: Record<ReadinessStatus, string> = {
    passed: styles.statusVerified,
    pending: styles.statusOpen,
    blocked: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article style={{ border: "1px solid var(--border)", borderRadius: 28, padding: 22, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{ color: "#18794e", fontWeight: 900, fontSize: 14 }}>{label}</span>
      <strong style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1, letterSpacing: "-0.05em" }}>{value}</strong>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45 }}>{note}</p>
    </article>
  );
}

export function ReceivableReadinessView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const report = receivableReadinessReport;

  function docLabel(id: string) {
    const doc = activeTrade.documents.find((item) => item.id === id);
    if (doc) return `${zh ? doc.typeZh : doc.typeEn} · ${doc.documentNo}`;
    if (id === "loan_receivable_vn_sg_0007") return t(zh, "贷款合约 · loan_receivable_vn_sg_0007", "Loan contract · loan_receivable_vn_sg_0007");
    return id;
  }

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "应收账款融资评分", "Receivable readiness score")}</span>
          <h2>{t(zh, "把贸易 PDF、物流证据和贷款 gate 转成资金方能读懂的融资判断。", "Turn trade PDFs, logistics evidence, and loan gates into a financing decision a financier can read.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.poNo} · {activeTrade.invoiceNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label={t(zh, "Readiness", "Readiness")} value={`${report.score}/${report.maxScore}`} note={t(zh, report.statusZh, report.statusEn)} />
          <MetricCard label={t(zh, "应收金额", "Receivable")} value="USD 36,960" note={t(zh, "70% 尾款，当前有争议", "70% balance, currently disputed")} />
          <MetricCard label={t(zh, "建议动作", "Recommendation")} value={t(zh, "预审", "Pre-review")} note={t(zh, "不建议正式放款", "Do not formally disburse yet")} />
          <MetricCard label={t(zh, "贷款 Gate", "Loan gates")} value="6/12" note={t(zh, "签章 + 物流 gate 仍未齐", "Signing + logistics gates incomplete")} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "资金方结论", "Financier conclusion")}</span>
          <h2>{t(zh, report.recommendationZh, report.recommendationEn)}</h2>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "评分拆解", "Score breakdown")}</span>
          <h2>{t(zh, "不是一句“能不能融”，而是拆成商业、物流、质检、金融执行四个判断。", "Not a vague yes/no; split the decision into commercial, logistics, quality, and financing executability.")}</h2>
        </div>
        <div className={styles.list}>
          {report.categories.map((category) => (
            <article className={styles.listRow} key={category.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, category.titleZh, category.titleEn)} · {category.score}/{category.maxScore}</h3>
                  <p className={styles.rowMeta}>{t(zh, category.summaryZh, category.summaryEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, "证据：", "Evidence: ")}{category.evidenceIds.map(docLabel).join(" / ")}</p>
                  <p className={styles.rowMeta}>{t(zh, "缺口：", "Missing: ")}{(zh ? category.missingZh : category.missingEn).join(" / ")}</p>
                </div>
                <span className={statusClass(category.status)}>{category.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "融资材料包", "Financing pack")}</span>
          <h2>{t(zh, "这是给资金方看的最小材料包：贸易摘要、已核验证据、未决阻塞、融资建议。", "This is the minimum pack for a financier: trade summary, verified evidence, blockers, and recommendation.")}</h2>
        </div>
        <div className={styles.list}>
          {report.financingPack.map((section) => (
            <article className={styles.listRow} key={section.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, section.titleZh, section.titleEn)}</h3>
                  <p className={styles.rowMeta}>{t(zh, section.detailZh, section.detailEn)}</p>
                </div>
                <span className={statusClass(section.status)}>{section.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "下一步动作", "Next actions")}</span>
          <h2>{t(zh, "BLM 第一阶段目标：不是发币，而是把证据缺口补齐到可融资状态。", "BLM phase-one goal: not token issuance, but closing evidence gaps until the receivable is finance-ready.")}</h2>
        </div>
        <div className={styles.list}>
          {(zh ? report.nextActionsZh : report.nextActionsEn).map((action, index) => (
            <article className={styles.listRow} key={action}>
              <h3 className={styles.rowTitle}>{index + 1}. {action}</h3>
            </article>
          ))}
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/business-loan">{t(zh, "查看贷款 Gate", "View loan gates")}</Link>
            <Link className="secondary-button" href="/business-logistics">{t(zh, "查看物流证据", "View logistics evidence")}</Link>
            <Link className="secondary-button" href="/business-signing">{t(zh, "查看签章", "View signatures")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
