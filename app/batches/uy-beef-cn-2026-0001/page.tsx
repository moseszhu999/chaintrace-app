import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const timeline = [
  { step: "01", zh: "乌拉圭牧场记录", en: "Uruguay ranch record", status: "Verified", actorZh: "牧场", actorEn: "Ranch" },
  { step: "02", zh: "屠宰与检疫", en: "Slaughter and quarantine", status: "Verified", actorZh: "屠宰厂 / 兽医", actorEn: "Plant / Vet" },
  { step: "03", zh: "分割包装与箱标", en: "Cutting, packing, carton labels", status: "Verified", actorZh: "加工厂", actorEn: "Processor" },
  { step: "04", zh: "冷链装柜", en: "Cold-chain loading", status: "Partial", actorZh: "冷库 / 物流", actorEn: "Cold warehouse / Logistics" },
  { step: "05", zh: "海运单证", en: "Ocean freight documents", status: "Verified", actorZh: "出口商", actorEn: "Exporter" },
  { step: "06", zh: "中国口岸放行", en: "China port release", status: "Missing", actorZh: "进口商 / 报关行", actorEn: "Importer / Broker" },
  { step: "07", zh: "仓库入库", en: "Warehouse entry", status: "Missing", actorZh: "中国仓库", actorEn: "China warehouse" },
  { step: "08", zh: "买家验收", en: "Buyer acceptance", status: "Missing", actorZh: "下游买家", actorEn: "Downstream buyer" },
];

const factCards = [
  { labelZh: "批次", labelEn: "Batch", value: "UY-BEEF-CN-2026-0001" },
  { labelZh: "产品", labelEn: "Product", valueZh: "冷冻牛肉", valueEn: "Frozen beef" },
  { labelZh: "起点", labelEn: "Origin", valueZh: "乌拉圭", valueEn: "Uruguay" },
  { labelZh: "目的地", labelEn: "Destination", valueZh: "中国", valueEn: "China" },
  { labelZh: "证明包状态", labelEn: "Proof pack status", value: "Missing evidence" },
  { labelZh: "完整度", labelEn: "Completeness", value: "5 / 8" },
];

const linkedDocs = [
  { zh: "牧场与牛只身份记录", en: "Ranch and animal identity record", hash: "0x9a31...c8f2", status: "Verified" },
  { zh: "卫生证书与检疫记录", en: "Sanitary certificate and quarantine record", hash: "0xa204...11bd", status: "Verified" },
  { zh: "装箱单与提单", en: "Packing list and bill of lading", hash: "0x3c91...72aa", status: "Verified" },
  { zh: "冷链温度记录", en: "Cold-chain temperature record", hash: "0x7d80...44ef", status: "Partial" },
  { zh: "中国口岸放行记录", en: "China port release record", hash: "Missing", status: "Missing" },
  { zh: "最终验收确认", en: "Final acceptance confirmation", hash: "Missing", status: "Missing" },
];

export default async function BatchFactPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "批次事实页" : "Batch Fact Page"}</div>
            <h1>{zh ? "一票乌拉圭牛肉的事实状态。" : "Fact status for one Uruguayan beef shipment."}</h1>
            <p>
              {zh
                ? "这个页面是买家、进口商、资金方、审计方真正会打开看的页面。它不讲技术，直接展示这票货从来源、加工、运输到验收的证据完整度。"
                : "This is the page buyers, importers, financiers, and auditors actually open. It does not talk technology; it shows evidence completeness from origin and processing to transport and acceptance."}
            </p>
            <div className="hero-actions">
              <Link href="/proof-pack-builder" className="primary-button">{zh ? "编辑证明包" : "Edit proof pack"}</Link>
              <Link href="/risk-dashboard" className="secondary-button">{zh ? "查看缺证风险" : "View risk gaps"}</Link>
              <Link href="/cases/uruguay-beef-china" className="secondary-button">{zh ? "查看完整案例" : "View full case"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "当前状态" : "Current status"}</span><strong>Missing evidence</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "已验证" : "Verified"}</span><strong>4</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "部分" : "Partial"}</span><strong>1</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "缺失" : "Missing"}</span><strong>3</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "可分享" : "Shareable"}</span><strong>Yes</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "不能 Ready 的原因" : "Why not Ready"}</span><strong>{zh ? "缺口岸放行、入库、验收。" : "Port release, warehouse entry, and acceptance are missing."}</strong><p>{zh ? "这不是坏事。诚实显示缺口，才是可信供应链。" : "This is not a failure. Honest gap display is what makes the chain trustworthy."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "批次摘要" : "Batch summary"}</span><h2>{zh ? "外部用户先看结论，再看证据。" : "External users see the conclusion first, then the evidence."}</h2><p>{zh ? "这个页面应该成为 Fact Passport 的核心子页面。" : "This page should become a core child page of Fact Passport."}</p></div>
        <div className="pack-step-grid">
          {factCards.map((card) => (
            <article key={card.labelEn} className="pack-step-card">
              <span>{zh ? card.labelZh : card.labelEn}</span>
              <strong>{card.value ?? (zh ? card.valueZh : card.valueEn)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{zh ? "事实时间线" : "Fact timeline"}</span><h2>{zh ? "从来源到验收，每一步都有状态。" : "Every step from origin to acceptance has status."}</h2><p>{zh ? "状态不是人工写故事，而是由证据槽和规则生成。" : "Status is not storytelling; it is generated by evidence slots and rules."}</p></div>
          <dl className="proof-details">
            {timeline.map((item) => (
              <div key={item.step}>
                <dt>{item.step}</dt>
                <dd><strong>{zh ? item.zh : item.en}</strong><br />{zh ? "责任方：" : "Owner: "}{zh ? item.actorZh : item.actorEn}<br /><span>{item.status}</span></dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel">
          <div className="section-heading"><span>{zh ? "关联证据" : "Linked evidence"}</span><h2>{zh ? "每条事实都应能追到证据哈希。" : "Every fact should trace back to an evidence hash."}</h2><p>{zh ? "真实文件可以私有，哈希和状态可以公开验证。" : "Raw files can stay private while hashes and status are publicly verifiable."}</p></div>
          <dl className="proof-details">
            {linkedDocs.map((doc) => (
              <div key={doc.en}>
                <dt>{doc.status}</dt>
                <dd><strong>{zh ? doc.zh : doc.en}</strong><br /><span>{doc.hash}</span></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
