import Link from "next/link";
import { coffeeLogisticsSummary, logisticsEvidenceItems, logisticsTimeline, qcDispute, type LogisticsStatus } from "@/lib/logistics-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function chipClass(status: LogisticsStatus) {
  const map: Record<LogisticsStatus, string> = {
    verified: styles.statusVerified,
    uploaded: styles.statusOpen,
    pending: styles.statusMissing,
    blocked: styles.statusRejected,
  };
  return `${styles.statusChip} ${map[status]}`;
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article style={{ border: "1px solid var(--border)", borderRadius: 28, padding: 22, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{ color: "#18794e", fontWeight: 900, fontSize: 14 }}>{label}</span>
      <strong style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.04em", wordBreak: "break-word" }}>{value}</strong>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45, wordBreak: "break-word" }}>{note}</p>
    </article>
  );
}

export function LogisticsControlView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const verifiedCount = logisticsTimeline.filter((item) => item.status === "verified").length;
  const blockedCount = logisticsTimeline.filter((item) => item.status === "blocked").length;
  const anchoredCount = logisticsTimeline.filter((item) => item.chainAnchor).length;

  function partyName(id: string) {
    return activeTrade.parties.find((party) => party.id === id)?.name ?? id;
  }

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "物流证据状态机", "Logistics evidence state machine")}</span>
          <h2>{t(zh, "把柜号、铅封、VGM、提单、清关、入库、质检和验收变成融资可读的证据链。", "Turn container, seal, VGM, B/L, customs, warehouse receipt, QC, and acceptance into a financing-readable evidence chain.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.totalAmount} · {activeTrade.containerNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label={t(zh, "柜号", "Container")} value={coffeeLogisticsSummary.containerNo} note={t(zh, "已修正为通过校验位的柜号", "Corrected to a check-digit-valid number")} />
          <MetricCard label={t(zh, "铅封", "Seal")} value={coffeeLogisticsSummary.sealNo} note={t(zh, "装柜后加封，照片和 hash 可作为责任点", "Applied after stuffing; photo and hash act as accountability point")} />
          <MetricCard label="VGM" value={`${coffeeLogisticsSummary.vgmWeightKg.toLocaleString()} kg`} note={t(zh, coffeeLogisticsSummary.vgmMethodZh, coffeeLogisticsSummary.vgmMethodEn)} />
          <MetricCard label={t(zh, "物流通过", "Logistics passed")} value={`${verifiedCount}/${logisticsTimeline.length}`} note={`${anchoredCount} ${t(zh, "个节点已 hash 锚定", "nodes hash-anchored")}`} />
          <MetricCard label={t(zh, "阻塞点", "Blockers")} value={`${blockedCount}`} note={t(zh, "仓库回执与到港质检/买方验收仍阻塞", "Warehouse receipt and arrival QC / buyer acceptance remain blocked")} />
          <MetricCard label={t(zh, "尾款风险", "Balance risk")} value={qcDispute.blockedPayment} note={t(zh, "70% 尾款被验收条件卡住", "70% balance blocked by acceptance condition")} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "运输路线", "Transport route")}</span>
          <h2>{t(zh, "真实物流不是一条 tracking 线，而是一组会影响付款和放款的责任切换点。", "Real logistics is not one tracking line; it is a set of accountability handoff points that affect payment and disbursement.")}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label={t(zh, "起运仓", "Origin warehouse")} value={t(zh, coffeeLogisticsSummary.originWarehouseZh, coffeeLogisticsSummary.originWarehouseEn)} note={t(zh, `${coffeeLogisticsSummary.cargo.bagCount} 袋 · 净重 ${coffeeLogisticsSummary.cargo.netWeightKg.toLocaleString()} kg`, `${coffeeLogisticsSummary.cargo.bagCount} bags · net ${coffeeLogisticsSummary.cargo.netWeightKg.toLocaleString()} kg`)} />
          <MetricCard label={t(zh, "起运港", "Origin port")} value={t(zh, coffeeLogisticsSummary.originPortZh, coffeeLogisticsSummary.originPortEn)} note={`ETD ${coffeeLogisticsSummary.etd} · ${coffeeLogisticsSummary.vessel} / ${coffeeLogisticsSummary.voyage}`} />
          <MetricCard label={t(zh, "目的港", "Destination port")} value={t(zh, coffeeLogisticsSummary.destinationPortZh, coffeeLogisticsSummary.destinationPortEn)} note={`ETA ${coffeeLogisticsSummary.eta} · TradeNet ${coffeeLogisticsSummary.tradeNetUrn}`} />
          <MetricCard label={t(zh, "目的仓", "Destination warehouse")} value={t(zh, coffeeLogisticsSummary.destinationWarehouseZh, coffeeLogisticsSummary.destinationWarehouseEn)} note={t(zh, "入库回执仍未最终签发", "Final warehouse receipt not yet issued")} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "物流 Gate", "Logistics gates")}</span>
          <h2>{t(zh, "这些节点应该成为贷款合约和签章合约读取的物流 gate。", "These nodes should become logistics gates read by the loan and signing contracts.")}</h2>
        </div>
        <div className={styles.list}>
          {logisticsTimeline.map((item) => (
            <article className={styles.listRow} key={item.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{item.order}. {t(zh, item.titleZh, item.titleEn)}</h3>
                  <p className={styles.rowMeta}>{partyName(item.partyId)} · {item.plannedAt} · {item.evidenceNo}</p>
                  <p className={styles.rowMeta}>{t(zh, item.noteZh, item.noteEn)}</p>
                  <p className={styles.rowMeta}>{item.chainAnchor ? t(zh, `链上锚定：${item.evidenceHash}`, `On-chain anchor: ${item.evidenceHash}`) : t(zh, "链下证明，待签章后再锚定", "Off-chain evidence; anchor after signature")}</p>
                </div>
                <span className={chipClass(item.status)}>{item.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "物流证据包", "Logistics evidence pack")}</span>
          <h2>{t(zh, "资金方真正看的不是口头解释，而是柜、封、重、单、关、仓、检是否能互相印证。", "Financiers do not rely on verbal explanations; they check whether container, seal, weight, documents, customs, warehouse, and QC corroborate.")}</h2>
        </div>
        <div className={styles.list}>
          {logisticsEvidenceItems.map((item) => (
            <article className={styles.listRow} key={item.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, item.labelZh, item.labelEn)} · {item.value}</h3>
                  <p className={styles.rowMeta}>{t(zh, "签发方：", "Issuer: ")}{t(zh, item.issuerZh, item.issuerEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, item.noteZh, item.noteEn)}</p>
                </div>
                <span className={chipClass(item.status)}>{item.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "到港质检争议", "Arrival QC dispute")}</span>
          <h2>{t(zh, "尾款不是抽象地“被卡”，而是被一个可验证、可追责、可融资解释的质检争议卡住。", "The balance is not vaguely blocked; it is blocked by a verifiable, accountable, financing-explainable QC dispute.")}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label={t(zh, "合同上限", "Contract cap")} value={`${qcDispute.contractMaxMoisturePct}%`} note={t(zh, "水分超过上限时买家可要求复检、扣款或拒收", "Buyer may require re-test, discount, or rejection if moisture exceeds cap")} />
          <MetricCard label={t(zh, "装运前 QC", "Pre-shipment QC")} value={`${qcDispute.exporterPreShipmentMoisturePct}%`} note={t(zh, "出口商证书显示通过", "Exporter certificate shows pass")} />
          <MetricCard label={t(zh, "到港快检", "Arrival quick test")} value={`${qcDispute.singaporeWarehouseQuickTestPct}%`} note={t(zh, "新加坡仓库快检触发争议", "Singapore warehouse quick test triggers dispute")} />
          <MetricCard label={t(zh, "实验室状态", "Lab status")} value={t(zh, "Pending", "Pending")} note={t(zh, qcDispute.labStatusZh, qcDispute.labStatusEn)} />
        </div>
        <div className={styles.list} style={{ marginTop: 14 }}>
          <article className={styles.listRow}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{t(zh, "Agent 建议", "Agent recommendation")}</h3>
                <p className={styles.rowMeta}>{t(zh, qcDispute.recommendedActionZh, qcDispute.recommendedActionEn)}</p>
                <p className={styles.rowMeta}>{t(zh, `在结果出来之前，只能做 USD 29,500 融资预审，不能把 USD 36,960 尾款直接确认为无争议应收。`, `Before the result, only USD 29,500 financing pre-review is appropriate; the USD 36,960 balance cannot be treated as undisputed receivable.`)}</p>
              </div>
              <span className={`${styles.statusChip} ${styles.statusHigh}`}>priority</span>
            </div>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/business-signing">{t(zh, "补物流签章", "Complete logistics signing")}</Link>
            <Link className="secondary-button" href="/business-loan">{t(zh, "查看贷款 Gate", "View loan gates")}</Link>
            <Link className="secondary-button" href="/evidence">{t(zh, "查看证据文件", "View evidence files")}</Link>
            <Link className="secondary-button" href="/business-funds">{t(zh, "查看尾款风险", "View balance risk")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
