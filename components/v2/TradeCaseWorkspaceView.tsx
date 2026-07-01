import Link from "next/link";
import { EvidenceUploadClient } from "@/components/v2/EvidenceUploadClient";
import type { TradeCaseWorkspaceV2 } from "@/lib/v2/trade-case-types";
import { stageLabel } from "@/lib/v2/trade-case-types";

type Props = { zh: boolean; workspace: TradeCaseWorkspaceV2; userEmail: string };

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function TradeCaseWorkspaceView({ zh, workspace, userEmail }: Props) {
  const tradeCase = workspace.case;

  return (
    <div className="workspace-stack">
      <div className="stats-grid">
        <article className="metric-card">
          <span>Case No</span>
          <strong>{tradeCase.caseNo}</strong>
          <small>{tradeCase.status}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "当前阶段", "Current stage")}</span>
          <strong>{stageLabel(tradeCase.currentStage)}</strong>
          <small>{t(zh, "Evidence 会挂到阶段。", "Evidence attaches to stages.")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "证据", "Evidence")}</span>
          <strong>SHA-256</strong>
          <small>{t(zh, "上传后生成真实 hash。", "Upload generates real hash.")}</small>
        </article>
      </div>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Trade Case", "Trade Case")}</span>
          <h2>{tradeCase.caseName}</h2>
          <p>{t(zh, "这是 v2.1 的真实 Case Workspace。", "This is the real v2.1 Case Workspace.")}</p>
        </div>
        <dl className="proof-details">
          <div><dt>{t(zh, "买方", "Buyer")}</dt><dd>{tradeCase.buyerName || "—"}</dd></div>
          <div><dt>{t(zh, "金额", "Amount")}</dt><dd>{tradeCase.currency ?? ""} {tradeCase.amount ?? "—"}</dd></div>
          <div><dt>{t(zh, "货物", "Goods")}</dt><dd>{tradeCase.goodsDescription || "—"}</dd></div>
          <div><dt>{t(zh, "路线", "Route")}</dt><dd>{tradeCase.originCountry || "—"} → {tradeCase.destinationCountry || "—"}</dd></div>
        </dl>
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Stages", "Stages")}</span>
          <h2>{t(zh, "业务阶段", "Business stages")}</h2>
        </div>
        <div className="proof-flow-grid">
          {workspace.stages.map((stage) => (
            <article className="proof-flow-card" key={stage.id}>
              <strong>{stageLabel(stage.stageCode)}</strong>
              <span>{stage.status}</span>
              <span>{t(zh, "Evidence upload available below", "Evidence upload available below")}</span>
            </article>
          ))}
        </div>
      </section>

      <EvidenceUploadClient zh={zh} caseId={tradeCase.id} userEmail={userEmail} />

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "State", "State")}</span>
          <h2>{t(zh, "状态变化", "State transitions")}</h2>
        </div>
        <div className="proof-flow-grid">
          {workspace.transitions.map((transition) => (
            <article className="proof-flow-card" key={transition.id}>
              <strong>{transition.trigger}</strong>
              <span>{transition.fromState || "START"} → {transition.toState}</span>
              <span>{transition.createdAt}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="hero-actions">
        <Link className="secondary-button" href="/trade-cases">{t(zh, "返回 Case 列表", "Back to cases")}</Link>
      </div>
    </div>
  );
}
