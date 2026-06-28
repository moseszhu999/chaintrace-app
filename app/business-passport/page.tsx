import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const summaryCards = [
  { zh: "企业", en: "Business", value: "Example Small Exporter" },
  { zh: "角色", en: "Role", valueZh: "出口商 / 贸易商", valueEn: "Exporter / Trader" },
  { zh: "Ready 批次", en: "Ready batches", value: "2" },
  { zh: "Missing 批次", en: "Missing batches", value: "1" },
  { zh: "证明包", en: "Proof packs", value: "8" },
  { zh: "公开状态", en: "Public status", value: "Active" },
];

const proofPacks = [
  { id: "PP-001", zh: "乌拉圭牛肉进口中国", en: "Uruguay beef imported to China", batch: "UY-BEEF-CN-2026-0001", status: "Missing evidence", ready: "5/8" },
  { id: "PP-002", zh: "越南咖啡出口欧洲", en: "Vietnam coffee exported to Europe", batch: "VN-COFFEE-EU-2026-0007", status: "Ready", ready: "6/6" },
  { id: "PP-003", zh: "服装订单交付证明", en: "Apparel order delivery proof", batch: "APPAREL-US-2026-0021", status: "Ready", ready: "6/6" },
  { id: "PP-004", zh: "冷链运输责任证明", en: "Cold-chain responsibility proof", batch: "COLD-MEAT-2026-0004", status: "Partial", ready: "4/6" },
];

const trustSignals = [
  { zh: "历史交付有证明", en: "Historical delivery evidence", value: "12 records", status: "Strong" },
  { zh: "质检记录完整度", en: "Inspection completeness", value: "86%", status: "Good" },
  { zh: "纠纷闭环", en: "Dispute closure", value: "2 / 2", status: "Good" },
  { zh: "缺证平均处理", en: "Missing-evidence handling", value: "2.4 days", status: "Watch" },
];

const publicSections = [
  { zh: "公开企业摘要", en: "Public business summary", descZh: "可公开展示企业角色、地区、主营品类。", descEn: "Can show business role, region, and main categories publicly." },
  { zh: "公开证明状态", en: "Public proof status", descZh: "可展示 Ready / Missing evidence，不暴露原始文件。", descEn: "Can show Ready / Missing evidence without exposing raw files." },
  { zh: "私有证据文件", en: "Private evidence files", descZh: "原始合同、发票、报关文件默认私有，只公开哈希和必要元数据。", descEn: "Raw contracts, invoices, and customs files stay private by default; only hashes and necessary metadata are public." },
  { zh: "外部验证链接", en: "External verify links", descZh: "给买家、资金方、审计方发送公开验证页。", descEn: "Send public verification pages to buyers, financiers, and auditors." },
];

export default async function BusinessPassportPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "MVP 页面 · 企业事实档案" : "MVP Page · Business Fact Passport"}</div>
            <h1>{zh ? "企业的可信度，来自长期积累的事实。" : "Business trust comes from accumulated facts."}</h1>
            <p>
              {zh
                ? "Business Fact Passport 把多个批次、多个证明包、多个证据对象聚合成企业长期可信档案。它不是企业黄页，而是企业在供应链中真实履约、补证、验收和争议闭环的事实资产。"
                : "Business Fact Passport aggregates batches, proof packs, and evidence objects into a long-term trust profile. It is not a business directory; it is a fact asset showing real fulfillment, evidence completion, acceptance, and dispute closure."}
            </p>
            <div className="hero-actions">
              <Link href="/batches/uy-beef-cn-2026-0001" className="primary-button">{zh ? "查看关联批次" : "View linked batch"}</Link>
              <Link href="/verify/uy-beef-cn-2026-0001" className="secondary-button">{zh ? "查看公开验证页" : "View public verify"}</Link>
              <Link href="/evidence-library" className="secondary-button">{zh ? "查看证据库" : "View evidence library"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "企业档案" : "Business passport"}</span><strong>Example Small Exporter</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "证明包" : "Packs"}</span><strong>8</strong></div>
                <div className="mini-proof-card present"><span>Ready</span><strong>2</strong></div>
                <div className="mini-proof-card pending"><span>Missing</span><strong>1</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "公开" : "Public"}</span><strong>Active</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "定位" : "Positioning"}</span><strong>{zh ? "不是名片，是事实资产。" : "Not a profile card, but a fact asset."}</strong><p>{zh ? "客户看的是企业过去能不能真实交付和补齐证据。" : "Customers care whether the business has actually delivered and completed evidence before."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "档案摘要" : "Passport summary"}</span><h2>{zh ? "企业可信度要从证明包聚合出来。" : "Business trust should aggregate from proof packs."}</h2><p>{zh ? "不是企业自己说可信，而是历史证据形成可信。" : "Trust does not come from self-claims; it comes from historical evidence."}</p></div>
        <div className="pack-step-grid">
          {summaryCards.map((card) => (
            <article key={card.en} className="pack-step-card">
              <span>{zh ? card.zh : card.en}</span>
              <strong>{card.value ?? (zh ? card.valueZh : card.valueEn)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{zh ? "证明包历史" : "Proof pack history"}</span><h2>{zh ? "一个企业会有很多批次和很多证明包。" : "One business has many batches and proof packs."}</h2><p>{zh ? "长期看，Ready 率、缺证处理速度、争议闭环都会变成声誉信号。" : "Over time, Ready rate, gap handling speed, and dispute closure become reputation signals."}</p></div>
          <dl className="proof-details">
            {proofPacks.map((pack) => (
              <div key={pack.id}>
                <dt>{pack.id}</dt>
                <dd><strong>{zh ? pack.zh : pack.en}</strong><br />{pack.batch} · {pack.status} · {pack.ready}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel">
          <div className="section-heading"><span>{zh ? "声誉信号" : "Trust signals"}</span><h2>{zh ? "声誉来自事实，不来自评分广告。" : "Reputation comes from facts, not rating ads."}</h2><p>{zh ? "这些指标后续可以进入供应商准入、融资风控和 Agent 自动筛选。" : "These signals can later support supplier onboarding, financing risk review, and agent filtering."}</p></div>
          <dl className="proof-details">
            {trustSignals.map((signal) => (
              <div key={signal.en}>
                <dt>{signal.status}</dt>
                <dd><strong>{zh ? signal.zh : signal.en}</strong><br />{signal.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "公开与隐私边界" : "Public and privacy boundary"}</span><h2>{zh ? "档案可以公开，但商业机密不必公开。" : "The passport can be public while trade secrets stay private."}</h2><p>{zh ? "ChainTrace 的价值是公开可验证状态，不是暴露全部原始文件。" : "ChainTrace publishes verifiable status, not all raw confidential files."}</p></div>
        <dl className="proof-details">
          {publicSections.map((item) => (
            <div key={item.en}>
              <dt>{zh ? item.zh : item.en}</dt>
              <dd>{zh ? item.descZh : item.descEn}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
