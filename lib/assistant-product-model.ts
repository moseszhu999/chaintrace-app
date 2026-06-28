export type AssistantView = "overview" | "memory" | "actions" | "drafts" | "approvals";

export type Role = "owner" | "operator" | "finance" | "buyer" | "auditor";

export type MemoryCategory = "profile" | "trade" | "documents" | "network" | "risk" | "permission";

export type ActionStatus = "suggested" | "drafted" | "approval_required" | "approved" | "sent" | "blocked";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "needs_changes";

export type Organization = {
  id: string;
  name: string;
  typeZh: string;
  typeEn: string;
  region: string;
  mainGoalZh: string;
  mainGoalEn: string;
};

export type User = {
  id: string;
  name: string;
  role: Role;
  titleZh: string;
  titleEn: string;
  canApprove: boolean;
};

export type CustomerMemory = {
  id: string;
  category: MemoryCategory;
  titleZh: string;
  titleEn: string;
  valueZh: string;
  valueEn: string;
  sourceZh: string;
  sourceEn: string;
  authorizationZh: string;
  authorizationEn: string;
  enabled: boolean;
  authorized: boolean;
  sensitivityZh: string;
  sensitivityEn: string;
};

export type BusinessContext = {
  id: string;
  name: string;
  batchNo: string;
  scenarioZh: string;
  scenarioEn: string;
  outcomeZh: string;
  outcomeEn: string;
  currentBlockerZh: string;
  currentBlockerEn: string;
};

export type ProofPack = {
  id: string;
  title: string;
  status: "Ready" | "Missing evidence" | "Review";
  businessContextId: string;
  readyScore: number;
  shareLinkId: string;
};

export type EvidenceSlot = {
  id: string;
  proofPackId: string;
  nameZh: string;
  nameEn: string;
  ownerZh: string;
  ownerEn: string;
  requiredForZh: string;
  requiredForEn: string;
  status: "verified" | "missing" | "rejected";
};

export type EvidenceItem = {
  id: string;
  slotId: string;
  fileName: string;
  hash: string;
  status: "verified" | "pending" | "rejected";
};

export type RiskGap = {
  id: string;
  proofPackId: string;
  titleZh: string;
  titleEn: string;
  impactZh: string;
  impactEn: string;
  severity: "high" | "medium" | "low";
  ownerZh: string;
  ownerEn: string;
};

export type Task = {
  id: string;
  titleZh: string;
  titleEn: string;
  ownerZh: string;
  ownerEn: string;
  due: string;
  relatedGapId: string;
  status: "open" | "waiting" | "done";
};

export type AssistantSuggestion = {
  id: string;
  titleZh: string;
  titleEn: string;
  reasonZh: string;
  reasonEn: string;
  proposedActionZh: string;
  proposedActionEn: string;
  businessImpactZh: string;
  businessImpactEn: string;
  contextRefs: string[];
  requiresApproval: boolean;
};

export type AssistantAction = {
  id: string;
  suggestionId: string;
  titleZh: string;
  titleEn: string;
  status: ActionStatus;
  draftId?: string;
  approvalId?: string;
  logZh: string[];
  logEn: string[];
};

export type Draft = {
  id: string;
  actionId: string;
  channel: "email" | "whatsapp" | "system";
  toZh: string;
  toEn: string;
  subjectZh: string;
  subjectEn: string;
  bodyZh: string;
  bodyEn: string;
  contextRefs: string[];
  boundaryZh: string;
  boundaryEn: string;
};

export type ApprovalRecord = {
  id: string;
  actionId: string;
  titleZh: string;
  titleEn: string;
  requestedBy: "AI Agent" | "Operator";
  status: ApprovalStatus;
  riskNoteZh: string;
  riskNoteEn: string;
  decisionLogZh: string[];
  decisionLogEn: string[];
};

export type ShareLink = {
  id: string;
  url: string;
  scopeZh: string;
  scopeEn: string;
  expiresAt: string;
};

export const assistantRoutes: { href: string; view: AssistantView; labelZh: string; labelEn: string; descZh: string; descEn: string }[] = [
  { href: "/assistant", view: "overview", labelZh: "助手中心", labelEn: "Assistant home", descZh: "今日简报、上下文、动作入口。", descEn: "Daily brief, context, and action entry." },
  { href: "/assistant/memory", view: "memory", labelZh: "记忆管理", labelEn: "Memory control", descZh: "查看、编辑、删除、关闭记忆与授权。", descEn: "View, edit, delete, disable memories and permissions." },
  { href: "/assistant/actions", view: "actions", labelZh: "助手动作", labelEn: "Agent actions", descZh: "把建议变成草稿、任务和审批。", descEn: "Turn suggestions into drafts, tasks, and approvals." },
  { href: "/assistant/drafts", view: "drafts", labelZh: "草稿箱", labelEn: "Drafts", descZh: "检查可发送话术和引用上下文。", descEn: "Review sendable messages and cited context." },
  { href: "/assistant/approvals", view: "approvals", labelZh: "审批中心", labelEn: "Approvals", descZh: "确认、拒绝或要求修改关键动作。", descEn: "Approve, reject, or request changes for key actions." },
];

export const sampleOrganization: Organization = {
  id: "org_example_exporter",
  name: "Example Small Exporter",
  typeZh: "小型出口贸易商",
  typeEn: "Small export trader",
  region: "Vietnam · China · Singapore",
  mainGoalZh: "让跨境货物证明包更快 Ready，从而减少收款、清关和融资卡点。",
  mainGoalEn: "Make cross-border proof packs Ready faster to reduce payment, customs, and financing blockers.",
};

export const sampleUser: User = {
  id: "user_maya_ops",
  name: "Maya Chen",
  role: "operator",
  titleZh: "运营负责人",
  titleEn: "Operations lead",
  canApprove: true,
};

export const sampleBusinessContext: BusinessContext = {
  id: "ctx_uy_beef_cn_2026_0001",
  name: "Uruguay Beef to China",
  batchNo: "UY-BEEF-CN-2026-0001",
  scenarioZh: "跨境食品贸易证明包",
  scenarioEn: "Cross-border food trade proof pack",
  outcomeZh: "让买家验收、资金方初审和内部收款跟进都基于同一事实链。",
  outcomeEn: "Let buyer acceptance, financier pre-review, and internal collection follow the same fact chain.",
  currentBlockerZh: "入库记录和买家验收确认未补齐。",
  currentBlockerEn: "Warehouse entry and buyer acceptance are still missing.",
};

export const sampleProofPack: ProofPack = {
  id: "pack_uy_beef_cn_2026_0001",
  title: "UY-BEEF-CN-2026-0001",
  status: "Missing evidence",
  businessContextId: sampleBusinessContext.id,
  readyScore: 68,
  shareLinkId: "share_uy_beef_public",
};

export const sampleCustomerMemories: CustomerMemory[] = [
  {
    id: "mem_profile",
    category: "profile",
    titleZh: "客户画像",
    titleEn: "Customer profile",
    valueZh: "Example Small Exporter 是小型出口贸易商，团队少，常用邮箱、Excel、聊天工具管理订单和文件。",
    valueEn: "Example Small Exporter is a small export trader with a lean team that manages orders and files through email, Excel, and chat tools.",
    sourceZh: "用户首次配置 + 历史证明包摘要",
    sourceEn: "User onboarding + historical proof-pack summary",
    authorizationZh: "用户允许助手读取组织级业务背景。",
    authorizationEn: "The user allows the assistant to read organization-level business context.",
    enabled: true,
    authorized: true,
    sensitivityZh: "低：组织业务背景，不含原始合同正文。",
    sensitivityEn: "Low: organization context, no raw contract text.",
  },
  {
    id: "mem_trade_pattern",
    category: "trade",
    titleZh: "常见交易模式",
    titleEn: "Common trade pattern",
    valueZh: "经常需要证明订单、发票、发货、质检、冷链、入库、交付和买家验收。",
    valueEn: "Often needs to prove order, invoice, shipment, inspection, cold chain, warehouse entry, delivery, and buyer acceptance.",
    sourceZh: "最近 3 个 ProofPack 的证据槽结构",
    sourceEn: "Evidence-slot structure from the last three ProofPacks",
    authorizationZh: "允许读取 ProofPack 元数据和证据槽状态。",
    authorizationEn: "Allowed to read ProofPack metadata and evidence-slot status.",
    enabled: true,
    authorized: true,
    sensitivityZh: "中：包含交易结构，但不读取私有文件正文。",
    sensitivityEn: "Medium: contains trade structure, but does not read private file bodies.",
  },
  {
    id: "mem_doc_habit",
    category: "documents",
    titleZh: "文件习惯",
    titleEn: "Document habit",
    valueZh: "订单和发票通常早补齐；入库记录和买家验收经常拖到最后，导致 Ready 变慢。",
    valueEn: "Orders and invoices are usually completed early; warehouse entry and buyer acceptance are often delayed, slowing Ready status.",
    sourceZh: "历史 EvidenceSlot 完成时间",
    sourceEn: "Historical EvidenceSlot completion timing",
    authorizationZh: "允许读取证据槽状态、上传时间和验证状态。",
    authorizationEn: "Allowed to read evidence-slot status, upload time, and verification status.",
    enabled: true,
    authorized: true,
    sensitivityZh: "中：用于排序任务，不直接暴露文件内容。",
    sensitivityEn: "Medium: used for task priority, without exposing file content.",
  },
  {
    id: "mem_network",
    category: "network",
    titleZh: "关系网络",
    titleEn: "Relationship network",
    valueZh: "常见协作方包括越南供应商、上海买家、冷链物流商、中国仓库和一家应收账款资金方。",
    valueEn: "Common collaborators include Vietnam suppliers, Shanghai buyers, cold-chain providers, China warehouse, and one receivable financier.",
    sourceZh: "用户录入的业务联系人 + 任务负责人",
    sourceEn: "User-entered contacts + task owners",
    authorizationZh: "联系人只用于生成草稿和任务，不自动发送。",
    authorizationEn: "Contacts are used for drafts and tasks only; nothing is sent automatically.",
    enabled: true,
    authorized: true,
    sensitivityZh: "中：包含业务关系，需要用户可关闭。",
    sensitivityEn: "Medium: includes business relationships and must be user-controllable.",
  },
  {
    id: "mem_risk_history",
    category: "risk",
    titleZh: "历史风险",
    titleEn: "Historical risk",
    valueZh: "过去 3 个批次里，有 2 次因为买家验收延迟导致收款或融资审核变慢。",
    valueEn: "In the last three batches, buyer acceptance delays slowed collection or financing review twice.",
    sourceZh: "RiskGap + Task 完成记录",
    sourceEn: "RiskGap + Task completion records",
    authorizationZh: "允许读取历史风险摘要，但不自动判断法律责任。",
    authorizationEn: "Allowed to read historical risk summaries, but not to decide legal responsibility.",
    enabled: true,
    authorized: true,
    sensitivityZh: "高：影响商业判断，建议必须引用来源。",
    sensitivityEn: "High: affects business judgment, so suggestions must cite sources.",
  },
  {
    id: "mem_permission_boundary",
    category: "permission",
    titleZh: "权限边界",
    titleEn: "Permission boundary",
    valueZh: "原始合同、发票、私有文件、ERP/邮箱/外部系统数据默认不可读，除非用户单独授权。",
    valueEn: "Raw contracts, invoices, private files, ERP, email, and external system data are unreadable by default unless the user grants permission.",
    sourceZh: "系统默认策略",
    sourceEn: "System default policy",
    authorizationZh: "默认启用，用户可查看但不建议关闭。",
    authorizationEn: "Enabled by default; users can view it, but should not disable it.",
    enabled: true,
    authorized: true,
    sensitivityZh: "系统边界：保护用户控制权。",
    sensitivityEn: "System boundary: protects user control.",
  },
];

export const sampleEvidenceSlots: EvidenceSlot[] = [
  { id: "slot_order", proofPackId: sampleProofPack.id, nameZh: "采购订单", nameEn: "Purchase order", ownerZh: "贸易商", ownerEn: "Trader", requiredForZh: "交易存在", requiredForEn: "Trade existence", status: "verified" },
  { id: "slot_invoice", proofPackId: sampleProofPack.id, nameZh: "商业发票", nameEn: "Commercial invoice", ownerZh: "贸易商", ownerEn: "Trader", requiredForZh: "收款 / 融资", requiredForEn: "Collection / financing", status: "verified" },
  { id: "slot_cold_chain", proofPackId: sampleProofPack.id, nameZh: "冷链记录", nameEn: "Cold-chain record", ownerZh: "物流商", ownerEn: "Logistics provider", requiredForZh: "质量证明", requiredForEn: "Quality proof", status: "verified" },
  { id: "slot_warehouse", proofPackId: sampleProofPack.id, nameZh: "入库记录", nameEn: "Warehouse entry", ownerZh: "中国仓库", ownerEn: "China warehouse", requiredForZh: "交付闭环", requiredForEn: "Delivery loop", status: "missing" },
  { id: "slot_acceptance", proofPackId: sampleProofPack.id, nameZh: "买家验收", nameEn: "Buyer acceptance", ownerZh: "上海买家", ownerEn: "Shanghai buyer", requiredForZh: "付款 / 融资确认", requiredForEn: "Payment / financing confirmation", status: "missing" },
];

export const sampleEvidenceItems: EvidenceItem[] = [
  { id: "ev_order", slotId: "slot_order", fileName: "purchase-order-uy-beef.pdf", hash: "0x8f3a...b219", status: "verified" },
  { id: "ev_invoice", slotId: "slot_invoice", fileName: "commercial-invoice-cn-0001.pdf", hash: "0x2a71...91fd", status: "verified" },
  { id: "ev_cold", slotId: "slot_cold_chain", fileName: "cold-chain-temperature-log.csv", hash: "0x55d0...a4ce", status: "verified" },
];

export const sampleRiskGaps: RiskGap[] = [
  { id: "gap_warehouse", proofPackId: sampleProofPack.id, titleZh: "缺少入库记录", titleEn: "Warehouse entry missing", impactZh: "交付闭环不足，Ready 分数无法过线。", impactEn: "Delivery loop is incomplete, so Ready score cannot pass threshold.", severity: "high", ownerZh: "中国仓库", ownerEn: "China warehouse" },
  { id: "gap_acceptance", proofPackId: sampleProofPack.id, titleZh: "缺少买家验收", titleEn: "Buyer acceptance missing", impactZh: "影响收款、融资审核和验收确认。", impactEn: "Affects payment collection, financing review, and acceptance confirmation.", severity: "high", ownerZh: "上海买家", ownerEn: "Shanghai buyer" },
  { id: "gap_share_scope", proofPackId: sampleProofPack.id, titleZh: "公开链接范围需确认", titleEn: "Public share scope needs confirmation", impactZh: "资金方可看状态，但不应看到私有合同正文。", impactEn: "Financier can see status, but should not see private contract text.", severity: "medium", ownerZh: "运营负责人", ownerEn: "Ops lead" },
];

export const sampleTasks: Task[] = [
  { id: "task_warehouse", titleZh: "提醒中国仓库上传入库记录", titleEn: "Remind China warehouse to upload entry note", ownerZh: "运营负责人", ownerEn: "Ops lead", due: "Today", relatedGapId: "gap_warehouse", status: "open" },
  { id: "task_acceptance", titleZh: "请求上海买家确认验收", titleEn: "Ask Shanghai buyer to confirm acceptance", ownerZh: "销售 / 运营", ownerEn: "Sales / ops", due: "Today", relatedGapId: "gap_acceptance", status: "open" },
  { id: "task_financier", titleZh: "给资金方发送当前公开验证链接", titleEn: "Send current public verification link to financier", ownerZh: "财务", ownerEn: "Finance", due: "Tomorrow", relatedGapId: "gap_share_scope", status: "waiting" },
];

export const sampleSuggestions: AssistantSuggestion[] = [
  {
    id: "sug_warehouse_first",
    titleZh: "先催入库记录",
    titleEn: "Chase warehouse entry first",
    reasonZh: "历史上入库和验收最容易拖慢 Ready；当前入库缺口会阻断交付闭环。",
    reasonEn: "Warehouse and acceptance historically slow Ready status; the current warehouse gap blocks the delivery loop.",
    proposedActionZh: "生成给中国仓库的入库记录提醒，并关联到当前 ProofPack。",
    proposedActionEn: "Draft a warehouse-entry reminder for China warehouse and attach it to the current ProofPack.",
    businessImpactZh: "补齐后 Ready 分数预计从 68 提升到 82，融资预审更容易通过。",
    businessImpactEn: "After completion, Ready score is expected to move from 68 to 82, improving financing pre-review.",
    contextRefs: ["mem_doc_habit", "mem_network", "gap_warehouse", "task_warehouse", "slot_warehouse"],
    requiresApproval: true,
  },
  {
    id: "sug_buyer_acceptance",
    titleZh: "生成买家验收确认请求",
    titleEn: "Draft buyer acceptance request",
    reasonZh: "买家验收是付款和融资确认最关键的缺口。",
    reasonEn: "Buyer acceptance is the key gap for payment and financing confirmation.",
    proposedActionZh: "用温和话术提醒买家：为了让这票货进入付款流程，请确认验收。",
    proposedActionEn: "Use a soft reminder: to move this shipment into payment flow, please confirm acceptance.",
    businessImpactZh: "补齐后证明包可接近 Ready，并降低争议风险。",
    businessImpactEn: "After completion, the proof pack moves closer to Ready and reduces dispute risk.",
    contextRefs: ["mem_risk_history", "gap_acceptance", "task_acceptance", "slot_acceptance"],
    requiresApproval: true,
  },
  {
    id: "sug_financier_update",
    titleZh: "给资金方发送当前状态说明",
    titleEn: "Send current status note to financier",
    reasonZh: "可以先说明事实链已形成，但正式融资申请应等验收补齐。",
    reasonEn: "The fact chain can be shared now, but formal financing submission should wait for acceptance.",
    proposedActionZh: "生成低风险状态摘要，只包含公开验证链接和必要元数据。",
    proposedActionEn: "Generate a low-risk status summary with only the public verification link and necessary metadata.",
    businessImpactZh: "提前沟通融资方，但不越权承诺融资结果。",
    businessImpactEn: "Pre-aligns with financier without over-promising financing outcome.",
    contextRefs: ["mem_permission_boundary", "gap_share_scope", "task_financier"],
    requiresApproval: true,
  },
];

export const sampleAssistantActions: AssistantAction[] = [
  {
    id: "act_warehouse_reminder",
    suggestionId: "sug_warehouse_first",
    titleZh: "生成并审批入库记录提醒",
    titleEn: "Draft and approve warehouse-entry reminder",
    status: "drafted",
    draftId: "draft_warehouse",
    approvalId: "approval_warehouse",
    logZh: ["AI 识别缺口：入库记录缺失。", "已生成提醒草稿，等待用户确认。"],
    logEn: ["AI identified gap: warehouse entry missing.", "Reminder draft generated and awaits user confirmation."],
  },
  {
    id: "act_buyer_acceptance",
    suggestionId: "sug_buyer_acceptance",
    titleZh: "生成买家验收确认请求",
    titleEn: "Draft buyer acceptance request",
    status: "approval_required",
    draftId: "draft_buyer",
    approvalId: "approval_buyer",
    logZh: ["AI 根据历史风险建议优先处理买家验收。", "动作涉及客户沟通，必须人工确认。"],
    logEn: ["AI suggested buyer acceptance based on historical risk.", "This customer communication requires human confirmation."],
  },
  {
    id: "act_financier_status",
    suggestionId: "sug_financier_update",
    titleZh: "准备资金方状态说明",
    titleEn: "Prepare financier status note",
    status: "suggested",
    draftId: "draft_financier",
    approvalId: "approval_financier",
    logZh: ["建议先分享公开状态，不正式提交融资申请。"],
    logEn: ["Suggested sharing public status first, not formally submitting financing."],
  },
];

export const sampleDrafts: Draft[] = [
  {
    id: "draft_warehouse",
    actionId: "act_warehouse_reminder",
    channel: "email",
    toZh: "中国仓库联系人",
    toEn: "China warehouse contact",
    subjectZh: "请补充 UY-BEEF-CN-2026-0001 入库记录",
    subjectEn: "Please add warehouse entry for UY-BEEF-CN-2026-0001",
    bodyZh: "你好，为了让 UY-BEEF-CN-2026-0001 这票货达到 Ready 状态并进入后续收款 / 审核流程，请今天补充入库记录。上传后系统会自动更新证明包状态。谢谢。",
    bodyEn: "Hi, to move UY-BEEF-CN-2026-0001 to Ready and support the follow-up collection / review process, please add the warehouse entry note today. After upload, the proof-pack status will update automatically. Thank you.",
    contextRefs: ["mem_doc_habit", "gap_warehouse", "task_warehouse"],
    boundaryZh: "只生成草稿，不自动发送；不承诺付款、验收或融资结果。",
    boundaryEn: "Draft only; not sent automatically; no promise about payment, acceptance, or financing outcome.",
  },
  {
    id: "draft_buyer",
    actionId: "act_buyer_acceptance",
    channel: "email",
    toZh: "上海买家联系人",
    toEn: "Shanghai buyer contact",
    subjectZh: "请确认 UY-BEEF-CN-2026-0001 验收状态",
    subjectEn: "Please confirm acceptance status for UY-BEEF-CN-2026-0001",
    bodyZh: "你好，我们正在整理 UY-BEEF-CN-2026-0001 的交付证明包。为了让这票货进入付款流程，请确认当前货物是否已完成验收。如需补充材料，我可以通过 ChainTrace 分享公开验证链接。",
    bodyEn: "Hi, we are preparing the delivery proof pack for UY-BEEF-CN-2026-0001. To move this shipment into the payment flow, please confirm whether acceptance has been completed. If needed, I can share the ChainTrace public verification link.",
    contextRefs: ["mem_risk_history", "gap_acceptance", "task_acceptance"],
    boundaryZh: "需要用户确认后发送；不替用户接受验收结果或法律责任。",
    boundaryEn: "Requires user confirmation before sending; does not accept buyer acceptance result or legal responsibility on behalf of the user.",
  },
  {
    id: "draft_financier",
    actionId: "act_financier_status",
    channel: "email",
    toZh: "应收账款资金方",
    toEn: "Receivable financier",
    subjectZh: "UY-BEEF-CN-2026-0001 当前证明包状态",
    subjectEn: "Current proof-pack status for UY-BEEF-CN-2026-0001",
    bodyZh: "你好，当前 UY-BEEF-CN-2026-0001 的订单、发票和冷链记录已验证，入库记录和买家验收仍在补充中。这里是公开验证链接，供你先看事实链状态。正式融资申请会在验收补齐后再提交。",
    bodyEn: "Hi, the order, invoice, and cold-chain records for UY-BEEF-CN-2026-0001 are verified. Warehouse entry and buyer acceptance are still being completed. Here is the public verification link for early fact-chain review. Formal financing submission will wait until acceptance is complete.",
    contextRefs: ["mem_permission_boundary", "gap_share_scope", "task_financier"],
    boundaryZh: "只分享公开状态和必要元数据；不暴露私有合同正文。",
    boundaryEn: "Shares only public status and necessary metadata; does not expose private contract text.",
  },
];

export const sampleApprovalRecords: ApprovalRecord[] = [
  {
    id: "approval_warehouse",
    actionId: "act_warehouse_reminder",
    titleZh: "发送入库记录提醒",
    titleEn: "Send warehouse-entry reminder",
    requestedBy: "AI Agent",
    status: "pending",
    riskNoteZh: "低风险沟通，但仍需用户确认联系人和语气。",
    riskNoteEn: "Low-risk communication, but contact and tone still require user confirmation.",
    decisionLogZh: ["AI 已生成草稿。", "等待运营负责人确认。"],
    decisionLogEn: ["AI generated draft.", "Waiting for ops lead approval."],
  },
  {
    id: "approval_buyer",
    actionId: "act_buyer_acceptance",
    titleZh: "发送买家验收确认请求",
    titleEn: "Send buyer acceptance request",
    requestedBy: "AI Agent",
    status: "pending",
    riskNoteZh: "涉及验收和付款流程，必须人工审批。",
    riskNoteEn: "Touches acceptance and payment flow, so human approval is mandatory.",
    decisionLogZh: ["AI 根据历史风险提出建议。", "已引用买家验收缺口。"],
    decisionLogEn: ["AI suggested this based on historical risk.", "Buyer acceptance gap cited."],
  },
  {
    id: "approval_financier",
    actionId: "act_financier_status",
    titleZh: "给资金方发送状态说明",
    titleEn: "Send status note to financier",
    requestedBy: "AI Agent",
    status: "needs_changes",
    riskNoteZh: "需要确认公开链接范围，避免暴露私有文件。",
    riskNoteEn: "Share scope must be confirmed to avoid exposing private files.",
    decisionLogZh: ["用户要求先确认公开链接范围。"],
    decisionLogEn: ["User requested share-scope confirmation first."],
  },
];

export const sampleShareLink: ShareLink = {
  id: "share_uy_beef_public",
  url: "/verify/uy-beef-cn-2026-0001",
  scopeZh: "只公开证明包状态、证据槽状态、哈希和必要元数据。",
  scopeEn: "Only exposes proof-pack status, evidence-slot status, hashes, and necessary metadata.",
  expiresAt: "2026-07-31",
};

export function findContextLabel(ref: string, zh: boolean) {
  const memory = sampleCustomerMemories.find((item) => item.id === ref);
  if (memory) return zh ? memory.titleZh : memory.titleEn;
  const gap = sampleRiskGaps.find((item) => item.id === ref);
  if (gap) return zh ? gap.titleZh : gap.titleEn;
  const task = sampleTasks.find((item) => item.id === ref);
  if (task) return zh ? task.titleZh : task.titleEn;
  const slot = sampleEvidenceSlots.find((item) => item.id === ref);
  if (slot) return zh ? slot.nameZh : slot.nameEn;
  return ref;
}
