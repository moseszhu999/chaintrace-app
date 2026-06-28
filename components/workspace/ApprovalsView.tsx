"use client";

import { useState } from "react";
import { demoWorkspace, getContextLabel } from "@/lib/demo-workspace-data";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function ApprovalsView({ zh }: { zh: boolean }) {
  const buyerDraft = demoWorkspace.drafts[1];
  const buyerApproval = demoWorkspace.approvals[1];
  const [draftBody, setDraftBody] = useState(zh ? buyerDraft.bodyZh : buyerDraft.bodyEn);
  const [approvalState, setApprovalState] = useState(buyerApproval.status);

  return (
    <section className="workspace">
      <div className="panel form-panel">
        <div className="section-heading">
          <span>{t(zh, "审批草稿", "Draft approval")}</span>
          <h2>{t(zh, "AI 不能直接发送。", "AI cannot send directly.")}</h2>
          <p>{t(zh, "付款、融资、验收、理赔、法律责任相关动作都必须确认。", "Actions related to payment, financing, acceptance, claims, and legal responsibility require confirmation.")}</p>
        </div>
        <label>{t(zh, "买家验收提醒草稿", "Buyer acceptance reminder draft")}<textarea rows={8} value={draftBody} onChange={(event) => setDraftBody(event.target.value)} /></label>
        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={() => setApprovalState("approved")}>{t(zh, "批准并发送", "Approve and send")}</button>
          <button type="button" className="secondary-button" onClick={() => setApprovalState("needs_changes")}>{t(zh, "要求修改", "Request changes")}</button>
        </div>
      </div>
      <div className="panel">
        <div className="section-heading"><span>{t(zh, "审批状态", "Approval status")}</span><h2>{approvalState}</h2></div>
        <dl className="proof-details">
          <div><dt>{t(zh, "边界", "Boundary")}</dt><dd>{t(zh, "只发送提醒，不替用户确认验收、付款或融资结果。", "Only sends a reminder; does not confirm acceptance, payment, or financing on behalf of the user.")}</dd></div>
          <div><dt>{t(zh, "引用", "Citations")}</dt><dd>{buyerDraft.contextRefs.map((ref) => getContextLabel(ref, zh)).join(" / ")}</dd></div>
        </dl>
      </div>
    </section>
  );
}
