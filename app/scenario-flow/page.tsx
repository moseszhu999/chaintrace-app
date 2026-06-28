import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const loginFlow = [
  {
    step: "01",
    zh: "客户登录 / 选择角色",
    en: "Customer logs in / selects role",
    actorZh: "供应商、贸易商、进口商、买家、资金方",
    actorEn: "Supplier, trader, importer, buyer, financier",
    actionZh: "系统根据角色显示不同入口和待办。",
    actionEn: "System shows role-specific entry points and tasks.",
    page: "/customer-workspace",
  },
  {
    step: "02",
    zh: "选择业务场景",
    en: "Select business scenario",
    actorZh: "当前登录用户",
    actorEn: "Current user",
    actionZh: "选择跨境食品、应收账款、冷链责任等场景。",
    actionEn: "Choose food import, receivable financing, cold-chain responsibility, etc.",
    page: "/scenario-workspace",
  },
  {
    step: "03",
    zh: "创建批次 / 订单证明包",
    en: "Create batch / order proof pack",
    actorZh: "贸易商 / 供应商",
    actorEn: "Trader / supplier",
    actionZh: "输入批次号、业务名称、交易对象，系统生成证据槽。",
    actionEn: "Enter batch ID, business name, parties; system generates evidence slots.",
    page: "/proof-pack-builder",
  },
  {
    step: "04",
    zh: "补证据 / 上传或接入系统",
    en: "Complete evidence / upload or sync",
    actorZh: "供应商、物流、仓库、买家",
    actorEn: "Supplier, logistics, warehouse, buyer",
    actionZh: "按责任方补齐订单、发票、发货、质检、交付、验收等证据。",
    actionEn: "Complete order, invoice, shipment, inspection, delivery, and acceptance evidence by owner.",
    page: "/evidence-library",
  },
  {
    step: "05",
    zh: "系统生成缺口与任务",
    en: "System generates gaps and tasks",
    actorZh: "ChainTrace / AI Agent",
    actorEn: "ChainTrace / AI Agent",
    actionZh: "缺失或未验证的证据自动变成任务，分配给责任角色。",
    actionEn: "Missing or unverified evidence becomes tasks assigned to responsible roles.",
    page: "/tasks",
  },
  {
    step: "06",
    zh: "风险看板判断业务影响",
    en: "Risk dashboard judges business impact",
    actorZh: "进口商、买家、资金方",
    actorEn: "Importer, buyer, financier",
    actionZh: "显示缺口影响付款、清关、融资、验收还是索赔。",
    actionEn: "Show whether gaps affect payment, customs, financing, acceptance, or claims.",
    page: "/risk-dashboard",
  },
  {
    step: "07",
    zh: "生成公开验证链接",
    en: "Generate public verification link",
    actorZh: "贸易商 / 进口商",
    actorEn: "Trader / importer",
    actionZh: "把状态、哈希和必要元数据分享给外部买家、资金方或审计方。",
    actionEn: "Share status, hashes, and necessary metadata with buyers, financiers, or auditors.",
    page: "/verify/uy-beef-cn-2026-0001",
  },
  {
    step: "08",
    zh: "形成企业长期事实档案",
    en: "Build long-term business fact passport",
    actorZh: "企业 / 平台",
    actorEn: "Business / platform",
    actionZh: "多个证明包沉淀为 Ready 率、缺证处理速度、争议闭环等声誉信号。",
    actionEn: "Multiple proof packs become reputation signals: Ready rate, gap handling speed, dispute closure.",
    page: "/business-passport",
  },
];

const interactions = [
  { zh: "选择角色", en: "Choose role", descZh: "登录后先区分我是供应商、贸易商、买家还是资金方。", descEn: "After login, identify whether I am supplier, trader, buyer, or financier." },
  { zh: "创建批次", en: "Create batch", descZh: "围绕一票货或一个订单创建业务锚点。", descEn: "Create a business anchor around one shipment or order." },
  { zh: "补证据", en: "Add evidence", descZh: "每个证据必须落入一个证据槽，而不是随便上传文件。", descEn: "Each evidence item must fill a slot, not just sit in a folder." },
  { zh: "验证状态", en: "Verify status", descZh: "Missing、Present、Verified、Rejected 直接影响 Ready。", descEn: "Missing, Present, Verified, Rejected directly affect Ready." },
  { zh: "分配任务", en: "Assign task", descZh: "缺证自动分配给责任角色。", descEn: "Missing evidence is automatically assigned to responsible roles." },
  { zh: "分享链接", en: "Share link", descZh: "外部人不用登录也能看公开验证状态。", descEn: "External users can see public verification status without login." },
];

export default async function ScenarioFlowPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "场景流程与登录后互动" : "Scenario Flow and Post-login Interaction"}</div>
            <h1>{zh ? "先梳理客户登录后怎么用，再谈功能模块。" : "Define how customers use it after login before talking modules."}</h1>
            <p>
              {zh
                ? "ChainTrace 的场景流程应该从客户动作出发：登录、选角色、选场景、建批次、补证据、看缺口、分配任务、分享链接、沉淀档案。每一步都要对应一个页面和一个可执行动作。"
                : "ChainTrace scenario flow should start from customer actions: login, choose role, choose scenario, create batch, add evidence, view gaps, assign tasks, share link, and build passport. Every step needs a page and an executable action."}
            </p>
            <div className="hero-actions">
              <Link href="/customer-workspace" className="primary-button">{zh ? "打开可点击工作台" : "Open clickable workspace"}</Link>
              <Link href="/proof-pack-builder" className="secondary-button">{zh ? "查看 Builder" : "View Builder"}</Link>
              <Link href="/tasks" className="secondary-button">{zh ? "查看任务" : "View tasks"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "客户路径" : "Customer path"}</span><strong>Login → Ready → Share</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "登录" : "Login"}</span><strong>Role</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "创建" : "Create"}</span><strong>Batch</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "补证" : "Evidence"}</span><strong>Slots</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "分享" : "Share"}</span><strong>Link</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "重点" : "Focus"}</span><strong>{zh ? "每一步都要有可点击动作。" : "Every step needs a clickable action."}</strong><p>{zh ? "否则就会像 PPT 解说。" : "Otherwise it feels like slide narration."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "客户登录后的主流程" : "Main post-login flow"}</span><h2>{zh ? "每一步对应一个真实页面。" : "Every step maps to a real page."}</h2><p>{zh ? "流程不是给内部看的，是为了定义客户怎么操作。" : "The flow is not internal documentation; it defines how customers operate."}</p></div>
        <dl className="proof-details">
          {loginFlow.map((item) => (
            <div key={item.step}>
              <dt>{item.step}</dt>
              <dd>
                <strong>{zh ? item.zh : item.en}</strong>
                <br />
                {zh ? "角色：" : "Actor: "}{zh ? item.actorZh : item.actorEn}
                <br />
                <span>{zh ? item.actionZh : item.actionEn}</span>
                <br />
                <Link href={item.page}>{item.page}</Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "必须有的互动" : "Required interactions"}</span><h2>{zh ? "从说明页变成产品，靠这些互动。" : "These interactions turn pages into product."}</h2><p>{zh ? "下一步开发应该围绕这些操作，而不是继续堆介绍。" : "Next development should focus on these operations, not more explanation."}</p></div>
        <div className="story-grid">
          {interactions.map((item) => (
            <article key={item.en} className="story-card">
              <strong>{zh ? item.zh : item.en}</strong>
              <p>{zh ? item.descZh : item.descEn}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
