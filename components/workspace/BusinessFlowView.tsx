import Link from "next/link";
import type { TradeMilestoneStatus } from "@/lib/concrete-trade-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusLabel(status: TradeMilestoneStatus, zh: boolean) {
  const map: Record<TradeMilestoneStatus, { zh: string; en: string }> = {
    done: { zh: "已完成", en: "Done" },
    working: { zh: "处理中", en: "Working" },
    blocked: { zh: "卡住", en: "Blocked" },
    waiting: { zh: "等待", en: "Waiting" },
  };
  return zh ? map[status].zh : map[status].en;
}

function statusClass(status: TradeMilestoneStatus) {
  const map: Record<TradeMilestoneStatus, string> = {
    done: styles.statusVerified,
    working: styles.statusOpen,
    blocked: styles.statusRejected,
    waiting: styles.statusMissing,
  };
  return `${styles.statusChip} ${map[status]}`;
}

export function BusinessFlowView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade, operatingSummary } = workspace;
  const blockedMilestones = activeTrade.milestones.filter((item) => item.status === "blocked");
  const verifiedDocs = activeTrade.documents.filter((item) => item.status === "verified").length;
  const missingDocs = activeTrade.documents.filter((item) => item.status === "missing").length;
  const paidAmount = activeTrade.payments.filter((item) => item.status === "paid").map((item) => item.amount).join(" / ");
  const blockedPayment = activeTrade.payments.find((item) => item.status === "blocked");

  function partyName(id: string) {
    return activeTrade.parties.find((party) => party.id === id)?.name ?? id;
  }

  function evidenceNames(ids: string[]) {
    return ids
      .map((id) => activeTrade.documents.find((doc) => doc.id === id))
      .filter(Boolean)
      .map((doc) => `${zh ? doc!.typeZh : doc!.typeEn}: ${doc!.documentNo}`)
      .join(" / ");
  }

  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <span>{t(zh, "测试业务：真实字段", "Test trade: real fields")}</span>
          <h2>{t(zh, activeTrade.titleZh, activeTrade.titleEn)}</h2>
          <p>{t(zh, operatingSummary.promiseZh, operatingSummary.promiseEn)}</p>
        </div>
        <div className="pack-step-grid">
          <article className="pack-step-card"><span>{t(zh, "金额", "Amount")}</span><strong>{activeTrade.totalAmount}</strong><p>{activeTrade.quantity}</p></article>
          <article className="pack-step-card"><span>PO</span><strong>{activeTrade.poNo}</strong><p>{activeTrade.orderNo}</p></article>
          <article className="pack-step-card"><span>{t(zh, "发票", "Invoice")}</span><strong>{activeTrade.invoiceNo}</strong><p>{activeTrade.currency}</p></article>
          <article className="pack-step-card"><span>{t(zh, "柜号", "Container")}</span><strong>{activeTrade.containerNo}</strong><p>{activeTrade.shipmentNo}</p></article>
          <article className="pack-step-card"><span>{t(zh, "文件", "Documents")}</span><strong>{verifiedDocs}/{activeTrade.documents.length}</strong><p>{missingDocs} {t(zh, "项缺失", "missing")}</p></article>
          <article className="pack-step-card"><span>{t(zh, "尾款", "Balance")}</span><strong>{blockedPayment?.amount ?? "-"}</strong><p>{blockedPayment ? t(zh, blockedPayment.conditionZh, blockedPayment.conditionEn) : t(zh, "无阻塞", "No blocker")}</p></article>
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading">
            <span>{t(zh, "交易推进", "Trade execution")}</span>
            <h2>{t(zh, "Agent 要测试的是具体交易，不是展示概念。", "The agent must be tested on a concrete trade, not a concept demo.")}</h2>
            <p>{activeTrade.origin} → {activeTrade.destination} · {activeTrade.incoterm} · ETA {activeTrade.expectedArrival}</p>
          </div>
          <div className={styles.list}>
            {activeTrade.milestones.map((stage) => (
              <article className={styles.listRow} key={stage.id}>
                <div className={styles.rowHeader}>
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>{stage.order}. {t(zh, stage.titleZh, stage.titleEn)}</h3>
                    <p className={styles.rowMeta}>{t(zh, "负责人：", "Owner: ")}{partyName(stage.ownerPartyId)} · {t(zh, "期限：", "Due: ")}{stage.dueDate}</p>
                    {stage.blockerZh && <p className={styles.rowMeta}>{t(zh, stage.blockerZh, stage.blockerEn ?? stage.blockerZh)}</p>}
                    <p className={styles.rowMeta}>{t(zh, "下一步：", "Next: ")}{t(zh, stage.nextActionZh, stage.nextActionEn)}</p>
                  </div>
                  <span className={statusClass(stage.status)}>{statusLabel(stage.status, zh)}</span>
                </div>
                <p className={styles.rowMeta}>{t(zh, "证据：", "Evidence: ")}{evidenceNames(stage.evidenceIds)}</p>
                <div className={styles.rowActions}>
                  <Link className="secondary-button" href="/evidence">{t(zh, "查看文件", "View documents")}</Link>
                  <Link className="secondary-button" href="/assistant/approvals">{t(zh, "查看审批", "View approvals")}</Link>
                  {stage.status === "blocked" && <Link className="primary-button" href="/assistant">{t(zh, "让 Agent 处理缺口", "Ask agent to handle gap")}</Link>}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <span>{t(zh, "交易对手与收款", "Parties & collection")}</span>
            <h2>{t(zh, "这笔业务当前卡在入库确认和买家验收。", "This trade is blocked by warehouse entry and buyer acceptance.")}</h2>
          </div>
          <div className={styles.list}>
            {activeTrade.parties.map((party) => (
              <article className={styles.listRow} key={party.id}>
                <div className={styles.rowHeader}>
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>{party.name}</h3>
                    <p className={styles.rowMeta}>{t(zh, party.roleZh, party.roleEn)} · {party.country} · {party.contact}</p>
                    <p className={styles.rowMeta}>{party.email}</p>
                  </div>
                </div>
              </article>
            ))}
            {activeTrade.payments.map((payment) => (
              <article className={styles.listRow} key={payment.id}>
                <div className={styles.rowHeader}>
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>{t(zh, payment.titleZh, payment.titleEn)} · {payment.amount}</h3>
                    <p className={styles.rowMeta}>{t(zh, payment.conditionZh, payment.conditionEn)} · {payment.dueDate}</p>
                  </div>
                  <span className={`${styles.statusChip} ${payment.status === "paid" ? styles.statusVerified : payment.status === "blocked" ? styles.statusRejected : styles.statusMissing}`}>{payment.status}</span>
                </div>
              </article>
            ))}
            <article className={styles.listRow}>
              <h3 className={styles.rowTitle}>{t(zh, "Agent 当前判断", "Current agent judgement")}</h3>
              <p className={styles.rowMeta}>{t(zh, `还有 ${blockedMilestones.length} 个阻塞点。先补仓库入库确认，再让买家确认验收，之后才能正式推进 ${blockedPayment?.amount ?? "尾款"} 和融资材料。`, `There are ${blockedMilestones.length} blockers. Complete warehouse entry first, then buyer acceptance, before formally moving ${blockedPayment?.amount ?? "the balance"} and financing materials.`)}</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
