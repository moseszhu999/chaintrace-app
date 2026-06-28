"use client";

import { useMemo, useState } from "react";
import {
  findContextLabel,
  sampleApprovalRecords,
  sampleBusinessContext,
  sampleCustomerMemories,
  sampleDrafts,
  sampleEvidenceSlots,
  sampleOrganization,
  sampleProofPack,
  sampleRiskGaps,
  sampleSuggestions,
  sampleTasks,
} from "@/lib/assistant-product-model";

type AppView = "dashboard" | "proofPacks" | "evidence" | "tasks" | "assistant" | "approvals";
type SlotStatus = "verified" | "missing" | "rejected";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function statusLabel(status: SlotStatus, zh: boolean) {
  const map: Record<SlotStatus, { zh: string; en: string }> = {
    verified: { zh: "已验证", en: "Verified" },
    missing: { zh: "缺失", en: "Missing" },
    rejected: { zh: "已拒绝", en: "Rejected" },
  };
  return zh ? map[status].zh : map[status].en;
}

export function ChainTraceWorkspaceApp({ zh, initialView = "dashboard" }: { zh: boolean; initialView?: AppView }) {
  const [view] = useState<AppView>(initialView);
  const [slots, setSlots] = useState(sampleEvidenceSlots);
  const [draftBody, setDraftBody] = useState(zh ? sampleDrafts[1].bodyZh : sampleDrafts[1].bodyEn);
  const [approvalState, setApprovalState] = useState(sampleApprovalRecords[1].status);
  const [log, setLog] = useState<string[]>([
    t(zh, "用户进入工作台，系统加载当前组织和证明包。", "User opened workspace; system loaded current organization and proof pack."),
  ]);

  const navItems: { key: AppView; href: string; zh: string; en: string }[] = [
    { key: "dashboard", href: "/dashboard", zh: "首页", en: "Home" },
    { key: "proofPacks", href: "/proof-packs", zh: "证明包", en: "Proof packs" },
    { key: "evidence", href: "/evidence", zh: "证据", en: "Evidence" },
    { key: "tasks", href: "/tasks", zh: "任务", en: "Tasks" },
    { key: "assistant", href: "/assistant", zh: "助手", en: "Assistant" },
    { key: "approvals", href: "/assistant/approvals", zh: "审批", en: "Approvals" },
  ];

  const verified = slots.filter((slot) => slot.status === "verified").length;
  const missing = slots.filter((slot) => slot.status === "missing").length;
  const readyScore = Math.round((verified / slots.length) * 100);
  const isReady = verified === slots.length;

  const blockerText = useMemo(() => {
    const missingSlots = slots.filter((slot) => slot.status !== "verified");
    if (missingSlots.length === 0) return t(zh, "这票货已经 Ready，可以生成公开验证链接。", "This shipment is Ready and can generate a public verification link.");
    return missingSlots.map((slot) => (zh ? slot.nameZh : slot.nameEn)).join(" / ");
  }, [slots, zh]);

  function pushLog(cn: string, en: string) {
    setLog((items) => [t(zh, cn, en), ...items].slice(0, 7));
  }

  function setSlotStatus(id: string, status: SlotStatus) {
    setSlots((items) => items.map((slot) => (slot.id === id ? { ...slot, status } : slot)));
    const slot = slots.find((item) => item.id === id);
    pushLog(`${slot?.nameZh ?? "证据"} 更新为 ${statusLabel(status, true)}。`, `${slot?.nameEn ?? "Evidence"} changed to ${statusLabel(status, false)}.`);
  }

  function verifyMissing() {
    const target = slots.find((slot) => slot.status !== "verified");
    if (!target) return;
    setSlotStatus(target.id, "verified");
  }

  function approveDraft() {
    setApprovalState("approved");
    pushLog("用户批准了买家验收提醒。真实系统下一步才会发送。", "User approved buyer acceptance reminder. The real system would send only after this approval.");
  }

  function renderTopbar() {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div className="eyebrow">{t(zh, "登录后工作台", "Logged-in workspace")}</div>
          <h1 style={{ margin: "14px 0 4px", fontSize: 34, letterSpacing: "-0.04em" }}>{t(zh, "今天先处理当前卡住的这票货。", "Start with the blocked shipment today.")}</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>{sampleOrganization.name} · {sampleBusinessContext.batchNo}</p>
        </div>
        <div className="hero-actions" style={{ marginTop: 0 }}>
          <a className="secondary-button" href="/assistant">{t(zh, "问助手", "Ask assistant")}</a>
          <button type="button" className="primary-button" onClick={verifyMissing}>{t(zh, "处理下一个缺口", "Resolve next gap")}</button>
        </div>
      </div>
    );
  }

  function renderDashboard() {
    return (
      <>
        <div className="pack-step-grid">
          <a href="/proof-packs" className="pack-step-card"><span>{t(zh, "当前证明包", "Current proof pack")}</span><strong>{sampleProofPack.title}</strong><p>{isReady ? "Ready" : "Missing evidence"}</p></a>
          <a href="/evidence" className="pack-step-card"><span>{t(zh, "Ready 分数", "Ready score")}</span><strong>{readyScore}%</strong><p>{verified}/{slots.length} {t(zh, "项已验证", "verified")}</p></a>
          <a href="/tasks" className="pack-step-card"><span>{t(zh, "待办任务", "Open tasks")}</span><strong>{missing}</strong><p>{blockerText}</p></a>
          <a href="/assistant/approvals" className="pack-step-card"><span>{t(zh, "审批", "Approvals")}</span><strong>{approvalState}</strong><p>{t(zh, "买家验收提醒待确认", "Buyer acceptance reminder needs review")}</p></a>
          <a href="/verify/uy-beef-cn-2026-0001" className="pack-step-card"><span>{t(zh, "公开链接", "Public link")}</span><strong>/verify</strong><p>{t(zh, "只公开状态和哈希", "Status and hashes only")}</p></a>
          <a href="/assistant" className="pack-step-card"><span>{t(zh, "助手建议", "Assistant advice")}</span><strong>{t(zh, "先补入库", "Warehouse first")}</strong><p>{t(zh, "再催买家验收", "Then chase buyer acceptance")}</p></a>
        </div>
        <section className="workspace">
          <div className="panel">
            <div className="section-heading"><span>{t(zh, "业务队列", "Business queue")}</span><h2>{t(zh, "证明包不是介绍卡片，是工作对象。", "Proof packs are work objects, not presentation cards.")}</h2></div>
            <dl className="proof-details">
              <div><dt>{sampleProofPack.status}</dt><dd><strong>{sampleProofPack.title}</strong><br />{t(zh, sampleBusinessContext.outcomeZh, sampleBusinessContext.outcomeEn)}</dd></div>
              <div><dt>{t(zh, "当前卡点", "Blocker")}</dt><dd>{blockerText}</dd></div>
              <div><dt>{t(zh, "下一步", "Next")}</dt><dd>{t(zh, "打开证据页补齐入库记录，或让助手生成提醒草稿。", "Open Evidence to complete warehouse entry, or let the assistant draft a reminder.")}</dd></div>
            </dl>
          </div>
          <div className="panel">
            <div className="section-heading"><span>{t(zh, "最近活动", "Recent activity")}</span><h2>{t(zh, "登录后每个动作都留痕。", "Every logged-in action leaves an audit trail.")}</h2></div>
            <dl className="proof-details">{log.map((item, index) => <div key={`${item}-${index}`}><dt>{String(index + 1).padStart(2, "0")}</dt><dd>{item}</dd></div>)}</dl>
          </div>
        </section>
      </>
    );
  }

  function renderProofPacks() {
    return (
      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>ProofPack</span><h2>{t(zh, "一票货一个证明包。", "One shipment, one proof pack.")}</h2><p>{t(zh, "这是登录后的列表页：搜索、筛选、状态、负责人、公开链接。", "This is the logged-in list page: search, filters, status, owner, public link.")}</p></div>
          <dl className="proof-details">
            <div><dt>{sampleProofPack.status}</dt><dd><strong>{sampleProofPack.title}</strong><br />{sampleBusinessContext.name} · Ready {readyScore}%</dd></div>
            <div><dt>{t(zh, "负责人", "Owner")}</dt><dd>Maya Chen · Operations lead</dd></div>
            <div><dt>{t(zh, "公开链接", "Public link")}</dt><dd><a className="inline-link" href="/verify/uy-beef-cn-2026-0001">/verify/uy-beef-cn-2026-0001</a></dd></div>
          </dl>
        </div>
        <div className="panel form-panel">
          <div className="section-heading"><span>{t(zh, "新建证明包", "New proof pack")}</span><h2>{t(zh, "正常 SaaS 要有表单。", "A normal SaaS needs forms.")}</h2></div>
          <label>{t(zh, "业务名称", "Business name")}<input defaultValue="Uruguay Beef to China" /></label>
          <label>{t(zh, "批次号", "Batch number")}<input defaultValue="UY-BEEF-CN-2026-0002" /></label>
          <label>{t(zh, "场景", "Scenario")}<select defaultValue="food"><option value="food">Cross-border food</option><option value="finance">Receivable financing</option><option value="coldchain">Cold chain</option></select></label>
          <button type="button" className="primary-button" onClick={() => pushLog("用户创建了一个前端模拟证明包。", "User created a frontend mock proof pack.")}>{t(zh, "创建证明包", "Create proof pack")}</button>
        </div>
      </section>
    );
  }

  function renderEvidence() {
    return (
      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "证据槽", "Evidence slots")}</span><h2>{sampleProofPack.title}</h2><p>{t(zh, "每个证据槽都有责任方、业务影响和验证状态。", "Every evidence slot has an owner, business impact, and verification status.")}</p></div>
          <dl className="proof-details">
            {slots.map((slot) => (
              <div key={slot.id}>
                <dt>{statusLabel(slot.status, zh)}</dt>
                <dd>
                  <strong>{zh ? slot.nameZh : slot.nameEn}</strong><br />
                  {t(zh, "责任方：", "Owner: ")}{zh ? slot.ownerZh : slot.ownerEn} · {t(zh, "影响：", "Affects: ")}{zh ? slot.requiredForZh : slot.requiredForEn}
                  <div className="hero-actions" style={{ marginTop: 10 }}>
                    <button type="button" className="secondary-button" onClick={() => setSlotStatus(slot.id, "missing")}>{t(zh, "标记缺失", "Mark missing")}</button>
                    <button type="button" className="secondary-button" onClick={() => setSlotStatus(slot.id, "rejected")}>{t(zh, "拒绝", "Reject")}</button>
                    <button type="button" className="primary-button" onClick={() => setSlotStatus(slot.id, "verified")}>{t(zh, "验证通过", "Verify")}</button>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "自动生成", "Auto-generated")}</span><h2>{t(zh, "缺口会自动变成任务和风险。", "Gaps become tasks and risks automatically.")}</h2></div>
          <dl className="proof-details">
            {slots.filter((slot) => slot.status !== "verified").map((slot) => (
              <div key={slot.id}><dt>{t(zh, "待办", "Task")}</dt><dd>{t(zh, `请${slot.ownerZh}补齐：${slot.nameZh}`, `Ask ${slot.ownerEn} to complete: ${slot.nameEn}`)}</dd></div>
            ))}
            {isReady && <div><dt>Ready</dt><dd>{t(zh, "可以进入公开验证和外部分享。", "Can move to public verification and external sharing.")}</dd></div>}
          </dl>
        </div>
      </section>
    );
  }

  function renderTasks() {
    return (
      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "任务中心", "Task center")}</span><h2>{t(zh, "登录后按责任方推进。", "After login, work is assigned by owner.")}</h2></div>
          <dl className="proof-details">
            {sampleTasks.map((task) => (
              <div key={task.id}><dt>{task.status}</dt><dd><strong>{zh ? task.titleZh : task.titleEn}</strong><br />{t(zh, "负责人：", "Owner: ")}{zh ? task.ownerZh : task.ownerEn} · {task.due}</dd></div>
            ))}
          </dl>
        </div>
        <div className="panel">
          <div className="section-heading"><span>RiskGap</span><h2>{t(zh, "任务来自业务风险，不是随便提醒。", "Tasks come from business risk, not random reminders.")}</h2></div>
          <dl className="proof-details">
            {sampleRiskGaps.map((gap) => (
              <div key={gap.id}><dt>{gap.severity}</dt><dd><strong>{zh ? gap.titleZh : gap.titleEn}</strong><br />{zh ? gap.impactZh : gap.impactEn}</dd></div>
            ))}
          </dl>
        </div>
      </section>
    );
  }

  function renderAssistant() {
    const suggestion = sampleSuggestions[1];
    return (
      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "客户上下文助手", "Customer-context assistant")}</span><h2>{t(zh, suggestion.titleZh, suggestion.titleEn)}</h2><p>{t(zh, suggestion.reasonZh, suggestion.reasonEn)}</p></div>
          <dl className="proof-details">
            <div><dt>{t(zh, "建议动作", "Suggested action")}</dt><dd>{t(zh, suggestion.proposedActionZh, suggestion.proposedActionEn)}</dd></div>
            <div><dt>{t(zh, "业务影响", "Business impact")}</dt><dd>{t(zh, suggestion.businessImpactZh, suggestion.businessImpactEn)}</dd></div>
            <div><dt>{t(zh, "引用上下文", "Cited context")}</dt><dd>{suggestion.contextRefs.map((ref) => findContextLabel(ref, zh)).join(" / ")}</dd></div>
          </dl>
          <a className="primary-button" href="/assistant/approvals">{t(zh, "生成草稿并提交审批", "Create draft and submit approval")}</a>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "记忆来源", "Memory source")}</span><h2>{t(zh, "必须让用户看得见、关得掉。", "Users must be able to see and disable memory.")}</h2></div>
          <dl className="proof-details">
            {sampleCustomerMemories.slice(0, 4).map((memory) => (
              <div key={memory.id}><dt>{memory.enabled ? "on" : "off"}</dt><dd><strong>{zh ? memory.titleZh : memory.titleEn}</strong><br />{zh ? memory.valueZh : memory.valueEn}</dd></div>
            ))}
          </dl>
        </div>
      </section>
    );
  }

  function renderApprovals() {
    return (
      <section className="workspace">
        <div className="panel form-panel">
          <div className="section-heading"><span>{t(zh, "审批草稿", "Draft approval")}</span><h2>{t(zh, "AI 不能直接发送。", "AI cannot send directly.")}</h2><p>{t(zh, "付款、融资、验收、理赔、法律责任相关动作都必须确认。", "Actions related to payment, financing, acceptance, claims, and legal responsibility require confirmation.")}</p></div>
          <label>{t(zh, "买家验收提醒草稿", "Buyer acceptance reminder draft")}<textarea rows={8} value={draftBody} onChange={(event) => setDraftBody(event.target.value)} /></label>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={approveDraft}>{t(zh, "批准并发送", "Approve and send")}</button>
            <button type="button" className="secondary-button" onClick={() => { setApprovalState("needs_changes"); pushLog("用户要求修改草稿。", "User requested draft changes."); }}>{t(zh, "要求修改", "Request changes")}</button>
          </div>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{t(zh, "审批状态", "Approval status")}</span><h2>{approvalState}</h2></div>
          <dl className="proof-details">
            <div><dt>{t(zh, "边界", "Boundary")}</dt><dd>{t(zh, "只发送提醒，不替用户确认验收、付款或融资结果。", "Only sends a reminder; does not confirm acceptance, payment, or financing on behalf of the user.")}</dd></div>
            <div><dt>{t(zh, "引用", "Citations")}</dt><dd>{sampleDrafts[1].contextRefs.map((ref) => findContextLabel(ref, zh)).join(" / ")}</dd></div>
          </dl>
        </div>
      </section>
    );
  }

  const body = view === "proofPacks" ? renderProofPacks() : view === "evidence" ? renderEvidence() : view === "tasks" ? renderTasks() : view === "assistant" ? renderAssistant() : view === "approvals" ? renderApprovals() : renderDashboard();

  return (
    <main className="page-shell">
      <section className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "230px minmax(0, 1fr)", minHeight: 760 }}>
          <aside style={{ borderRight: "1px solid var(--border)", padding: 22, background: "rgba(255,250,240,.72)" }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 950, marginBottom: 24 }}><span style={{ display: "inline-grid", placeItems: "center", width: 34, height: 34, borderRadius: 999, background: "#111827", color: "#fff" }}>CT</span>ChainTrace</a>
            <nav style={{ display: "grid", gap: 8 }}>
              {navItems.map((item) => (
                <a key={item.key} href={item.href} className={view === item.key ? "primary-button" : "secondary-button"} style={{ justifyContent: "flex-start", width: "100%" }}>{zh ? item.zh : item.en}</a>
              ))}
            </nav>
            <div className="proof-flow-card" style={{ marginTop: 24 }}><strong>{t(zh, "当前组织", "Current org")}</strong><span>{sampleOrganization.name}</span></div>
            <a className="secondary-button" href="/login" style={{ width: "100%" }}>{t(zh, "退出模拟登录", "Exit mock login")}</a>
          </aside>
          <section style={{ padding: 26, minWidth: 0 }}>
            {renderTopbar()}
            {body}
          </section>
        </div>
      </section>
    </main>
  );
}
