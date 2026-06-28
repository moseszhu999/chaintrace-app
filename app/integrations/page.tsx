import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const connectors = [
  { name: "ERP / Order System", zh: "ERP / 订单系统", status: "Planned", purposeZh: "同步订单、合同、客户和供应商。", purposeEn: "Sync orders, contracts, customers, and suppliers." },
  { name: "WMS / Warehouse", zh: "WMS / 仓库系统", status: "Planned", purposeZh: "同步入库、出库、签收和库存位置。", purposeEn: "Sync warehouse entry, outbound records, receipts, and inventory location." },
  { name: "TMS / Logistics", zh: "TMS / 物流系统", status: "Planned", purposeZh: "同步运输、柜号、封条、交接和异常事件。", purposeEn: "Sync transport, container, seal, handover, and incident events." },
  { name: "IoT / Temperature Logger", zh: "IoT / 温度记录仪", status: "Planned", purposeZh: "同步冷链温度曲线和传感器事件。", purposeEn: "Sync cold-chain temperature curves and sensor events." },
  { name: "Accounting / Invoice", zh: "财务 / 发票系统", status: "Planned", purposeZh: "同步发票、应收账款和付款状态。", purposeEn: "Sync invoices, receivables, and payment status." },
  { name: "AI Agent", zh: "AI Agent", status: "Design", purposeZh: "读取事实状态、缺证任务和风险缺口，触发自动协作。", purposeEn: "Read fact status, missing-evidence tasks, and risk gaps to trigger automated collaboration." },
];

const apiObjects = [
  { key: "GET /proof-packs/{id}", zh: "读取证明包状态、证据槽和 Ready 判断。", en: "Read proof pack status, evidence slots, and Ready judgement." },
  { key: "POST /evidence", zh: "提交证据元数据、哈希、可见性和责任方。", en: "Submit evidence metadata, hash, visibility, and owner." },
  { key: "GET /batches/{id}/facts", zh: "读取批次事实时间线和公开状态。", en: "Read batch fact timeline and public status." },
  { key: "GET /risk-gaps", zh: "读取缺证、责任角色、业务影响和下一步动作。", en: "Read missing evidence, owner role, business impact, and next action." },
  { key: "POST /webhooks/fact-events", zh: "接收外部系统推送的订单、物流、仓储、验收事件。", en: "Receive order, logistics, warehouse, and acceptance events from external systems." },
  { key: "GET /agent/tasks", zh: "给 AI Agent 读取待处理任务和可执行动作。", en: "Let AI agents read open tasks and executable actions." },
];

const eventTypes = [
  { type: "proof_pack.created", zh: "证明包已创建", en: "Proof pack created" },
  { type: "evidence.added", zh: "新证据已添加", en: "Evidence added" },
  { type: "evidence.verified", zh: "证据已验证", en: "Evidence verified" },
  { type: "risk_gap.created", zh: "风险缺口已生成", en: "Risk gap created" },
  { type: "task.assigned", zh: "任务已分配给角色", en: "Task assigned to role" },
  { type: "proof_pack.ready", zh: "证明包已达到 Ready", en: "Proof pack reached Ready" },
];

export default async function IntegrationsPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "MVP 页面 · 集成与 Agent API" : "MVP Page · Integrations and Agent API"}</div>
            <h1>{zh ? "先让自家产品跑通，再开放系统和 Agent 接入。" : "Make the first-party product work, then open systems and agents."}</h1>
            <p>
              {zh
                ? "Integrations 页面定义 ChainTrace 后续如何接入 ERP、仓库、物流、温度记录仪、发票系统和 AI Agent。当前阶段不急着开发复杂生态，但要先把接口对象、事件类型和接入边界设计清楚。"
                : "The Integrations page defines how ChainTrace will connect ERP, warehouse, logistics, temperature logger, invoice systems, and AI agents. The current phase should not overbuild the ecosystem, but the API objects, events, and integration boundaries should be clear."}
            </p>
            <div className="hero-actions">
              <Link href="/evidence-library" className="primary-button">{zh ? "查看证据对象" : "View evidence objects"}</Link>
              <Link href="/tasks" className="secondary-button">{zh ? "查看任务中心" : "View task center"}</Link>
              <Link href="/business-passport" className="secondary-button">{zh ? "查看企业档案" : "View business passport"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "接入层" : "Integration layer"}</span><strong>Systems → Facts → Agents</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card pending"><span>ERP</span><strong>Planned</strong></div>
                <div className="mini-proof-card pending"><span>WMS</span><strong>Planned</strong></div>
                <div className="mini-proof-card pending"><span>TMS</span><strong>Planned</strong></div>
                <div className="mini-proof-card present"><span>Agent</span><strong>Design</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "边界" : "Boundary"}</span><strong>{zh ? "API 只读事实，不替代业务系统。" : "API reads facts; it does not replace business systems."}</strong><p>{zh ? "ChainTrace 是事实层，不是新的 ERP。" : "ChainTrace is the fact layer, not a new ERP."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "连接器" : "Connectors"}</span><h2>{zh ? "先定义要接哪些系统。" : "Define which systems to connect first."}</h2><p>{zh ? "真实世界证据不会只来自手工上传，后续要来自现有业务系统和设备。" : "Real-world evidence will not only come from manual upload; later it comes from existing systems and devices."}</p></div>
        <div className="story-grid">
          {connectors.map((connector) => (
            <article key={connector.name} className="story-card">
              <span>{connector.status}</span>
              <strong>{zh ? connector.zh : connector.name}</strong>
              <p>{zh ? connector.purposeZh : connector.purposeEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{zh ? "API 对象" : "API objects"}</span><h2>{zh ? "Agent 和企业系统读取的是结构化事实。" : "Agents and enterprise systems read structured facts."}</h2><p>{zh ? "不要让 Agent 去猜 PDF，而是给它读 ProofPack、Evidence、RiskGap、Task。" : "Do not make agents guess PDFs; let them read ProofPack, Evidence, RiskGap, and Task."}</p></div>
          <dl className="proof-details">
            {apiObjects.map((item) => (
              <div key={item.key}>
                <dt>{item.key}</dt>
                <dd>{zh ? item.zh : item.en}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel">
          <div className="section-heading"><span>{zh ? "事件类型" : "Event types"}</span><h2>{zh ? "状态变化要能被系统和 Agent 订阅。" : "State changes should be subscribable by systems and agents."}</h2><p>{zh ? "这为后续自动提醒、自动补证、自动风控打基础。" : "This lays the foundation for automatic reminders, evidence completion, and risk review."}</p></div>
          <dl className="proof-details">
            {eventTypes.map((item) => (
              <div key={item.type}>
                <dt>{item.type}</dt>
                <dd>{zh ? item.zh : item.en}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
