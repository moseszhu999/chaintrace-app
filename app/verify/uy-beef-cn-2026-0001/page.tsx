import Link from "next/link";
import { cookies } from "next/headers";
import { PublicHeader } from "@/components/PublicHeader";
import { normalizeLocale } from "@/lib/i18n";

const verifyItems = [
  { zh: "原产地证明", en: "Origin proof", status: "Verified", hash: "0x9a31...c8f2", publicInfoZh: "乌拉圭牧场来源已记录。", publicInfoEn: "Uruguay ranch origin recorded." },
  { zh: "检疫 / 卫生证明", en: "Quarantine / sanitary proof", status: "Verified", hash: "0xa204...11bd", publicInfoZh: "卫生证书与检疫记录已记录。", publicInfoEn: "Sanitary certificate and quarantine record recorded." },
  { zh: "提单与装箱单", en: "Bill of lading and packing list", status: "Verified", hash: "0x3c91...72aa", publicInfoZh: "海运单证已记录。", publicInfoEn: "Ocean freight documents recorded." },
  { zh: "冷链温度记录", en: "Cold-chain temperature record", status: "Partial", hash: "0x7d80...44ef", publicInfoZh: "存在部分温度记录，但缺少完整曲线。", publicInfoEn: "Partial temperature data exists, but full curve is missing." },
  { zh: "中国口岸放行", en: "China port release", status: "Missing", hash: "Missing", publicInfoZh: "尚未记录公开可验证证据。", publicInfoEn: "No publicly verifiable evidence recorded yet." },
  { zh: "买家验收", en: "Buyer acceptance", status: "Missing", hash: "Missing", publicInfoZh: "尚未记录买家确认。", publicInfoEn: "Buyer confirmation not recorded yet." },
];

const publicSummary = [
  { labelZh: "批次", labelEn: "Batch", value: "UY-BEEF-CN-2026-0001" },
  { labelZh: "产品", labelEn: "Product", valueZh: "冷冻牛肉", valueEn: "Frozen beef" },
  { labelZh: "来源", labelEn: "Origin", valueZh: "乌拉圭", valueEn: "Uruguay" },
  { labelZh: "目的地", labelEn: "Destination", valueZh: "中国", valueEn: "China" },
  { labelZh: "公开状态", labelEn: "Public status", value: "Missing evidence" },
  { labelZh: "最后更新", labelEn: "Last update", value: "2026-06-28" },
];

export default async function PublicVerifyPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <>
      <PublicHeader zh={zh} />
      <main className="page-shell">
        <section className="hero landing-hero">
          <div className="landing-grid">
            <div className="hero-copy">
              <div className="eyebrow">{zh ? "公开验证页" : "Public Verify Portal"}</div>
              <h1>{zh ? "外部用户只需要一个链接，就能看懂这票货的可信状态。" : "External users need one link to understand shipment trust status."}</h1>
              <p>
                {zh
                  ? "这个页面面向买家、资金方、审计方和下游客户。它不暴露原始商业机密文件，只展示必要元数据、证据哈希、公开状态和缺口说明。"
                  : "This page is for buyers, financiers, auditors, and downstream customers. It does not expose confidential raw files; it shows necessary metadata, evidence hashes, public status, and gap explanation."}
              </p>
              <div className="hero-actions">
                <Link href="/dashboard" className="primary-button">{zh ? "登录查看内部工作台" : "Login to internal workspace"}</Link>
                <Link href="/tasks" className="secondary-button">{zh ? "查看任务" : "View tasks"}</Link>
                <Link href="/proof-packs" className="secondary-button">{zh ? "查看证明包" : "View proof pack"}</Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="signal-board">
                <div className="signal-board-header"><span>{zh ? "公开状态" : "Public status"}</span><strong>Missing evidence</strong></div>
                <div className="signal-card-grid">
                  <div className="mini-proof-card present"><span>{zh ? "已验证" : "Verified"}</span><strong>3</strong></div>
                  <div className="mini-proof-card present"><span>{zh ? "部分" : "Partial"}</span><strong>1</strong></div>
                  <div className="mini-proof-card pending"><span>{zh ? "缺失" : "Missing"}</span><strong>2</strong></div>
                  <div className="mini-proof-card pending"><span>{zh ? "可交易" : "Tradable"}</span><strong>{zh ? "需补证" : "Needs proof"}</strong></div>
                </div>
                <div className="signal-status-box"><span>{zh ? "外部解释" : "External explanation"}</span><strong>{zh ? "来源和单证可信，交付闭环未完成。" : "Origin and documents are credible; delivery loop is not closed."}</strong><p>{zh ? "这比简单写“正品”更可信。" : "This is more trustworthy than simply claiming authentic."}</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel product-showcase">
          <div className="section-heading"><span>{zh ? "公开摘要" : "Public summary"}</span><h2>{zh ? "先给结论，再给证据。" : "Show conclusion first, then evidence."}</h2><p>{zh ? "外部用户不需要看复杂后台，只看这张事实卡。" : "External users do not need the internal dashboard; this fact card is enough."}</p></div>
          <div className="pack-step-grid">
            {publicSummary.map((item) => (
              <article key={item.labelEn} className="pack-step-card">
                <span>{zh ? item.labelZh : item.labelEn}</span>
                <strong>{item.value ?? (zh ? item.valueZh : item.valueEn)}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="panel product-showcase">
          <div className="section-heading"><span>{zh ? "公开证据状态" : "Public evidence status"}</span><h2>{zh ? "不公开原文件，也能公开验证事实状态。" : "Verify fact status publicly without exposing raw files."}</h2><p>{zh ? "哈希用于验证文件一致性；状态用于给业务方快速判断。" : "Hashes verify file consistency; status helps business users decide quickly."}</p></div>
          <dl className="proof-details">
            {verifyItems.map((item) => (
              <div key={item.en}>
                <dt>{item.status}</dt>
                <dd>
                  <strong>{zh ? item.zh : item.en}</strong>
                  <br />
                  {zh ? item.publicInfoZh : item.publicInfoEn}
                  <br />
                  <span>Hash: {item.hash}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="panel proof-card public-proof-card">
          <div className="proof-card-header"><div><span className="proof-type">{zh ? "验证结论" : "Verification conclusion"}</span><h3>{zh ? "这票货不是不可用，而是还没有达到 Ready。" : "This shipment is not invalid; it has not reached Ready yet."}</h3></div><div className="status-pill warning">Missing evidence</div></div>
          <dl className="proof-details">
            <div><dt>{zh ? "可信部分" : "Trusted parts"}</dt><dd>{zh ? "原产地、检疫、海运单证已有可验证记录。" : "Origin, quarantine, and ocean documents have verifiable records."}</dd></div>
            <div><dt>{zh ? "缺口" : "Gaps"}</dt><dd>{zh ? "完整冷链、中国口岸放行、买家验收仍需补齐。" : "Full cold chain, China port release, and buyer acceptance still need evidence."}</dd></div>
            <div><dt>{zh ? "建议" : "Suggestion"}</dt><dd>{zh ? "交易方应先补齐高风险缺口，再用于融资、分销或正式验收。" : "Parties should fill high-risk gaps before financing, distribution, or formal acceptance."}</dd></div>
          </dl>
        </section>
      </main>
    </>
  );
}
