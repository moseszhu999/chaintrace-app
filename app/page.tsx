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
    zh: "交易建档",
    en: "Deal setup",
    descZh: "记录买家、供应商、订单、金额、交付条件和付款节点。",
    descEn: "Capture buyer, supplier, order, amount, delivery terms, and payment milestones.",
  },
  {
    zh: "文件补齐",
    en: "Document completion",
    descZh: "把合同、订单、发票、提单、质检、冷链、入库、验收放到交易对象下。",
    descEn: "Attach contract, order, invoice, bill of lading, inspection, cold-chain, warehouse, and acceptance records to the deal.",
  },
  {
    zh: "履约闭环",
    en: "Fulfillment closure",
    descZh: "跟踪发货、清关、入库、交付和验收，不让关键环节卡在聊天记录里。",
    descEn: "Track shipment, customs, warehouse entry, delivery, and acceptance without burying blockers in chat.",
  },
  {
    zh: "收款 / 融资准备",
    en: "Collection / financing readiness",
    descZh: "根据事实链判断能不能催款、能不能给资金方看、还缺什么。",
    descEn: "Use the fact trail to judge whether to collect, share with financiers, and identify remaining gaps.",
  },
  {
    zh: "选择性证明",
    en: "Selective proof",
    descZh: "对外只暴露状态、哈希和必要元数据，不把商业机密全公开。",
    descEn: "Expose only status, hashes, and necessary metadata externally, not all business secrets.",
  },
];

const differentiationBlocks = [
  {
    titleZh: "不是飞书",
    titleEn: "Not Feishu",
    textZh: "不做通用聊天、会议、文档协作。ChainTrace 只围绕跨公司交易闭环。",
    textEn: "Not generic chat, meetings, or document collaboration. ChainTrace focuses on cross-company trade closure.",
  },
  {
    titleZh: "不是 ERP",
    titleEn: "Not ERP",
    textZh: "不替代库存、财务总账和内部流程；只抓交易对外可信所需的关键事实。",
    textEn: "Not inventory, general ledger, or internal process replacement; it captures facts needed for external trust.",
  },
  {
    titleZh: "不是单纯溯源",
    titleEn: "Not only traceability",
    textZh: "溯源只是证据能力之一，最终目标是验收、收款、融资、理赔和减少纠纷。",
    textEn: "Traceability is one evidence capability; the goal is acceptance, collection, financing, claims, and fewer disputes.",
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
              <div className="eyebrow">{t(zh, "ChainTrace · 小微企业交易 Sidecar", "ChainTrace · SME trade sidecar")}</div>
              <h1>{t(zh, "从订单到收款，把每一笔生意做完。", "From order to collection, finish every trade.")}</h1>
              <p>
                {t(
                  zh,
                  "ChainTrace 不是飞书式协作工具，而是小微企业跨公司交易 Sidecar。它围绕订单、发票、物流、验收、收款和融资，帮企业发现缺口、催办责任方、准备选择性证明，让买家、资金方和合作伙伴更容易相信你。",
                  "ChainTrace is not another collaboration suite. It is a cross-company trade sidecar for SMEs. Around orders, invoices, logistics, acceptance, collection, and financing, it finds gaps, nudges owners, prepares selective proof, and helps buyers, financiers, and partners trust you.",
                )}
              </p>
              <div className="hero-actions">
                <a href="/business-ops" className="primary-button">{t(zh, "打开交易 Sidecar", "Open trade sidecar")}</a>
                <a href="/login" className="secondary-button">{t(zh, "登录", "Login")}</a>
                <a href="/verify/uy-beef-cn-2026-0001" className="secondary-button">{t(zh, "查看选择性证明", "View selective proof")}</a>
              </div>
              <div className="hero-badges">
                <span className="badge-chip">Deal</span>
                <span className="badge-chip">Invoice</span>
                <span className="badge-chip">Fulfillment</span>
                <span className="badge-chip">Acceptance</span>
                <span className="badge-chip">Receivable</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="signal-board">
                <div className="signal-board-header"><span>{t(zh, "当前交易", "Active deal")}</span><strong>UY-BEEF-CN-2026-0001</strong></div>
                <div className="signal-card-grid">
                  <div className="mini-proof-card present"><span>{t(zh, "订单", "Order")}</span><strong>{t(zh, "已确认", "Confirmed")}</strong></div>
                  <div className="mini-proof-card present"><span>{t(zh, "发票", "Invoice")}</span><strong>{t(zh, "已齐", "Ready")}</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "入库", "Warehouse")}</span><strong>{t(zh, "缺失", "Missing")}</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "验收", "Acceptance")}</span><strong>{t(zh, "待确认", "Open")}</strong></div>
                </div>
                <div className="signal-status-box">
                  <span>{t(zh, "Sidecar 建议", "Sidecar advice")}</span>
                  <strong>{t(zh, "先补入库和买家验收，再进入催款 / 融资。", "Complete warehouse entry and buyer acceptance before collection / financing.")}</strong>
                  <p>{t(zh, "这不是内部协作提醒，而是影响收款和融资的交易事实缺口。", "This is not an internal collaboration reminder; it is a trade-fact gap that affects collection and financing.")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="panel product-showcase">
          <div className="section-heading">
            <span>{t(zh, "差异化", "Differentiation")}</span>
            <h2>{t(zh, "ChainTrace 不做办公协作，做跨公司交易可信闭环。", "ChainTrace does not do office collaboration; it closes cross-company trades with trust.")}</h2>
            <p>{t(zh, "飞书解决公司内部怎么协作；ChainTrace 解决小微企业对外怎么被相信、怎么验收、怎么收款、怎么融资。", "Feishu solves internal collaboration; ChainTrace helps SMEs be trusted externally, get acceptance, collect, and prepare financing.")}</p>
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
            <span>{t(zh, "交易流程", "Trade flow")}</span>
            <h2>{t(zh, "核心不是任务管理，而是把交易推进到验收和收款。", "The core is not task management; it is moving the trade to acceptance and collection.")}</h2>
            <p>{t(zh, "任务、AI、审批都是辅助，主对象永远是交易事实。", "Tasks, AI, and approvals are helpers; the main object is always trade facts.")}</p>
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
          <article><span>{t(zh, "对外结果", "External outcome")}</span><strong>{t(zh, "买家验收更快，资金方更容易初审，合作伙伴更容易相信交易事实。", "Buyers accept faster, financiers can pre-review more easily, and partners can trust trade facts.")}</strong></article>
          <article><span>{t(zh, "最小披露", "Minimal disclosure")}</span><strong>{t(zh, "只分享状态、哈希和必要元数据，不公开原始合同和商业机密。", "Share only status, hashes, and necessary metadata, not raw contracts or trade secrets.")}</strong></article>
          <article><span>{t(zh, "人工确认", "Human approval")}</span><strong>{t(zh, "催款、融资、验收、理赔和法律责任不能由 AI 自动决定。", "AI cannot automatically decide collection, financing, acceptance, claims, or legal responsibility.")}</strong></article>
        </section>

        <section className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">Trade Sidecar</span>
              <h3>{t(zh, "下一步从交易 Sidecar 开始，而不是从通用工作台开始。", "Start from the trade sidecar, not a generic workspace.")}</h3>
            </div>
            <div className="status-pill">SME</div>
          </div>
          <dl className="proof-details">
            <div><dt>{t(zh, "交易 Sidecar", "Trade sidecar")}</dt><dd><a href="/business-ops" className="inline-link">/business-ops</a></dd></div>
            <div><dt>{t(zh, "登录", "Login")}</dt><dd><a href="/login" className="inline-link">/login</a></dd></div>
            <div><dt>{t(zh, "选择性证明", "Selective proof")}</dt><dd><a href="/verify/uy-beef-cn-2026-0001" className="inline-link">/verify/uy-beef-cn-2026-0001</a></dd></div>
          </dl>
        </section>
      </main>
    </>
  );
}
