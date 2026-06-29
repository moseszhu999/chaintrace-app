import Link from "next/link";
import { concreteFundItems, formatUsd } from "@/lib/fund-management-fixture";
import { businessWallets, walletTransactions } from "@/lib/crypto-wallet-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function FlowCard({ title, subtitle, value, status, href }: { title: string; subtitle: string; value: string; status: string; href: string }) {
  return (
    <Link href={href} style={{ border: "1px solid var(--border)", borderRadius: 28, padding: 22, minWidth: 0, display: "flex", flexDirection: "column", gap: 14, textDecoration: "none" }}>
      <span style={{ color: "#18794e", fontWeight: 900, fontSize: 14 }}>{title}</span>
      <strong style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.04em", wordBreak: "break-word" }}>{value}</strong>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45 }}>{subtitle}</p>
      <span className="secondary-button" style={{ width: "fit-content" }}>{status}</span>
    </Link>
  );
}

export function FourFlowView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const verifiedDocs = activeTrade.documents.filter((doc) => doc.status === "verified").length;
  const missingDocs = activeTrade.documents.filter((doc) => doc.status === "missing").length;
  const blockedMilestones = activeTrade.milestones.filter((milestone) => milestone.status === "blocked").length;
  const blockedReceivable = concreteFundItems.filter((item) => item.direction === "inflow" && item.status === "blocked").reduce((sum, item) => sum + item.amountUsd, 0);
  const pendingOutflows = concreteFundItems.filter((item) => item.direction === "outflow" && item.status !== "paid").reduce((sum, item) => sum + item.amountUsd, 0);
  const usdcBalance = businessWallets.find((wallet) => wallet.id === "wallet_ops_usdc_polygon")?.balances.find((balance) => balance.asset === "USDC")?.usdValue ?? "USD 0";
  const proofAnchors = walletTransactions.filter((tx) => tx.direction === "anchor" && tx.status === "confirmed").length;

  const flows = [
    {
      title: t(zh, "商流", "Commercial flow"),
      value: activeTrade.poNo,
      subtitle: t(zh, `订单 ${activeTrade.orderNo}，发票 ${activeTrade.invoiceNo}，金额 ${activeTrade.totalAmount}`, `Order ${activeTrade.orderNo}, invoice ${activeTrade.invoiceNo}, amount ${activeTrade.totalAmount}`),
      status: t(zh, "订单与发票已形成", "Order and invoice formed"),
      href: "/business-ops",
    },
    {
      title: t(zh, "物流", "Logistics flow"),
      value: activeTrade.containerNo,
      subtitle: t(zh, `${activeTrade.origin} → ${activeTrade.destination}，提单 ${activeTrade.shipmentNo}`, `${activeTrade.origin} → ${activeTrade.destination}, shipment ${activeTrade.shipmentNo}`),
      status: t(zh, `${blockedMilestones} 个物流 / 验收卡点`, `${blockedMilestones} logistics / acceptance blockers`),
      href: "/tasks",
    },
    {
      title: t(zh, "资金流", "Funds flow"),
      value: formatUsd(blockedReceivable),
      subtitle: t(zh, `待付成本 ${formatUsd(pendingOutflows)}，USDC 钱包 ${usdcBalance}`, `Pending outflows ${formatUsd(pendingOutflows)}, USDC wallet ${usdcBalance}`),
      status: t(zh, "尾款被验收条件卡住", "Balance blocked by acceptance"),
      href: "/business-funds",
    },
    {
      title: t(zh, "信息流", "Information flow"),
      value: `${verifiedDocs}/${activeTrade.documents.length}`,
      subtitle: t(zh, `文件已验证 ${verifiedDocs} 项，缺失 ${missingDocs} 项，链上 hash 锚定 ${proofAnchors} 项`, `${verifiedDocs} docs verified, ${missingDocs} missing, ${proofAnchors} on-chain hash anchor`),
      status: t(zh, "证明和审计记录持续更新", "Proof and audit trail updating"),
      href: "/evidence",
    },
  ];

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "供应链四流合一", "Four-flow supply-chain integration")}</span>
          <h2>{t(zh, "ChainTrace 的核心不是单点工具，而是把商流、物流、资金流、信息流对齐到同一笔业务。", "ChainTrace is not a single-point tool; it aligns commercial, logistics, funds, and information flows to the same trade.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.totalAmount} · {activeTrade.poNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {flows.map((flow) => <FlowCard key={flow.title} {...flow} />)}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "四流对齐检查", "Four-flow alignment check")}</span>
          <h2>{t(zh, "只有四流互相印证，应收账款和 RWA 才有基础。", "Receivables and RWA only have a basis when all four flows corroborate each other.")}</h2>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{t(zh, "商流 ↔ 信息流", "Commercial flow ↔ information flow")}</h3>
                <p className={styles.rowMeta}>{t(zh, "PO、发票、质检证书已验证，说明交易基础存在。", "PO, invoice, and quality certificate are verified, so the commercial basis exists.")}</p>
              </div>
              <span className={`${styles.statusChip} ${styles.statusVerified}`}>verified</span>
            </div>
          </article>
          <article className={styles.listRow}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{t(zh, "物流 ↔ 资金流", "Logistics flow ↔ funds flow")}</h3>
                <p className={styles.rowMeta}>{t(zh, "入库确认和买家验收缺失，导致 70% 尾款和融资放款都不能正式推进。", "Warehouse entry and buyer acceptance are missing, so the 70% balance and financing disbursement cannot formally proceed.")}</p>
              </div>
              <span className={`${styles.statusChip} ${styles.statusRejected}`}>blocked</span>
            </div>
          </article>
          <article className={styles.listRow}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{t(zh, "资金流 ↔ 钱包", "Funds flow ↔ wallet")}</h3>
                <p className={styles.rowMeta}>{t(zh, "业务钱包可以承载 stablecoin 收款和 RWA 托管草稿，但不能在文件缺失时自动放款。", "The business wallet can support stablecoin collection and RWA escrow drafts, but cannot auto-disburse while documents are missing.")}</p>
              </div>
              <span className={`${styles.statusChip} ${styles.statusMissing}`}>guarded</span>
            </div>
          </article>
          <article className={styles.listRow}>
            <div className={styles.rowHeader}>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{t(zh, "Agent 当前判断", "Current agent judgement")}</h3>
                <p className={styles.rowMeta}>{t(zh, "四流没有完全闭合：商流成立，信息流部分成立，物流缺入库和验收，资金流因此被卡。下一步不是 tokenization，而是补物流与验收事实。", "The four flows are not fully closed: commercial flow is formed, information flow is partial, logistics lacks warehouse and acceptance, so funds are blocked. The next step is not tokenization; it is closing logistics and acceptance facts.")}</p>
              </div>
              <span className={`${styles.statusChip} ${styles.statusHigh}`}>priority</span>
            </div>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/evidence">{t(zh, "补齐信息流", "Complete information flow")}</Link>
            <Link className="secondary-button" href="/tasks">{t(zh, "处理物流 / 验收", "Handle logistics / acceptance")}</Link>
            <Link className="secondary-button" href="/business-funds">{t(zh, "查看资金流", "View funds flow")}</Link>
            <Link className="secondary-button" href="/business-wallet">{t(zh, "查看钱包", "View wallet")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
