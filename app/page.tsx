"use client";

import { useEffect, useState } from "react";
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
    en: "Evidence upload",
    descZh: "上传 PO、发票、装箱、VGM、报关、仓库、质检和买家验收材料。",
    descEn: "Upload PO, invoice, packing, VGM, customs, warehouse, QC, and buyer-acceptance materials.",
  },
  {
    zh: "Agent 初筛",
    en: "Agent pre-check",
    descZh: "AI Agent 自动分类单证、抽取关键字段、匹配签章和物流 gate。",
    descEn: "AI agents classify documents, extract key fields, and match signing/logistics gates.",
  },
  {
    zh: "缺口催办",
    en: "Gap chasing",
    descZh: "系统生成缺口清单、责任方、催办话术和下一步动作。",
    descEn: "The system generates gap lists, responsible parties, follow-up language, and next actions.",
  },
  {
    zh: "融资预审",
    en: "Financing pre-review",
    descZh: "输出 Readiness Score、Financing Pack、风险 flags 和资金方 memo。",
    descEn: "Output Readiness Score, Financing Pack, risk flags, and financier memo.",
  },
  {
    zh: "合约执行",
    en: "Contract execution",
    descZh: "智能合约检查 gate，条件未齐时阻断放款，减少人工复核摩擦。",
    descEn: "Smart contracts check gates and block disbursement when conditions are incomplete.",
  },
];

const differentiationBlocks = [
  {
    titleZh: "AI Agent 减少证据摩擦",
    titleEn: "Agents reduce evidence friction",
    textZh: "Agent 替代人工翻 PDF、抽字段、对 checklist、写 memo 初稿和催办缺口。",
    textEn: "Agents replace manual PDF reading, field extraction, checklist matching, memo drafting, and gap chasing.",
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
              <div className="eyebrow">{t(zh, "ChainTrace · AI Agent 驱动的贸易融资证据操作系统", "ChainTrace · AI-agent-driven trade-finance evidence OS")}</div>
              <h1>{t(zh, "把跨境贸易 PDF 变成可融资应收账款。", "Turn cross-border trade PDFs into finance-ready receivables.")}</h1>
              <p>
                {t(
                  zh,
                  "ChainTrace 用 AI Agent 整理贸易证据，用智能合约锁定 gate 状态，让资金方、银行和律所只审查关键例外，而不是从零翻一堆 PDF。当前案例是越南罗布斯塔咖啡出口新加坡：USD 36,960 尾款被质检和验收卡住，系统判断仅可预审，不能正式放款。",
                  "ChainTrace uses AI agents to organize trade evidence and smart contracts to lock gate states, so financiers, banks, and law firms review key exceptions instead of reading raw PDFs from scratch. The current case is Vietnam Robusta coffee exported to Singapore: a USD 36,960 balance is blocked by QC and acceptance, so the system allows pre-review only, not formal disbursement.",
                )}
              </p>
              <div className="hero-actions">
                <a href="/agent" className="primary-button">{t(zh, "看 Agent 如何工作", "See ChainTrace Agent in action")}</a>
                <a href="/business-readiness" className="secondary-button">{t(zh, "查看融资评分", "View readiness score")}</a>
                <a href="/api/financing-pack" className="secondary-button">{t(zh, "打开融资包 API", "Open financing-pack API")}</a>
              </div>
              <div className="hero-badges">
                <span className="badge-chip">Evidence Agent</span>
                <span className="badge-chip">Gate Agent</span>
                <span className="badge-chip">Readiness 62/100</span>
                <span className="badge-chip">6/12 Gates</span>
                <span className="badge-chip">GATES_NOT_PASSED</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="signal-board">
                <div className="signal-board-header"><span>{t(zh, "当前交易", "Active trade")}</span><strong>VN-COFFEE-SG-2026-0007</strong></div>
                <div className="signal-card-grid">
                  <div className="mini-proof-card present"><span>{t(zh, "贸易金额", "Trade value")}</span><strong>USD 52,800</strong></div>
                  <div className="mini-proof-card present"><span>{t(zh, "申请垫款", "Advance")}</span><strong>USDC 29,500</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "贷款 Gate", "Loan gates")}</span><strong>6/12</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "融资状态", "Finance status")}</span><strong>{t(zh, "仅可预审", "Pre-review only")}</strong></div>
                </div>
                <div className="signal-status-box">
                  <span>{t(zh, "系统判断", "System decision")}</span>
                  <strong>{t(zh, "到港 QC、仓库回执、买家验收未闭合；禁止正式放款。", "Arrival QC, warehouse receipt, and buyer acceptance remain open; formal disbursement is blocked.")}</strong>
                  <p>{t(zh, "AI Agent 负责整理和催办，智能合约负责 gate 检查和放款阻断。", "AI agents organize and chase evidence; smart contracts enforce gate checks and disbursement blocking.")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="panel product-showcase">
          <div className="section-heading">
            <span>{t(zh, "差异化", "Differentiation")}</span>
            <h2>{t(zh, "不是协作工具，不是简单溯源，而是融资证据操作系统。", "Not collaboration software, not simple traceability, but a trade-finance evidence OS.")}</h2>
            <p>{t(zh, "核心价值是同时压缩三类摩擦：证据整理摩擦、合约执行摩擦、中介重复核验摩擦。", "The core value is compressing three frictions at once: evidence operations, contract execution, and repetitive intermediary review.")}</p>
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
              <h3>{t(zh, "先看公开 Agent 体验，再进入操作员工作台。", "Start with the public Agent experience, then enter the operator workspace.")}</h3>
            </div>
            <div className="status-pill">Pre-review</div>
          </div>
          <dl className="proof-details">
            <div><dt>{t(zh, "Agent 体验", "Agent experience")}</dt><dd><a href="/agent" className="inline-link">/agent</a></dd></div>
            <div><dt>{t(zh, "融资评分", "Readiness score")}</dt><dd><a href="/business-readiness" className="inline-link">/business-readiness</a></dd></div>
            <div><dt>{t(zh, "专业审查", "Professional review")}</dt><dd><a href="/business-professional-review" className="inline-link">/business-professional-review</a></dd></div>
          </dl>
        </section>
      </main>
    </>
  );
}
