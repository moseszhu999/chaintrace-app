import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const architectureRows = [
  {
    painZh: "证据散乱，遇到争议说不清。",
    painEn: "Evidence is scattered and hard to explain during disputes.",
    userZh: "小工厂 / 供应商 / 贸易商",
    userEn: "Small factory / supplier / trader",
    actionZh: "把一票货的订单、发票、质检、发货、交付、验收收进一个证明包。",
    actionEn: "Collect order, invoice, inspection, shipment, delivery, and acceptance into one proof pack.",
    functionZh: "Proof Pack Builder",
    functionEn: "Proof Pack Builder",
    dataZh: "ProofPack、EvidenceSlot、EvidenceItem",
    dataEn: "ProofPack, EvidenceSlot, EvidenceItem",
    resultZh: "少扯皮，更快证明履约。",
    resultEn: "Less dispute, faster fulfillment proof.",
  },
  {
    painZh: "不知道缺什么证据，业务卡住但没人负责。",
    painEn: "Nobody knows what evidence is missing; the business is blocked without an owner.",
    userZh: "进口商 / 仓库 / 买家 / 物流商",
    userEn: "Importer / warehouse / buyer / logistics provider",
    actionZh: "把缺口转成角色任务，告诉谁该补、补什么、影响什么结果。",
    actionEn: "Turn gaps into role tasks: who adds what and which business result is affected.",
    functionZh: "Task Center + Risk Dashboard",
    functionEn: "Task Center + Risk Dashboard",
    dataZh: "RiskGap、Task、Responsibility、Impact",
    dataEn: "RiskGap, Task, Responsibility, Impact",
    resultZh: "责任清楚，推动 Missing 变成 Ready。",
    resultEn: "Clear ownership; move Missing toward Ready.",
  },
  {
    painZh: "外部客户、资金方、审计方不想登录系统，只想快速判断可信状态。",
    painEn: "External customers, financiers, and auditors do not want to log in; they want quick trust status.",
    userZh: "买家 / 资金方 / 审计方",
    userEn: "Buyer / financier / auditor",
    actionZh: "生成一个可分享公开验证页，只暴露状态、哈希和必要元数据。",
    actionEn: "Generate a shareable public verification page exposing only status, hashes, and necessary metadata.",
    functionZh: "Public Verify Portal",
    functionEn: "Public Verify Portal",
    dataZh: "ShareLink、PublicProofPage、VerificationLog",
    dataEn: "ShareLink, PublicProofPage, VerificationLog",
    resultZh: "一个链接完成外部验证。",
    resultEn: "One link completes external verification.",
  },
  {
    painZh: "单次交易可信不够，企业需要长期可信档案。",
    painEn: "One trade is not enough; businesses need long-term trust profiles.",
    userZh: "供应商 / 贸易商 / 买家 / 资金方",
    userEn: "Supplier / trader / buyer / financier",
    actionZh: "把多个批次、证明包、交付记录、缺证处理沉淀成企业事实档案。",
    actionEn: "Aggregate batches, proof packs, delivery records, and gap handling into a business fact passport.",
    functionZh: "Business Fact Passport",
    functionEn: "Business Fact Passport",
    dataZh: "Party、BusinessProfile、ProofHistory、TrustSignal",
    dataEn: "Party, BusinessProfile, ProofHistory, TrustSignal",
    resultZh: "形成可积累的供应链声誉资产。",
    resultEn: "Build accumulated supply-chain reputation assets.",
  },
  {
    painZh: "不同场景证据要求不同，用户不知道从哪里开始。",
    painEn: "Different scenarios need different evidence; users do not know where to start.",
    userZh: "所有小 B 用户",
    userEn: "All small-business users",
    actionZh: "从场景模板启动，自动生成证据槽、角色任务和缺口规则。",
    actionEn: "Start from scenario templates that generate slots, role tasks, and gap rules.",
    functionZh: "Scenario Workspace",
    functionEn: "Scenario Workspace",
    dataZh: "ScenarioTemplate、RequiredEvidence、RoleRule",
    dataEn: "ScenarioTemplate, RequiredEvidence, RoleRule",
    resultZh: "不用懂建模，也能开始补证。",
    resultEn: "Start evidence completion without understanding modeling.",
  },
  {
    painZh: "真实证据来自 ERP、仓库、物流、IoT、发票系统，不能永远手工上传。",
    painEn: "Real evidence comes from ERP, warehouse, logistics, IoT, and invoice systems; manual upload cannot last forever.",
    userZh: "企业系统 / SaaS / AI Agent",
    userEn: "Enterprise systems / SaaS / AI agents",
    actionZh: "提供连接器、事件、API，让外部系统和 Agent 读写事实状态。",
    actionEn: "Provide connectors, events, and APIs so external systems and agents can read and write fact status.",
    functionZh: "Integrations + Agent API",
    functionEn: "Integrations + Agent API",
    dataZh: "FactEvent、Webhook、APIKey、AgentTask",
    dataEn: "FactEvent, Webhook, APIKey, AgentTask",
    resultZh: "从手工证明升级为事实基础设施。",
    resultEn: "Upgrade from manual proof to fact infrastructure.",
  },
];

const functionGroups = [
  {
    nameZh: "一、入口层：先让用户按痛点进入",
    nameEn: "1. Entry layer: let users enter by pain",
    descZh: "不是按技术模块进，而是按“我要融资、我要清关、我要验收、我要证明交付”进入。",
    descEn: "Users enter by jobs such as financing, customs, acceptance, or delivery proof, not by technical modules.",
    modulesZh: ["用户价值页", "Scenario Workspace", "案例模板", "角色入口"],
    modulesEn: ["User value page", "Scenario Workspace", "Case templates", "Role entry"],
  },
  {
    nameZh: "二、证明层：把散乱材料变成证明包",
    nameEn: "2. Proof layer: turn scattered materials into proof packs",
    descZh: "核心是 Proof Pack Builder，不是文件夹。每个文件必须落到证据槽和业务结果上。",
    descEn: "The core is Proof Pack Builder, not folders. Every file must map to an evidence slot and business result.",
    modulesZh: ["Proof Pack Builder", "Evidence Slot", "Evidence Library", "Hash / Metadata"],
    modulesEn: ["Proof Pack Builder", "Evidence Slot", "Evidence Library", "Hash / Metadata"],
  },
  {
    nameZh: "三、协作层：把缺证变成任务",
    nameEn: "3. Collaboration layer: turn gaps into tasks",
    descZh: "用户真正需要的是下一步动作：谁补、补什么、为什么补。",
    descEn: "Users need next actions: who adds what and why.",
    modulesZh: ["Task Center", "Risk Dashboard", "Role Responsibility", "Notifications"],
    modulesEn: ["Task Center", "Risk Dashboard", "Role Responsibility", "Notifications"],
  },
  {
    nameZh: "四、验证层：给外部人一个链接",
    nameEn: "4. Verification layer: give outsiders one link",
    descZh: "买家、资金方、审计方不想看后台，只要能判断可信状态。",
    descEn: "Buyers, financiers, and auditors do not want the backend; they need trust status.",
    modulesZh: ["Public Verify Portal", "Batch Fact Page", "Share Link", "Verification Log"],
    modulesEn: ["Public Verify Portal", "Batch Fact Page", "Share Link", "Verification Log"],
  },
  {
    nameZh: "五、资产层：把一次证明沉淀成长期声誉",
    nameEn: "5. Asset layer: turn one proof into long-term reputation",
    descZh: "企业长期 Ready 率、补证速度、争议闭环，才是小企业的可信资产。",
    descEn: "Long-term Ready rate, gap handling speed, and dispute closure become business trust assets.",
    modulesZh: ["Business Fact Passport", "Trust Signals", "Proof History", "Supplier Rating Input"],
    modulesEn: ["Business Fact Passport", "Trust Signals", "Proof History", "Supplier Rating Input"],
  },
  {
    nameZh: "六、接入层：让事实被系统和 Agent 使用",
    nameEn: "6. Integration layer: make facts usable by systems and agents",
    descZh: "长期要让 ERP、WMS、TMS、IoT、AI Agent 接入事实层。",
    descEn: "Long term, ERP, WMS, TMS, IoT, and AI agents connect to the fact layer.",
    modulesZh: ["Integrations", "Agent API", "Webhook", "FactEvent"],
    modulesEn: ["Integrations", "Agent API", "Webhook", "FactEvent"],
  },
];

const mvpOrder = [
  { step: "01", zh: "用户选择场景和角色", en: "User selects scenario and role", module: "Scenario Workspace" },
  { step: "02", zh: "系统生成证明包和证据槽", en: "System generates proof pack and evidence slots", module: "Proof Pack Builder" },
  { step: "03", zh: "缺口自动变成角色任务", en: "Gaps become role tasks", module: "Task Center" },
  { step: "04", zh: "证据进入统一证据库", en: "Evidence enters one library", module: "Evidence Library" },
  { step: "05", zh: "系统显示风险和业务影响", en: "System shows risk and business impact", module: "Risk Dashboard" },
  { step: "06", zh: "对外生成可验证链接", en: "Generate external verification link", module: "Public Verify Portal" },
  { step: "07", zh: "企业积累长期可信档案", en: "Business accumulates long-term trust passport", module: "Business Passport" },
];

export default async function FunctionArchitecturePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "痛点驱动功能架构" : "Pain-driven Function Architecture"}</div>
            <h1>{zh ? "功能不是从模块出发，而是从用户卡在哪里出发。" : "Functions should start from where users are blocked, not from modules."}</h1>
            <p>
              {zh
                ? "ChainTrace 的整体功能架构要按用户痛点组织：证据散乱、缺口没人负责、外部验证麻烦、企业可信不能积累、系统事实不能互通。每个功能都必须回答：它替哪个用户少了什么麻烦，带来什么业务结果。"
                : "ChainTrace should organize functions by user pain: scattered evidence, unowned gaps, difficult external verification, no accumulated trust, and disconnected facts. Every function must answer which user's trouble it removes and which business outcome it creates."}
            </p>
            <div className="hero-actions">
              <Link href="/user-value" className="primary-button">{zh ? "查看用户价值" : "View user value"}</Link>
              <Link href="/scenario-workspace" className="secondary-button">{zh ? "进入场景工作台" : "Open scenario workspace"}</Link>
              <Link href="/proof-pack-builder" className="secondary-button">{zh ? "创建证明包" : "Create proof pack"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "架构公式" : "Architecture formula"}</span><strong>Pain → Action → Function → Data → Outcome</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card pending"><span>{zh ? "痛点" : "Pain"}</span><strong>{zh ? "卡住" : "Blocked"}</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "动作" : "Action"}</span><strong>{zh ? "补证" : "Complete"}</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "功能" : "Function"}</span><strong>Proof Pack</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "结果" : "Outcome"}</span><strong>Ready</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "判断" : "Judgement"}</span><strong>{zh ? "不能证明解决痛点的功能，先不要做。" : "Do not build functions that cannot prove pain relief."}</strong><p>{zh ? "这是控制产品不发散的硬规则。" : "This is the hard rule to keep the product focused."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "痛点到功能映射" : "Pain-to-function map"}</span>
          <h2>{zh ? "每个功能必须绑定一个用户痛点。" : "Every function must bind to a user pain."}</h2>
          <p>{zh ? "不是“我们有什么模块”，而是“这个模块替谁解决什么麻烦”。" : "Not what modules we have, but whose trouble each module removes."}</p>
        </div>
        <dl className="proof-details">
          {architectureRows.map((row) => (
            <div key={row.functionEn}>
              <dt>{zh ? row.functionZh : row.functionEn}</dt>
              <dd>
                <strong>{zh ? "用户：" : "User: "}</strong>{zh ? row.userZh : row.userEn}
                <br />
                <strong>{zh ? "痛点：" : "Pain: "}</strong>{zh ? row.painZh : row.painEn}
                <br />
                <strong>{zh ? "解决动作：" : "Action: "}</strong>{zh ? row.actionZh : row.actionEn}
                <br />
                <strong>{zh ? "数据对象：" : "Data: "}</strong>{zh ? row.dataZh : row.dataEn}
                <br />
                <span><strong>{zh ? "业务结果：" : "Outcome: "}</strong>{zh ? row.resultZh : row.resultEn}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "功能分层" : "Function layers"}</span>
          <h2>{zh ? "六层功能架构，都从用户痛点反推。" : "Six function layers, all derived from user pain."}</h2>
          <p>{zh ? "这才是后续页面、数据表、API、Agent 的统一骨架。" : "This becomes the unified skeleton for pages, data tables, APIs, and agents."}</p>
        </div>
        <div className="story-grid">
          {functionGroups.map((group) => (
            <article key={group.nameEn} className="story-card">
              <strong>{zh ? group.nameZh : group.nameEn}</strong>
              <p>{zh ? group.descZh : group.descEn}</p>
              <p>{(zh ? group.modulesZh : group.modulesEn).join(" · ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "MVP 功能顺序" : "MVP function order"}</span>
          <h2>{zh ? "先做能直接解决痛点的闭环。" : "First build the loop that directly relieves pain."}</h2>
          <p>{zh ? "不要先做大平台，先让一票货从 Missing 走到 Ready。" : "Do not build the big platform first; make one shipment move from Missing to Ready."}</p>
        </div>
        <dl className="proof-details">
          {mvpOrder.map((item) => (
            <div key={item.step}>
              <dt>{item.step}</dt>
              <dd><strong>{zh ? item.zh : item.en}</strong><br />{item.module}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel proof-card public-proof-card">
        <div className="proof-card-header"><div><span className="proof-type">{zh ? "功能取舍原则" : "Function prioritization rule"}</span><h3>{zh ? "所有功能都要通过一条测试：它是否让某个角色更快完成交易判断？" : "Every function must pass one test: does it help a role make a trade decision faster?"}</h3></div><div className="status-pill">Pain First</div></div>
        <dl className="proof-details">
          <div><dt>{zh ? "先做" : "Build first"}</dt><dd>{zh ? "场景入口、证明包、任务、证据库、风险、公开验证。" : "Scenario entry, proof packs, tasks, evidence library, risks, public verification."}</dd></div>
          <div><dt>{zh ? "后做" : "Build later"}</dt><dd>{zh ? "复杂生态、深度链上、自动 Agent、第三方市场。" : "Complex ecosystem, deep on-chain, autonomous agents, third-party marketplace."}</dd></div>
          <div><dt>{zh ? "不做" : "Do not build"}</dt><dd>{zh ? "不能对应用户痛点、只为了显得高级的功能。" : "Features that do not map to user pain and only look impressive."}</dd></div>
        </dl>
      </section>
    </main>
  );
}
