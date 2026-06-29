"use client";

import { useMemo, useState } from "react";

type AssistantMode = "morning" | "risk" | "customer" | "financing" | "agent";
type MemoryKey = "business" | "trade" | "documents" | "relationships" | "risk";

type CustomerMemory = {
  key: MemoryKey;
  zh: string;
  en: string;
  valueZh: string;
  valueEn: string;
};

type AssistantMessage = {
  role: "assistant" | "user";
  zh: string;
  en: string;
};

const memories: CustomerMemory[] = [
  {
    key: "business",
    zh: "客户画像",
    en: "Customer profile",
    valueZh: "Example Small Exporter 是一家小型出口贸易商，常做食品和咖啡出口。团队小，文件管理靠邮箱和 Excel。",
    valueEn: "Example Small Exporter is a small export trader for food and coffee. The team is small and manages files through email and Excel.",
  },
  {
    key: "trade",
    zh: "常见交易",
    en: "Common trades",
    valueZh: "经常需要给买家、进口商和资金方证明订单、发票、发货、质检、交付和验收。",
    valueEn: "Often needs to prove order, invoice, shipment, inspection, delivery, and acceptance to buyers, importers, and financiers.",
  },
  {
    key: "documents",
    zh: "文件习惯",
    en: "Document habits",
    valueZh: "订单和发票通常齐全，但交付、入库、买家验收经常最后才补，导致 Ready 慢。",
    valueEn: "Orders and invoices are usually complete, but delivery, warehouse entry, and buyer acceptance are often added late, slowing Ready status.",
  },
  {
    key: "relationships",
    zh: "关系网络",
    en: "Relationship network",
    valueZh: "常见协作方包括越南供应商、上海买家、冷链物流商和一家应收账款资金方。",
    valueEn: "Common collaborators include Vietnam suppliers, Shanghai buyers, cold-chain providers, and one receivable financier.",
  },
  {
    key: "risk",
    zh: "历史风险",
    en: "Historical risk",
    valueZh: "过去 3 个批次里，有 2 次因为买家验收延迟导致收款或融资审核变慢。",
    valueEn: "In the last three batches, buyer acceptance delays slowed collection or financing review twice.",
  },
];

const modeContent: Record<AssistantMode, {
  titleZh: string;
  titleEn: string;
  intentZh: string;
  intentEn: string;
  recommendationZh: string;
  recommendationEn: string;
  actionsZh: string[];
  actionsEn: string[];
}> = {
  morning: {
    titleZh: "今日工作简报",
    titleEn: "Daily work brief",
    intentZh: "客户早上登录后，不想看一堆页面，想知道今天先做什么。",
    intentEn: "When the customer logs in, they do not want pages; they want to know what to do first.",
    recommendationZh: "今天优先处理 UY-BEEF-CN-2026-0001 的入库记录和买家验收。只要这两项补齐，这票货可以从 Missing evidence 接近 Ready。",
    recommendationEn: "Today, prioritize warehouse entry and buyer acceptance for UY-BEEF-CN-2026-0001. Once these two are complete, the shipment can move from Missing evidence toward Ready.",
    actionsZh: ["提醒中国仓库上传入库单", "给上海买家生成验收确认请求", "把当前公开验证链接发给资金方", "30 分钟后检查任务是否完成"],
    actionsEn: ["Remind China warehouse to upload entry note", "Generate acceptance request for Shanghai buyer", "Send current public verify link to financier", "Check task completion in 30 minutes"],
  },
  risk: {
    titleZh: "风险解释助手",
    titleEn: "Risk explanation assistant",
    intentZh: "客户看到 Missing evidence，但不知道业务后果。",
    intentEn: "The customer sees Missing evidence but does not understand the business consequence.",
    recommendationZh: "当前最大风险不是原产地或发票，而是交付闭环未完成。资金方会认为真实交易存在，但应收账款确认还不够强。",
    recommendationEn: "The largest risk is not origin or invoice, but the incomplete delivery loop. The financier may accept that real trade exists, but receivable confirmation is still weak.",
    actionsZh: ["解释缺证影响付款、融资、验收", "按严重度排序风险", "生成给买家的补证话术", "标记本周必须完成的任务"],
    actionsEn: ["Explain how gaps affect payment, financing, acceptance", "Sort risks by severity", "Generate buyer follow-up message", "Mark tasks that must be done this week"],
  },
  customer: {
    titleZh: "客户沟通助手",
    titleEn: "Customer communication assistant",
    intentZh: "小团队不擅长催买家和仓库，容易说得太硬或太软。",
    intentEn: "Small teams struggle to chase buyers and warehouses without sounding too harsh or too soft.",
    recommendationZh: "建议用“为了让这票货达到 Ready 并进入付款流程”作为理由，而不是直接说“你们没给材料”。",
    recommendationEn: "Use “to move this shipment to Ready and enter payment flow” as the reason instead of saying “you did not provide documents.”",
    actionsZh: ["生成给仓库的入库单请求", "生成给买家的验收确认请求", "生成给资金方的当前状态说明", "记录对方响应时间"],
    actionsEn: ["Draft warehouse entry request", "Draft buyer acceptance request", "Draft current status note for financier", "Record response time"],
  },
  financing: {
    titleZh: "融资准备助手",
    titleEn: "Financing preparation assistant",
    intentZh: "客户想融资，但不知道证明包是否够强。",
    intentEn: "The customer wants financing but does not know whether the proof pack is strong enough.",
    recommendationZh: "目前可以先给资金方看事实链，但不建议正式提交融资申请。等买家验收补齐后，融资材料会更强。",
    recommendationEn: "You can show the fact chain to the financier now, but do not formally submit financing yet. After buyer acceptance is added, the financing package will be stronger.",
    actionsZh: ["生成融资前检查清单", "列出资金方最关心的缺口", "准备低风险摘要", "验收完成后提醒提交"],
    actionsEn: ["Generate pre-financing checklist", "List gaps financiers care about most", "Prepare low-risk summary", "Remind submission after acceptance"],
  },
  agent: {
    titleZh: "Agent 自动协作助手",
    titleEn: "Agent collaboration assistant",
    intentZh: "客户不想每天手工盯任务，希望系统像 Claude Code 一样理解项目上下文并持续推进。",
    intentEn: "The customer does not want to manually track tasks; they want the system to understand project context and keep progress moving like Claude Code.",
    recommendationZh: "我会持续观察证明包、证据槽、任务、风险和历史习惯；当某个证据拖慢 Ready，我会主动建议下一步并生成可发送消息。",
    recommendationEn: "I will continuously observe proof packs, evidence slots, tasks, risks, and historical habits. When evidence blocks Ready, I will suggest next steps and draft messages.",
    actionsZh: ["每天生成工作简报", "自动识别拖延的责任方", "为每个缺口生成下一步动作", "保留所有 Agent 建议和人工确认记录"],
    actionsEn: ["Generate daily brief", "Identify delayed owners", "Generate next action for each gap", "Keep all agent suggestions and human confirmations"],
  },
};

const initialMessages: AssistantMessage[] = [
  {
    role: "assistant",
    zh: "我已经读取你的客户画像、当前批次、历史缺证习惯和未完成任务。今天最该先处理的是买家验收和仓库入库记录。",
    en: "I have read your customer profile, current batches, historical evidence gaps, and open tasks. The top priorities today are buyer acceptance and warehouse entry.",
  },
];

function text(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function CustomerAssistantDemo({ zh }: { zh: boolean }) {
  const [mode, setMode] = useState<AssistantMode>("morning");
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages);
  const [selectedMemory, setSelectedMemory] = useState<MemoryKey>("documents");
  const content = modeContent[mode];
  const currentMemory = memories.find((item) => item.key === selectedMemory) ?? memories[0];

  const contextSummary = useMemo(() => {
    return zh
      ? "客户：小型出口贸易商 · 当前目标：让 UY-BEEF-CN-2026-0001 Ready · 最大阻塞：入库和验收 · 业务结果：收款 / 融资 / 验收"
      : "Customer: small export trader · Current goal: make UY-BEEF-CN-2026-0001 Ready · Biggest blocker: warehouse entry and acceptance · Business outcome: collection / financing / acceptance";
  }, [zh]);

  function askAssistant(nextMode: AssistantMode) {
    setMode(nextMode);
    setMessages((items) => {
      const nextMessages: AssistantMessage[] = [
        ...items,
        { role: "user", zh: `帮我处理：${modeContent[nextMode].titleZh}`, en: `Help me with: ${modeContent[nextMode].titleEn}` },
        { role: "assistant", zh: modeContent[nextMode].recommendationZh, en: modeContent[nextMode].recommendationEn },
      ];
      return nextMessages.slice(-8);
    });
  }

  function addAction(actionZh: string, actionEn: string) {
    setMessages((items) => {
      const nextMessages: AssistantMessage[] = [
        ...items,
        { role: "user", zh: `执行动作：${actionZh}`, en: `Run action: ${actionEn}` },
        {
          role: "assistant",
          zh: `已生成草稿和任务记录：${actionZh}。关键商业动作仍需你确认后发送。`,
          en: `Draft and task record generated: ${actionEn}. Key business actions still require your confirmation before sending.`,
        },
      ];
      return nextMessages.slice(-8);
    });
  }

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{text(zh, "客户上下文助手", "Customer-aware assistant")}</div>
            <h1>{text(zh, "像 Claude Code 理解代码项目一样，ChainTrace 要理解客户的供应链项目。", "Like Claude Code understands a code project, ChainTrace should understand a customer's supply-chain project.")}</h1>
            <p>
              {text(
                zh,
                "这个助手不是普通聊天框。它读取客户画像、交易习惯、证明包、证据槽、风险缺口、任务和历史响应，主动告诉客户今天该做什么、找谁补证、怎么说、补完会影响什么业务结果。",
                "This is not a generic chat box. It reads the customer profile, trade habits, proof packs, evidence slots, risk gaps, tasks, and historical responses, then proactively tells the customer what to do today, whom to chase, what to say, and which business result improves.",
              )}
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => askAssistant("morning")}>{text(zh, "生成今日简报", "Generate daily brief")}</button>
              <button type="button" className="secondary-button" onClick={() => askAssistant("customer")}>{text(zh, "帮我催买家", "Help chase buyer")}</button>
              <button type="button" className="secondary-button" onClick={() => askAssistant("financing")}>{text(zh, "检查融资准备", "Check financing readiness")}</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-board">
              <div className="signal-board-header"><span>{text(zh, "助手上下文", "Assistant context")}</span><strong>Customer Memory</strong></div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{text(zh, "客户画像", "Profile")}</span><strong>{text(zh, "已读取", "Read")}</strong></div>
                <div className="mini-proof-card present"><span>ProofPack</span><strong>3</strong></div>
                <div className="mini-proof-card pending"><span>RiskGap</span><strong>4</strong></div>
                <div className="mini-proof-card pending"><span>Task</span><strong>5</strong></div>
              </div>
              <div className="signal-status-box"><span>{text(zh, "当前判断", "Current judgement")}</span><strong>{text(zh, "先补入库和验收。", "Complete warehouse and acceptance first.")}</strong><p>{contextSummary}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "助手能记住什么", "What the assistant remembers")}</span><h2>{text(zh, "不是记闲聊，而是记业务上下文。", "It remembers business context, not random chat.")}</h2><p>{text(zh, "客户可以查看、修改、关闭某些记忆。", "Customers should be able to view, edit, or disable specific memories.")}</p></div>
          <div className="story-grid">
            {memories.map((memory) => (
              <button
                type="button"
                key={memory.key}
                className="story-card"
                onClick={() => setSelectedMemory(memory.key)}
                style={{ textAlign: "left", cursor: "pointer", border: selectedMemory === memory.key ? "2px solid #111827" : undefined }}
              >
                <strong>{text(zh, memory.zh, memory.en)}</strong>
                <p>{text(zh, memory.valueZh, memory.valueEn)}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "当前选中记忆", "Selected memory")}</span><h2>{text(zh, currentMemory.zh, currentMemory.en)}</h2></div>
          <div className="proof-flow-card"><strong>{text(zh, "记忆内容", "Memory content")}</strong><span>{text(zh, currentMemory.valueZh, currentMemory.valueEn)}</span></div>
          <div className="proof-flow-card"><strong>{text(zh, "为什么有用", "Why useful")}</strong><span>{text(zh, "助手用它决定提醒顺序、生成话术、判断风险和建议下一步动作。", "The assistant uses it to prioritize reminders, draft messages, judge risks, and suggest next actions.")}</span></div>
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "贴身助手模式", "Assistant modes")}</span><h2>{text(zh, "客户不是来聊天，是来推进交易。", "Customers are not here to chat; they are here to move trade forward.")}</h2><p>{text(zh, "每个模式都对应一个真实业务动作。", "Each mode maps to a real business action.")}</p></div>
          <div className="story-grid">
            {(Object.keys(modeContent) as AssistantMode[]).map((key) => (
              <button key={key} type="button" className="story-card" onClick={() => askAssistant(key)} style={{ textAlign: "left", cursor: "pointer", border: mode === key ? "2px solid #111827" : undefined }}>
                <strong>{text(zh, modeContent[key].titleZh, modeContent[key].titleEn)}</strong>
                <p>{text(zh, modeContent[key].intentZh, modeContent[key].intentEn)}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "助手建议", "Assistant recommendation")}</span><h2>{text(zh, content.titleZh, content.titleEn)}</h2><p>{text(zh, content.recommendationZh, content.recommendationEn)}</p></div>
          <dl className="proof-details">
            {(zh ? content.actionsZh : content.actionsEn).map((action, index) => (
              <div key={action}>
                <dt>{String(index + 1).padStart(2, "0")}</dt>
                <dd>
                  <strong>{action}</strong>
                  <br />
                  <button type="button" className="secondary-button" onClick={() => addAction(content.actionsZh[index], content.actionsEn[index])}>{text(zh, "生成草稿 / 任务", "Create draft / task")}</button>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "对话区", "Conversation")}</span><h2>{text(zh, "助手应该带着上下文回答。", "The assistant should answer with context.")}</h2></div>
          <dl className="proof-details">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`}>
                <dt>{message.role === "assistant" ? "AI" : text(zh, "用户", "User")}</dt>
                <dd>{text(zh, message.zh, message.en)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="panel">
          <div className="section-heading"><span>{text(zh, "权限边界", "Permission boundaries")}</span><h2>{text(zh, "贴身，但不能越权。", "Personal, but not over-authorized.")}</h2></div>
          <dl className="proof-details">
            <div><dt>{text(zh, "可读取", "Can read")}</dt><dd>{text(zh, "客户画像、证明包、证据槽、任务、风险、历史操作。", "Customer profile, proof packs, evidence slots, tasks, risks, historical actions.")}</dd></div>
            <div><dt>{text(zh, "需授权", "Needs permission")}</dt><dd>{text(zh, "原始合同、发票、私有文件、外部系统数据。", "Raw contracts, invoices, private files, external system data.")}</dd></div>
            <div><dt>{text(zh, "不能自动决定", "Cannot decide automatically")}</dt><dd>{text(zh, "付款、融资、验收、理赔、法律责任。", "Payment, financing, acceptance, claims, legal responsibility.")}</dd></div>
          </dl>
        </div>
      </section>
    </main>
  );
}
