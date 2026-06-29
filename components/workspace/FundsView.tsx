import Link from "next/link";
import { concreteFundItems, formatUsd, type FundStatus } from "@/lib/fund-management-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: FundStatus) {
  const map: Record<FundStatus, string> = {
    paid: styles.statusVerified,
    pending: styles.statusOpen,
    blocked: styles.statusRejected,
    planned: styles.statusMissing,
  };
  return `${styles.statusChip} ${map[status]}`;
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article style={{ border: "1px solid var(--border)", borderRadius: 28, padding: 22, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{ color: "#18794e", fontWeight: 900, fontSize: 14 }}>{label}</span>
      <strong style={{ fontSize: "clamp(28px, 3vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.04em", wordBreak: "break-word" }}>{value}</strong>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45 }}>{note}</p>
    </article>
  );
}

export function FundsView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const paidInflows = concreteFundItems.filter((item) => item.direction === "inflow" && item.status === "paid").reduce((sum, item) => sum + item.amountUsd, 0);
  const pendingOutflows = concreteFundItems.filter((item) => item.direction === "outflow" && item.status !== "paid").reduce((sum, item) => sum + item.amountUsd, 0);
  const blockedReceivable = concreteFundItems.filter((item) => item.direction === "inflow" && item.status === "blocked").reduce((sum, item) => sum + item.amountUsd, 0);
  const plannedFinancing = concreteFundItems.find((item) => item.id === "fund_possible_financing");
  const availableCashAfterPending = paidInflows - pendingOutflows;
  const cashGap = Math.max(0, pendingOutflows - paidInflows);

  function partyName(id: string) {
    return activeTrade.parties.find((party) => party.id === id)?.name ?? id;
  }

  function docLabel(id?: string) {
    if (!id) return "-";
    const doc = activeTrade.documents.find((item) => item.id === id);
    return doc ? `${zh ? doc.typeZh : doc.typeEn} · ${doc.documentNo}` : id;
  }

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "业务资金管理", "Business funds management")}</span>
          <h2>{t(zh, "先看现金、应收、应付和资金缺口，再谈融资与 RWA。", "Manage cash, receivables, payables, and funding gaps before financing or RWA.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.totalAmount} · {activeTrade.poNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label={t(zh, "已入账资金", "Booked inflows")} value={formatUsd(paidInflows)} note={t(zh, "期初现金 + 买家 30% 预付款", "Opening cash + buyer 30% deposit")} />
          <MetricCard label={t(zh, "待付成本", "Pending outflows")} value={formatUsd(pendingOutflows)} note={t(zh, "供应商、物流、仓储相关支出", "Supplier, logistics, and warehouse costs")} />
          <MetricCard label={t(zh, "现金缺口", "Cash gap")} value={formatUsd(cashGap)} note={availableCashAfterPending >= 0 ? t(zh, "当前现金可覆盖待付成本", "Current cash covers pending outflows") : t(zh, "需要融资或延后付款", "Needs financing or payment delay")} />
          <MetricCard label={t(zh, "被卡应收", "Blocked receivable")} value={formatUsd(blockedReceivable)} note={t(zh, "70% 尾款被买家验收条件卡住", "70% balance blocked by buyer acceptance")} />
          <MetricCard label={t(zh, "潜在融资", "Potential financing")} value={formatUsd(plannedFinancing?.amountUsd ?? 0)} note={t(zh, "补齐入库和验收后再提交", "Submit after warehouse entry and acceptance")} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "资金流水", "Funds ledger")}</span>
          <h2>{t(zh, "每一笔资金都要绑定交易、责任方和文件条件。", "Each fund item must attach to the trade, owner, and document condition.")}</h2>
        </div>
        <div className={styles.list}>
          {concreteFundItems.map((item) => (
            <article className={styles.listRow} key={item.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, item.titleZh, item.titleEn)} · {formatUsd(item.amountUsd)}</h3>
                  <p className={styles.rowMeta}>{item.direction === "inflow" ? t(zh, "流入", "Inflow") : t(zh, "流出", "Outflow")} · {t(zh, "日期：", "Date: ")}{item.dueDate} · {t(zh, "责任方：", "Party: ")}{partyName(item.relatedPartyId)}</p>
                  <p className={styles.rowMeta}>{t(zh, "关联文件：", "Linked document: ")}{docLabel(item.relatedDocumentId)}</p>
                  <p className={styles.rowMeta}>{t(zh, item.noteZh, item.noteEn)}</p>
                </div>
                <span className={statusClass(item.status)}>{item.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "资金 Agent 判断", "Funds agent judgement")}</span>
          <h2>{t(zh, "资金管理模块应该告诉老板今天钱卡在哪里。", "The funds module should tell the owner where cash is blocked today.")}</h2>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "当前结论", "Current conclusion")}</h3>
            <p className={styles.rowMeta}>{t(zh, "现金基本能覆盖供应商和物流待付，但 USD 36,960 尾款被买家验收卡住。资金管理优先级不是发币，而是先拿到入库确认和买家验收。", "Cash can mostly cover supplier and logistics payables, but the USD 36,960 balance is blocked by buyer acceptance. The priority is not tokenization; it is warehouse entry and buyer acceptance.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "下一步动作", "Next actions")}</h3>
            <p className={styles.rowMeta}>{t(zh, "1. 催仓库入库确认；2. 催买家验收；3. 补齐后生成融资包；4. 再进入 RWA 资格判断。", "1. Request warehouse entry; 2. Request buyer acceptance; 3. Generate financing pack after completion; 4. Then run RWA eligibility.")}</p>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/business-financing">{t(zh, "进入融资 / RWA", "Go to financing / RWA")}</Link>
            <Link className="secondary-button" href="/evidence">{t(zh, "补齐文件", "Complete documents")}</Link>
            <Link className="secondary-button" href="/tasks">{t(zh, "查看履约卡点", "View blockers")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
