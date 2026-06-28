import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const riskGaps = [
  {
    id: "RG-01",
    zh: "缺少中国口岸放行记录",
    en: "China port release record missing",
    ownerZh: "进口商 / 报关行",
    ownerEn: "Importer / customs broker",
    impactZh: "影响清关合规、下游销售和资金方审查。",
    impactEn: "Affects customs compliance, downstream sale, and financier review.",
    actionZh: "上传报关单、检验放行或海关状态截图。",
    actionEn: "Upload declaration, inspection release, or customs status evidence.",
    severity: "High",
  },
  {
    id: "RG-02",
    zh: "冷链温度曲线不完整",
    en: "Cold-chain temperature curve incomplete",
    ownerZh: "冷链物流商",
    ownerEn: "Cold-chain logistics provider",
    impactZh: "影响食品安全解释、保险理赔和买家验收。",
    impactEn: "Affects food-safety explanation, insurance claim, and buyer acceptance.",
    actionZh: "补充全程温度记录仪导出文件和交接记录。",
    actionEn: "Add full temperature logger export and handover records.",
    severity: "High",
  },
  {
    id: "RG-03",
    zh: "缺少入库单",
    en: "Warehouse entry record missing",
    ownerZh: "中国仓库",
    ownerEn: "China warehouse",
    impactZh: "影响货物是否真实到达指定节点的判断。",
    impactEn: "Affects judgement of whether goods really reached the target node.",
    actionZh: "上传入库单、仓库签收或 WMS 截图。",
    actionEn: "Upload warehouse entry note, receipt, or WMS screenshot.",
    severity: "Medium",
  },
  {
    id: "RG-04",
    zh: "缺少买家验收确认",
    en: "Buyer acceptance confirmation missing",
    ownerZh: "下游买家",
    ownerEn: "Downstream buyer",
    impactZh: "影响应收账款确认、融资和争议闭环。",
    impactEn: "Affects receivable confirmation, financing, and dispute closure.",
    actionZh: "邀请买家确认收货、验收或提出异议。",
    actionEn: "Invite buyer to confirm receipt, acceptance, or dispute.",
    severity: "High",
  },
];

const impactBuckets = [
  { zh: "付款", en: "Payment", count: 2, status: "Blocked" },
  { zh: "清关", en: "Customs", count: 1, status: "Blocked" },
  { zh: "融资", en: "Financing", count: 2, status: "At risk" },
  { zh: "验收", en: "Acceptance", count: 2, status: "Blocked" },
  { zh: "索赔", en: "Claims", count: 1, status: "At risk" },
  { zh: "销售", en: "Sales", count: 1, status: "At risk" },
];

export default async function RiskDashboardPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "MVP 页面 · 风险缺口看板" : "MVP Page · Risk Gap Dashboard"}</div>
            <h1>{zh ? "不只告诉你缺证，还告诉你卡在哪。" : "Not only what is missing, but where the shipment is blocked."}</h1>
            <p>
              {zh
                ? "Risk Gap Dashboard 是 ChainTrace 从“证明工具”走向“供应链协作应用”的关键页面。它把缺证、责任角色、业务影响和下一步动作放在一起。"
                : "Risk Gap Dashboard is the key page that moves ChainTrace from proof tool to supply-chain collaboration app. It connects missing evidence, responsible role, business impact, and next action."}
            </p>
            <div className="hero-actions">
              <Link href="/proof-pack-builder" className="primary-button">{zh ? "去补证据" : "Add evidence"}</Link>
              <Link href="/batches/uy-beef-cn-2026-0001" className="secondary-button">{zh ? "查看批次事实页" : "View batch fact page"}</Link>
              <Link href="/project-plan" className="secondary-button">{zh ? "查看项目计划" : "View project plan"}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "当前风险" : "Current risks"}</span><strong>4 gaps</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card pending"><span>{zh ? "高风险" : "High"}</span><strong>3</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "中风险" : "Medium"}</span><strong>1</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "责任方" : "Owners"}</span><strong>4</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "状态" : "Status"}</span><strong>Blocked</strong></div>
              </div>
              <div className="signal-status-box"><span>{zh ? "最关键下一步" : "Critical next step"}</span><strong>{zh ? "补齐口岸放行 + 买家验收。" : "Add port release + buyer acceptance."}</strong><p>{zh ? "补齐这两项后，付款、融资、验收三个结果会同时改善。" : "Once these two are added, payment, financing, and acceptance improve together."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "业务影响" : "Business impact"}</span><h2>{zh ? "缺证不是文件问题，是业务结果问题。" : "Missing evidence is not a file problem; it is a business-result problem."}</h2><p>{zh ? "用户需要知道缺口会影响付款、清关、融资、验收还是索赔。" : "Users need to know whether a gap affects payment, customs, financing, acceptance, or claims."}</p></div>
        <div className="pack-step-grid">
          {impactBuckets.map((bucket) => (
            <article key={bucket.en} className="pack-step-card">
              <span>{bucket.status}</span>
              <strong>{zh ? bucket.zh : bucket.en}</strong>
              <p>{zh ? `关联缺口：${bucket.count} 个` : `Related gaps: ${bucket.count}`}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "缺口清单" : "Gap list"}</span><h2>{zh ? "每个缺口都有责任方和下一步动作。" : "Every gap has an owner and next action."}</h2><p>{zh ? "这就是平台应用和普通文件管理的区别。" : "This is the difference between a platform app and ordinary file management."}</p></div>
        <dl className="proof-details">
          {riskGaps.map((gap) => (
            <div key={gap.id}>
              <dt>{gap.id}</dt>
              <dd>
                <strong>{zh ? gap.zh : gap.en}</strong>
                <br />
                {zh ? "责任方：" : "Owner: "}{zh ? gap.ownerZh : gap.ownerEn} · {gap.severity}
                <br />
                <span><strong>{zh ? "影响：" : "Impact: "}</strong>{zh ? gap.impactZh : gap.impactEn}</span>
                <br />
                <span><strong>{zh ? "动作：" : "Action: "}</strong>{zh ? gap.actionZh : gap.actionEn}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
