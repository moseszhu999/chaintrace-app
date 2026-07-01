import Link from "next/link";
import { getIsZhRequest } from "@/lib/request-locale";
import { safeGetCurrentTradeCase, safeListTradeCases } from "@/lib/repositories/safe-chaintrace-repository";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const [zh, activeCase, cases] = await Promise.all([getIsZhRequest(), safeGetCurrentTradeCase(), safeListTradeCases()]);

  return (
    <main className="page-shell">
      <section className="panel workspace-panel">
        <div className="workspace-topbar">
          <div>
            <div className="eyebrow">{zh ? "贸易 Case" : "Trade cases"}</div>
            <h1 className="workspace-title">{zh ? "Case 工作台" : "Case workspace"}</h1>
            <p className="workspace-subtitle">
              {zh ? "把 demo 模块收束到 case-centered workflow。" : "The demo modules now start from a case-centered workflow."}
            </p>
          </div>
          <Link className="primary-button" href={`/cases/${activeCase.id}`}>
            {zh ? "打开当前 Case" : "Open active case"}
          </Link>
        </div>

        <div className="proof-flow-grid" style={{ marginTop: "24px" }}>
          {cases.map((trade) => (
            <article className="proof-flow-card" key={trade.id}>
              <strong>{zh ? trade.titleZh : trade.titleEn}</strong>
              <span>{trade.id}</span>
              <span>PO: {trade.poNo}</span>
              <span>Invoice: {trade.invoiceNo}</span>
              <span>{zh ? "边界：Pre-review only" : "Boundary: Pre-review only"}</span>
              <span>source={trade.source}</span>
              <Link className="secondary-button" href={`/cases/${trade.id}`}>
                {zh ? "进入 Case" : "Enter case"}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
