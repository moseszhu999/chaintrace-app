import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const userValues = [
  {
    roleZh: "小工厂 / 供应商",
    roleEn: "Small factory / supplier",
    painZh: "货做完了、也发了，但证据散在微信、邮箱、Excel、纸质单据里。客户一争议，就要反复解释。",
    painEn: "They produced and shipped goods, but evidence is scattered across chat, email, Excel, and paper. When a customer disputes, they explain again and again.",
    valueZh: "ChainTrace 帮他把订单、质检、发货、交付、验收串成一个证明包。",
    valueEn: "ChainTrace turns order, inspection, shipment, delivery, and acceptance into one proof pack.",
    outcomeZh: "少扯皮、更快收款、更容易证明自己履约。",
    outcomeEn: "Less dispute, faster collection, easier proof of fulfillment.",
    productZh: "Proof Pack Builder + Task Center",
    productEn: "Proof Pack Builder + Task Center",
  },
  {
    roleZh: "贸易商 / 出口商",
    roleEn: "Trader / exporter",
    painZh: "上下游文件太多，客户、银行、保险、物流每个人要看的材料都不一样，重复沟通成本高。",
    painEn: "Too many upstream and downstream documents; customers, banks, insurers, and logistics partners ask for different materials.",
    valueZh: "ChainTrace 把一票货整理成可分享的事实链和公开验证页。",
    valueEn: "ChainTrace organizes one shipment into a shareable fact chain and public verification page.",
    outcomeZh: "少重复解释，给客户和资金方一个链接就能看状态。",
    outcomeEn: "Less repeated explanation; one link shows status to customers and financiers.",
    productZh: "Batch Fact Page + Public Verify Portal",
    productEn: "Batch Fact Page + Public Verify Portal",
  },
  {
    roleZh: "进口商 / 分销商",
    roleEn: "Importer / distributor",
    painZh: "拿到货之前很难快速判断来源、冷链、报关、检疫、入库是否完整。文件不一致时风险很大。",
    painEn: "Before receiving goods, they struggle to judge whether origin, cold chain, customs, quarantine, and warehouse entry are complete.",
    valueZh: "ChainTrace 直接显示这批货哪里 Verified、哪里 Missing、哪里有风险。",
    valueEn: "ChainTrace shows what is Verified, what is Missing, and where the risk is.",
    outcomeZh: "更快决定能不能入库、付款、分销。",
    outcomeEn: "Faster decisions on receiving, payment, and distribution.",
    productZh: "Risk Dashboard + Batch Fact Page",
    productEn: "Risk Dashboard + Batch Fact Page",
  },
  {
    roleZh: "物流 / 冷链服务商",
    roleEn: "Logistics / cold-chain provider",
    painZh: "运输出问题时，温度、封条、交接、延误责任很难说清，容易背锅。",
    painEn: "When transit problems happen, temperature, seal, handover, and delay responsibility are hard to explain, so they get blamed.",
    valueZh: "ChainTrace 给每个交接点和温控记录建立证据对象。",
    valueEn: "ChainTrace creates evidence objects for each handover point and temperature record.",
    outcomeZh: "责任边界更清楚，索赔和争议更容易处理。",
    outcomeEn: "Clearer responsibility boundaries; easier claims and dispute handling.",
    productZh: "Evidence Library + Task Center",
    productEn: "Evidence Library + Task Center",
  },
  {
    roleZh: "买家 / 采购方",
    roleEn: "Buyer / procurement",
    painZh: "供应商说材料齐了，但采购方很难一眼看出订单、质检、交付、验收是否闭环。",
    painEn: "Suppliers say documents are complete, but buyers cannot instantly see whether order, inspection, delivery, and acceptance form a closed loop.",
    valueZh: "ChainTrace 给买家一个清楚的 Ready / Missing evidence 判断。",
    valueEn: "ChainTrace gives buyers a clear Ready / Missing evidence judgement.",
    outcomeZh: "降低验真成本，减少追问和内部审批阻塞。",
    outcomeEn: "Lower verification cost, fewer follow-ups, fewer internal approval blockers.",
    productZh: "Public Verify Portal + Business Passport",
    productEn: "Public Verify Portal + Business Passport",
  },
  {
    roleZh: "资金方 / 保险方",
    roleEn: "Financier / insurer",
    painZh: "不敢只看发票放款或承保，需要知道真实交易、真实货物、真实交付是否存在。",
    painEn: "They cannot lend or underwrite based on invoices alone; they need to know whether real trade, goods, and delivery exist.",
    valueZh: "ChainTrace 先给事实完整度和风险缺口，再进入风控、融资、理赔流程。",
    valueEn: "ChainTrace shows fact completeness and risk gaps before risk review, financing, or claims.",
    outcomeZh: "减少假贸易风险，加快低风险交易审核。",
    outcomeEn: "Reduce fake-trade risk and speed up review for lower-risk transactions.",
    productZh: "Risk Dashboard + Business Passport",
    productEn: "Risk Dashboard + Business Passport",
  },
  {
    roleZh: "审计 / 合规方",
    roleEn: "Auditor / compliance",
    painZh: "要追溯证据来源、时间、责任人和版本，但传统材料没有统一索引。",
    painEn: "They need evidence source, time, owner, and version, but traditional documents lack a unified index.",
    valueZh: "ChainTrace 把证据变成可追溯、可复核、可抽查的索引。",
    valueEn: "ChainTrace turns evidence into a traceable, reviewable, sample-checkable index.",
    outcomeZh: "审计更快，证据链更清楚，抽查成本更低。",
    outcomeEn: "Faster audits, clearer evidence chain, lower sampling cost.",
    productZh: "Evidence Library + Public Verify Portal",
    productEn: "Evidence Library + Public Verify Portal",
  },
  {
    roleZh: "AI Agent / 企业系统",
    roleEn: "AI Agent / enterprise system",
    painZh: "Agent 不能只读自然语言和 PDF 猜事实，需要结构化、可验证的事实状态。",
    painEn: "Agents cannot guess facts from natural language and PDFs; they need structured, verifiable fact states.",
    valueZh: "ChainTrace 提供 ProofPack、Evidence、RiskGap、Task 等可读取对象。",
    valueEn: "ChainTrace exposes readable objects such as ProofPack, Evidence, RiskGap, and Task.",
    outcomeZh: "Agent 能自动提醒、补证、协作、预警，而不是乱猜。",
    outcomeEn: "Agents can remind, complete evidence, collaborate, and alert instead of guessing.",
    productZh: "Integrations + Agent API",
    productEn: "Integrations + Agent API",
  },
];

const valuePrinciples = [
  {
    zh: "不要卖区块链，先卖少扯皮。",
    en: "Do not sell blockchain first; sell less dispute first.",
    descZh: "小企业不关心底层协议，关心客户认不认、钱能不能快点回来。",
    descEn: "Small businesses care less about protocol and more about whether customers accept the proof and pay faster.",
  },
  {
    zh: "不要卖文件管理，先卖证据完整度。",
    en: "Do not sell file management first; sell evidence completeness first.",
    descZh: "文件夹解决不了交易信任，Ready / Missing evidence 才能推动业务动作。",
    descEn: "Folders do not solve trade trust; Ready / Missing evidence drives business action.",
  },
  {
    zh: "不要卖监管替代品，先卖可验证事实。",
    en: "Do not sell a regulator replacement; sell verifiable facts first.",
    descZh: "ChainTrace 不替代监管和审计，而是让事实更容易被监管、审计、客户和资金方读取。",
    descEn: "ChainTrace does not replace regulators or auditors; it makes facts easier for regulators, auditors, customers, and financiers to read.",
  },
  {
    zh: "不要卖平台愿景，先卖一个能发出去的链接。",
    en: "Do not sell platform vision first; sell one shareable link first.",
    descZh: "外部买家和资金方打开链接能看懂状态，这就是第一价值闭环。",
    descEn: "When buyers and financiers can understand status from one link, the first value loop is real.",
  },
];

export default async function UserValuePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "用户价值" : "User Value"}</div>
            <h1>{zh ? "ChainTrace 给用户带来的不是功能，而是少扯皮、快验证、能收款。" : "ChainTrace does not sell features; it gives users less dispute, faster verification, and better collection."}</h1>
            <p>
              {zh
                ? "从用户出发，ChainTrace 的价值不是“上链”“哈希”“平台”，而是把分散证据变成能被客户、买家、资金方、审计方和系统读取的事实状态。"
                : "From the user perspective, ChainTrace is not about chain, hash, or platform first. It turns scattered evidence into fact status readable by customers, buyers, financiers, auditors, and systems."}
            </p>
            <div className="hero-actions">
              <Link href="/scenario-workspace" className="primary-button">{zh ? "按场景开始" : "Start by scenario"}</Link>
              <Link href="/proof-pack-builder" className="secondary-button">{zh ? "创建证明包" : "Create proof pack"}</Link>
              <Link href="/verify/uy-beef-cn-2026-0001" className="secondary-button">{zh ? "查看公开验证" : "View public verify"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "价值公式" : "Value formula"}</span><strong>Pain → Proof → Outcome</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card pending"><span>{zh ? "痛点" : "Pain"}</span><strong>{zh ? "散乱证据" : "Scattered proof"}</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "产品" : "Product"}</span><strong>Proof Pack</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "状态" : "Status"}</span><strong>Ready / Missing</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "结果" : "Outcome"}</span><strong>{zh ? "更快决策" : "Faster decision"}</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "一句话" : "One line"}</span><strong>{zh ? "让一票货到底缺什么证据，一眼看清。" : "Make missing evidence for one shipment obvious at a glance."}</strong><p>{zh ? "这才是小企业、买家和资金方愿意用的价值。" : "This is the value small businesses, buyers, and financiers will actually use."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "用户痛点 → ChainTrace 价值" : "User pain → ChainTrace value"}</span>
          <h2>{zh ? "每个角色都要看到自己的好处。" : "Every role must see its own benefit."}</h2>
          <p>{zh ? "不要让用户理解我们的架构；要让用户马上理解自己能少什么麻烦。" : "Do not ask users to understand our architecture; show what trouble we remove for them."}</p>
        </div>
        <dl className="proof-details">
          {userValues.map((item) => (
            <div key={item.roleEn}>
              <dt>{zh ? item.roleZh : item.roleEn}</dt>
              <dd>
                <strong>{zh ? "痛点：" : "Pain: "}</strong>{zh ? item.painZh : item.painEn}
                <br />
                <strong>{zh ? "我们带来：" : "We bring: "}</strong>{zh ? item.valueZh : item.valueEn}
                <br />
                <strong>{zh ? "结果：" : "Outcome: "}</strong>{zh ? item.outcomeZh : item.outcomeEn}
                <br />
                <span>{zh ? "对应产品：" : "Product: "}{zh ? item.productZh : item.productEn}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "产品表达原则" : "Product messaging principles"}</span>
          <h2>{zh ? "对外不要先讲技术，要先讲业务结果。" : "Do not lead with technology; lead with business outcomes."}</h2>
          <p>{zh ? "这组原则应该反过来改首页、演示脚本和销售话术。" : "These principles should drive homepage, demo script, and sales copy."}</p>
        </div>
        <div className="story-grid">
          {valuePrinciples.map((item) => (
            <article key={item.en} className="story-card">
              <strong>{zh ? item.zh : item.en}</strong>
              <p>{zh ? item.descZh : item.descEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel proof-card public-proof-card">
        <div className="proof-card-header"><div><span className="proof-type">{zh ? "核心定位" : "Core positioning"}</span><h3>{zh ? "ChainTrace 是给供应链参与方用的证据完整度与事实协作平台。" : "ChainTrace is an evidence-completeness and fact-collaboration platform for supply-chain participants."}</h3></div><div className="status-pill">User First</div></div>
        <dl className="proof-details">
          <div><dt>{zh ? "用户不买" : "Users do not buy"}</dt><dd>{zh ? "区块链、哈希、抽象平台、复杂协议。" : "Blockchain, hashes, abstract platform, complex protocol."}</dd></div>
          <div><dt>{zh ? "用户会买" : "Users buy"}</dt><dd>{zh ? "少扯皮、快验证、能收款、能清关、能融资、能追责。" : "Less dispute, faster verification, collection, customs clearance, financing, and accountability."}</dd></div>
          <div><dt>{zh ? "第一产品" : "First product"}</dt><dd>{zh ? "围绕一票货的 Proof Pack + Ready / Missing evidence 状态。" : "Proof Pack around one shipment + Ready / Missing evidence status."}</dd></div>
        </dl>
      </section>
    </main>
  );
}
