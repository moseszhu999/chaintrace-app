import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

export default async function CasesPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="eyebrow">{zh ? "ChainTrace 案例库" : "ChainTrace Case Library"}</div>
        <h1>{zh ? "用真实供应链场景，解释可信证明到底解决什么问题。" : "Use real supply-chain scenarios to explain what trust proofs actually solve."}</h1>
        <p>
          {zh
            ? "每个案例都把一条复杂供应链拆成事实节点、证据槽、风险点和 Ready / Missing evidence 状态，让小白也能看懂 ChainTrace 在做什么。"
            : "Each case breaks a complex supply chain into fact nodes, evidence slots, risk points, and Ready / Missing evidence status so non-technical users can understand ChainTrace."}
        </p>
      </section>

      <section className="story-grid">
        <article className="story-card">
          <span>{zh ? "跨境食品溯源" : "Cross-border food traceability"}</span>
          <strong>{zh ? "乌拉圭牛肉进口中国" : "Uruguay beef imported to China"}</strong>
          <p>
            {zh
              ? "从牧场、屠宰、分割、装柜、海运，到中国口岸清关、仓储和终端销售。"
              : "From ranch, slaughter, cutting, container loading, and ocean freight to China customs, warehousing, and downstream sale."}
          </p>
          <Link href="/cases/uruguay-beef-china" className="primary-button">{zh ? "打开案例" : "Open case"}</Link>
        </article>
      </section>
    </main>
  );
}
