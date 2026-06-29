import { receivableReadinessReport, type ReadinessStatus } from "@/lib/receivable-readiness-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import { DecisionPanel, MetricCard, MetricGrid, StatusList, WorkspaceHero } from "./WorkspacePrimitives";
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

function MemoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 24, padding: 18 }}>
      <h3 className={styles.rowTitle}>{title}</h3>
      <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "var(--muted)", lineHeight: 1.7 }}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export function ReceivableReadinessView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const report = receivableReadinessReport;
  const memo = report.financierMemo;

  function docLabel(id: string) {
    const doc = activeTrade.documents.find((item) => item.id === id);
    if (doc) return `${zh ? doc.typeZh : doc.typeEn} · ${doc.documentNo}`;
    if (id === "loan_receivable_vn_sg_0007") return t(zh, "贷款合约 · loan_receivable_vn_sg_0007", "Loan contract · loan_receivable_vn_sg_0007");
    return id;
  }

  return (
    <section className="workspace">
      <WorkspaceHero
        eyebrow={t(zh, "应收账款融资评分", "Receivable readiness score")}
        title={t(zh, "把贸易 PDF、物流证据和贷款 gate 转成资金方能读懂的融资判断。", "Turn trade PDFs, logistics evidence, and loan gates into a financing decision a financier can read.")}
        subtitle={`${t(zh, activeTrade.titleZh, activeTrade.titleEn)} · ${activeTrade.poNo} · ${activeTrade.invoiceNo}`}
        actions={[
          { href: "/api/financing-pack", label: t(zh, "打开融资包 API", "Open financing-pack API"), primary: true, external: true },
          { href: "/business-loan", label: t(zh, "查看贷款 Gate", "View loan gates") },
        ]}
      >
        <MetricGrid>
          <MetricCard label={t(zh, "Readiness", "Readiness")} value={`${report.score}/${report.maxScore}`} note={t(zh, report.statusZh, report.statusEn)} large />
          <MetricCard label={t(zh, "应收金额", "Receivable")} value="USD 36,960" note={t(zh, "70% 尾款，当前有争议", "70% balance, currently disputed")} large />
          <MetricCard label={t(zh, "建议动作", "Recommendation")} value={t(zh, "预审", "Pre-review")} note={t(zh, "不建议正式放款", "Do not formally disburse yet")} large />
          <MetricCard label={t(zh, "贷款 Gate", "Loan gates")} value="6/12" note={t(zh, "签章 + 物流 gate 仍未齐", "Signing + logistics gates incomplete")} large />
        </MetricGrid>
      </WorkspaceHero>

      <DecisionPanel eyebrow={t(zh, "资金方结论", "Financier conclusion")} title={t(zh, report.recommendationZh, report.recommendationEn)} />

      <DecisionPanel
        eyebrow={t(zh, "评分拆解", "Score breakdown")}
        title={t(zh, "不是一句“能不能融”，而是拆成商业、物流、质检、金融执行四个判断。", "Not a vague yes/no; split the decision into commercial, logistics, quality, and financing executability.")}
      >
        <StatusList
          items={report.categories.map((category) => ({
            id: category.id,
            title: `${t(zh, category.titleZh, category.titleEn)} · ${category.score}/${category.maxScore}`,
            meta: [
              t(zh, category.summaryZh, category.summaryEn),
              `${t(zh, "证据：", "Evidence: ")}${category.evidenceIds.map(docLabel).join(" / ")}`,
              `${t(zh, "缺口：", "Missing: ")}${(zh ? category.missingZh : category.missingEn).join(" / ")}`,
            ],
            status: category.status,
            statusClassName: statusClass(category.status),
          }))}
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "融资材料包", "Financing pack")}
        title={t(zh, "这是给资金方看的最小材料包：贸易摘要、已核验证据、未决阻塞、融资建议。", "This is the minimum pack for a financier: trade summary, verified evidence, blockers, and recommendation.")}
      >
        <StatusList
          items={report.financingPack.map((section) => ({
            id: section.id,
            title: t(zh, section.titleZh, section.titleEn),
            meta: [t(zh, section.detailZh, section.detailEn)],
            status: section.status,
            statusClassName: statusClass(section.status),
          }))}
        />
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, memo.titleZh, memo.titleEn)}
        title={t(zh, memo.executiveDecisionZh, memo.executiveDecisionEn)}
        subtitle={t(zh, "这部分是给资金方、保理商、风控经理直接阅读的预审备忘录。", "This section is a pre-review memo for financiers, factors, and risk managers.")}
      >
        <MetricGrid>
          {memo.items.map((item) => (
            <MetricCard
              key={item.labelEn}
              label={t(zh, item.labelZh, item.labelEn)}
              value={t(zh, item.valueZh, item.valueEn)}
            />
          ))}
        </MetricGrid>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 14 }}>
          <MemoList title={t(zh, "主要风险", "Key risk flags")} items={zh ? memo.riskFlagsZh : memo.riskFlagsEn} />
          <MemoList title={t(zh, "正式放款前置条件", "Approval conditions")} items={zh ? memo.approvalConditionsZh : memo.approvalConditionsEn} />
        </div>
        <article style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 24, padding: 20, background: "rgba(24, 121, 78, 0.05)" }}>
          <h3 className={styles.rowTitle}>{t(zh, "可复制 Memo", "Copy-ready memo")}</h3>
          <p style={{ margin: "12px 0 0", color: "var(--muted)", lineHeight: 1.75 }}>{t(zh, memo.memoTextZh, memo.memoTextEn)}</p>
        </article>
      </DecisionPanel>

      <DecisionPanel
        eyebrow={t(zh, "下一步动作", "Next actions")}
        title={t(zh, "BLM 第一阶段目标：不是发币，而是把证据缺口补齐到可融资状态。", "BLM phase-one goal: not token issuance, but closing evidence gaps until the receivable is finance-ready.")}
        actions={[
          { href: "/business-loan", label: t(zh, "查看贷款 Gate", "View loan gates"), primary: true },
          { href: "/business-logistics", label: t(zh, "查看物流证据", "View logistics evidence") },
          { href: "/business-signing", label: t(zh, "查看签章", "View signatures") },
        ]}
      >
        <StatusList
          items={(zh ? report.nextActionsZh : report.nextActionsEn).map((action, index) => ({
            id: `${index}`,
            title: `${index + 1}. ${action}`,
          }))}
        />
      </DecisionPanel>
    </section>
  );
}
