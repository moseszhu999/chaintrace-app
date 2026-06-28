import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const evidenceItems = [
  {
    id: "EV-001",
    zh: "牧场与牛只身份记录",
    en: "Ranch and animal identity record",
    type: "Origin",
    batch: "UY-BEEF-CN-2026-0001",
    hash: "0x9a31...c8f2",
    visibility: "Public metadata",
    status: "Verified",
    ownerZh: "乌拉圭牧场",
    ownerEn: "Uruguay ranch",
  },
  {
    id: "EV-002",
    zh: "卫生证书与检疫记录",
    en: "Sanitary certificate and quarantine record",
    type: "Quarantine",
    batch: "UY-BEEF-CN-2026-0001",
    hash: "0xa204...11bd",
    visibility: "Private file + public hash",
    status: "Verified",
    ownerZh: "屠宰厂 / 兽医",
    ownerEn: "Plant / Vet",
  },
  {
    id: "EV-003",
    zh: "装箱单与提单",
    en: "Packing list and bill of lading",
    type: "Shipping",
    batch: "UY-BEEF-CN-2026-0001",
    hash: "0x3c91...72aa",
    visibility: "Private file + public hash",
    status: "Verified",
    ownerZh: "出口商",
    ownerEn: "Exporter",
  },
  {
    id: "EV-004",
    zh: "冷链温度记录",
    en: "Cold-chain temperature record",
    type: "Cold chain",
    batch: "UY-BEEF-CN-2026-0001",
    hash: "0x7d80...44ef",
    visibility: "Private file + summary",
    status: "Partial",
    ownerZh: "冷链物流商",
    ownerEn: "Cold-chain provider",
  },
  {
    id: "EV-005",
    zh: "中国口岸放行记录",
    en: "China port release record",
    type: "Customs",
    batch: "UY-BEEF-CN-2026-0001",
    hash: "Missing",
    visibility: "Not uploaded",
    status: "Missing",
    ownerZh: "进口商 / 报关行",
    ownerEn: "Importer / Broker",
  },
  {
    id: "EV-006",
    zh: "买家验收确认",
    en: "Buyer acceptance confirmation",
    type: "Acceptance",
    batch: "UY-BEEF-CN-2026-0001",
    hash: "Missing",
    visibility: "Not uploaded",
    status: "Missing",
    ownerZh: "下游买家",
    ownerEn: "Downstream buyer",
  },
];

const filters = [
  { zh: "全部证据", en: "All evidence", value: "6" },
  { zh: "已验证", en: "Verified", value: "3" },
  { zh: "部分", en: "Partial", value: "1" },
  { zh: "缺失", en: "Missing", value: "2" },
  { zh: "私有文件", en: "Private files", value: "3" },
  { zh: "公开哈希", en: "Public hashes", value: "4" },
];

const objectModel = [
  { key: "EvidenceItem", zh: "一份证据对象：文件、哈希、状态、责任方、可见性。", en: "One evidence object: file, hash, status, owner, visibility." },
  { key: "EvidenceSlot", zh: "证明包里的证据槽：订单、发票、交付、验收等。", en: "A slot inside a proof pack: order, invoice, delivery, acceptance, etc." },
  { key: "ProofPack", zh: "围绕一票货或一个订单聚合多个证据槽。", en: "Aggregates multiple evidence slots around one shipment or order." },
  { key: "FactEvent", zh: "证据产生或状态变化时生成事件，供 Agent/API 读取。", en: "Generated when evidence is created or status changes; readable by agents/API." },
];

export default async function EvidenceLibraryPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "MVP 页面 · 证据库" : "MVP Page · Evidence Library"}</div>
            <h1>{zh ? "证据不是附件，是平台的核心对象。" : "Evidence is not an attachment; it is the core platform object."}</h1>
            <p>
              {zh
                ? "Evidence Library 管理所有证据对象：谁上传、属于哪个批次、对应哪个证据槽、哈希是什么、能公开什么、状态是否 Verified。这样 Proof Pack、风险看板、公开验证页都能共享同一套事实。"
                : "Evidence Library manages all evidence objects: who uploaded it, which batch it belongs to, which slot it fills, what hash it has, what can be public, and whether it is Verified. Proof Pack, Risk Dashboard, and Public Verify Portal all share the same facts."}
            </p>
            <div className="hero-actions">
              <Link href="/proof-pack-builder" className="primary-button">{zh ? "回到 Builder" : "Back to Builder"}</Link>
              <Link href="/verify/uy-beef-cn-2026-0001" className="secondary-button">{zh ? "查看公开验证" : "View public verify"}</Link>
              <Link href="/tasks" className="secondary-button">{zh ? "查看任务中心" : "View task center"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "证据对象" : "Evidence objects"}</span><strong>6 records</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "已验证" : "Verified"}</span><strong>3</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "部分" : "Partial"}</span><strong>1</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "缺失" : "Missing"}</span><strong>2</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "私有" : "Private"}</span><strong>3</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "架构意义" : "Architecture meaning"}</span><strong>{zh ? "所有页面共用一个证据事实源。" : "All pages use one evidence fact source."}</strong><p>{zh ? "否则 Builder、风险看板、公开验证都会各说各话。" : "Otherwise Builder, Risks, and Verify pages will tell different stories."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "证据统计" : "Evidence stats"}</span><h2>{zh ? "先按状态和可见性管理。" : "Manage by status and visibility first."}</h2><p>{zh ? "商业机密不必公开，但哈希、状态和必要元数据必须可验证。" : "Confidential files do not need to be public, but hashes, status, and necessary metadata must be verifiable."}</p></div>
        <div className="pack-step-grid">
          {filters.map((item) => (
            <article key={item.en} className="pack-step-card">
              <span>{zh ? item.zh : item.en}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "证据列表" : "Evidence list"}</span><h2>{zh ? "每条证据都要能追到批次、槽位、责任方和哈希。" : "Every evidence item traces to batch, slot, owner, and hash."}</h2><p>{zh ? "这页以后会变成真实文件上传、审核、权限和版本管理入口。" : "This will become the real entry for upload, review, permissions, and versioning."}</p></div>
        <dl className="proof-details">
          {evidenceItems.map((item) => (
            <div key={item.id}>
              <dt>{item.id}</dt>
              <dd>
                <strong>{zh ? item.zh : item.en}</strong>
                <br />
                {item.batch} · {item.type} · {item.status}
                <br />
                <span>{zh ? "责任方：" : "Owner: "}{zh ? item.ownerZh : item.ownerEn}</span>
                <br />
                <span>{item.visibility} · Hash: {item.hash}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "对象模型" : "Object model"}</span><h2>{zh ? "证据库支撑所有产品页面。" : "Evidence Library supports all product pages."}</h2><p>{zh ? "这就是从页面原型进入数据架构的桥。" : "This is the bridge from page prototype to data architecture."}</p></div>
        <dl className="proof-details">
          {objectModel.map((item) => (
            <div key={item.key}>
              <dt>{item.key}</dt>
              <dd>{zh ? item.zh : item.en}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
