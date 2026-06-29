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

  return (
    <section className="workspace">
      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "业务融资 / RWA", "Business financing / RWA")}</span>
          <h2>{t(zh, "先做应收账款融资资格判断，不急着 tokenization。", "Judge receivable-financing eligibility before tokenization.")}</h2>
          <p>{t(zh, activeTrade.titleZh, activeTrade.titleEn)} · {activeTrade.poNo} · {activeTrade.invoiceNo}</p>
        </div>
        <div className="pack-step-grid">
          <article className="pack-step-card"><span>{t(zh, "应收账款", "Receivable")}</span><strong>{balance?.amount ?? "-"}</strong><p>{t(zh, balance?.conditionZh ?? "等待付款条件", balance?.conditionEn ?? "Waiting for payment condition")}</p></article>
          <article className="pack-step-card"><span>{t(zh, "已收款", "Collected")}</span><strong>{deposit?.amount ?? "-"}</strong><p>{deposit?.status ?? "-"}</p></article>
          <article className="pack-step-card"><span>{t(zh, "融资状态", "Financing status")}</span><strong>{t(zh, "仅可预审", "Pre-review only")}</strong><p>{t(zh, "不能正式提交", "Not ready for formal submission")}</p></article>
          <article className="pack-step-card"><span>{t(zh, "RWA 资格", "RWA eligibility")}</span><strong>{isRwaEligible ? t(zh, "可进入准备", "Preparation ready") : t(zh, "暂不合格", "Not eligible yet")}</strong><p>{missingDocs.length + uploadedButNotVerified.length} {t(zh, "个阻塞条件", "blocking conditions")}</p></article>
          <article className="pack-step-card"><span>{t(zh, "建议融资额", "Suggested advance")}</span><strong>{estimatedAdvance}</strong><p>{t(zh, "缺口未补齐前为 0", "Zero until gaps close")}</p></article>
          <article className="pack-step-card"><span>{t(zh, "资金方", "Financier")}</span><strong>{financier?.name ?? "-"}</strong><p>{financier?.email ?? "-"}</p></article>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <span>{t(zh, "RWA 事实矩阵", "RWA fact matrix")}</span>
          <h2>{t(zh, "资金方要看的不是聊天记录，而是这笔应收账款是否 clean。", "Financiers need to know whether this receivable is clean, not read chat logs.")}</h2>
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
          <span>{t(zh, "Agent 判断", "Agent judgement")}</span>
          <h2>{t(zh, "当前不能做正式 RWA tokenization，只能做资金方预审。", "This is not ready for formal RWA tokenization; only financier pre-review is appropriate.")}</h2>
        </div>
        <div className={styles.list}>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "为什么暂不合格", "Why not eligible yet")}</h3>
            <p className={styles.rowMeta}>{t(zh, "入库确认缺失，买家验收缺失，提单签章仍待核验；尾款触发条件没有满足，应收账款还不够 clean。", "Warehouse entry is missing, buyer acceptance is missing, and the bill of lading stamp is still pending; the balance trigger is not satisfied, so the receivable is not clean enough.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "补齐后可以做什么", "What becomes possible after gaps close")}</h3>
            <p className={styles.rowMeta}>{t(zh, "生成 receivable financing pack，把融资包 hash 上链，记录资金方查看日志，再考虑 stablecoin 结算或对接 RWA/private credit 平台。", "Generate a receivable financing pack, anchor its hash on-chain, log financier access, then consider stablecoin settlement or RWA/private-credit integrations.")}</p>
          </article>
          <article className={styles.listRow}>
            <h3 className={styles.rowTitle}>{t(zh, "交易主体", "Trade parties")}</h3>
            <p className={styles.rowMeta}>{t(zh, "出口商：", "Exporter: ")}{exporter?.name} · {t(zh, "买家：", "Buyer: ")}{buyer?.name} · {t(zh, "仓库：", "Warehouse: ")}{warehouse?.name}</p>
          </article>
          <div className={styles.rowActions}>
            <Link className="primary-button" href="/assistant">{t(zh, "生成融资 Agent 动作", "Generate financing-agent actions")}</Link>
            <Link className="secondary-button" href="/evidence">{t(zh, "补齐文件", "Complete documents")}</Link>
            <Link className="secondary-button" href="/tasks">{t(zh, "查看阻塞任务", "View blockers")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
