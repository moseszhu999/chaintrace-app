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

const workflow = [
  {
    zh: "登录 / 选择组织角色",
    en: "Login / choose org and role",
    descZh: "不同角色看到不同证明包、任务、审批和公开链接。",
    descEn: "Different roles see different proof packs, tasks, approvals, and public links.",
  },
  {
    zh: "创建证明包",
    en: "Create proof pack",
    descZh: "围绕一票货、一个订单或一笔应收账款创建事实锚点。",
    descEn: "Create a fact anchor around one shipment, order, or receivable.",
  },
  {
    zh: "补证据 / 生成任务",
    en: "Complete evidence / generate tasks",
    descZh: "系统把缺失的入库、验收、质检、冷链等证据变成责任方任务。",
    descEn: "The system turns missing warehouse, acceptance, inspection, and cold-chain evidence into owner tasks.",
  },
  {
    zh: "助手建议 / 人工审批",
    en: "Assistant suggestion / human approval",
    descZh: "AI 可生成草稿和下一步建议，但发送、融资、验收等动作必须确认。",
    descEn: "AI can draft and suggest next steps, but sending, financing, and acceptance actions require confirmation.",
  },
  {
    zh: "公开验证链接",
    en: "Public verification link",
    descZh: "外部买家、资金方、审计方不用登录也能查看公开状态、哈希和必要元数据。",
    descEn: "External buyers, financiers, and auditors can see public status, hashes, and necessary metadata without login.",
  },
];

const productBlocks = [
  {
    titleZh: "证明包工作台",
    titleEn: "Proof pack workspace",
    textZh: "把订单、发票、装柜、质检、冷链、入库、验收放进同一个业务对象。",
    textEn: "Put order, invoice, loading, inspection, cold chain, warehouse entry, and acceptance into one business object.",
  },
  {
    titleZh: "客户上下文助手",
    titleEn: "Customer-context assistant",
    textZh: "像理解项目一样理解客户：常做什么贸易、历史缺什么、当前卡在哪、下一步找谁。",
    textEn: "Understand the customer like a project: common trades, historical gaps, current blockers, and whom to chase next.",
  },
  {
    titleZh: "任务与审批",
    titleEn: "Tasks and approvals",
    textZh: "缺口自动变任务；AI 建议自动变草稿；关键商业动作必须人工确认。",
    textEn: "Gaps become tasks; AI suggestions become drafts; key commercial actions require human approval.",
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
              <div className="eyebrow">{t(zh, "ChainTrace · 供应链事实 SaaS", "ChainTrace · Supply Chain Fact SaaS")}</div>
              <h1>{t(zh, "让一票货的事实、任务和下一步都清楚。", "Make every shipment's facts, tasks, and next steps clear.")}</h1>
              <p>
                {t(
                  zh,
                  "ChainTrace 是给小供应商、贸易商、进口商、买家和资金方使用的供应链事实工作台。登录前，用户理解它能解决什么；登录后，用户直接处理证明包、缺证任务、AI 草稿、审批和公开验证链接。",
                  "ChainTrace is a supply-chain fact workspace for small suppliers, traders, importers, buyers, and financiers. Before login, users understand what it solves; after login, they work directly with proof packs, missing-evidence tasks, AI drafts, approvals, and public verification links.",
                )}
              </p>
              <div className="hero-actions">
                <a href="/login" className="primary-button">{t(zh, "登录进入工作台", "Login to workspace")}</a>
                <a href="/dashboard" className="secondary-button">{t(zh, "直接看登录后效果", "View logged-in demo")}</a>
                <a href="/verify/uy-beef-cn-2026-0001" className="secondary-button">{t(zh, "查看公开验证页", "View public verification")}</a>
              </div>
              <div className="hero-badges">
                <span className="badge-chip">ProofPack</span>
                <span className="badge-chip">EvidenceSlot</span>
                <span className="badge-chip">Task / Approval</span>
                <span className="badge-chip">Customer Memory</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="signal-board">
                <div className="signal-board-header"><span>{t(zh, "登录后首页", "Logged-in home")}</span><strong>UY-BEEF-CN-2026-0001</strong></div>
                <div className="signal-card-grid">
                  <div className="mini-proof-card present"><span>{t(zh, "已验证", "Verified")}</span><strong>3/5</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "缺口", "Gaps")}</span><strong>2</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "任务", "Tasks")}</span><strong>5</strong></div>
                  <div className="mini-proof-card pending"><span>{t(zh, "审批", "Approvals")}</span><strong>1</strong></div>
                </div>
                <div className="signal-status-box">
                  <span>{t(zh, "助手建议", "Assistant advice")}</span>
                  <strong>{t(zh, "先补入库记录，再催买家验收。", "Complete warehouse entry first, then chase buyer acceptance.")}</strong>
                  <p>{t(zh, "因为这两项最影响 Ready、收款和融资审核。", "Because these two most affect Ready, collection, and financing review.")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="panel product-showcase">
          <div className="section-heading">
            <span>{t(zh, "产品结构", "Product structure")}</span>
            <h2>{t(zh, "登录前讲清楚价值，登录后进入工作台。", "Before login, explain value; after login, enter the workspace.")}</h2>
            <p>{t(zh, "官网不再堆 PPT 页。用户点登录后看到的是正常 SaaS 的侧边栏、列表、表单、任务、草稿和审批。", "The public site no longer stacks presentation pages. After login, users see a normal SaaS sidebar, lists, forms, tasks, drafts, and approvals.")}</p>
          </div>
          <div className="principles-grid">
            {productBlocks.map((item) => (
              <article key={item.titleEn}>
                <strong>{t(zh, item.titleZh, item.titleEn)}</strong>
                <p>{t(zh, item.textZh, item.textEn)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="panel product-showcase">
          <div className="section-heading">
            <span>{t(zh, "登录后的功能流程", "Post-login workflow")}</span>
            <h2>{t(zh, "客户不是看介绍，而是推进交易。", "Customers are not reading slides; they are moving trade forward.")}</h2>
            <p>{t(zh, "这条流程对应 `/dashboard` 里的真实前端交互。", "This workflow maps to the real frontend interaction in `/dashboard`.")}</p>
          </div>
          <div className="pack-step-grid">
            {workflow.map((step, index) => (
              <article key={step.en} className="pack-step-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(zh, step.zh, step.en)}</strong>
                <p>{t(zh, step.descZh, step.descEn)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="security" className="clarity-strip">
          <article><span>{t(zh, "可读取", "Can read")}</span><strong>{t(zh, "用户授权的客户画像、证明包、证据槽、任务、风险和操作历史。", "Authorized customer profile, proof packs, evidence slots, tasks, risks, and action history.")}</strong></article>
          <article><span>{t(zh, "需授权", "Needs permission")}</span><strong>{t(zh, "原始合同、发票、私有文件、邮箱、ERP 和外部系统数据。", "Raw contracts, invoices, private files, email, ERP, and external system data.")}</strong></article>
          <article><span>{t(zh, "不能自动决定", "Cannot decide")}</span><strong>{t(zh, "付款、融资、验收、理赔、法律责任等关键商业动作。", "Payment, financing, acceptance, claims, legal responsibility, and other key commercial actions.")}</strong></article>
        </section>

        <section className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{t(zh, "开始使用", "Get started")}</span>
              <h3>{t(zh, "先走正常网站路径：官网说明 → 登录 → 工作台 → 证明包 → 任务 / 助手 / 审批。", "Use the normal website path first: public site → login → workspace → proof pack → tasks / assistant / approvals.")}</h3>
            </div>
            <div className="status-pill">SaaS</div>
          </div>
          <dl className="proof-details">
            <div><dt>{t(zh, "登录页", "Login")}</dt><dd><a href="/login" className="inline-link">/login</a></dd></div>
            <div><dt>{t(zh, "登录后工作台", "Logged-in workspace")}</dt><dd><a href="/dashboard" className="inline-link">/dashboard</a></dd></div>
            <div><dt>{t(zh, "公开验证", "Public verification")}</dt><dd><a href="/verify/uy-beef-cn-2026-0001" className="inline-link">/verify/uy-beef-cn-2026-0001</a></dd></div>
          </dl>
        </section>
      </main>
    </>
  );
}
