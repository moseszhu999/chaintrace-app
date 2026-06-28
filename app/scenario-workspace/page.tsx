import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const templates = [
  {
    id: "food-import",
    zh: "跨境食品进口",
    en: "Cross-border food import",
    exampleZh: "乌拉圭牛肉进口中国",
    exampleEn: "Uruguay beef imported to China",
    targetZh: "证明来源、检疫、冷链、清关、入库、验收。",
    targetEn: "Prove origin, quarantine, cold chain, customs, warehouse entry, and acceptance.",
    slotsZh: ["原产地", "检疫", "冷链", "提单", "清关", "入库", "验收"],
    slotsEn: ["Origin", "Quarantine", "Cold chain", "Bill of lading", "Customs", "Warehouse", "Acceptance"],
  },
  {
    id: "receivable",
    zh: "应收账款融资",
    en: "Receivable financing",
    exampleZh: "小工厂交付后申请融资",
    exampleEn: "Small factory applies for financing after delivery",
    targetZh: "证明真实交易、真实货物、真实交付和买家确认。",
    targetEn: "Prove real trade, real goods, real delivery, and buyer confirmation.",
    slotsZh: ["订单", "发票", "发货", "质检", "交付", "验收"],
    slotsEn: ["Order", "Invoice", "Shipment", "Inspection", "Delivery", "Acceptance"],
  },
  {
    id: "cold-chain",
    zh: "冷链责任追踪",
    en: "Cold-chain responsibility",
    exampleZh: "肉类、海鲜、药品运输异常",
    exampleEn: "Transport anomaly for meat, seafood, or medicine",
    targetZh: "证明温度、封条、交接和异常责任。",
    targetEn: "Prove temperature, seal, handover, and incident responsibility.",
    slotsZh: ["柜号", "封条", "温度曲线", "交接", "异常", "签收"],
    slotsEn: ["Container", "Seal", "Temperature", "Handover", "Incident", "Receipt"],
  },
  {
    id: "supplier-onboarding",
    zh: "供应商准入",
    en: "Supplier onboarding",
    exampleZh: "买家评估海外供应商是否可信",
    exampleEn: "Buyer evaluates whether an overseas supplier is trustworthy",
    targetZh: "证明资质、历史订单、质检记录和交付表现。",
    targetEn: "Prove qualification, order history, inspection records, and delivery performance.",
    slotsZh: ["企业资料", "资质证书", "历史订单", "质检", "交付", "纠纷"],
    slotsEn: ["Profile", "Certificates", "Orders", "Inspection", "Delivery", "Disputes"],
  },
];

const roleTasks = [
  { roleZh: "供应商", roleEn: "Supplier", taskZh: "上传订单、生产、质检和发货证据。", taskEn: "Upload order, production, inspection, and shipment evidence." },
  { roleZh: "物流商", roleEn: "Logistics", taskZh: "补充柜号、封条、温度和交接记录。", taskEn: "Add container, seal, temperature, and handover records." },
  { roleZh: "进口商", roleEn: "Importer", taskZh: "补充清关、税费、入库和分销记录。", taskEn: "Add customs, tax, warehouse entry, and distribution records." },
  { roleZh: "买家", roleEn: "Buyer", taskZh: "确认收货、验收或提出异议。", taskEn: "Confirm receipt, acceptance, or dispute." },
  { roleZh: "资金方", roleEn: "Financier", taskZh: "查看完整度和缺口，再决定是否进入风控。", taskEn: "Review completeness and gaps before risk assessment." },
  { roleZh: "AI Agent", roleEn: "AI Agent", taskZh: "读取结构化事实状态并触发下一步任务。", taskEn: "Read structured fact status and trigger next tasks." },
];

export default async function ScenarioWorkspacePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "MVP 页面 · Scenario Workspace" : "MVP Page · Scenario Workspace"}</div>
            <h1>{zh ? "从场景开始，而不是从空白表单开始。" : "Start from a scenario, not a blank form."}</h1>
            <p>
              {zh
                ? "Scenario Workspace 把供应链场景变成可创建的产品模板。用户选择“跨境食品进口”或“应收账款融资”，系统自动带出证据槽、责任角色、缺口规则和下一步动作。"
                : "Scenario Workspace turns supply-chain scenarios into creatable product templates. When users choose food import or receivable financing, the system generates evidence slots, responsible roles, gap rules, and next actions."}
            </p>
            <div className="hero-actions">
              <Link href="/proof-pack-builder" className="primary-button">{zh ? "用模板创建证明包" : "Create proof pack from template"}</Link>
              <Link href="/cases/uruguay-beef-china" className="secondary-button">{zh ? "查看乌拉圭牛肉案例" : "View Uruguay beef case"}</Link>
              <Link href="/product" className="secondary-button">{zh ? "返回产品架构" : "Back to product architecture"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "模板引擎" : "Template engine"}</span><strong>Scenario → Slots → Owners</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "模板" : "Templates"}</span><strong>4</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "角色" : "Roles"}</span><strong>6</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "规则" : "Rules"}</span><strong>{zh ? "待接入" : "Next"}</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "输出" : "Output"}</span><strong>Proof Pack</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "产品价值" : "Product value"}</span><strong>{zh ? "用户不用懂供应链建模。" : "Users do not need to model supply chains."}</strong><p>{zh ? "选择场景后，ChainTrace 自动告诉他该收集什么证据。" : "After choosing a scenario, ChainTrace tells them what evidence to collect."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "场景模板" : "Scenario templates"}</span><h2>{zh ? "场景直接生成证据槽。" : "Scenarios generate evidence slots directly."}</h2><p>{zh ? "这是把案例库转成产品能力的关键。" : "This is the key step that turns case library into product capability."}</p></div>
        <div className="story-grid">
          {templates.map((template) => (
            <article key={template.id} className="story-card">
              <span>{zh ? template.exampleZh : template.exampleEn}</span>
              <strong>{zh ? template.zh : template.en}</strong>
              <p>{zh ? template.targetZh : template.targetEn}</p>
              <p>{(zh ? template.slotsZh : template.slotsEn).join(" · ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "角色任务" : "Role tasks"}</span><h2>{zh ? "不同角色进入同一个证明包，但看到不同任务。" : "Different roles enter the same proof pack but see different tasks."}</h2><p>{zh ? "这一步决定 ChainTrace 是协作应用，而不是单人文件上传工具。" : "This makes ChainTrace a collaboration app, not a single-user upload tool."}</p></div>
        <dl className="proof-details">
          {roleTasks.map((item) => (
            <div key={item.roleEn}>
              <dt>{zh ? item.roleZh : item.roleEn}</dt>
              <dd>{zh ? item.taskZh : item.taskEn}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
