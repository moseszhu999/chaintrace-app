import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const productApps = [
  {
    nameZh: "Proof Pack Builder",
    nameEn: "Proof Pack Builder",
    focusZh: "核心产品",
    focusEn: "Core product",
    problemZh: "用户不知道一票货、一个订单、一个批次到底缺哪些证据。",
    problemEn: "Users do not know which evidence is missing for a shipment, order, or batch.",
    outputZh: "围绕批次 / 订单号生成 Ready / Missing evidence 状态。",
    outputEn: "Generate Ready / Missing evidence status around a batch / order ID.",
    dataZh: "ProofPack、EvidenceSlot、EvidenceItem、CompletenessRule。",
    dataEn: "ProofPack, EvidenceSlot, EvidenceItem, CompletenessRule.",
  },
  {
    nameZh: "Fact Passport",
    nameEn: "Fact Passport",
    focusZh: "可信档案",
    focusEn: "Trust profile",
    problemZh: "企业、供应商、产品、批次没有一个外部可读的可信事实页。",
    problemEn: "Businesses, suppliers, products, and batches lack an externally readable trusted fact page.",
    outputZh: "企业档案、供应商档案、产品批次档案。",
    outputEn: "Business, supplier, and product-batch passports.",
    dataZh: "Party、BusinessProfile、ProductBatch、ReputationSignal。",
    dataEn: "Party, BusinessProfile, ProductBatch, ReputationSignal.",
  },
  {
    nameZh: "Scenario Workspace",
    nameEn: "Scenario Workspace",
    focusZh: "场景工作台",
    focusEn: "Scenario workspace",
    problemZh: "不同场景需要不同证据组合，不能让用户从空白表单开始。",
    problemEn: "Different scenarios require different evidence sets; users should not start from a blank form.",
    outputZh: "跨境食品、冷链、融资、供应商准入、争议索赔等模板。",
    outputEn: "Templates for food traceability, cold chain, financing, onboarding, and claims.",
    dataZh: "ScenarioTemplate、Role、PainPoint、RequiredEvidence。",
    dataEn: "ScenarioTemplate, Role, PainPoint, RequiredEvidence.",
  },
  {
    nameZh: "Risk Gap Dashboard",
    nameEn: "Risk Gap Dashboard",
    focusZh: "风险缺口",
    focusEn: "Risk gap",
    problemZh: "用户不仅要知道缺文件，还要知道缺口影响付款、清关、融资还是验收。",
    problemEn: "Users need to know not only what is missing, but whether the gap affects payment, customs, financing, or acceptance.",
    outputZh: "缺证清单、责任角色、影响结果、下一步动作。",
    outputEn: "Missing-evidence list, responsible role, impact, and next action.",
    dataZh: "RiskGap、Responsibility、Impact、ActionItem。",
    dataEn: "RiskGap, Responsibility, Impact, ActionItem.",
  },
  {
    nameZh: "Public Verify Portal",
    nameEn: "Public Verify Portal",
    focusZh: "外部验证",
    focusEn: "External verification",
    problemZh: "买家、资金方、审计方不想登录复杂系统，只想打开链接确认状态。",
    problemEn: "Buyers, financiers, and auditors do not want a complex login; they want a link that confirms status.",
    outputZh: "可分享证明页、二维码页、公开状态页。",
    outputEn: "Shareable proof pages, QR pages, and public status pages.",
    dataZh: "PublicProofPage、ShareLink、VerificationLog。",
    dataEn: "PublicProofPage, ShareLink, VerificationLog.",
  },
  {
    nameZh: "Agent Fact API",
    nameEn: "Agent Fact API",
    focusZh: "后续开放",
    focusEn: "Later API",
    problemZh: "AI Agent 和企业系统需要读结构化事实，而不是解析散乱 PDF。",
    problemEn: "AI agents and enterprise systems need structured facts instead of parsing scattered PDFs.",
    outputZh: "状态查询、缺证订阅、事件推送、自动协作接口。",
    outputEn: "Status query, missing-evidence subscription, event push, automated collaboration APIs.",
    dataZh: "FactEvent、APIKey、Webhook、AgentTask。",
    dataEn: "FactEvent, APIKey, Webhook, AgentTask.",
  },
];

const dataDomains = [
  {
    nameZh: "主体域",
    nameEn: "Party domain",
    entitiesZh: "企业、供应商、买家、物流商、资金方、审计方、Agent。",
    entitiesEn: "Business, supplier, buyer, logistics provider, financier, auditor, agent.",
  },
  {
    nameZh: "交易域",
    nameEn: "Trade domain",
    entitiesZh: "订单、合同、发票、应收账款、付款状态。",
    entitiesEn: "Order, contract, invoice, receivable, payment status.",
  },
  {
    nameZh: "货物域",
    nameEn: "Goods domain",
    entitiesZh: "产品、批次、箱、托盘、柜号、封条、温度曲线。",
    entitiesEn: "Product, batch, carton, pallet, container, seal, temperature curve.",
  },
  {
    nameZh: "证据域",
    nameEn: "Evidence domain",
    entitiesZh: "证据文件、哈希、元数据、证据槽、证明包、完整度规则。",
    entitiesEn: "Evidence file, hash, metadata, evidence slot, proof pack, completeness rule.",
  },
  {
    nameZh: "流程域",
    nameEn: "Process domain",
    entitiesZh: "生产、质检、发货、装柜、运输、清关、入库、交付、验收。",
    entitiesEn: "Production, inspection, shipment, loading, transport, customs, warehouse entry, delivery, acceptance.",
  },
  {
    nameZh: "风险域",
    nameEn: "Risk domain",
    entitiesZh: "缺证、异常、责任方、影响环节、下一步动作。",
    entitiesEn: "Missing evidence, exception, responsible party, impact area, next action.",
  },
];

const techLayers = [
  {
    layerZh: "前端产品层",
    layerEn: "Frontend product layer",
    contentZh: "首页、产品架构、场景工作台、证明包 Builder、企业档案、公开验证页。",
    contentEn: "Homepage, product architecture, scenario workspace, proof pack builder, passports, public verification pages.",
  },
  {
    layerZh: "应用服务层",
    layerEn: "Application service layer",
    contentZh: "Proof Pack Service、Evidence Service、Passport Service、Scenario Service、Risk Gap Service。",
    contentEn: "Proof Pack Service, Evidence Service, Passport Service, Scenario Service, Risk Gap Service.",
  },
  {
    layerZh: "数据服务层",
    layerEn: "Data service layer",
    contentZh: "MongoDB / Postgres 保存结构化事实；对象存储保存原始文件或私有附件引用；索引服务支持检索。",
    contentEn: "MongoDB / Postgres stores structured facts; object storage stores private files or references; indexing service supports search.",
  },
  {
    layerZh: "可信证明层",
    layerEn: "Trust proof layer",
    contentZh: "SHA-256、证据哈希、链上锚定、时间戳、公开验证、可选零知识 / 隐私证明。",
    contentEn: "SHA-256, evidence hash, on-chain anchor, timestamp, public verification, optional ZK / privacy proof.",
  },
  {
    layerZh: "集成与 Agent 层",
    layerEn: "Integration and agent layer",
    contentZh: "API、Webhook、ERP / SaaS Connector、Agent Fact API、状态订阅。",
    contentEn: "API, webhook, ERP / SaaS connectors, Agent Fact API, status subscriptions.",
  },
];

const roadmap = [
  {
    phaseZh: "P0：产品主线统一",
    phaseEn: "P0: Unify product spine",
    detailZh: "先把首页、产品架构、场景案例、证明包、企业档案统一成一个平台叙事。",
    detailEn: "Unify homepage, product architecture, cases, proof packs, and passports into one platform narrative.",
  },
  {
    phaseZh: "P1：Proof Pack Builder 可用",
    phaseEn: "P1: Make Proof Pack Builder usable",
    detailZh: "围绕一个批次 / 订单补齐证据槽，自动判断 Ready / Missing evidence。",
    detailEn: "Fill evidence slots around a batch / order and automatically judge Ready / Missing evidence.",
  },
  {
    phaseZh: "P2：Fact Passport 可分享",
    phaseEn: "P2: Make Fact Passport shareable",
    detailZh: "企业、供应商、产品、批次都有外部可读的事实档案页。",
    detailEn: "Businesses, suppliers, products, and batches get externally readable fact passport pages.",
  },
  {
    phaseZh: "P3：Risk Gap Dashboard",
    phaseEn: "P3: Risk Gap Dashboard",
    detailZh: "告诉用户缺什么证据、谁负责补、影响什么业务结果。",
    detailEn: "Show what evidence is missing, who should add it, and what business result is affected.",
  },
  {
    phaseZh: "P4：API / Agent 生态",
    phaseEn: "P4: API / Agent ecosystem",
    detailZh: "在自家产品跑通后，再开放 Agent Fact API 和第三方应用。",
    detailEn: "After the first-party product works, open Agent Fact API and third-party apps.",
  },
];

export default async function ProductPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "ChainTrace 产品架构" : "ChainTrace Product Architecture"}</div>
            <h1>{zh ? "先主攻产品：从场景到应用，再反推数据和技术。" : "Product first: scenarios define apps, apps define data and technology."}</h1>
            <p>
              {zh
                ? "ChainTrace 的第一阶段不是继续堆概念，而是把供应链角色和场景沉淀成可用产品：证明包 Builder、事实档案、场景工作台、风险缺口看板、公开验证页。数据架构和技术架构都为这些产品服务。"
                : "The first phase of ChainTrace is not more concepts. It turns supply-chain roles and scenarios into usable products: Proof Pack Builder, Fact Passport, Scenario Workspace, Risk Gap Dashboard, and Public Verify Portal. Data and technology serve those products."}
            </p>
            <div className="hero-actions">
              <Link href="/#create-proof" className="primary-button">{zh ? "先创建一个证明" : "Create a proof first"}</Link>
              <Link href="/platform" className="secondary-button">{zh ? "查看角色痛点" : "View role pain map"}</Link>
              <Link href="/cases" className="secondary-button">{zh ? "查看场景案例" : "View scenario cases"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header">
                <span>{zh ? "统一方法" : "Unified method"}</span>
                <strong>Scenario → App → Data → Tech</strong>
              </div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "场景" : "Scenario"}</span><strong>{zh ? "定义痛点" : "Pain"}</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "应用" : "App"}</span><strong>{zh ? "解决任务" : "Job"}</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "数据" : "Data"}</span><strong>{zh ? "沉淀事实" : "Facts"}</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "技术" : "Tech"}</span><strong>{zh ? "支撑验证" : "Proof"}</strong></div>
              </div>
              <div className="signal-status-box">
                <span>{zh ? "产品原则" : "Product principle"}</span>
                <strong>{zh ? "不要先卖链，先卖缺证问题。" : "Do not sell chain first; sell missing-evidence relief first."}</strong>
                <p>{zh ? "用户真正买的是：少扯皮、快验证、能付款、能清关、能融资、能追责。" : "Users buy less dispute, faster verification, payment, customs clearance, financing, and accountability."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "一、应用架构" : "1. Application architecture"}</span>
          <h2>{zh ? "先做 6 个自家产品应用。" : "Start with six first-party product apps."}</h2>
          <p>{zh ? "每个应用都必须对应明确场景、明确痛点、明确输出，而不是抽象模块。" : "Every app must map to a clear scenario, pain point, and output, not an abstract module."}</p>
        </div>
        <div className="pack-step-grid">
          {productApps.map((app, index) => (
            <article key={app.nameEn} className="pack-step-card">
              <span>{String(index + 1).padStart(2, "0")} · {zh ? app.focusZh : app.focusEn}</span>
              <strong>{zh ? app.nameZh : app.nameEn}</strong>
              <p>{zh ? app.problemZh : app.problemEn}</p>
              <p><strong>{zh ? "输出：" : "Output: "}</strong>{zh ? app.outputZh : app.outputEn}</p>
              <p><strong>{zh ? "数据：" : "Data: "}</strong>{zh ? app.dataZh : app.dataEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading">
            <span>{zh ? "二、数据架构" : "2. Data architecture"}</span>
            <h2>{zh ? "数据不是文件库，而是供应链事实模型。" : "Data is not a file library; it is a supply-chain fact model."}</h2>
            <p>{zh ? "原始文件只是输入，平台真正沉淀的是主体、交易、货物、证据、流程、风险之间的关系。" : "Raw files are only input. The platform records relationships among parties, trade, goods, evidence, process, and risk."}</p>
          </div>
          <dl className="proof-details">
            {dataDomains.map((domain) => (
              <div key={domain.nameEn}>
                <dt>{zh ? domain.nameZh : domain.nameEn}</dt>
                <dd>{zh ? domain.entitiesZh : domain.entitiesEn}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel">
          <div className="section-heading">
            <span>{zh ? "核心对象关系" : "Core object relationship"}</span>
            <h2>{zh ? "一个批次 / 订单是产品的中心锚点。" : "One batch / order ID is the product anchor."}</h2>
            <p>{zh ? "所有证据都围绕同一个业务锚点聚合，而不是散落在不同页面。" : "All evidence aggregates around one business anchor instead of being scattered across pages."}</p>
          </div>
          <dl className="proof-details">
            <div><dt>Party</dt><dd>{zh ? "谁参与：供应商、贸易商、买家、物流、资金方、审计方。" : "Who participates: supplier, trader, buyer, logistics, financier, auditor."}</dd></div>
            <div><dt>Trade</dt><dd>{zh ? "什么交易：订单、合同、发票、应收账款。" : "What trade: order, contract, invoice, receivable."}</dd></div>
            <div><dt>Goods</dt><dd>{zh ? "什么货：产品、批次、箱、托盘、柜。" : "What goods: product, batch, carton, pallet, container."}</dd></div>
            <div><dt>Evidence</dt><dd>{zh ? "有什么证据：文件哈希、元数据、证据槽、状态。" : "What evidence: file hash, metadata, evidence slot, status."}</dd></div>
            <div><dt>ProofPack</dt><dd>{zh ? "如何判断：规则、完整度、Ready / Missing evidence。" : "How to judge: rules, completeness, Ready / Missing evidence."}</dd></div>
            <div><dt>RiskGap</dt><dd>{zh ? "缺什么：责任方、影响结果、下一步动作。" : "What is missing: owner, impact, next action."}</dd></div>
          </dl>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "三、技术架构" : "3. Technical architecture"}</span>
          <h2>{zh ? "技术只服务一个目标：让供应链事实可验证、可分享、可自动读取。" : "Technology serves one goal: make supply-chain facts verifiable, shareable, and machine-readable."}</h2>
          <p>{zh ? "当前不要炫技术，先确保产品闭环。链上、AI、Agent、API 都排在产品证据闭环之后。" : "Do not lead with technology. On-chain, AI, agents, and APIs come after the product evidence loop works."}</p>
        </div>
        <div className="story-grid">
          {techLayers.map((layer) => (
            <article key={layer.layerEn} className="story-card">
              <strong>{zh ? layer.layerZh : layer.layerEn}</strong>
              <p>{zh ? layer.contentZh : layer.contentEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "产品优先路线图" : "Product-first roadmap"}</span>
          <h2>{zh ? "先做能被客户理解和使用的产品闭环。" : "First build a product loop customers understand and use."}</h2>
          <p>{zh ? "平台、数据、技术都要围绕这个路线图收敛。" : "Platform, data, and technology should converge around this roadmap."}</p>
        </div>
        <dl className="proof-details">
          {roadmap.map((item) => (
            <div key={item.phaseEn}>
              <dt>{zh ? item.phaseZh : item.phaseEn}</dt>
              <dd>{zh ? item.detailZh : item.detailEn}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel proof-card public-proof-card">
        <div className="proof-card-header">
          <div>
            <span className="proof-type">{zh ? "当前收敛结论" : "Current convergence"}</span>
            <h3>{zh ? "ChainTrace 的第一产品不是区块链工具，而是供应链证据完整度应用。" : "The first ChainTrace product is not a blockchain tool; it is a supply-chain evidence-completeness app."}</h3>
          </div>
          <div className="status-pill">Product First</div>
        </div>
        <dl className="proof-details">
          <div><dt>{zh ? "主攻" : "Focus"}</dt><dd>{zh ? "Proof Pack Builder + Fact Passport。" : "Proof Pack Builder + Fact Passport."}</dd></div>
          <div><dt>{zh ? "先不主攻" : "Not first"}</dt><dd>{zh ? "复杂协议、第三方生态、过早 Agent 平台、过深链上叙事。" : "Complex protocol, third-party ecosystem, premature agent platform, and deep on-chain narrative."}</dd></div>
          <div><dt>{zh ? "产品口号" : "Product line"}</dt><dd>{zh ? "让一票货缺什么证据、卡在哪、能不能 Ready，一眼看清。" : "See what evidence a shipment lacks, where it is blocked, and whether it can be Ready at a glance."}</dd></div>
        </dl>
      </section>
    </main>
  );
}
