"use client";

import { useEffect, useState } from "react";
import { type Locale, normalizeLocale } from "@/lib/i18n";

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )chaintrace_locale=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}

const usageSteps = [
  {
    zh: "1. 登录并选择角色",
    en: "1. Login and choose role",
    descZh: "供应商、贸易商、进口商、买家、资金方进入后看到不同任务。",
    descEn: "Suppliers, traders, importers, buyers, and financiers see different tasks after login.",
    href: "/app-demo",
  },
  {
    zh: "2. 选择场景并创建证明包",
    en: "2. Choose scenario and create proof pack",
    descZh: "选择跨境食品、应收账款、冷链责任等场景，系统自动生成证据槽。",
    descEn: "Choose food import, receivable financing, cold-chain responsibility, etc.; the system generates evidence slots.",
    href: "/customer-workspace",
  },
  {
    zh: "3. 上传或补齐证据",
    en: "3. Upload or complete evidence",
    descZh: "订单、发票、发货、质检、交付、验收都落入对应证据槽。",
    descEn: "Order, invoice, shipment, inspection, delivery, and acceptance fill their evidence slots.",
    href: "/evidence-library",
  },
  {
    zh: "4. 系统生成任务和风险",
    en: "4. System generates tasks and risks",
    descZh: "缺什么、谁负责、影响付款/清关/融资/验收，一眼看清。",
    descEn: "See what is missing, who owns it, and whether it affects payment, customs, financing, or acceptance.",
    href: "/tasks",
  },
  {
    zh: "5. 生成公开验证链接",
    en: "5. Generate public verification link",
    descZh: "买家、资金方、审计方不用登录，也能看公开状态、哈希和必要元数据。",
    descEn: "Buyers, financiers, and auditors can view public status, hashes, and necessary metadata without login.",
    href: "/verify/uy-beef-cn-2026-0001",
  },
];

const userCards = [
  {
    zh: "小工厂 / 供应商",
    en: "Small factory / supplier",
    painZh: "货做完了、发了，但证据散在微信、邮箱、Excel 里。",
    painEn: "Goods are produced and shipped, but proof is scattered across chat, email, and Excel.",
    valueZh: "把履约证据整理成证明包，更快收款、少扯皮。",
    valueEn: "Turn fulfillment proof into a proof pack, collect faster, and reduce disputes.",
  },
  {
    zh: "贸易商 / 进口商",
    en: "Trader / importer",
    painZh: "上下游文件太多，不知道这票货卡在哪。",
    painEn: "Too many upstream/downstream documents; hard to know where a shipment is blocked.",
    valueZh: "一眼看到 Missing / Ready、责任方和下一步动作。",
    valueEn: "See Missing / Ready, owners, and next actions at a glance.",
  },
  {
    zh: "买家 / 资金方",
    en: "Buyer / financier",
    painZh: "不想反复要文件，也不敢只看发票判断交易。",
    painEn: "They do not want repeated document chasing and cannot rely on invoices alone.",
    valueZh: "打开一个链接先看事实完整度，再决定验收、付款或融资。",
    valueEn: "Open one link to check fact completeness before acceptance, payment, or financing.",
  },
  {
    zh: "AI Agent / 企业系统",
    en: "AI Agent / enterprise system",
    painZh: "Agent 不能靠猜 PDF 协作，需要结构化事实状态。",
    painEn: "Agents cannot collaborate by guessing PDFs; they need structured fact status.",
    valueZh: "读取 ProofPack、Evidence、RiskGap、Task，自动提醒和推动补证。",
    valueEn: "Read ProofPack, Evidence, RiskGap, and Task to remind and drive evidence completion.",
  },
];

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const zh = locale === "zh-CN";

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "ChainTrace · 供应链事实工作台" : "ChainTrace · Supply Chain Fact Workspace"}</div>
            <h1>{zh ? "登录后，从一票货开始补证据、看风险、发验证链接。" : "After login, start from one shipment: complete evidence, see risks, and share a verification link."}</h1>
            <p>
              {zh
                ? "ChainTrace 帮小企业把订单、发票、发货、质检、交付、验收这些关键节点，变成可操作的证明包和可分享的事实状态。不是先讲区块链，而是先让用户少扯皮、快验证、能收款。"
                : "ChainTrace turns order, invoice, shipment, inspection, delivery, and acceptance into operable proof packs and shareable fact status. It does not lead with blockchain; it helps users reduce disputes, verify faster, and collect better."}
            </p>
            <div className="hero-actions">
              <a href="/app-demo" className="primary-button">{zh ? "打开 App Demo" : "Open App Demo"}</a>
              <a href="/customer-workspace" className="secondary-button">{zh ? "进入客户工作台" : "Open customer workspace"}</a>
              <a href="/scenario-flow" className="secondary-button">{zh ? "看登录后流程" : "See post-login flow"}</a>
              <a href="/verify/uy-beef-cn-2026-0001" className="secondary-button">{zh ? "查看公开验证页" : "View public verify"}</a>
            </div>
            <div className="hero-badges">
              <span className="badge-chip">{zh ? "登录后工作流" : "Post-login workflow"}</span>
              <span className="badge-chip">Ready / Missing evidence</span>
              <span className="badge-chip">{zh ? "任务 + 风险 + 分享" : "Tasks + Risks + Sharing"}</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="atmosphere-orb orb-one" />
            <div className="atmosphere-orb orb-two" />
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "客户登录后" : "After customer login"}</span><strong>UY-BEEF-CN-2026-0001</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "订单" : "Order"}</span><strong>{zh ? "已验证" : "Verified"}</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "发货" : "Shipment"}</span><strong>{zh ? "已上传" : "Present"}</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "入库" : "Warehouse"}</span><strong>{zh ? "待补" : "Missing"}</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "验收" : "Acceptance"}</span><strong>{zh ? "待补" : "Missing"}</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "当前状态" : "Current status"}</span><strong>Missing evidence</strong><p>{zh ? "补齐入库和验收后，这票货才能 Ready，并生成对外验证链接。" : "Add warehouse entry and acceptance before this shipment becomes Ready and shareable."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "如何使用 ChainTrace" : "How to use ChainTrace"}</span>
          <h2>{zh ? "从首页就能进入真实操作路径。" : "The homepage now leads directly into the real operating path."}</h2>
          <p>{zh ? "用户不需要先理解架构，先按这 5 步完成一票货的证明闭环。" : "Users do not need to understand the architecture first; they follow these five steps to close one shipment's proof loop."}</p>
        </div>
        <div className="pack-step-grid">
          {usageSteps.map((step) => (
            <a key={step.en} href={step.href} className="pack-step-card">
              <span>{zh ? step.zh : step.en}</span>
              <strong>{zh ? step.descZh : step.descEn}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="clarity-strip">
        <article><span>{zh ? "用户痛点" : "User pain"}</span><strong>{zh ? "证据散乱，交易卡住，责任不清。" : "Scattered evidence, blocked trade, unclear responsibility."}</strong></article>
        <article><span>{zh ? "ChainTrace 做什么" : "What ChainTrace does"}</span><strong>{zh ? "把缺证变成任务，把证据变成状态。" : "Turn gaps into tasks and evidence into status."}</strong></article>
        <article><span>{zh ? "最后产出" : "Final output"}</span><strong>{zh ? "证明包 + 风险看板 + 公开验证链接。" : "Proof pack + risk dashboard + public verification link."}</strong></article>
      </section>

      <section className="audience-grid">
        {userCards.map((card) => (
          <article key={card.en} className="audience-card">
            <strong>{zh ? card.zh : card.en}</strong>
            <p><b>{zh ? "痛点：" : "Pain: "}</b>{zh ? card.painZh : card.painEn}</p>
            <p><b>{zh ? "价值：" : "Value: "}</b>{zh ? card.valueZh : card.valueEn}</p>
          </article>
        ))}
      </section>

      <section className="panel proof-card public-proof-card">
        <div className="proof-card-header">
          <div>
            <span className="proof-type">{zh ? "第一入口" : "Primary entry"}</span>
            <h3>{zh ? "先打开 App Demo，看客户登录后怎么实际操作。" : "Open the App Demo first to see how customers actually operate after login."}</h3>
          </div>
          <div className="status-pill">App Demo</div>
        </div>
        <dl className="proof-details">
          <div><dt>{zh ? "演示入口" : "Demo entry"}</dt><dd><a href="/app-demo" className="inline-link">/app-demo</a></dd></div>
          <div><dt>{zh ? "流程说明" : "Flow guide"}</dt><dd><a href="/scenario-flow" className="inline-link">/scenario-flow</a></dd></div>
          <div><dt>{zh ? "外部验证" : "External verification"}</dt><dd><a href="/verify/uy-beef-cn-2026-0001" className="inline-link">/verify/uy-beef-cn-2026-0001</a></dd></div>
        </dl>
      </section>
    </main>
  );
}
