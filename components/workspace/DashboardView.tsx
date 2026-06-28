import { getBlockerText, getMissingEvidenceSlots, getReadyScore, getVerifiedEvidenceCount } from "@/lib/demo-workspace-data";
import type { WorkspaceSnapshot } from "@/lib/workspace-repository";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function DashboardView({ zh, workspace }: { zh: boolean; workspace: WorkspaceSnapshot }) {
  const { businessContext, evidenceSlots, proofPack } = workspace;
  const verified = getVerifiedEvidenceCount(evidenceSlots);
  const missing = getMissingEvidenceSlots(evidenceSlots).length;
  const readyScore = getReadyScore(evidenceSlots);
  const blockerText = getBlockerText(zh, evidenceSlots);

  return (
    <>
      <div className="pack-step-grid">
        <a href="/proof-packs" className="pack-step-card"><span>{t(zh, "当前证明包", "Current proof pack")}</span><strong>{proofPack.title}</strong><p>{proofPack.status}</p></a>
        <a href="/evidence" className="pack-step-card"><span>{t(zh, "Ready 分数", "Ready score")}</span><strong>{readyScore}%</strong><p>{verified}/{evidenceSlots.length} {t(zh, "项已验证", "verified")}</p></a>
        <a href="/tasks" className="pack-step-card"><span>{t(zh, "待办任务", "Open tasks")}</span><strong>{missing}</strong><p>{blockerText}</p></a>
        <a href="/assistant/approvals" className="pack-step-card"><span>{t(zh, "审批", "Approvals")}</span><strong>pending</strong><p>{t(zh, "买家验收提醒待确认", "Buyer acceptance reminder needs review")}</p></a>
        <a href="/verify/uy-beef-cn-2026-0001" className="pack-step-card"><span>{t(zh, "公开链接", "Public link")}</span><strong>/verify</strong><p>{t(zh, "只公开状态和哈希", "Status and hashes only")}</p></a>
        <a href="/assistant" className="pack-step-card"><span>{t(zh, "助手建议", "Assistant advice")}</span><strong>{t(zh, "先补入库", "Warehouse first")}</strong><p>{t(zh, "再催买家验收", "Then chase buyer acceptance")}</p></a>
      </div>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "业务队列", "Business queue")}</span><h2>{t(zh, "证明包不是介绍卡片，是工作对象。", "Proof packs are work objects, not presentation cards.")}</h2></div>
          <dl className="proof-details">
            <div><dt>{proofPack.status}</dt><dd><strong>{proofPack.title}</strong><br />{t(zh, businessContext.outcomeZh, businessContext.outcomeEn)}</dd></div>
            <div><dt>{t(zh, "当前卡点", "Blocker")}</dt><dd>{blockerText}</dd></div>
            <div><dt>{t(zh, "下一步", "Next")}</dt><dd>{t(zh, "打开证据页补齐入库记录，或让助手生成提醒草稿。", "Open Evidence to complete warehouse entry, or let the assistant draft a reminder.")}</dd></div>
          </dl>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "最近活动", "Recent activity")}</span><h2>{t(zh, "登录后每个动作都留痕。", "Every logged-in action leaves an audit trail.")}</h2></div>
          <dl className="proof-details">
            <div><dt>01</dt><dd>{t(zh, "用户进入工作台，系统加载当前组织和证明包。", "User opened workspace; system loaded current organization and proof pack.")}</dd></div>
            <div><dt>02</dt><dd>{t(zh, "系统识别入库记录和买家验收仍未补齐。", "System identified warehouse entry and buyer acceptance as incomplete.")}</dd></div>
          </dl>
        </div>
      </section>
    </>
  );
}
