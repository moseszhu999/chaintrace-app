import Link from "next/link";
import type { TradeDocument } from "@/lib/concrete-trade-fixture";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";
import styles from "./WorkspaceViews.module.css";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function isTradeDocument(doc: TradeDocument | undefined): doc is TradeDocument {
  return Boolean(doc);
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article
      style={{
        border: "1px solid var(--border)",
        borderRadius: 28,
        padding: 22,
        minWidth: 0,
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 14,
        overflow: "hidden",
      }}
    >
      <span style={{ color: "#18794e", fontWeight: 900, fontSize: 14, lineHeight: 1.3 }}>{label}</span>
      <strong style={{ fontSize: "clamp(26px, 3vw, 38px)", lineHeight: 1.05, letterSpacing: "-0.04em", wordBreak: "break-word" }}>{value}</strong>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45, wordBreak: "break-word" }}>{note}</p>
    </article>
  );
}

export function FinancingView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { activeTrade } = workspace;
  const balance = activeTrade.payments.find((payment) => payment.id === "pay_balance");
  const deposit = activeTrade.payments.find((payment) => payment.id === "pay_deposit");
  const buyer = activeTrade.parties.find((party) => party.id === "party_buyer");
  const exporter = activeTrade.parties.find((party) => party.id === "party_exporter");
  const financier = activeTrade.parties.find((party) => party.id === "party_financier");
  const warehouse = activeTrade.parties.find((party) => party.id === "party_warehouse");
  const requiredDocs = ["doc_po", "doc_invoice", "doc_quality", "doc_bl", "doc_warehouse", "doc_acceptance"];
  const docs = requiredDocs
    .map((id) => activeTrade.documents.find((doc) => doc.id === id))
    .filter(isTradeDocument);
  const missingDocs = docs.filter((doc) => doc.status === "missing" || doc.status === "rejected");
  const uploadedButNotVerified = docs.filter((doc) => doc.status === "uploaded");
  const isRwaEligible = missingDocs.length === 0 && uploadedButNotVerified.length === 0;
  const estimatedAdvance = isRwaEligible ? "USD 29,500" : "USD 0";
  const tokenizationStatus = isRwaEligible ? t(zh, "可进入受限代币化", "Ready for restricted tokenization") : t(zh, "条件未满足", "Gated");

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "业务融资 / RWA Tokenization", "Business financing / RWA tokenization")}</span>
          <h2>{t(zh, "RWA 可以代币化，但必须先让应收账款 clean。", "RWA can be tokenized, but the receivable must be clean first.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.poNo} · {activeTrade.invoiceNo}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, alignItems: "stretch" }}>
          <MetricCard label={t(zh, "应收账款", "Receivable")} value={balance?.amount ?? "-"} note={t(zh, balance?.conditionZh ?? "等待付款条件", balance?.conditionEn ?? "Waiting for payment condition")} />
          <MetricCard label={t(zh, "已收款", "Collected")} value={deposit?.amount ?? "-"} note={deposit?.status ?? "-"} />
          <MetricCard label={t(zh, "融资状态", "Financing status")} value={t(zh, "仅可预审", "Pre-review only")} note={t(zh, "补齐后可正式提交", "Formal submission after gaps close")} />
          <MetricCard label={t(zh, "Tokenization", "Tokenization")} value={tokenizationStatus} note={t(zh, "非中国大陆业务；许可司法区；KYC/白名单/转让限制", "Non-mainland business; permitted jurisdiction; KYC, whitelist, transfer restrictions")} />
          <MetricCard label={t(zh, "建议融资额", "Suggested advance")} value={estimatedAdvance} note={t(zh, "缺口未补齐前为 0", "Zero until gaps close")} />
          <MetricCard label={t(zh, "资金方", "Financier")} value={financier?.name ?? "-"} note={financier?.email ?? "-"} />
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "RWA 事实矩阵", "RWA fact matrix")}</span>
          <h2>{t(zh, "代币不是事实本身，token 背后必须有可验证的四流事实。", "The token is not the fact itself; it must be backed by verifiable four-flow facts.")}</h2>
        </div>
        <div className={styles.list}>
          {docs.map((doc) => (
            <article className={styles.listRow} key={doc.id}>
              <div className={styles.rowHeader}>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{t(zh, doc.typeZh, doc.typeEn)} · {doc.documentNo}</h3>
                  <p className={styles.rowMeta}>{doc.fileName} · {doc.issuedAt} · {doc.hash ? `Hash: ${doc.hash}` : t(zh, "无 hash", "No hash")}</p>
                  <p className={styles.rowMeta}>{t(zh, doc.noteZh, doc.noteEn)}</p>
                </div>
                <span className={`${styles.statusChip} ${doc.status === "verified" ? styles.statusVerified : doc.status === "uploaded" ? styles.statusOpen : styles.statusRejected}`}>{doc.status}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "Tokenization 设计", "Tokenization design")}</span>
          <h2>{t(zh, "目标不是公开发币，而是受限、合规、可追索的应收账款 token。", "The goal is not a public coin offering, but a restricted, compliant, enforceable receivable token.")}</h2>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "可代币化资产", "Tokenizable asset")}</h3>
            <p className={styles.rowMeta}>{t(zh, "70% 尾款应收账款 USD 36,960。底层权利来自 PO、发票、提单、入库、买家验收和付款条款。", "The 70% balance receivable of USD 36,960. The underlying right comes from the PO, invoice, bill of lading, warehouse entry, buyer acceptance, and payment terms.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "发行边界", "Issuance boundary")}</h3>
            <p className={styles.rowMeta}>{t(zh, "不面向中国大陆，不做散户池，不承诺收益；只面向许可司法区的 KYC 资金方或合格投资人。", "No mainland-China offering, no retail pool, no promised yield; only KYC financiers or qualified investors in permitted jurisdictions.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "转让控制", "Transfer controls")}</h3>
            <p className={styles.rowMeta}>{t(zh, "token 必须白名单转让、记录持有人、支持冻结/赎回/到期销毁，并绑定链下法律文件。", "The token must use whitelist transfers, holder records, freeze/redemption/maturity burn, and an off-chain legal wrapper.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "当前 gating", "Current gating")}</h3>
            <p className={styles.rowMeta}>{t(zh, "入库确认缺失，买家验收缺失，提单签章仍待核验；因此可以设计 tokenization，但不能正式发行。", "Warehouse entry is missing, buyer acceptance is missing, and the bill-of-lading stamp is pending; tokenization can be designed, but issuance cannot start.")}</p>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/assistant">{t(zh, "生成 tokenization checklist", "Generate tokenization checklist")}</Link>
            <Link className="secondary-button" href="/evidence">{t(zh, "补齐文件", "Complete documents")}</Link>
            <Link className="secondary-button" href="/business-wallet">{t(zh, "查看钱包", "View wallet")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
