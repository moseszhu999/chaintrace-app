import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const rolePainMap = [
  {
    roleZh: "供应商 / 小工厂",
    roleEn: "Supplier / small factory",
    painZh: "做了货、发了货，但证据散在微信、邮箱、Excel、纸质单据里，遇到争议时说不清。",
    painEn: "They produce and ship goods, but evidence is scattered across chat, email, Excel, and paper documents, making disputes hard to explain.",
    jobZh: "证明自己确实接单、生产、质检、发货。",
    jobEn: "Prove that they received the order, produced, inspected, and shipped the goods.",
    appZh: "生产事实档案、发货证明、质检证明、批次证明。",
    appEn: "Production fact passport, shipment proof, inspection proof, batch proof.",
  },
  {
    roleZh: "贸易商 / 出口商",
    roleEn: "Trader / exporter",
    painZh: "上下游单证太多，客户、银行、保险、物流都要看不同材料，重复解释成本高。",
    painEn: "Too many upstream and downstream documents; customers, banks, insurers, and logistics partners each ask for different proof.",
    jobZh: "把一票货从订单到交付串成一个可信故事。",
    jobEn: "Turn a shipment from order to delivery into one trusted story.",
    appZh: "订单证明包、出口单证包、客户分享页、企业可信档案。",
    appEn: "Order proof pack, export document pack, customer share page, business trust passport.",
  },
  {
    roleZh: "进口商 / 分销商",
    roleEn: "Importer / distributor",
    painZh: "拿到货之前要判断来源、冷链、报关、质检是否完整，但文件经常不一致。",
    painEn: "Before taking goods, they must judge origin, cold chain, customs, and inspection completeness, but documents often do not reconcile.",
    jobZh: "快速确认这批货是否能放心入库、付款、分销。",
    jobEn: "Quickly decide whether a batch is safe to receive, pay for, and distribute.",
    appZh: "进口清关证明、冷链证明、入库证明、下游验收证明。",
    appEn: "Import clearance proof, cold-chain proof, warehouse-entry proof, downstream acceptance proof.",
  },
  {
    roleZh: "物流 / 冷链服务商",
    roleEn: "Logistics / cold-chain provider",
    painZh: "运输过程中出问题时，温度、封条、交接、延误责任很难快速证明。",
    painEn: "When something goes wrong in transit, temperature, seals, handover, and delay responsibility are hard to prove quickly.",
    jobZh: "证明自己在每个交接点完成了约定责任。",
    jobEn: "Prove they fulfilled responsibilities at each handover point.",
    appZh: "柜号封条证明、温度曲线证明、交接证明、异常事件证明。",
    appEn: "Container-seal proof, temperature-curve proof, handover proof, incident proof.",
  },
  {
    roleZh: "买家 / 采购方",
    roleEn: "Buyer / procurement team",
    painZh: "供应商说材料齐了，但采购很难一眼判断订单、质检、交付、验收是否闭环。",
    painEn: "Suppliers claim documents are complete, but buyers cannot instantly see whether order, inspection, delivery, and acceptance form a closed loop.",
    jobZh: "降低采购验真成本，减少扯皮和重复追问。",
    jobEn: "Lower verification cost and reduce disputes and repeated follow-ups.",
    appZh: "采购验真页面、供应商事实档案、批次 Ready 状态。",
    appEn: "Procurement verification page, supplier fact passport, batch Ready status.",
  },
  {
    roleZh: "资金方 / 保险方",
    roleEn: "Financier / insurer",
    painZh: "不敢只看发票放款或承保，需要知道真实交易、真实货物、真实交付是否存在。",
    painEn: "They cannot rely on invoices alone; they need to know whether real trade, real goods, and real delivery exist.",
    jobZh: "先读事实完整度，再进入风控、融资、理赔或承保流程。",
    jobEn: "Read fact completeness before entering risk, financing, claims, or underwriting workflows.",
    appZh: "应收账款证明包、融资前事实审计、风险缺口提示。",
    appEn: "Receivable proof pack, pre-financing fact audit, risk-gap alerts.",
  },
  {
    roleZh: "审计 / 合规 / 监管接口",
    roleEn: "Audit / compliance / regulatory interface",
    painZh: "审计要追溯证据来源、时间和责任人，但传统材料缺少统一索引。",
    painEn: "Audits need evidence source, time, and responsibility, but traditional materials lack a unified index.",
    jobZh: "建立可追溯、可复核、可抽查的事实索引。",
    jobEn: "Build a traceable, reviewable, sample-checkable fact index.",
    appZh: "审计证据索引、合规状态页、异常缺口清单。",
    appEn: "Audit evidence index, compliance status page, exception gap list.",
  },
  {
    roleZh: "AI Agent / 企业系统",
    roleEn: "AI agent / enterprise system",
    painZh: "Agent 不能只相信自然语言描述，需要读取结构化、可验证的事实状态。",
    painEn: "Agents cannot rely on natural-language claims alone; they need structured, verifiable fact states.",
    jobZh: "让 Agent 基于可信事实协作、预警、审查和触发流程。",
    jobEn: "Let agents collaborate, alert, review, and trigger workflows based on trusted facts.",
    appZh: "Fact API、Proof Index、状态订阅、自动缺证提醒。",
    appEn: "Fact API, Proof Index, status subscription, automatic missing-evidence alerts.",
  },
];

const scenarioMap = [
  {
    titleZh: "跨境食品溯源",
    titleEn: "Cross-border food traceability",
    exampleZh: "乌拉圭牛肉进口中国、越南咖啡出口欧洲、智利水果进口亚洲。",
    exampleEn: "Uruguay beef to China, Vietnam coffee to Europe, Chile fruit to Asia.",
    proofZh: "原产地、检疫、冷链、清关、仓储、验收。",
    proofEn: "Origin, quarantine, cold chain, customs clearance, warehouse entry, acceptance.",
  },
  {
    titleZh: "应收账款融资",
    titleEn: "Receivable financing",
    exampleZh: "小工厂完成交付后，用订单、发票、发货、验收形成融资证明包。",
    exampleEn: "A small factory completes delivery and uses order, invoice, shipment, and acceptance evidence to form a financing proof pack.",
    proofZh: "订单、发票、发货、质检、交付、验收。",
    proofEn: "Order, invoice, shipment, inspection, delivery, acceptance.",
  },
  {
    titleZh: "品牌防伪与批次证明",
    titleEn: "Brand anti-counterfeit and batch proof",
    exampleZh: "正品批次、授权经销、包装标签、终端扫码验证。",
    exampleEn: "Authentic batch, authorized distribution, package label, end-customer scan verification.",
    proofZh: "生产批次、授权链、箱标、出库、终端验证。",
    proofEn: "Production batch, authorization chain, carton label, outbound record, end-user verification.",
  },
  {
    titleZh: "冷链责任追踪",
    titleEn: "Cold-chain responsibility tracking",
    exampleZh: "肉类、海鲜、药品、生鲜在运输过程中出现温度异常。",
    exampleEn: "Meat, seafood, medicine, and fresh produce face temperature anomalies in transit.",
    proofZh: "温度曲线、柜号、封条、交接、异常事件。",
    proofEn: "Temperature curve, container number, seal, handover, incident record.",
  },
  {
    titleZh: "供应商准入与评级",
    titleEn: "Supplier onboarding and rating",
    exampleZh: "买家想判断一个海外供应商是不是值得合作。",
    exampleEn: "A buyer wants to know whether an overseas supplier is worth working with.",
    proofZh: "历史订单、交付准时率、质检记录、纠纷记录、证书。",
    proofEn: "Order history, on-time delivery, inspection history, dispute record, certificates.",
  },
  {
    titleZh: "贸易争议与索赔",
    titleEn: "Trade dispute and claims",
    exampleZh: "货损、延误、短装、质量争议，需要快速定位责任节点。",
    exampleEn: "Damage, delay, shortage, or quality dispute requires fast responsibility localization.",
    proofZh: "装柜、运输、温控、签收、验收、异常照片。",
    proofEn: "Loading, transport, temperature, receipt, acceptance, incident photos.",
  },
];

const firstPartyApps = [
  {
    nameZh: "Fact Passport",
    nameEn: "Fact Passport",
    descZh: "企业、供应商、批次、产品的可信档案页。",
    descEn: "Trust passport pages for businesses, suppliers, batches, and products.",
  },
  {
    nameZh: "Proof Pack Builder",
    nameEn: "Proof Pack Builder",
    descZh: "围绕一个订单 / 批次补齐证据槽，生成 Ready / Missing evidence 状态。",
    descEn: "Fill evidence slots around one order / batch and generate Ready / Missing evidence status.",
  },
  {
    nameZh: "Trace Case Library",
    nameEn: "Trace Case Library",
    descZh: "用行业案例教育客户：食品、服装、药品、矿产、电子元件。",
    descEn: "Use industry cases to educate customers: food, apparel, pharma, minerals, electronics.",
  },
  {
    nameZh: "Risk Gap Dashboard",
    nameEn: "Risk Gap Dashboard",
    descZh: "自动告诉用户缺什么证据、卡在哪个角色、影响什么交易结果。",
    descEn: "Automatically show what evidence is missing, which role blocks it, and what transaction result it affects.",
  },
  {
    nameZh: "Agent Fact API",
    nameEn: "Agent Fact API",
    descZh: "让 AI Agent 和企业系统读取结构化事实，而不是读散乱文件。",
    descEn: "Let AI agents and enterprise systems read structured facts instead of scattered files.",
  },
  {
    nameZh: "Public Verify Page",
    nameEn: "Public Verify Page",
    descZh: "给买家、资金方、审计方打开链接就能看的验证页。",
    descEn: "A shareable verification page for buyers, financiers, and auditors.",
  },
];

export default async function PlatformPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "ChainTrace 平台应用" : "ChainTrace Platform App"}</div>
            <h1>{zh ? "先做自家的供应链事实应用。" : "Build our own supply-chain fact app first."}</h1>
            <p>
              {zh
                ? "ChainTrace 不能只是一层协议或一个证明工具。第一步要把平台自己的应用做出来：让不同供应链角色知道自己缺什么证据、解决什么痛点、在哪些场景里可以直接用。"
                : "ChainTrace cannot be only a protocol layer or proof tool. The first step is a first-party app: help every supply-chain role see what evidence is missing, what pain it solves, and which scenarios it can use immediately."}
            </p>
            <div className="hero-actions">
              <Link href="/cases" className="primary-button">{zh ? "查看场景案例" : "View scenarios"}</Link>
              <Link href="/#create-proof" className="secondary-button">{zh ? "记录一个证据" : "Record evidence"}</Link>
              <Link href="/passport" className="secondary-button">{zh ? "查看事实档案" : "View passports"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header">
                <span>{zh ? "平台应用骨架" : "Platform app skeleton"}</span>
                <strong>Roles → Pain → Scenario → Proof</strong>
              </div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "角色" : "Roles"}</span><strong>8</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "场景" : "Scenarios"}</span><strong>6</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "应用模块" : "Apps"}</span><strong>6</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "状态" : "Status"}</span><strong>Build first</strong></div>
              </div>
              <div className="signal-status-box">
                <span>{zh ? "当前产品判断" : "Current product judgement"}</span>
                <strong>{zh ? "先做应用，再谈协议。" : "App first, protocol later."}</strong>
                <p>{zh ? "用户先买痛点解决方案，不会先买底层基础设施。" : "Users buy pain relief first, not infrastructure first."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "供应链角色痛点图" : "Supply-chain role pain map"}</span>
          <h2>{zh ? "每个角色都有不同痛点，但都需要同一个事实底座。" : "Each role has different pain, but all need the same fact base."}</h2>
          <p>{zh ? "平台应用的入口不能是“上传文件”，而应该是“我是哪个角色，我要解决什么问题”。" : "The app entry should not be upload a file; it should be who I am and what problem I need to solve."}</p>
        </div>
        <dl className="proof-details">
          {rolePainMap.map((item) => (
            <div key={item.roleEn}>
              <dt>{zh ? item.roleZh : item.roleEn}</dt>
              <dd>
                <strong>{zh ? "痛点：" : "Pain: "}</strong>{zh ? item.painZh : item.painEn}
                <br />
                <strong>{zh ? "任务：" : "Job: "}</strong>{zh ? item.jobZh : item.jobEn}
                <br />
                <span><strong>{zh ? "应用：" : "App: "}</strong>{zh ? item.appZh : item.appEn}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "场景库" : "Scenario library"}</span>
          <h2>{zh ? "先用高频场景卖产品，再逐步变成供应链事实基础设施。" : "Sell high-frequency scenarios first, then become supply-chain fact infrastructure."}</h2>
          <p>{zh ? "每个场景都要明确：谁痛、缺什么证据、补齐后状态怎么变化。" : "Every scenario must make clear who feels pain, what evidence is missing, and how status changes when it is complete."}</p>
        </div>
        <div className="story-grid">
          {scenarioMap.map((item) => (
            <article key={item.titleEn} className="story-card">
              <strong>{zh ? item.titleZh : item.titleEn}</strong>
              <p>{zh ? item.exampleZh : item.exampleEn}</p>
              <span>{zh ? item.proofZh : item.proofEn}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "自家应用模块" : "First-party app modules"}</span>
          <h2>{zh ? "ChainTrace 先做 6 个自家应用模块。" : "ChainTrace should start with six first-party app modules."}</h2>
          <p>{zh ? "这些模块让平台先能被使用、被演示、被销售，然后再开放 API、Agent 和第三方生态。" : "These modules make the platform usable, demoable, and sellable before opening APIs, agents, and a third-party ecosystem."}</p>
        </div>
        <div className="pack-step-grid">
          {firstPartyApps.map((item, index) => (
            <article key={item.nameEn} className="pack-step-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{zh ? item.nameZh : item.nameEn}</strong>
              <p>{zh ? item.descZh : item.descEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel proof-card public-proof-card">
        <div className="proof-card-header">
          <div>
            <span className="proof-type">{zh ? "产品路线" : "Product route"}</span>
            <h3>{zh ? "平台不是从协议开始卖，而是从角色痛点开始用。" : "The platform should not sell protocol first; it should start from role pain."}</h3>
          </div>
          <div className="status-pill">Build first</div>
        </div>
        <dl className="proof-details">
          <div><dt>Step 1</dt><dd>{zh ? "首页讲清楚：ChainTrace 是供应链事实应用。" : "Homepage explains ChainTrace as a supply-chain fact app."}</dd></div>
          <div><dt>Step 2</dt><dd>{zh ? "平台页梳理角色、痛点、场景、应用模块。" : "Platform page maps roles, pain points, scenarios, and app modules."}</dd></div>
          <div><dt>Step 3</dt><dd>{zh ? "案例页教育客户：乌拉圭牛肉、咖啡、药品、服装、矿产。" : "Case pages educate customers: beef, coffee, pharma, apparel, minerals."}</dd></div>
          <div><dt>Step 4</dt><dd>{zh ? "证明包 Builder 和企业 Fact Passport 才是第一批可用产品。" : "Proof Pack Builder and Business Fact Passport are the first usable products."}</dd></div>
        </dl>
      </section>
    </main>
  );
}
