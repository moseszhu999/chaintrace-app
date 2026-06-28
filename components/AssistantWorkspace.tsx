"use client";

import { useMemo, useState } from "react";
import {
  assistantRoutes,
  findContextLabel,
  sampleApprovalRecords,
  sampleAssistantActions,
  sampleBusinessContext,
  sampleCustomerMemories,
  sampleDrafts,
  sampleEvidenceItems,
  sampleEvidenceSlots,
  sampleOrganization,
  sampleProofPack,
  sampleRiskGaps,
  sampleShareLink,
  sampleSuggestions,
  sampleTasks,
  sampleUser,
  type ActionStatus,
  type ApprovalRecord,
  type AssistantAction,
  type AssistantView,
  type CustomerMemory,
  type Draft,
} from "@/lib/assistant-product-model";

function text(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function actionStatusLabel(status: ActionStatus, zh: boolean) {
  const map: Record<ActionStatus, { zh: string; en: string }> = {
    suggested: { zh: "已建议", en: "Suggested" },
    drafted: { zh: "已生成草稿", en: "Drafted" },
    approval_required: { zh: "待审批", en: "Approval required" },
    approved: { zh: "已批准", en: "Approved" },
    sent: { zh: "已发送", en: "Sent" },
    blocked: { zh: "已阻塞", en: "Blocked" },
  };
  return zh ? map[status].zh : map[status].en;
}

function nextActionStatus(status: ActionStatus): ActionStatus {
  const next: Record<ActionStatus, ActionStatus> = {
    suggested: "drafted",
    drafted: "approval_required",
    approval_required: "approved",
    approved: "sent",
    sent: "sent",
    blocked: "suggested",
  };
  return next[status];
}

function approvalStatusLabel(status: ApprovalRecord["status"], zh: boolean) {
  const map: Record<ApprovalRecord["status"], { zh: string; en: string }> = {
    pending: { zh: "待确认", en: "Pending" },
    approved: { zh: "已批准", en: "Approved" },
    rejected: { zh: "已拒绝", en: "Rejected" },
    needs_changes: { zh: "需修改", en: "Needs changes" },
  };
  return zh ? map[status].zh : map[status].en;
}

function statusPillClass(status: ActionStatus | ApprovalRecord["status"]) {
  return status === "approved" || status === "sent" ? "status-pill" : "status-pill warning";
}

function routeTitle(view: AssistantView, zh: boolean) {
  const route = assistantRoutes.find((item) => item.view === view) ?? assistantRoutes[0];
  return zh ? route.labelZh : route.labelEn;
}

export function AssistantWorkspace({ zh, initialView }: { zh: boolean; initialView: AssistantView }) {
  const [view] = useState<AssistantView>(initialView);
  const [memories, setMemories] = useState<CustomerMemory[]>(sampleCustomerMemories);
  const [selectedMemoryId, setSelectedMemoryId] = useState(sampleCustomerMemories[2]?.id ?? "");
  const [actions, setActions] = useState<AssistantAction[]>(sampleAssistantActions);
  const [drafts, setDrafts] = useState<Draft[]>(sampleDrafts);
  const [selectedDraftId, setSelectedDraftId] = useState(sampleDrafts[1]?.id ?? "");
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(sampleApprovalRecords);
  const [activityLog, setActivityLog] = useState<string[]>([
    zh ? "AI 已读取授权业务背景，并生成今日建议。" : "AI read authorized business context and generated today's suggestions.",
  ]);

  const selectedMemory = memories.find((item) => item.id === selectedMemoryId) ?? memories[0];
  const selectedDraft = drafts.find((item) => item.id === selectedDraftId) ?? drafts[0];

  const readySummary = useMemo(() => {
    const verified = sampleEvidenceSlots.filter((slot) => slot.status === "verified").length;
    const missing = sampleEvidenceSlots.filter((slot) => slot.status === "missing").length;
    return text(
      zh,
      `${sampleProofPack.title} · Ready ${sampleProofPack.readyScore}% · 已验证 ${verified} 项 · 缺 ${missing} 项`,
      `${sampleProofPack.title} · Ready ${sampleProofPack.readyScore}% · ${verified} verified · ${missing} missing`,
    );
  }, [zh]);

  function pushLog(cn: string, en: string) {
    setActivityLog((items) => [text(zh, cn, en), ...items].slice(0, 8));
  }

  function toggleMemory(id: string, field: "enabled" | "authorized") {
    setMemories((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: !item[field] } : item)),
    );
    pushLog(
      field === "enabled" ? "用户修改了一条记忆的启用状态。" : "用户修改了一条上下文授权。",
      field === "enabled" ? "User changed a memory enablement setting." : "User changed a context permission.",
    );
  }

  function updateMemoryValue(id: string, value: string) {
    setMemories((items) =>
      items.map((item) => (item.id === id ? { ...item, valueZh: value, valueEn: value } : item)),
    );
  }

  function deleteMemory(id: string) {
    setMemories((items) => {
      const next = items.filter((item) => item.id !== id);
      setSelectedMemoryId(next[0]?.id ?? "");
      return next;
    });
    pushLog("用户删除了一条可删除记忆，后续建议不再引用它。", "User deleted a removable memory; future suggestions will not cite it.");
  }

  function advanceAction(id: string) {
    setActions((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const next = nextActionStatus(item.status);
        return {
          ...item,
          status: next,
          logZh: [`状态更新为：${actionStatusLabel(next, true)}`, ...item.logZh].slice(0, 5),
          logEn: [`Status updated to: ${actionStatusLabel(next, false)}`, ...item.logEn].slice(0, 5),
        };
      }),
    );
    pushLog("用户推进了一个助手动作，系统记录了操作日志。", "User advanced an assistant action; the system recorded the operation log.");
  }

  function createActionFromSuggestion(suggestionId: string) {
    const suggestion = sampleSuggestions.find((item) => item.id === suggestionId);
    if (!suggestion) return;
    const existing = actions.find((item) => item.suggestionId === suggestionId);
    if (existing) {
      advanceAction(existing.id);
      return;
    }
    const action: AssistantAction = {
      id: `act_from_${suggestionId}`,
      suggestionId,
      titleZh: suggestion.proposedActionZh,
      titleEn: suggestion.proposedActionEn,
      status: "drafted",
      logZh: ["由 AI 建议生成动作。", "已进入草稿阶段。"],
      logEn: ["Action created from AI suggestion.", "Moved into draft stage."],
    };
    setActions((items) => [action, ...items]);
    pushLog("AI 建议已转成可审批动作。", "AI suggestion was converted into an approvable action.");
  }

  function updateDraftBody(id: string, value: string) {
    setDrafts((items) =>
      items.map((item) => (item.id === id ? { ...item, bodyZh: value, bodyEn: value } : item)),
    );
  }

  function updateApproval(id: string, status: ApprovalRecord["status"]) {
    setApprovals((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              decisionLogZh: [`用户操作：${approvalStatusLabel(status, true)}`, ...item.decisionLogZh].slice(0, 5),
              decisionLogEn: [`User action: ${approvalStatusLabel(status, false)}`, ...item.decisionLogEn].slice(0, 5),
            }
          : item,
      ),
    );
    pushLog("用户处理了一条助手动作审批。", "User handled an assistant action approval.");
  }

  function renderOverview() {
    return (
      <>
        <section className="workspace">
          <div className="panel">
            <div className="section-heading">
              <span>{text(zh, "助手信息架构", "Assistant information architecture")}</span>
              <h2>{text(zh, "从聊天框升级成客户项目操作系统。", "Upgrade from chat box to customer project OS.")}</h2>
              <p>{text(zh, "这里不是解释功能，而是让客户登录后马上看到：系统知道当前项目、缺口、下一步和审批边界。", "This is not a feature explanation. After login, the customer should see that the system understands the current case, gaps, next steps, and approval boundaries.")}</p>
            </div>
            <div className="pack-step-grid">
              {assistantRoutes.map((route) => (
                <a key={route.href} className={`pack-step-card ${route.view === view ? "active" : ""}`} href={route.href}>
                  <span>{zh ? route.labelZh : route.labelEn}</span>
                  <strong>{zh ? route.descZh : route.descEn}</strong>
                </a>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="section-heading">
              <span>{text(zh, "今日简报", "Daily brief")}</span>
              <h2>{text(zh, "先补入库，再补验收。", "Complete warehouse entry, then buyer acceptance.")}</h2>
              <p>{text(zh, "这不是泛泛建议，而是来自客户记忆、证据槽、RiskGap 和 Task 的合成判断。", "This is not generic advice. It is a combined judgement from customer memory, evidence slots, RiskGap, and Task.")}</p>
            </div>
            <dl className="proof-details">
              <div><dt>{text(zh, "客户", "Customer")}</dt><dd>{sampleOrganization.name} · {text(zh, sampleOrganization.typeZh, sampleOrganization.typeEn)}</dd></div>
              <div><dt>{text(zh, "当前项目", "Current case")}</dt><dd>{sampleBusinessContext.batchNo}</dd></div>
              <div><dt>{text(zh, "状态", "Status")}</dt><dd>{readySummary}</dd></div>
              <div><dt>{text(zh, "业务结果", "Business outcome")}</dt><dd>{text(zh, sampleBusinessContext.outcomeZh, sampleBusinessContext.outcomeEn)}</dd></div>
            </dl>
          </div>
        </section>

        <section className="clarity-strip">
          <article><span>{text(zh, "读取范围", "Readable scope")}</span><strong>{text(zh, "客户授权背景、ProofPack、EvidenceSlot、RiskGap、Task。", "Authorized context, ProofPack, EvidenceSlot, RiskGap, and Task.")}</strong></article>
          <article><span>{text(zh, "必须授权", "Permission required")}</span><strong>{text(zh, "原始合同、发票、私有文件、邮箱、ERP、外部系统。", "Raw contracts, invoices, private files, email, ERP, external systems.")}</strong></article>
          <article><span>{text(zh, "不能自动决定", "Cannot auto-decide")}</span><strong>{text(zh, "付款、融资、验收、理赔、法律责任。", "Payment, financing, acceptance, claims, legal responsibility.")}</strong></article>
        </section>

        <section className="workspace">
          <div className="panel">
            <div className="section-heading"><span>{text(zh, "数据模型", "Data model")}</span><h2>{text(zh, "第一版真实 SaaS 数据对象。", "First real SaaS data objects.")}</h2></div>
            <dl className="proof-details">
              {[
                "Organization", "User", "Role", "CustomerMemory", "BusinessContext", "ProofPack", "EvidenceSlot", "EvidenceItem", "RiskGap", "Task", "AssistantSuggestion", "AssistantAction", "ApprovalRecord", "ShareLink",
              ].map((item) => <div key={item}><dt>{item}</dt><dd>{text(zh, "已在前端模型中落地，后续可迁移到数据库。", "Landed in the front-end model and ready to migrate to database later.")}</dd></div>)}
            </dl>
          </div>
          <div className="panel">
            <div className="section-heading"><span>{text(zh, "当前事实链", "Current fact chain")}</span><h2>{sampleProofPack.title}</h2><p>{text(zh, sampleBusinessContext.currentBlockerZh, sampleBusinessContext.currentBlockerEn)}</p></div>
            <dl className="proof-details">
              {sampleEvidenceSlots.map((slot) => (
                <div key={slot.id}>
                  <dt>{text(zh, slot.nameZh, slot.nameEn)}</dt>
                  <dd><strong>{slot.status}</strong><br />{text(zh, slot.requiredForZh, slot.requiredForEn)} · {text(zh, slot.ownerZh, slot.ownerEn)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </>
    );
  }

  function renderMemory() {
    if (!selectedMemory) {
      return <section className="panel"><div className="section-heading"><h2>{text(zh, "暂无记忆", "No memory left")}</h2></div></section>;
    }
    const citingSuggestions = sampleSuggestions.filter((suggestion) => suggestion.contextRefs.includes(selectedMemory.id));
    return (
      <section className="workspace">
        <div className="panel">
          <div className="section-heading">
            <span>{text(zh, "客户记忆管理", "Customer memory control")}</span>
            <h2>{text(zh, "用户必须知道系统记住了什么。", "Users must know what the system remembers.")}</h2>
            <p>{text(zh, "每条记忆都要能看到来源、授权状态、启用状态和被哪些建议引用。", "Every memory shows source, permission state, enablement, and which suggestions cite it.")}</p>
          </div>
          <div className="story-grid">
            {memories.map((memory) => (
              <button
                type="button"
                key={memory.id}
                className="story-card"
                onClick={() => setSelectedMemoryId(memory.id)}
                style={{ textAlign: "left", cursor: "pointer", border: selectedMemory.id === memory.id ? "2px solid #111827" : undefined }}
              >
                <strong>{text(zh, memory.titleZh, memory.titleEn)}</strong>
                <p>{text(zh, memory.valueZh, memory.valueEn)}</p>
                <span className={memory.enabled && memory.authorized ? "status-pill" : "status-pill warning"}>{memory.enabled && memory.authorized ? text(zh, "可用", "Active") : text(zh, "受限", "Limited")}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "当前记忆", "Selected memory")}</span><h2>{text(zh, selectedMemory.titleZh, selectedMemory.titleEn)}</h2><p>{text(zh, selectedMemory.sensitivityZh, selectedMemory.sensitivityEn)}</p></div>
          <label>
            {text(zh, "记忆内容", "Memory content")}
            <textarea rows={5} value={text(zh, selectedMemory.valueZh, selectedMemory.valueEn)} onChange={(event) => updateMemoryValue(selectedMemory.id, event.target.value)} />
          </label>
          <dl className="proof-details">
            <div><dt>{text(zh, "来源", "Source")}</dt><dd>{text(zh, selectedMemory.sourceZh, selectedMemory.sourceEn)}</dd></div>
            <div><dt>{text(zh, "授权", "Permission")}</dt><dd>{text(zh, selectedMemory.authorizationZh, selectedMemory.authorizationEn)}</dd></div>
            <div><dt>{text(zh, "建议引用", "Suggestions citing it")}</dt><dd>{citingSuggestions.length ? citingSuggestions.map((item) => text(zh, item.titleZh, item.titleEn)).join(" / ") : text(zh, "暂无引用", "No current citation")}</dd></div>
          </dl>
          <div className="hero-actions">
            <button type="button" className="secondary-button" onClick={() => toggleMemory(selectedMemory.id, "enabled")}>{selectedMemory.enabled ? text(zh, "关闭这条记忆", "Disable memory") : text(zh, "启用这条记忆", "Enable memory")}</button>
            <button type="button" className="secondary-button" onClick={() => toggleMemory(selectedMemory.id, "authorized")}>{selectedMemory.authorized ? text(zh, "取消授权", "Revoke permission") : text(zh, "重新授权", "Grant permission")}</button>
            <button type="button" className="secondary-button" onClick={() => deleteMemory(selectedMemory.id)}>{text(zh, "删除记忆", "Delete memory")}</button>
          </div>
        </div>
      </section>
    );
  }

  function renderActions() {
    return (
      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "Agent 建议", "Agent suggestions")}</span><h2>{text(zh, "建议必须能落成动作，但不能越权执行。", "Suggestions must become actions, but cannot execute beyond permission.")}</h2></div>
          <div className="story-grid">
            {sampleSuggestions.map((suggestion) => (
              <article key={suggestion.id} className="story-card">
                <strong>{text(zh, suggestion.titleZh, suggestion.titleEn)}</strong>
                <p>{text(zh, suggestion.reasonZh, suggestion.reasonEn)}</p>
                <p><b>{text(zh, "业务影响：", "Impact: ")}</b>{text(zh, suggestion.businessImpactZh, suggestion.businessImpactEn)}</p>
                <button type="button" className="secondary-button" onClick={() => createActionFromSuggestion(suggestion.id)}>{text(zh, "转成动作 / 草稿", "Create action / draft")}</button>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "动作流水线", "Action pipeline")}</span><h2>{text(zh, "从建议到草稿、审批、发送。", "From suggestion to draft, approval, and send.")}</h2></div>
          <dl className="proof-details">
            {actions.map((action) => (
              <div key={action.id}>
                <dt><span className={statusPillClass(action.status)}>{actionStatusLabel(action.status, zh)}</span></dt>
                <dd>
                  <strong>{text(zh, action.titleZh, action.titleEn)}</strong><br />
                  {(zh ? action.logZh : action.logEn).join(" · ")}<br />
                  <button type="button" className="secondary-button" onClick={() => advanceAction(action.id)}>{text(zh, "推进下一步", "Advance next step")}</button>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    );
  }

  function renderDrafts() {
    if (!selectedDraft) return null;
    return (
      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "草稿箱", "Drafts")}</span><h2>{text(zh, "AI 负责生成，用户负责确认。", "AI drafts; user confirms.")}</h2><p>{text(zh, "每个草稿必须显示引用了哪些上下文，以及不能承诺什么。", "Every draft must show cited context and what it must not promise.")}</p></div>
          <div className="story-grid">
            {drafts.map((draft) => (
              <button key={draft.id} type="button" className="story-card" onClick={() => setSelectedDraftId(draft.id)} style={{ textAlign: "left", cursor: "pointer", border: selectedDraft.id === draft.id ? "2px solid #111827" : undefined }}>
                <strong>{text(zh, draft.subjectZh, draft.subjectEn)}</strong>
                <p>{text(zh, "收件方：", "To: ")}{text(zh, draft.toZh, draft.toEn)}</p>
                <span className="badge-chip">{draft.channel}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "编辑草稿", "Edit draft")}</span><h2>{text(zh, selectedDraft.subjectZh, selectedDraft.subjectEn)}</h2></div>
          <label>{text(zh, "正文", "Body")}<textarea rows={8} value={text(zh, selectedDraft.bodyZh, selectedDraft.bodyEn)} onChange={(event) => updateDraftBody(selectedDraft.id, event.target.value)} /></label>
          <dl className="proof-details">
            <div><dt>{text(zh, "引用上下文", "Cited context")}</dt><dd>{selectedDraft.contextRefs.map((ref) => findContextLabel(ref, zh)).join(" / ")}</dd></div>
            <div><dt>{text(zh, "边界", "Boundary")}</dt><dd>{text(zh, selectedDraft.boundaryZh, selectedDraft.boundaryEn)}</dd></div>
          </dl>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => pushLog("草稿已提交审批。", "Draft submitted for approval.")}>{text(zh, "提交审批", "Submit for approval")}</button>
            <button type="button" className="secondary-button" onClick={() => pushLog("草稿已保存，但没有发送。", "Draft saved, not sent.")}>{text(zh, "只保存，不发送", "Save only, do not send")}</button>
          </div>
        </div>
      </section>
    );
  }

  function renderApprovals() {
    return (
      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "审批中心", "Approval center")}</span><h2>{text(zh, "关键商业动作必须人工确认。", "Key commercial actions require human confirmation.")}</h2><p>{text(zh, "审批不是摆设：它保护付款、融资、验收、理赔和法律责任边界。", "Approval is not decoration: it protects boundaries around payment, financing, acceptance, claims, and legal responsibility.")}</p></div>
          <dl className="proof-details">
            {approvals.map((approval) => (
              <div key={approval.id}>
                <dt><span className={statusPillClass(approval.status)}>{approvalStatusLabel(approval.status, zh)}</span></dt>
                <dd>
                  <strong>{text(zh, approval.titleZh, approval.titleEn)}</strong><br />
                  {text(zh, approval.riskNoteZh, approval.riskNoteEn)}<br />
                  <div className="hero-actions" style={{ marginTop: 12 }}>
                    <button type="button" className="secondary-button" onClick={() => updateApproval(approval.id, "approved")}>{text(zh, "批准并发送", "Approve and send")}</button>
                    <button type="button" className="secondary-button" onClick={() => updateApproval(approval.id, "needs_changes")}>{text(zh, "要求修改", "Request changes")}</button>
                    <button type="button" className="secondary-button" onClick={() => updateApproval(approval.id, "rejected")}>{text(zh, "拒绝", "Reject")}</button>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "操作日志", "Operation log")}</span><h2>{text(zh, "所有 Agent 建议和人工确认都要留痕。", "All Agent suggestions and human confirmations need audit trail.")}</h2></div>
          <dl className="proof-details">
            {activityLog.map((item, index) => <div key={`${item}-${index}`}><dt>{String(index + 1).padStart(2, "0")}</dt><dd>{item}</dd></div>)}
          </dl>
        </div>
      </section>
    );
  }

  const renderBody = () => {
    if (view === "memory") return renderMemory();
    if (view === "actions") return renderActions();
    if (view === "drafts") return renderDrafts();
    if (view === "approvals") return renderApprovals();
    return renderOverview();
  };

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{text(zh, "ChainTrace · 客户上下文 AI 助手", "ChainTrace · Customer-context AI assistant")}</div>
            <h1>{text(zh, "把客户助手做成真实 SaaS 工作台。", "Turn the customer assistant into a real SaaS workspace.")}</h1>
            <p>
              {text(
                zh,
                "系统像 Claude Code 理解代码项目一样理解客户供应链项目：知道客户是谁、常做什么贸易、哪票货卡住、缺什么证据、下一步该找谁，以及补完后影响收款、清关、融资还是验收。",
                "The system understands the customer's supply-chain project like Claude Code understands a codebase: who the customer is, common trades, which shipment is blocked, what evidence is missing, whom to chase next, and whether completion affects collection, customs, financing, or acceptance.",
              )}
            </p>
            <div className="hero-actions">
              <a href="/assistant/memory" className="primary-button">{text(zh, "管理客户记忆", "Manage memory")}</a>
              <a href="/assistant/actions" className="secondary-button">{text(zh, "查看助手动作", "View actions")}</a>
              <a href="/assistant/approvals" className="secondary-button">{text(zh, "审批关键动作", "Approve actions")}</a>
            </div>
            <div className="hero-badges">
              <span className="badge-chip">{routeTitle(view, zh)}</span>
              <span className="badge-chip">{sampleUser.name} · {text(zh, sampleUser.titleZh, sampleUser.titleEn)}</span>
              <span className="badge-chip">{text(zh, "只读授权上下文", "Authorized context only")}</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{text(zh, "当前客户项目", "Current customer case")}</span><strong>{sampleBusinessContext.batchNo}</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{text(zh, "组织", "Organization")}</span><strong>{sampleOrganization.name}</strong></div>
                <div className="mini-proof-card present"><span>ProofPack</span><strong>{sampleProofPack.status}</strong></div>
                <div className="mini-proof-card pending"><span>RiskGap</span><strong>{sampleRiskGaps.length}</strong></div>
                <div className="mini-proof-card pending"><span>Task</span><strong>{sampleTasks.filter((task) => task.status !== "done").length}</strong></div>
              </div>
              <div className="signal-status-box">
                <span>{text(zh, "助手判断", "Assistant judgement")}</span>
                <strong>{text(zh, "先补入库和验收，再推进融资沟通。", "Complete warehouse and acceptance before financing communication.")}</strong>
                <p>{readySummary}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 22 }}>
        <div className="section-heading"><span>{text(zh, "助手模块入口", "Assistant module routes")}</span><h2>{text(zh, "五个页面对应真实产品结构。", "Five pages map to the real product structure.")}</h2></div>
        <div className="pack-step-grid">
          {assistantRoutes.map((route) => (
            <a key={route.href} href={route.href} className={`pack-step-card ${route.view === view ? "active" : ""}`}>
              <span>{route.href}</span>
              <strong>{zh ? route.labelZh : route.labelEn}</strong>
              <p>{zh ? route.descZh : route.descEn}</p>
            </a>
          ))}
        </div>
      </section>

      {renderBody()}

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "授权与公开链接", "Permission and public link")}</span><h2>{text(zh, "公开验证不等于暴露私有文件。", "Public verification does not expose private files.")}</h2></div>
          <dl className="proof-details">
            <div><dt>{text(zh, "公开链接", "Public link")}</dt><dd><a href={sampleShareLink.url} className="inline-link">{sampleShareLink.url}</a></dd></div>
            <div><dt>{text(zh, "公开范围", "Public scope")}</dt><dd>{text(zh, sampleShareLink.scopeZh, sampleShareLink.scopeEn)}</dd></div>
            <div><dt>{text(zh, "过期时间", "Expires")}</dt><dd>{sampleShareLink.expiresAt}</dd></div>
          </dl>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "证据项", "Evidence items")}</span><h2>{text(zh, "助手引用状态，不替代真实验证。", "The assistant cites status; it does not replace real verification.")}</h2></div>
          <dl className="proof-details">
            {sampleEvidenceItems.map((item) => (
              <div key={item.id}><dt>{item.status}</dt><dd><strong>{item.fileName}</strong><br /><span className="hash-value">{item.hash}</span></dd></div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
