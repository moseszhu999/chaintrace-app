import Link from "next/link";
import { businessWallets, walletTransactions, type WalletTxStatus } from "@/lib/crypto-wallet-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusClass(status: WalletTxStatus) {
  const map: Record<WalletTxStatus, string> = {
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

export function WalletView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const businessWallet = businessWallets.find((wallet) => wallet.id === "wallet_ops_usdc_polygon");
  const escrowWallet = businessWallets.find((wallet) => wallet.id === "wallet_rwa_escrow_base");
  const confirmedAnchors = walletTransactions.filter((tx) => tx.direction === "anchor" && tx.status === "confirmed").length;
  const blockedDisbursement = walletTransactions.find((tx) => tx.id === "tx_rwa_disbursement_draft");
  const usdcBalance = businessWallet?.balances.find((item) => item.asset === "USDC")?.usdValue ?? "USD 0";

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "业务 Crypto 钱包", "Business crypto wallet")}</span>
          <h2>{t(zh, "钱包用于 stablecoin 收款、RWA 托管和证明锚定，不是投资入口。", "Wallets are for stablecoin collection, RWA escrow, and proof anchoring — not an investment entry.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.poNo} · {activeTrade.invoiceNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <MetricCard label="USDC" value={usdcBalance} note={t(zh, "业务收款钱包余额", "Business collection wallet balance")} />
          <MetricCard label={t(zh, "链上证明", "Proof anchors")} value={`${confirmedAnchors}`} note={t(zh, "已锚定文件包 hash，不公开原文", "Anchored file-pack hashes; raw files are not public")} />
          <MetricCard label={t(zh, "RWA 托管", "RWA escrow")} value={escrowWallet?.balances.find((item) => item.asset === "USDC")?.usdValue ?? "USD 0"} note={t(zh, "未满足条件前不放款", "No disbursement before conditions are met")} />
          <MetricCard label={t(zh, "放款草稿", "Disbursement draft")} value={blockedDisbursement?.usdValue ?? "-"} note={t(zh, "入库和验收缺失，状态 blocked", "Warehouse and acceptance missing; status blocked")} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "钱包列表", "Wallets")}</span>
          <h2>{t(zh, "每个钱包都要有用途、托管方式和签名权限。", "Each wallet needs purpose, custody model, and signing permissions.")}</h2>
        </div>
        <div className={styles.list}>
          {businessWallets.map((wallet) => (
            <article className={styles.listRow} key={wallet.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, wallet.nameZh, wallet.nameEn)} · {wallet.network}</h3>
                  <p className={styles.rowMeta}>{wallet.address}</p>
                  <p className={styles.rowMeta}>{t(zh, wallet.custodyZh, wallet.custodyEn)}</p>
                  <p className={styles.rowMeta}>{t(zh, wallet.policyZh, wallet.policyEn)}</p>
                </div>
                <span className={`${styles.statusChip} ${wallet.type === "business" ? styles.statusVerified : styles.statusOpen}`}>{wallet.type}</span>
              </div>
              <div className={styles.rowActions}>
                {wallet.balances.map((balance) => <span key={`${wallet.id}-${balance.asset}`} className="secondary-button">{balance.asset}: {balance.usdValue}</span>)}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "钱包交易", "Wallet transactions")}</span>
          <h2>{t(zh, "Agent 可以准备交易，但关键动作必须人工签名。", "The agent can prepare transactions, but critical actions require human signing.")}</h2>
        </div>
        <div className={styles.list}>
          {walletTransactions.map((tx) => (
            <article className={styles.listRow} key={tx.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, tx.titleZh, tx.titleEn)} · {tx.amount} {tx.asset}</h3>
                  <p className={styles.rowMeta}>{t(zh, tx.counterpartyZh, tx.counterpartyEn)} · {tx.usdValue} · {tx.txHash ? `Tx: ${tx.txHash}` : t(zh, "未上链", "Not on-chain")}</p>
                  <p className={styles.rowMeta}>{t(zh, tx.noteZh, tx.noteEn)}</p>
                </div>
                <span className={statusClass(tx.status)}>{tx.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "权限边界", "Permission boundary")}</span>
          <h2>{t(zh, "ChainTrace 不能替用户签名。", "ChainTrace must not sign for the user.")}</h2>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "可以做", "Allowed")}</h3>
            <p className={styles.rowMeta}>{t(zh, "读取余额、生成收款地址、准备 stablecoin 收款请求、锚定 proof pack hash、准备 RWA 放款草稿。", "Read balances, generate collection addresses, prepare stablecoin requests, anchor proof-pack hashes, and draft RWA disbursements.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "不能做", "Not allowed")}</h3>
            <p className={styles.rowMeta}>{t(zh, "不能保管私钥，不能自动转账，不能绕过老板/财务审批，不能把钱包做成散户投资池。", "Cannot custody private keys, auto-transfer, bypass owner/finance approval, or turn the wallet into a retail investment pool.")}</p>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/business-funds">{t(zh, "回到资金管理", "Back to funds")}</Link>
            <Link className="secondary-button" href="/business-financing">{t(zh, "融资 / RWA", "Financing / RWA")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
