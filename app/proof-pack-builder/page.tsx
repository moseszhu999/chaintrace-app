import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const evidenceSlots = [
  {
    no: "01",
    key: "Order",
    zh: "订单 / 合同",
    en: "Order / Contract",
    ownerZh: "供应商 / 贸易商",
    ownerEn: "Supplier / Trader",
    status: "Present",
    descZh: "证明这笔交易真实存在：谁买、谁卖、什么货、哪个批次。",
    descEn: "Proves the trade exists: buyer, seller, goods, and batch.",
  },
  {
    no: "02",
    key: "Invoice",
    zh: "发票",
    en: "Invoice",
    ownerZh: "贸易商 / 出口商",
    ownerEn: "Trader / Exporter",
    status: "Present",
    descZh: "证明已经形成可追踪的收款或应收账款主张。",
    descEn: "Proves a traceable payment or receivable claim exists.",
  },
  {
    no: "03",
    key: "Shipment",
    zh: "发货 / 装柜",
    en: "Shipment / Loading",
    ownerZh: "物流 / 仓库",
    ownerEn: "Logistics / Warehouse",
    status: "Present",
    descZh: "证明货物已经离开上游节点并进入物流链路。",
    descEn: "Proves goods left the upstream node and entered logistics flow.",
  },
  {
    no: "04",
    key: "Inspection",
    zh: "质检 / 检疫",
    en: "Inspection / Quarantine",
    ownerZh: "质检方 / 工厂",
    ownerEn: "Inspector / Plant",
    status: "Present",
    descZh: "证明货物符合约定质量、检验或检疫要求。",
    descEn: "Proves the goods meet quality, inspection, or quarantine requirements.",
  },
  {
    no: "05",
    key: "Delivery",
    zh: "交付 / 入库",
    en: "Delivery / Warehouse entry",
    ownerZh: "进口商 / 仓库",
    ownerEn: "Importer / Warehouse",
    status: "Missing",
    descZh: "证明货物已经到达指定地点或下游节点。",
    descEn: "Proves goods reached the specified place or downstream node.",
  },
  {
    no: "06",
    key: "Acceptance",
    zh: "验收确认",
    en: "Acceptance confirmation",
    ownerZh: "买家 / 采购方",
    ownerEn: "Buyer / Procurement",
    status: "Missing",
    descZh: "证明买家确认收到并接受，形成事实闭环。",
    descEn: "Proves the buyer confirmed receipt and acceptance, closing the fact loop.",
  },
];

const scenarioTemplates = [
  { zh: "应收账款融资", en: "Receivable financing", slots: "Order · Invoice · Shipment · Delivery · Acceptance" },
  { zh: "跨境食品溯源", en: "Cross-border food traceability", slots: "Origin · Quarantine · Cold chain · Customs · Acceptance" },
  { zh: "冷链责任追踪", en: "Cold-chain responsibility", slots: "Container · Seal · Temperature · Handover · Incident" },
  { zh: "贸易争议索赔", en: "Trade dispute and claims", slots: "Contract · Loading · Transport · Photos · Acceptance" },
];

export default async function ProofPackBuilderPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";
  const presentCount = evidenceSlots.filter((slot) => slot.status === "Present").length;
  const ready = presentCount === evidenceSlots.length;

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "MVP 页面 · Proof Pack Builder" : "MVP Page · Proof Pack Builder"}</div>
            <h1>{zh ? "围绕一票货，补齐证据槽。" : "Fill evidence slots around one shipment."}</h1>
            <p>
              {zh
                ? "这是 ChainTrace 的第一主产品页面。用户不是从空白上传文件开始，而是先选择业务场景，系统自动生成证据槽、责任角色和 Ready / Missing evidence 判断。"
                : "This is the first core ChainTrace product page. Users do not start from blank upload; they choose a business scenario, and the system generates evidence slots, responsible roles, and Ready / Missing evidence judgement."}
            </p>
            <div className="hero-actions">
              <Link href="/batches/uy-beef-cn-2026-0001" className="primary-button">{zh ? "查看批次事实页" : "View batch fact page"}</Link>
              <Link href="/risk-dashboard" className="secondary-button">{zh ? "查看风险缺口" : "View risk gaps"}</Link>
              <Link href="/product" className="secondary-button">{zh ? "返回产品架构" : "Back to product architecture"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "当前证明包" : "Current proof pack"}</span><strong>UY-BEEF-CN-2026-0001</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "已补齐" : "Present"}</span><strong>{presentCount}/6</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "缺证" : "Missing"}</span><strong>{evidenceSlots.length - presentCount}/6</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "场景" : "Scenario"}</span><strong>{zh ? "食品进口" : "Food import"}</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "状态" : "Status"}</span><strong>{ready ? "Ready" : "Missing"}</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "判断" : "Judgement"}</span><strong>{ready ? "Ready" : "Missing evidence"}</strong><p>{zh ? "还缺交付 / 入库和买家验收，不能进入 Ready。" : "Delivery / warehouse entry and buyer acceptance are still missing, so it cannot become Ready."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="panel form-panel">
          <div className="section-heading"><span>{zh ? "创建证明包" : "Create proof pack"}</span><h2>{zh ? "先选场景，再生成证据槽。" : "Choose scenario first, then generate evidence slots."}</h2><p>{zh ? "这是页面原型，下一步接入真实数据模型和保存 API。" : "This is a page prototype; next step is connecting the real data model and save API."}</p></div>
          <label>{zh ? "业务场景" : "Business scenario"}<select defaultValue="cross-border-food"><option value="receivable">{zh ? "应收账款融资" : "Receivable financing"}</option><option value="cross-border-food">{zh ? "跨境食品溯源" : "Cross-border food traceability"}</option><option value="cold-chain">{zh ? "冷链责任追踪" : "Cold-chain responsibility"}</option><option value="claim">{zh ? "贸易争议索赔" : "Trade dispute and claims"}</option></select></label>
          <label>{zh ? "批次 / 订单号" : "Batch / Order ID"}<input defaultValue="UY-BEEF-CN-2026-0001" /></label>
          <label>{zh ? "业务名称" : "Business name"}<input defaultValue={zh ? "乌拉圭冷冻牛肉进口中国" : "Uruguay frozen beef imported to China"} /></label>
          <label>{zh ? "当前责任方" : "Current owner"}<input defaultValue={zh ? "中国进口商 / 仓库" : "Chinese importer / warehouse"} /></label>
          <div className="proof-flow-card"><strong>{zh ? "下一步动作" : "Next action"}</strong><span>{zh ? "上传交付 / 入库记录，并邀请买家补充验收确认。" : "Upload delivery / warehouse entry record and invite the buyer to add acceptance confirmation."}</span></div>
        </div>

        <div className="panel preview-panel">
          <div className="section-heading"><span>{zh ? "证据槽状态" : "Evidence slot status"}</span><h2>{zh ? "一票货能不能 Ready，由证据槽决定。" : "Ready status depends on evidence slots."}</h2><p>{zh ? "每个槽有责任角色、证据说明和状态。" : "Each slot has owner, evidence description, and status."}</p></div>
          <dl className="proof-details">
            {evidenceSlots.map((slot) => (
              <div key={slot.key}>
                <dt>{slot.no}</dt>
                <dd>
                  <strong>{zh ? slot.zh : slot.en}</strong>
                  <br />
                  {zh ? slot.descZh : slot.descEn}
                  <br />
                  <span>{zh ? "责任方：" : "Owner: "}{zh ? slot.ownerZh : slot.ownerEn} · {slot.status}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "场景模板" : "Scenario templates"}</span><h2>{zh ? "不同场景对应不同证据组合。" : "Different scenarios require different evidence sets."}</h2><p>{zh ? "这一步把“场景文案”变成可创建的产品模板。" : "This turns scenario copy into creatable product templates."}</p></div>
        <div className="story-grid">
          {scenarioTemplates.map((item) => (
            <article key={item.en} className="story-card">
              <strong>{zh ? item.zh : item.en}</strong>
              <p>{item.slots}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
