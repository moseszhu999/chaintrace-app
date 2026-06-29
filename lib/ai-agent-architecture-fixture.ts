export type BusinessArchitectureSection = {
  id: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  pointsZh: string[];
  pointsEn: string[];
};

export type AgentReplacementStep = {
  id: string;
  manualStepZh: string;
  manualStepEn: string;
  agentZh: string;
  agentEn: string;
  replacementZh: string;
  replacementEn: string;
  outputZh: string;
  outputEn: string;
};

export const businessArchitectureSections: BusinessArchitectureSection[] = [
  {
    id: "business-capability-map",
    titleZh: "业务能力地图",
    titleEn: "Business capability map",
    summaryZh: "ChainTrace 的业务能力不是“供应链上链”，而是把贸易证据转成融资判断。",
    summaryEn: "ChainTrace is not about putting supply chains on-chain; it turns trade evidence into financing decisions.",
    pointsZh: [
      "贸易 Case 管理：把 PO、发票、货物、付款条款统一到一个 case。",
      "证据 Gate 管理：把签章、物流、仓库、质检、买家验收拆成可追踪 gate。",
      "融资可行性管理：生成 Readiness Score、Financing Pack 和 Financier Memo。",
      "链上执行管理：Gate 满足后进入 FinancierPool → BankVault → ReceivableLoan 放款路径。",
    ],
    pointsEn: [
      "Trade case management: unify PO, invoice, goods, and payment terms into one case.",
      "Evidence gate management: split signatures, logistics, warehouse, QC, and buyer acceptance into trackable gates.",
      "Financing executability management: generate Readiness Score, Financing Pack, and Financier Memo.",
      "On-chain execution management: after gates close, execute the FinancierPool → BankVault → ReceivableLoan path.",
    ],
  },
  {
    id: "scenario-flow-as-business-architecture",
    titleZh: "端到端业务流程",
    titleEn: "End-to-end business flow",
    summaryZh: "正确咨询流程里，场景流程属于业务架构，不应该放在 BLM 与应用架构之间单独漂着。",
    summaryEn: "In the corrected consulting flow, scenario flow belongs inside business architecture rather than floating between BLM and application architecture.",
    pointsZh: [
      "创建贸易 Case → 上传 PO / 发票 / 装箱 / VGM / 报关 / 仓库 / 质检 / 验收。",
      "AI Agent 识别证据类型、抽取关键字段、匹配 gate。",
      "系统生成证据缺口、下一步催办对象、融资评分和 memo。",
      "资金方只审阅融资包和关键风险，不再人工翻一堆 PDF。",
    ],
    pointsEn: [
      "Create trade case → upload PO / invoice / packing / VGM / customs / warehouse / QC / acceptance.",
      "AI agents classify evidence, extract key fields, and map evidence to gates.",
      "The system generates evidence gaps, next chase targets, readiness score, and memo.",
      "Financiers review the financing pack and key risks instead of manually reading scattered PDFs.",
    ],
  },
  {
    id: "agent-first-operating-model",
    titleZh: "Agent-first 运营模式",
    titleEn: "Agent-first operating model",
    summaryZh: "出圈点必须是 AI Agent 替代人工证据运营，而不是单纯多一个聊天机器人。",
    summaryEn: "The breakout point must be AI agents replacing manual evidence operations, not merely another chatbot.",
    pointsZh: [
      "Evidence Agent 替代人工整理 PDF、邮件、图片和单证。",
      "Gate Agent 替代人工判断每个 gate 是否缺证据、缺谁签、缺哪个文件。",
      "Risk Agent 替代人工写预审 memo 和风险 flags。",
      "Chasing Agent 替代人工催物流、仓库、买家、质检方补材料。",
    ],
    pointsEn: [
      "Evidence Agent replaces manual organization of PDFs, emails, images, and trade documents.",
      "Gate Agent replaces manual checks of missing evidence, signatures, and documents for each gate.",
      "Risk Agent replaces manual drafting of pre-review memo and risk flags.",
      "Chasing Agent replaces manual follow-up with logistics providers, warehouses, buyers, and QC parties.",
    ],
  },
];

export const agentReplacementMap: AgentReplacementStep[] = [
  {
    id: "document-triage",
    manualStepZh: "人工打开每个 PDF / 图片，判断是 PO、发票、装箱单、VGM、报关、仓库还是质检。",
    manualStepEn: "A human opens every PDF / image and decides whether it is PO, invoice, packing list, VGM, customs, warehouse, or QC.",
    agentZh: "Evidence Agent",
    agentEn: "Evidence Agent",
    replacementZh: "自动分类单证、抽取编号、金额、柜号、铅封、重量、日期、签发方。",
    replacementEn: "Automatically classifies documents and extracts numbers, amount, container, seal, weight, date, and issuer.",
    outputZh: "结构化 Document + Evidence metadata。",
    outputEn: "Structured Document + Evidence metadata.",
  },
  {
    id: "gate-matching",
    manualStepZh: "人工把证据一项项对到融资 checklist，判断哪些 gate 已满足。",
    manualStepEn: "A human maps evidence to the financing checklist and decides which gates are satisfied.",
    agentZh: "Gate Agent",
    agentEn: "Gate Agent",
    replacementZh: "自动把证据映射到 signing gate、logistics gate、QC gate 和 buyer acceptance gate。",
    replacementEn: "Automatically maps evidence to signing gates, logistics gates, QC gates, and buyer acceptance gates.",
    outputZh: "Gate 状态：passed / pending / blocked。",
    outputEn: "Gate status: passed / pending / blocked.",
  },
  {
    id: "gap-detection",
    manualStepZh: "人工问货代、仓库、买家、质检方：还差什么？谁没回？哪个文件不合格？",
    manualStepEn: "A human asks forwarder, warehouse, buyer, and QC provider what is missing, who has not replied, and which file is invalid.",
    agentZh: "Evidence Gap Agent",
    agentEn: "Evidence Gap Agent",
    replacementZh: "自动列出缺失证据、责任方、下一步动作和优先级。",
    replacementEn: "Automatically lists missing evidence, responsible party, next action, and priority.",
    outputZh: "Next Actions + responsible party + blocker reason。",
    outputEn: "Next Actions + responsible party + blocker reason.",
  },
  {
    id: "risk-memo",
    manualStepZh: "风控经理人工写预审 memo、风险点和放款前置条件。",
    manualStepEn: "Risk manager manually writes pre-review memo, risk flags, and approval conditions.",
    agentZh: "Risk Agent",
    agentEn: "Risk Agent",
    replacementZh: "自动生成 Financier Memo、risk flags、approval conditions 和 machineDecision。",
    replacementEn: "Automatically generates Financier Memo, risk flags, approval conditions, and machineDecision.",
    outputZh: "资金方可读 memo + 机器可读 Financing Pack API。",
    outputEn: "Human-readable memo + machine-readable Financing Pack API.",
  },
  {
    id: "follow-up",
    manualStepZh: "运营人员人工催物流商补 B/L、催仓库补回执、催买家验收。",
    manualStepEn: "Ops manually chases forwarder for B/L, warehouse for receipt, and buyer for acceptance.",
    agentZh: "Chasing Agent",
    agentEn: "Chasing Agent",
    replacementZh: "根据缺口自动生成催办任务、消息模板、截止时间和升级路径。",
    replacementEn: "Generates follow-up tasks, message templates, due dates, and escalation path based on gaps.",
    outputZh: "任务队列 + 催办话术 + SLA。",
    outputEn: "Task queue + follow-up message + SLA.",
  },
];
