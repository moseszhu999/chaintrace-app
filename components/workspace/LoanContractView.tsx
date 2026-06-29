import Link from "next/link";
import { loanEvents, loanGates, receivableLoanContract, type LoanEventStatus, type LoanGateStatus } from "@/lib/loan-contract-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function chipClass(status: LoanGateStatus | LoanEventStatus) {
  const map: Record<LoanGateStatus | LoanEventStatus, string> = {
    passed: styles.statusVerified,
    confirmed: styles.statusVerified,
    pending: styles.statusOpen,
    blocked: styles.statusRejected,
    draft: styles.statusMissing,
  };
  return `${styles.statusChip} ${map[status]}`;
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article style={{ border: "1px solid var(--border)", borderRadius: 28, padding: 22, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{ color: "#18794e", fontWeight: 900, fontSize: 14 }}>{label}</span>
      <strong style={{ fontSize: "clamp(26px, 3vw, 38px)", lineHeight: 1.05, letterSpacing: "-0.04em", wordBreak: "break-word" }}>{value}</strong>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45, wordBreak: "break-word" }}>{note}</p>
    </article>
  );
}

export function LoanContractView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const passed = loanGates.filter((gate) => gate.status === "passed").length;
  const pending = loanGates.filter((gate) => gate.status === "pending").length;
  const blocked = loanGates.filter((gate) => gate.status === "blocked").length;
  const canDisburse = blocked === 0 && pending === 0;

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
          <span>{t(zh, "链上贷款融资", "On-chain loan financing")}</span>
          <h2>{t(zh, "用智能合约控制应收账款贷款的放款、还款、逾期和结清。", "Use a smart contract to control receivable-loan disbursement, repayment, overdue handling, and closure.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {receivableLoanContract.network} · {receivableLoanContract.address}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label={t(zh, "应收账款", "Receivable")} value={receivableLoanContract.receivableAmount} note={t(zh, "底层资产：70% 尾款", "Underlying asset: 70% balance")} />
          <MetricCard label={t(zh, "拟放款", "Advance")} value={receivableLoanContract.advanceAmount} note={`${receivableLoanContract.advanceRate} · ${receivableLoanContract.asset}`} />
          <MetricCard label={t(zh, "期限", "Tenor")} value={`${receivableLoanContract.tenorDays} ${t(zh, "天", "days")}`} note={`${t(zh, "费用", "Fee")} ${receivableLoanContract.feeRate}`} />
          <MetricCard label={t(zh, "状态", "Status")} value={canDisburse ? t(zh, "可放款", "Ready") : t(zh, "Gated", "Gated")} note={`${passed}/${loanGates.length} ${t(zh, "条件通过", "gates passed")}`} />
          <MetricCard label={t(zh, "借款方", "Borrower")} value={partyName(receivableLoanContract.borrowerPartyId)} note={t(zh, "出口商 / 小微企业", "Exporter / SME")} />
          <MetricCard label={t(zh, "资金方", "Financier")} value={partyName(receivableLoanContract.financierPartyId)} note={t(zh, "KYC 资金方", "KYC financier")} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "放款 Gate", "Disbursement gates")}</span>
          <h2>{t(zh, "合约必须读取签章合约状态，所有 gate 通过后才允许 USDC 放款。", "The loan contract must read the signing-contract state; USDC disbursement is allowed only after all gates pass.")}</h2>
        </div>
        <div className={styles.list}>
          {loanGates.map((gate) => (
            <article className={styles.listRow} key={gate.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, gate.titleZh, gate.titleEn)}</h3>
                  <p className={styles.rowMeta}>{t(zh, "关联文件：", "Linked document: ")}{docLabel(gate.linkedDocumentId)} · {t(zh, "签章槽：", "Signing slot: ")}{gate.linkedSigningSlotId ?? "-"}</p>
                  <p className={styles.rowMeta}>{t(zh, "解锁：", "Unlocks: ")}{t(zh, gate.unlocksZh, gate.unlocksEn)}</p>
                </div>
                <span className={chipClass(gate.status)}>{gate.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "链上事件", "On-chain events")}</span>
          <h2>{t(zh, "贷款不是人工 Excel 流程，而是合约事件驱动的融资状态机。", "The loan is not an Excel workflow; it is a contract-event-driven financing state machine.")}</h2>
        </div>
        <div className={styles.list}>
          {loanEvents.map((event) => (
            <article className={styles.listRow} key={event.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, event.titleZh, event.titleEn)}{event.amount ? ` · ${event.amount}` : ""}</h3>
                  <p className={styles.rowMeta}>{event.txHash ? `Tx: ${event.txHash}` : t(zh, "未执行上链交易", "No on-chain transaction executed")} {event.dueDate ? `· ${event.dueDate}` : ""}</p>
                  <p className={styles.rowMeta}>{t(zh, event.noteZh, event.noteEn)}</p>
                </div>
                <span className={chipClass(event.status)}>{event.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "合约动作", "Contract actions")}</span>
          <h2>{t(zh, "当前能设计贷款合约，但不能执行放款。", "The loan contract can be designed now, but disbursement cannot execute yet.")}</h2>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "当前阻塞", "Current blockers")}</h3>
            <p className={styles.rowMeta}>{t(zh, "提单签章待核验，仓库入库签章缺失，买家验收签字缺失，资金方放款多签被阻塞。", "Bill-of-lading seal is pending, warehouse entry seal is missing, buyer acceptance signature is missing, and financier disbursement multisig is blocked.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "放款条件", "Disbursement condition")}</h3>
            <p className={styles.rowMeta}>{t(zh, "当签章合约返回全部 gate passed，贷款合约才允许托管钱包向业务钱包释放 USDC 29,500。", "When the signing contract returns all gates passed, the loan contract can release USDC 29,500 from escrow to the business wallet.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "还款规则", "Repayment rule")}</h3>
            <p className={styles.rowMeta}>{t(zh, "买家 USD 36,960 尾款进入托管钱包后，合约优先归还本金和费用，剩余金额释放给出口商；逾期则进入追索/违约状态。", "When the buyer's USD 36,960 balance enters escrow, the contract repays principal and fee first, releases the remainder to the exporter, and enters recourse/default if overdue.")}</p>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/business-signing">{t(zh, "补签章 Gate", "Complete signing gates")}</Link>
            <Link className="secondary-button" href="/business-wallet">{t(zh, "查看托管钱包", "View escrow wallet")}</Link>
            <Link className="secondary-button" href="/business-financing">{t(zh, "RWA 代币化", "RWA tokenization")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
