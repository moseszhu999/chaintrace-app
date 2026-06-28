import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const phases = [
  {
    phaseZh: "第 0 阶段：统一产品主线",
    phaseEn: "Phase 0: Unify the product spine",
    timeZh: "第 1 周",
    timeEn: "Week 1",
    goalZh: "把 ChainTrace 从零散页面统一成一个供应链证据完整度产品。",
    goalEn: "Turn ChainTrace from scattered pages into one supply-chain evidence-completeness product.",
    deliverablesZh: ["统一导航与命名", "产品架构页", "角色痛点页", "场景案例入口", "首页主叙事收敛"],
    deliverablesEn: ["Unified navigation and naming", "Product architecture page", "Role pain map", "Scenario case entry", "Homepage narrative convergence"],
    acceptanceZh: "用户 10 秒内知道：这是帮一票货判断缺什么证据、能不能 Ready 的平台。",
    acceptanceEn: "A user understands within 10 seconds: this platform shows what evidence a shipment lacks and whether it can be Ready.",
  },
  {
    phaseZh: "第 1 阶段：Proof Pack Builder MVP",
    phaseEn: "Phase 1: Proof Pack Builder MVP",
    timeZh: "第 2-3 周",
    timeEn: "Weeks 2-3",
    goalZh: "围绕一个订单 / 批次创建证明包，管理证据槽和 Ready / Missing evidence 状态。",
    goalEn: "Create proof packs around one order / batch, manage evidence slots, and show Ready / Missing evidence status.",
    deliverablesZh: ["证明包创建流程", "六类核心证据槽", "证据上传与哈希", "完整度规则", "缺证提示"],
    deliverablesEn: ["Proof pack creation flow", "Six core evidence slots", "Evidence upload and hash", "Completeness rules", "Missing-evidence alerts"],
    acceptanceZh: "用户可创建一个批次，上传订单、发票、发货、质检、交付、验收证据，并看到状态变化。",
    acceptanceEn: "A user can create a batch, upload order, invoice, shipment, inspection, delivery, and acceptance evidence, and see status changes.",
  },
  {
    phaseZh: "第 2 阶段：Fact Passport MVP",
    phaseEn: "Phase 2: Fact Passport MVP",
    timeZh: "第 4 周",
    timeEn: "Week 4",
    goalZh: "把企业、供应商、产品、批次的事实沉淀成可分享档案。",
    goalEn: "Turn business, supplier, product, and batch facts into shareable passports.",
    deliverablesZh: ["企业档案页", "批次档案页", "证明包聚合", "公开分享链接", "二维码入口"],
    deliverablesEn: ["Business passport page", "Batch passport page", "Proof pack aggregation", "Public share link", "QR entry"],
    acceptanceZh: "买家或资金方打开链接即可查看企业和批次的证据完整度。",
    acceptanceEn: "A buyer or financier can open a link and view business and batch evidence completeness.",
  },
  {
    phaseZh: "第 3 阶段：Scenario Workspace",
    phaseEn: "Phase 3: Scenario Workspace",
    timeZh: "第 5-6 周",
    timeEn: "Weeks 5-6",
    goalZh: "按场景启动应用，而不是从空白上传文件开始。",
    goalEn: "Start from scenario templates instead of blank file upload.",
    deliverablesZh: ["跨境食品溯源模板", "应收账款融资模板", "冷链责任模板", "供应商准入模板", "争议索赔模板"],
    deliverablesEn: ["Cross-border food traceability template", "Receivable financing template", "Cold-chain responsibility template", "Supplier onboarding template", "Dispute and claim template"],
    acceptanceZh: "用户选择场景后，系统自动生成对应证据槽、角色责任和缺证规则。",
    acceptanceEn: "After choosing a scenario, the system generates evidence slots, role responsibilities, and missing-evidence rules.",
  },
  {
    phaseZh: "第 4 阶段：Risk Gap Dashboard",
    phaseEn: "Phase 4: Risk Gap Dashboard",
    timeZh: "第 7 周",
    timeEn: "Week 7",
    goalZh: "从展示状态升级为告诉用户下一步该做什么。",
    goalEn: "Move from showing status to telling users what to do next.",
    deliverablesZh: ["缺证清单", "责任角色", "业务影响", "下一步动作", "提醒与状态订阅"],
    deliverablesEn: ["Missing-evidence list", "Responsible role", "Business impact", "Next action", "Reminders and status subscription"],
    acceptanceZh: "用户能看到：缺什么、谁补、影响付款/清关/融资/验收哪个结果。",
    acceptanceEn: "A user can see what is missing, who should add it, and whether it affects payment, customs, financing, or acceptance.",
  },
  {
    phaseZh: "第 5 阶段：Pilot 与产品化验证",
    phaseEn: "Phase 5: Pilot and product validation",
    timeZh: "第 8 周",
    timeEn: "Week 8",
    goalZh: "用 2-3 个具体行业案例验证是否能讲清、能演示、能收集客户反馈。",
    goalEn: "Use 2-3 industry cases to validate whether the product can be explained, demoed, and improved with customer feedback.",
    deliverablesZh: ["乌拉圭牛肉案例", "咖啡/服装/药品二选一案例", "演示脚本", "客户反馈表", "下一轮 backlog"],
    deliverablesEn: ["Uruguay beef case", "One of coffee / apparel / pharma cases", "Demo script", "Customer feedback form", "Next backlog"],
    acceptanceZh: "能面向小贸易商、进口商、资金方完整演示一个从 Missing 到 Ready 的证据闭环。",
    acceptanceEn: "The team can demo a full Missing-to-Ready evidence loop to small traders, importers, and financiers.",
  },
];

const workstreams = [
  {
    nameZh: "产品与 UX",
    nameEn: "Product and UX",
    itemsZh: ["信息架构", "页面流程", "角色入口", "场景模板", "状态文案", "Demo 脚本"],
    itemsEn: ["Information architecture", "Page flow", "Role entry", "Scenario templates", "Status copy", "Demo script"],
  },
  {
    nameZh: "前端应用",
    nameEn: "Frontend app",
    itemsZh: ["Proof Pack Builder", "Fact Passport", "Risk Gap Dashboard", "Public Verify Page", "案例库"],
    itemsEn: ["Proof Pack Builder", "Fact Passport", "Risk Gap Dashboard", "Public Verify Page", "Case library"],
  },
  {
    nameZh: "后端与 API",
    nameEn: "Backend and API",
    itemsZh: ["证明包 API", "证据 API", "档案 API", "状态判断 API", "分享链接 API"],
    itemsEn: ["Proof pack API", "Evidence API", "Passport API", "Status rule API", "Share link API"],
  },
  {
    nameZh: "数据模型",
    nameEn: "Data model",
    itemsZh: ["Party", "Trade", "Goods", "Evidence", "ProofPack", "RiskGap", "FactEvent"],
    itemsEn: ["Party", "Trade", "Goods", "Evidence", "ProofPack", "RiskGap", "FactEvent"],
  },
  {
    nameZh: "可信证明",
    nameEn: "Trust proof",
    itemsZh: ["SHA-256", "文件哈希", "元数据签名", "链上锚定", "公开验证"],
    itemsEn: ["SHA-256", "File hash", "Metadata signature", "On-chain anchor", "Public verification"],
  },
  {
    nameZh: "试点与销售材料",
    nameEn: "Pilot and sales material",
    itemsZh: ["行业案例", "客户演示", "FAQ", "价格包装", "反馈收集"],
    itemsEn: ["Industry cases", "Customer demo", "FAQ", "Pricing package", "Feedback collection"],
  },
];

const mvpBacklog = [
  {
    titleZh: "证明包数据模型",
    titleEn: "Proof pack data model",
    priority: "P0",
    outputZh: "定义 ProofPack、EvidenceSlot、EvidenceItem、CompletenessRule。",
    outputEn: "Define ProofPack, EvidenceSlot, EvidenceItem, CompletenessRule.",
  },
  {
    titleZh: "证明包创建页面",
    titleEn: "Proof pack creation page",
    priority: "P0",
    outputZh: "用户输入业务名称、批次/订单号、场景类型，生成证据槽。",
    outputEn: "User enters business name, batch/order ID, scenario type, and generates evidence slots.",
  },
  {
    titleZh: "证据槽状态判断",
    titleEn: "Evidence slot status rules",
    priority: "P0",
    outputZh: "每个槽显示 Missing / Present / Verified / Rejected。",
    outputEn: "Each slot shows Missing / Present / Verified / Rejected.",
  },
  {
    titleZh: "批次事实页",
    titleEn: "Batch fact page",
    priority: "P0",
    outputZh: "围绕一个批次展示证据完整度、风险缺口、分享链接。",
    outputEn: "Show evidence completeness, risk gaps, and share link around one batch.",
  },
  {
    titleZh: "企业 Fact Passport",
    titleEn: "Business Fact Passport",
    priority: "P1",
    outputZh: "聚合企业历史证明包、Ready 率、缺证风险、公开资料。",
    outputEn: "Aggregate historical proof packs, Ready rate, risk gaps, and public information.",
  },
  {
    titleZh: "乌拉圭牛肉模板产品化",
    titleEn: "Productize Uruguay beef template",
    priority: "P1",
    outputZh: "从案例页升级为可创建的食品溯源模板。",
    outputEn: "Upgrade case page into a creatable food traceability template.",
  },
  {
    titleZh: "风险缺口看板",
    titleEn: "Risk gap dashboard",
    priority: "P2",
    outputZh: "按业务影响聚合缺证：付款、融资、清关、验收、索赔。",
    outputEn: "Group missing evidence by business impact: payment, financing, customs, acceptance, claims.",
  },
];

const risks = [
  {
    riskZh: "继续做成概念网站，而不是可操作产品。",
    riskEn: "It remains a concept site instead of an operable product.",
    controlZh: "所有页面必须指向 Proof Pack Builder 和 Fact Passport。",
    controlEn: "Every page must point to Proof Pack Builder and Fact Passport.",
  },
  {
    riskZh: "过早强调区块链，客户听不懂。",
    riskEn: "Over-emphasizing blockchain too early confuses customers.",
    controlZh: "对外只讲证据完整度、可验证、可分享；链上锚定作为高级能力。",
    controlEn: "Externally talk about completeness, verification, and sharing; on-chain anchor stays advanced.",
  },
  {
    riskZh: "场景太多，MVP 失焦。",
    riskEn: "Too many scenarios make the MVP unfocused.",
    controlZh: "主攻应收账款证明包 + 跨境食品溯源两个场景。",
    controlEn: "Focus on receivable proof pack and cross-border food traceability first.",
  },
  {
    riskZh: "数据模型太复杂，开发推进慢。",
    riskEn: "The data model becomes too complex and slows development.",
    controlZh: "先围绕 Batch / Order / Evidence / ProofPack 四个核心对象做。",
    controlEn: "Start with four core objects: Batch / Order / Evidence / ProofPack.",
  },
];

export default async function ProjectPlanPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "ChainTrace 项目计划" : "ChainTrace Project Plan"}</div>
            <h1>{zh ? "8 周做出可演示、可验证、可试点的供应链事实产品。" : "Build a demoable, verifiable, pilot-ready supply-chain fact product in eight weeks."}</h1>
            <p>
              {zh
                ? "项目主线收敛为 Proof Pack Builder + Fact Passport。先解决一票货缺什么证据、卡在哪、能不能 Ready，再逐步扩展场景、风险看板、API 和 Agent。"
                : "The project spine converges on Proof Pack Builder + Fact Passport. First solve what evidence a shipment lacks, where it is blocked, and whether it can be Ready; then expand to scenarios, risk dashboards, APIs, and agents."}
            </p>
            <div className="hero-actions">
              <Link href="/product" className="primary-button">{zh ? "查看产品架构" : "View product architecture"}</Link>
              <Link href="/#create-proof" className="secondary-button">{zh ? "创建证明" : "Create proof"}</Link>
              <Link href="/cases/uruguay-beef-china" className="secondary-button">{zh ? "查看试点案例" : "View pilot case"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "项目主线" : "Project spine"}</span><strong>Product → Data → Tech → Pilot</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>MVP</span><strong>Proof Pack</strong></div>
                <div className="mini-proof-card present"><span>MVP</span><strong>Passport</strong></div>
                <div className="mini-proof-card pending"><span>Pilot</span><strong>Food trace</strong></div>
                <div className="mini-proof-card pending"><span>Later</span><strong>Agent API</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "原则" : "Principle"}</span><strong>{zh ? "先产品闭环，后平台生态。" : "Product loop first, platform ecosystem later."}</strong><p>{zh ? "能创建、能补证、能判断、能分享、能演示，再谈协议和生态。" : "Create, add evidence, judge status, share, and demo first; protocol and ecosystem later."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "阶段计划" : "Phase plan"}</span><h2>{zh ? "8 周项目推进节奏。" : "Eight-week delivery rhythm."}</h2><p>{zh ? "每个阶段都有目标、交付物和验收标准。" : "Each phase has goals, deliverables, and acceptance criteria."}</p></div>
        <dl className="proof-details">
          {phases.map((phase) => (
            <div key={phase.phaseEn}>
              <dt>{zh ? phase.timeZh : phase.timeEn}</dt>
              <dd>
                <strong>{zh ? phase.phaseZh : phase.phaseEn}</strong>
                <br />
                {zh ? phase.goalZh : phase.goalEn}
                <br />
                <span><strong>{zh ? "交付物：" : "Deliverables: "}</strong>{(zh ? phase.deliverablesZh : phase.deliverablesEn).join(" · ")}</span>
                <br />
                <span><strong>{zh ? "验收：" : "Acceptance: "}</strong>{zh ? phase.acceptanceZh : phase.acceptanceEn}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "工作流" : "Workstreams"}</span><h2>{zh ? "项目按 6 条工作流推进。" : "The project runs through six workstreams."}</h2><p>{zh ? "所有工作流都服务 Proof Pack Builder 和 Fact Passport 两个主产品。" : "Every workstream serves the two core products: Proof Pack Builder and Fact Passport."}</p></div>
        <div className="story-grid">
          {workstreams.map((stream) => (
            <article key={stream.nameEn} className="story-card">
              <strong>{zh ? stream.nameZh : stream.nameEn}</strong>
              <p>{(zh ? stream.itemsZh : stream.itemsEn).join(" · ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{zh ? "MVP Backlog" : "MVP Backlog"}</span><h2>{zh ? "先做这些，不要发散。" : "Build these first; do not diffuse."}</h2><p>{zh ? "P0 必须优先完成，P1/P2 等产品闭环稳定后再做。" : "P0 must finish first; P1/P2 follow after the product loop stabilizes."}</p></div>
          <dl className="proof-details">
            {mvpBacklog.map((item) => (
              <div key={item.titleEn}>
                <dt>{item.priority}</dt>
                <dd><strong>{zh ? item.titleZh : item.titleEn}</strong><br />{zh ? item.outputZh : item.outputEn}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel">
          <div className="section-heading"><span>{zh ? "主要风险" : "Key risks"}</span><h2>{zh ? "项目失焦风险要提前压住。" : "Control focus risks early."}</h2><p>{zh ? "ChainTrace 最容易犯的错是太早讲平台、协议、AI，而不是先做产品闭环。" : "The easiest mistake is talking platform, protocol, and AI too early instead of building the product loop first."}</p></div>
          <dl className="proof-details">
            {risks.map((item, index) => (
              <div key={item.riskEn}>
                <dt>R{index + 1}</dt>
                <dd><strong>{zh ? item.riskZh : item.riskEn}</strong><br /><span>{zh ? `控制：${item.controlZh}` : `Control: ${item.controlEn}`}</span></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="panel proof-card public-proof-card">
        <div className="proof-card-header"><div><span className="proof-type">{zh ? "项目结论" : "Project conclusion"}</span><h3>{zh ? "第一阶段成功标准：客户能看懂、能操作、能演示一票货从 Missing 到 Ready。" : "First-stage success: customers can understand, operate, and demo a shipment moving from Missing to Ready."}</h3></div><div className="status-pill">8 Weeks</div></div>
        <dl className="proof-details">
          <div><dt>{zh ? "主攻产品" : "Core product"}</dt><dd>Proof Pack Builder + Fact Passport</dd></div>
          <div><dt>{zh ? "主攻场景" : "Core scenarios"}</dt><dd>{zh ? "应收账款证明包 + 跨境食品溯源。" : "Receivable proof pack + cross-border food traceability."}</dd></div>
          <div><dt>{zh ? "暂缓" : "Defer"}</dt><dd>{zh ? "复杂协议、第三方生态、过早 Agent 平台、过度链上叙事。" : "Complex protocol, third-party ecosystem, premature agent platform, and over-heavy on-chain narrative."}</dd></div>
        </dl>
      </section>
    </main>
  );
}
