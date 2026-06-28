import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const taskGroups = [
  {
    roleZh: "进口商 / 报关行",
    roleEn: "Importer / customs broker",
    count: 2,
    tasks: [
      {
        zh: "补充中国口岸放行记录",
        en: "Add China port release record",
        batch: "UY-BEEF-CN-2026-0001",
        dueZh: "高优先级 · 影响清关和分销",
        dueEn: "High priority · affects customs and distribution",
        actionZh: "上传报关单、检验放行或海关状态截图。",
        actionEn: "Upload declaration, inspection release, or customs status screenshot.",
      },
      {
        zh: "补充税费 / 放行关联编号",
        en: "Add tax / release reference number",
        batch: "UY-BEEF-CN-2026-0001",
        dueZh: "中优先级 · 影响资金方审查",
        dueEn: "Medium priority · affects financier review",
        actionZh: "填写可公开的单证编号或上传私有附件哈希。",
        actionEn: "Enter a public document reference or upload private attachment hash.",
      },
    ],
  },
  {
    roleZh: "冷链物流商",
    roleEn: "Cold-chain logistics provider",
    count: 1,
    tasks: [
      {
        zh: "补齐完整温度曲线",
        en: "Complete full temperature curve",
        batch: "UY-BEEF-CN-2026-0001",
        dueZh: "高优先级 · 影响食品安全和保险",
        dueEn: "High priority · affects food safety and insurance",
        actionZh: "上传全程温度记录仪导出文件，并关联柜号与封条号。",
        actionEn: "Upload full logger export and link it to container and seal numbers.",
      },
    ],
  },
  {
    roleZh: "中国仓库",
    roleEn: "China warehouse",
    count: 1,
    tasks: [
      {
        zh: "补充入库单或 WMS 记录",
        en: "Add warehouse entry or WMS record",
        batch: "UY-BEEF-CN-2026-0001",
        dueZh: "中优先级 · 影响交付事实",
        dueEn: "Medium priority · affects delivery fact",
        actionZh: "上传入库单、签收单或 WMS 截图。",
        actionEn: "Upload warehouse entry note, receipt, or WMS screenshot.",
      },
    ],
  },
  {
    roleZh: "下游买家",
    roleEn: "Downstream buyer",
    count: 1,
    tasks: [
      {
        zh: "确认收货并完成验收",
        en: "Confirm receipt and acceptance",
        batch: "UY-BEEF-CN-2026-0001",
        dueZh: "高优先级 · 影响 Ready 和融资",
        dueEn: "High priority · affects Ready and financing",
        actionZh: "确认收货、验收通过，或提交异议说明。",
        actionEn: "Confirm receipt and acceptance, or submit a dispute note.",
      },
    ],
  },
];

const statusCards = [
  { zh: "待处理任务", en: "Open tasks", value: "5" },
  { zh: "高优先级", en: "High priority", value: "3" },
  { zh: "涉及角色", en: "Roles involved", value: "4" },
  { zh: "关联批次", en: "Linked batch", value: "UY-BEEF-CN-2026-0001" },
  { zh: "当前状态", en: "Current status", value: "Missing evidence" },
  { zh: "目标状态", en: "Target status", value: "Ready" },
];

export default async function TaskCenterPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "MVP 页面 · 任务中心" : "MVP Page · Task Center"}</div>
            <h1>{zh ? "让每个角色知道自己该补什么。" : "Let every role know what they need to add."}</h1>
            <p>
              {zh
                ? "Task Center 是供应链协作的入口。Risk Dashboard 告诉你缺口，Task Center 把缺口分配给具体角色，让进口商、物流商、仓库、买家各自完成自己的证据任务。"
                : "Task Center is the entry point for supply-chain collaboration. Risk Dashboard shows the gaps; Task Center assigns them to roles so importers, logistics providers, warehouses, and buyers complete their evidence tasks."}
            </p>
            <div className="hero-actions">
              <Link href="/risk-dashboard" className="primary-button">{zh ? "查看风险看板" : "View risk dashboard"}</Link>
              <Link href="/proof-pack-builder" className="secondary-button">{zh ? "编辑证明包" : "Edit proof pack"}</Link>
              <Link href="/batches/uy-beef-cn-2026-0001" className="secondary-button">{zh ? "查看批次" : "View batch"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "协作状态" : "Collaboration status"}</span><strong>5 open tasks</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card pending"><span>{zh ? "进口商" : "Importer"}</span><strong>2</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "物流" : "Logistics"}</span><strong>1</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "仓库" : "Warehouse"}</span><strong>1</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "买家" : "Buyer"}</span><strong>1</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "核心价值" : "Core value"}</span><strong>{zh ? "缺口变成任务，任务推动 Ready。" : "Gaps become tasks; tasks move the batch to Ready."}</strong><p>{zh ? "这是 ChainTrace 从展示系统变成协作系统的关键。" : "This is how ChainTrace moves from display system to collaboration system."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "任务摘要" : "Task summary"}</span><h2>{zh ? "先看整体阻塞，再进入角色任务。" : "See overall blockers first, then role tasks."}</h2><p>{zh ? "用户不用在一堆文件里找问题，系统直接告诉他哪些角色未完成。" : "Users do not hunt through files; the system shows which roles are not done."}</p></div>
        <div className="pack-step-grid">
          {statusCards.map((card) => (
            <article key={card.en} className="pack-step-card">
              <span>{zh ? card.zh : card.en}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "按角色分配" : "Assigned by role"}</span><h2>{zh ? "每个角色只看自己要做的事。" : "Each role sees only what they need to do."}</h2><p>{zh ? "这会成为邀请协作、邮件提醒、Agent 自动跟进的基础。" : "This becomes the base for invitations, email reminders, and agent follow-up."}</p></div>
        <dl className="proof-details">
          {taskGroups.map((group) => (
            <div key={group.roleEn}>
              <dt>{zh ? group.roleZh : group.roleEn}</dt>
              <dd>
                <strong>{group.count} {zh ? "个任务" : "tasks"}</strong>
                {group.tasks.map((task) => (
                  <p key={task.en}>
                    <strong>{zh ? task.zh : task.en}</strong>
                    <br />
                    {task.batch} · {zh ? task.dueZh : task.dueEn}
                    <br />
                    <span>{zh ? task.actionZh : task.actionEn}</span>
                  </p>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
