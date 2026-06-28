import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const steps = [
  { en: "Order", zh: "订单", enText: "Purchase order, sales contract, or receivable basis.", zhText: "采购订单、销售合同或应收账款基础文件。" },
  { en: "Invoice", zh: "发票", enText: "Invoice hash and public metadata for existence proof.", zhText: "发票哈希与公开元数据，证明发票存在。" },
  { en: "Shipment", zh: "发货", enText: "Shipping, carrier, or logistics handoff evidence.", zhText: "发货、承运或物流交接证据。" },
  { en: "Inspection", zh: "质检", enText: "Quality control, inspection report, or test evidence.", zhText: "质量控制、检验报告或测试证据。" },
  { en: "Delivery", zh: "交付", enText: "Delivery receipt, warehouse receipt, or POD evidence.", zhText: "交付回执、入库回执或 POD 交付证明。" },
  { en: "Acceptance", zh: "验收", enText: "Buyer acceptance, confirmation, or signed approval.", zhText: "买家验收、确认记录或签收审批。" },
];

export default async function ReceivablePackPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero product-hero">
        <div className="eyebrow">{zh ? "ChainTrace 产品" : "ChainTrace Product"}</div>
        <h1>{zh ? "应收账款证明包 Lite" : "Receivable Proof Pack Lite"}</h1>
        <p>
          {zh
            ? "把订单、发票、发货、质检、交付、验收六类证据串成一个可分享、可校验、可审计的轻量证明包。先服务小贸易商和小企业，再进入资金方、买家和 AI Agent 协作场景。"
            : "Turn order, invoice, shipment, inspection, delivery, and acceptance evidence into a shareable, verifiable, audit-friendly proof pack. Start with small exporters and traders, then serve buyers, financiers, and AI-agent workflows."}
        </p>
        <div className="hero-actions">
          <Link href="/#create-proof" className="primary-button">{zh ? "开始创建证据" : "Start creating evidence"}</Link>
          <Link href="/passport" className="secondary-button">{zh ? "查看企业档案" : "View business passports"}</Link>
        </div>
      </section>

      <section className="product-strip">
        <article>
          <span>{zh ? "用户" : "User"}</span>
          <strong>{zh ? "小出口商 / 小贸易商" : "Small exporter / trader"}</strong>
          <p>{zh ? "不需要复杂 ERP，也能把关键贸易事实变成可信页面。" : "No heavy ERP required. Turn key trade facts into a trust page."}</p>
        </article>
        <article>
          <span>{zh ? "买家" : "Buyer"}</span>
          <strong>{zh ? "快速判断是否缺证据" : "See what is missing"}</strong>
          <p>{zh ? "Ready / Missing evidence 直接展示证明包完整度。" : "Ready / Missing evidence makes pack completeness obvious."}</p>
        </article>
        <article>
          <span>{zh ? "资金方" : "Financier"}</span>
          <strong>{zh ? "先看完整性，再做风控" : "Completeness before risk"}</strong>
          <p>{zh ? "ChainTrace 不做授信结论，先提供可验证证据层。" : "ChainTrace does not make credit decisions; it provides the evidence layer."}</p>
        </article>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "证明包结构" : "Pack structure"}</span>
          <h2>{zh ? "六个证据槽，少一个就 Missing evidence" : "Six evidence slots. Missing one means Missing evidence."}</h2>
          <p>
            {zh
              ? "当前 Lite 版按同一个批次 / 订单号自动聚合证据。六类齐全时，企业档案页显示 Ready；否则列出缺失证据。"
              : "The Lite version groups evidence by the same batch / order ID. When all six evidence types are present, the business passport shows Ready; otherwise it lists the missing evidence."}
          </p>
        </div>

        <div className="pack-step-grid">
          {steps.map((step, index) => (
            <article key={step.en} className="pack-step-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{zh ? step.zh : step.en}</strong>
              <p>{zh ? step.zhText : step.enText}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{zh ? "产品路径" : "product path"}</span>
              <h3>{zh ? "从一个证明，到一个企业可信档案" : "From one proof to a business trust profile"}</h3>
            </div>
            <div className="status-pill">MVP</div>
          </div>
          <dl className="proof-details">
            <div>
              <dt>{zh ? "第一步" : "Step 1"}</dt>
              <dd>{zh ? "上传或选择一个证据文件，浏览器本地生成 SHA-256 哈希。" : "Upload or select one evidence file. The browser generates a local SHA-256 hash."}</dd>
            </div>
            <div>
              <dt>{zh ? "第二步" : "Step 2"}</dt>
              <dd>{zh ? "用同一个企业名称和批次 / 订单号继续补齐六类证据。" : "Use the same business name and batch / order ID to fill the six evidence slots."}</dd>
            </div>
            <div>
              <dt>{zh ? "第三步" : "Step 3"}</dt>
              <dd>{zh ? "企业档案自动展示 Ready / Missing evidence，买家或资金方可以扫码查看。" : "The business passport automatically shows Ready / Missing evidence for buyers or financiers to review by link or QR code."}</dd>
            </div>
          </dl>
          <p className="proof-note">
            {zh
              ? "产品原则：先做证明完整性，不碰原始文件托管，不急着做授信评分。这样最轻、最容易传播，也最适合小企业自发使用。"
              : "Product principle: start with evidence completeness, not file custody or credit scoring. This keeps the product lightweight, viral, and suitable for small businesses."}
          </p>
        </article>
      </section>
    </main>
  );
}
