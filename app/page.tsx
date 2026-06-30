"use client";

import { useEffect, useState } from "react";
import { ClientReceivableConverter } from "@/components/ClientReceivableConverter";
import { PublicHeader } from "@/components/PublicHeader";
import { type Locale, normalizeLocale } from "@/lib/i18n";

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )chaintrace_locale=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

const tradeFlow = [
  {
    zh: "证据上传",
    en: "Evidence hashing",
    descZh: "浏览器本地读取 PO、发票、提单、仓库、质检和买家验收 PDF，生成 SHA-256。",
    descEn: "Read PO, invoice, B/L, warehouse, QC, and buyer-acceptance PDFs locally in the browser and generate SHA-256.",
  },
  {
    zh: "应收账款候选",
    en: "Receivable candidate",
    descZh: "把文件哈希、贸易 ID、尾款应收和垫款金额生成可签名的候选 JSON。",
    descEn: "Turn file hash, trade ID, balance receivable, and advance amount into a signable candidate JSON.",
  },
  {
    zh: "钱包签名",
    en: "Wallet signature",
    descZh: "出口商、物流、仓库、质检、买家和资金方只签自己负责的事实节点。",
    descEn: "Exporter, logistics provider, warehouse, QC, buyer, and financier sign only their own fact nodes.",
  },
  {
    zh: "链上预审",
    en: "On-chain pre-review",
    descZh: "LoanRequestRegistry 写入预审申请；Readiness、risk flags 和 blocker code 可被资金方读取。",
    descEn: "LoanRequestRegistry records the pre-review request; readiness, risk flags, and blocker code are readable by financiers.",
  },
  {
    zh: "合约执行",
    en: "Contract execution",
    descZh: "ReceivableLoan 检查 gate；条件未齐时阻断放款，条件齐备后才进入正式融资。",
    descEn: "ReceivableLoan checks gates; incomplete conditions block disbursement, complete gates allow formal financing flow.",
  },
];

const differentiationBlocks = [
  {
    titleZh: "前端本地处理 PDF",
    titleEn: "Browser-local PDF handling",
    textZh: "PDF 原文不进后端；浏览器生成哈希和候选 JSON，钱包签名后再写链上状态。",
    textEn: "Raw PDFs do not enter a backend; the browser creates hashes and candidate JSON, then wallet signatures write state on-chain.",
  },
  {
    titleZh: "智能合约减少执行摩擦",
    titleEn: "Contracts reduce execution friction",
    textZh: "签章、物流、贷款 gate 成为共享状态机；条件未齐时，合约自动阻断放款。",
    textEn: "Signing, logistics, and loan gates become a shared state machine; contracts block disbursement if conditions are incomplete.",
  },
  {
    titleZh: "中介退到高价值节点",
    titleEn: "Intermediaries move up-value",
    textZh: "银行和律所不再从零翻材料，而是审查授信、合规、法律结构、争议和重大例外。",
    textEn: "Banks and law firms stop starting from raw materials and focus on underwriting, compliance, legal structure, disputes, and material exceptions.",
  },
];

const evidencePulse = [
  { zh: "PO / 发票已读取", en: "PO / invoice parsed", state: "ok" },
  { zh: "提单最终状态待核验", en: "Final B/L pending", state: "wait" },
  { zh: "到港 QC 争议阻断", en: "Arrival QC blocked", state: "block" },
  { zh: "买家验收未闭合", en: "Buyer acceptance open", state: "block" },
];

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const zh = locale === "zh-CN";

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  return (
    <>
      <PublicHeader zh={zh} />
      <main className="page-shell">
        <section className="hero landing-hero">
          <div className="landing-grid">
            <div className="hero-copy">
              <div className="eyebrow">{t(zh, "ChainTrace · 前端 + 链上贸易融资协议", "ChainTrace · Frontend + on-chain trade-finance protocol")}</div>
              <h1>{t(zh, "把跨境贸易 PDF 变成链上可验证的应收账款融资候选。", "Turn cross-border trade PDFs into on-chain receivable financing candidates.")}</h1>
              <p>
                {t(
                  zh,
                  "PDF 在浏览器本地哈希，钱包签名把事实写入 TradeSigningRegistry、LogisticsEvidenceRegistry 和 LoanRequestRegistry。当前案例仍是 Pre-review only，gate 未齐时合约阻断正式放款。",
                  "PDFs are hashed locally in the browser, then wallet signatures write facts into TradeSigningRegistry, LogisticsEvidenceRegistry, and LoanRequestRegistry. The current case remains Pre-review only; contracts block formal disbursement while gates are incomplete.",
                )}
              </p>
              <div className="hero-actions">
                <a href="/agent" className="primary-button">{t(zh, "看 Agent 如何工作", "See ChainTrace Agent in action")}</a>
                <a href="/login" className="secondary-button">{t(zh, "登录进入工作台", "Login to workspace")}</a>
                <a href="#pdf-to-receivable" className="secondary-button">{t(zh, "试 PDF 转换", "Try PDF conversion")}</a>
              </div>
              <div className="hero-badges">
                <span className="badge-chip">Browser SHA-256</span>
                <span className="badge-chip">Wallet Signature</span>
                <span className="badge-chip">LoanRequestRegistry</span>
                <span className="badge-chip">Readiness 62/100</span>
                <span className="badge-chip">6/12 Gates</span>
                <span className="badge-chip">GATES_NOT_PASSED</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="signal-board viral-case-board">
                <div className="signal-board-header"><span>{t(zh, "当前交易", "Active trade")}</span><strong>VN-COFFEE-SG-2026-0007</strong></div>
                <div className="signal-card-grid">
                  <div className="mini-proof-card present"><span>{t(zh, "贸易金额", "Trade value")}</span><strong>USD 52,800</strong></div>
                  <div className="mini-proof-card present"><span>{t(zh, "申请垫款", "Advance")}</span><strong>USDC 29,500</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "贷款 Gate", "Loan gates")}</span><strong>6/12</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "融资状态", "Finance status")}</span><strong>{t(zh, "仅可预审", "Pre-review only")}</strong></div>
                </div>
                <div className="evidence-pulse-list">
                  {evidencePulse.map((item) => (
                    <div key={item.en} className={`evidence-pulse ${item.state}`}>
                      <span aria-hidden="true" />
                      <strong>{t(zh, item.zh, item.en)}</strong>
                    </div>
                  ))}
                </div>
                <div className="signal-status-box">
                  <span>{t(zh, "系统判断", "System decision")}</span>
                  <strong>Pre-review only · GATES_NOT_PASSED</strong>
                  <p>disbursementAllowed=false</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ClientReceivableConverter zh={zh} />

        <section id="product" className="panel product-showcase">
          <div className="section-heading">
            <span>{t(zh, "差异化", "Differentiation")}</span>
            <h2>{t(zh, "不是后端系统先收文件，而是前端生成证明、链上执行 gate。", "Not backend-first file intake, but frontend proof creation and on-chain gate execution.")}</h2>
            <p>{t(zh, "核心价值是同时压缩三类摩擦：PDF 证明摩擦、合约执行摩擦、中介重复核验摩擦。", "The core value is compressing three frictions at once: PDF proof creation, contract execution, and repetitive intermediary review.")}</p>
          </div>
          <div className="principles-grid">
            {differentiationBlocks.map((item) => (
              <article key={item.titleEn}>
                <strong>{t(zh, item.titleZh, item.titleEn)}</strong>
                <p>{t(zh, item.textZh, item.textEn)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="panel product-showcase">
          <div className="section-heading">
            <span>{t(zh, "产品旅程", "Product journey")}</span>
            <h2>{t(zh, "从贸易证据到融资判断，再到合约执行。", "From trade evidence to financing decision to contract execution.")}</h2>
            <p>{t(zh, "每一步都对应一个可演示视图：Agent 工作台、融资评分、专业审查、合约控制台。", "Each step maps to a demo view: Agent workbench, readiness score, professional review, and contract console.")}</p>
          </div>
          <div className="pack-step-grid">
            {tradeFlow.map((step, index) => (
              <article key={step.en} className="pack-step-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(zh, step.zh, step.en)}</strong>
                <p>{t(zh, step.descZh, step.descEn)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="security" className="clarity-strip">
          <article><span>{t(zh, "资金方", "Financier")}</span><strong>{t(zh, "看融资包、risk flags、approval conditions，而不是从零翻单证。", "Reviews financing pack, risk flags, and approval conditions instead of raw documents.")}</strong></article>
          <article><span>{t(zh, "银行 / 律所", "Bank / law firm")}</span><strong>{t(zh, "处理授信、合规、法律结构、争议和重大例外。", "Handles underwriting, compliance, legal structure, disputes, and material exceptions.")}</strong></article>
          <article><span>{t(zh, "合约执行", "Contract execution")}</span><strong>{t(zh, "gate 不通过，贷款合约不放款。", "If gates do not pass, the loan contract does not disburse.")}</strong></article>
        </section>

        <section className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">AI trade-finance evidence OS</span>
              <h3>{t(zh, "公开页负责传播，工作台负责处理业务。", "The public layer spreads the story; the workspace handles the work.")}</h3>
            </div>
            <div className="status-pill">Pre-review</div>
          </div>
          <dl className="proof-details">
            <div><dt>{t(zh, "Agent 体验", "Agent experience")}</dt><dd><a href="/agent" className="inline-link">/agent</a></dd></div>
            <div><dt>{t(zh, "登录入口", "Login entry")}</dt><dd><a href="/login" className="inline-link">/login</a></dd></div>
            <div><dt>{t(zh, "公开 API", "Public API")}</dt><dd><a href="/api/financing-pack" className="inline-link">/api/financing-pack</a></dd></div>
          </dl>
        </section>
      </main>
    </>
  );
}
