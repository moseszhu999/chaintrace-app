export type ArchitectureSection = {
  id: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  pointsZh: string[];
  pointsEn: string[];
};

export type ArchitectureLayer = {
  id: string;
  titleZh: string;
  titleEn: string;
  ownerZh: string;
  ownerEn: string;
  capabilitiesZh: string[];
  capabilitiesEn: string[];
};

export type ArchitectureRoadmap = {
  phase: string;
  titleZh: string;
  titleEn: string;
  goalZh: string;
  goalEn: string;
  deliverablesZh: string[];
  deliverablesEn: string[];
};

export const blmSections: ArchitectureSection[] = [
  {
    id: "market-insight",
    titleZh: "Market Insight / 市场洞察",
    titleEn: "Market Insight",
    summaryZh: "小企业跨境贸易的核心痛点不是缺区块链，而是贸易事实无法被快速金融化。",
    summaryEn: "The core SME cross-border trade pain is not lack of blockchain; it is that trade facts cannot be quickly converted into finance-ready assets.",
    pointsZh: ["证据散在 PDF、邮件、WhatsApp、Excel、货代和仓库系统。", "资金方难以快速判断应收是否真实、完整、可追索。", "买家验收、质检争议和仓库回执经常卡住尾款。"],
    pointsEn: ["Evidence is scattered across PDFs, email, WhatsApp, Excel, forwarders, and warehouses.", "Financiers cannot quickly judge whether a receivable is real, complete, and enforceable.", "Buyer acceptance, QC disputes, and warehouse receipts often block balance payments."],
  },
  {
    id: "strategic-intent",
    titleZh: "Strategic Intent / 战略意图",
    titleEn: "Strategic Intent",
    summaryZh: "把小企业跨境贸易证据转化为可融资的应收账款状态机，并让 AI Agent 替代人工证据运营。",
    summaryEn: "Turn SME cross-border trade evidence into finance-ready receivable state machines and let AI agents replace manual evidence operations.",
    pointsZh: ["第一阶段聚焦融资证据操作系统。", "中期接入资金方和受限 RWA。", "长期成为 AI Agent 可调用的小企业跨境贸易信用基础设施。"],
    pointsEn: ["Phase one focuses on a trade-finance evidence operating system.", "Mid-term connects financiers and restricted RWA workflows.", "Long-term becomes AI-agent-readable SME cross-border trade credit infrastructure."],
  },
  {
    id: "innovation-focus",
    titleZh: "Innovation Focus / 创新焦点",
    titleEn: "Innovation Focus",
    summaryZh: "不是上链存证，而是 AI Agent 驱动的证据到放款闭环。",
    summaryEn: "Not on-chain notarization, but an AI-agent-driven evidence-to-disbursement loop.",
    pointsZh: ["Evidence Agent 抽取和分类单证。", "Gate Agent 判断签章、物流、质检、买家验收是否满足。", "Risk Agent 生成 Readiness Score、Financing Pack 和资金方 memo。"],
    pointsEn: ["Evidence Agent extracts and classifies documents.", "Gate Agent checks whether signing, logistics, QC, and buyer acceptance gates are satisfied.", "Risk Agent generates Readiness Score, Financing Pack, and financier memo."],
  },
  {
    id: "business-design",
    titleZh: "Business Design / 业务设计",
    titleEn: "Business Design",
    summaryZh: "早期卖点不是 RWA，而是 AI Agent 替代人工整理证据、催办缺口、生成融资材料包。",
    summaryEn: "The early business is not RWA issuance; it is AI agents replacing manual evidence organization, gap chasing, and financing-pack generation.",
    pointsZh: ["出口商减少整理资料和反复解释的人工成本。", "资金方减少尽调和预审 memo 的人工成本。", "平台可收 SaaS 费、Agent 处理费、材料包费、预审服务费和融资成功服务费。"],
    pointsEn: ["Exporters reduce manual document preparation and explanation cost.", "Financiers reduce due-diligence and pre-review memo labor cost.", "The platform can charge SaaS, agent-processing, pack generation, pre-review, and success fees."],
  },
];

export const valueChainSections: ArchitectureSection[] = [
  {
    id: "value-creation",
    titleZh: "价值创造：贸易事实生成",
    titleEn: "Value creation: trade facts are generated",
    summaryZh: "出口商、买家、物流、仓库、质检方在真实贸易过程中产生事实，但这些事实原本分散、低结构化、难融资。",
    summaryEn: "Exporter, buyer, logistics provider, warehouse, and QC provider generate real trade facts, but these facts are scattered, unstructured, and hard to finance.",
    pointsZh: ["PO、发票、装箱、VGM、报关、B/L、仓库、QC、验收共同构成应收账款事实链。", "AI Agent 先把低结构化材料变成结构化证据。", "ChainTrace 的第一价值是降低证据整理成本。"],
    pointsEn: ["PO, invoice, packing, VGM, customs, B/L, warehouse, QC, and acceptance form the receivable fact chain.", "AI agents first turn unstructured materials into structured evidence.", "ChainTrace's first value is lowering evidence organization cost."],
  },
  {
    id: "value-verification",
    titleZh: "价值验证：多方 Gate 确认",
    titleEn: "Value verification: multi-party gate confirmation",
    summaryZh: "价值不是平台自己说了算，而是由买家、物流、仓库、质检、资金方在各自职责内验证。",
    summaryEn: "Value is not self-claimed by the platform; it is verified by buyer, logistics provider, warehouse, QC provider, and financier within their roles.",
    pointsZh: ["Signing Gate 验证商业义务。", "Logistics Gate 验证货物流转。", "QC / Acceptance Gate 验证争议状态和尾款触发条件。"],
    pointsEn: ["Signing gates verify commercial obligations.", "Logistics gates verify cargo movement.", "QC / acceptance gates verify dispute status and balance-payment triggers."],
  },
  {
    id: "value-conversion",
    titleZh: "价值转化：证据变融资判断",
    titleEn: "Value conversion: evidence becomes a financing decision",
    summaryZh: "ChainTrace 的核心增值点是把证据链转化为 Readiness Score、Financing Pack 和 Financier Memo。",
    summaryEn: "ChainTrace's core added value is converting evidence chains into Readiness Score, Financing Pack, and Financier Memo.",
    pointsZh: ["资金方不需要人工翻 PDF，而是看风险 flags、缺口、前置条件和 machineDecision。", "AI Agent 替代预审助理和风控文书工作。", "API 让银行、保理商、Agent 和平台后台直接消费同一份判断。"],
    pointsEn: ["Financiers do not manually read PDFs; they review risk flags, gaps, approval conditions, and machineDecision.", "AI agents replace pre-review assistants and risk-documentation work.", "The API lets banks, factors, agents, and platform back offices consume the same decision."],
  },
  {
    id: "value-consumption",
    titleZh: "价值消费：资金方与小企业使用结果",
    titleEn: "Value consumption: financiers and SMEs use the result",
    summaryZh: "出口商消费的是融资可得性，资金方消费的是低成本尽调结果，验证方消费的是低摩擦确认入口。",
    summaryEn: "Exporters consume financing accessibility, financiers consume low-cost due diligence output, and verifiers consume low-friction confirmation entry points.",
    pointsZh: ["出口商用它换取更快预审和更高信任。", "资金方用它减少尽调时间和坏账盲区。", "货代、仓库、质检、买家只需确认自己负责的事实节点。"],
    pointsEn: ["Exporters use it for faster pre-review and higher trust.", "Financiers use it to reduce due-diligence time and blind spots.", "Forwarders, warehouses, QC providers, and buyers only confirm their responsible fact nodes."],
  },
  {
    id: "value-capture",
    titleZh: "价值捕获：平台收入与网络效应",
    titleEn: "Value capture: platform revenue and network effects",
    summaryZh: "平台收入不应先靠发币，而应来自 Agent 处理、融资材料包、SaaS、预审服务和融资成功服务费。",
    summaryEn: "Platform revenue should not start from token issuance; it should come from agent processing, financing packs, SaaS, pre-review service, and financing success fees.",
    pointsZh: ["每笔贸易 case 产生可计费的 Agent 工作量。", "每份 Financing Pack 产生可计费的风控交付物。", "越多交易、验证方和资金方接入，Trade Fact Graph 越有复用价值。"],
    pointsEn: ["Each trade case creates billable agent workload.", "Each Financing Pack creates a billable risk deliverable.", "As more trades, verifiers, and financiers connect, the Trade Fact Graph gains reusable value."],
  },
];

export const applicationArchitecture: ArchitectureLayer[] = [
  {
    id: "portal",
    titleZh: "门户层",
    titleEn: "Portal layer",
    ownerZh: "出口商、资金方、验证方、平台运营",
    ownerEn: "Exporter, financier, verifier, platform ops",
    capabilitiesZh: ["SME Portal", "Financier Portal", "Verifier Portal", "Admin / Risk Portal"],
    capabilitiesEn: ["SME Portal", "Financier Portal", "Verifier Portal", "Admin / Risk Portal"],
  },
  {
    id: "workspace",
    titleZh: "贸易工作台",
    titleEn: "Trade workspace",
    ownerZh: "业务用户",
    ownerEn: "Business users",
    capabilitiesZh: ["四流合一", "业务总览", "业务文件", "履约 / 验收"],
    capabilitiesEn: ["Four-flow view", "Business overview", "Business documents", "Fulfillment / acceptance"],
  },
  {
    id: "agent-workbench",
    titleZh: "AI Agent 工作台",
    titleEn: "AI Agent workbench",
    ownerZh: "AI Agent + 业务运营",
    ownerEn: "AI agents + business ops",
    capabilitiesZh: ["Evidence Agent", "Gate Agent", "Evidence Gap Agent", "Risk Agent", "Chasing Agent"],
    capabilitiesEn: ["Evidence Agent", "Gate Agent", "Evidence Gap Agent", "Risk Agent", "Chasing Agent"],
  },
  {
    id: "evidence",
    titleZh: "证据与 Gate 应用",
    titleEn: "Evidence and gate applications",
    ownerZh: "货代、仓库、质检、买家",
    ownerEn: "Forwarder, warehouse, QC, buyer",
    capabilitiesZh: ["签章合约", "物流证据", "Proof Pack", "Gate 状态追踪"],
    capabilitiesEn: ["Signing contract", "Logistics evidence", "Proof Pack", "Gate status tracking"],
  },
  {
    id: "readiness",
    titleZh: "融资评分应用",
    titleEn: "Readiness application",
    ownerZh: "资金方 / 风控经理",
    ownerEn: "Financier / risk manager",
    capabilitiesZh: ["Readiness Score", "Financing Pack", "Financier Memo", "Financing Pack API"],
    capabilitiesEn: ["Readiness Score", "Financing Pack", "Financier Memo", "Financing Pack API"],
  },
  {
    id: "onchain-finance",
    titleZh: "链上金融应用",
    titleEn: "On-chain finance applications",
    ownerZh: "资金方、平台风控",
    ownerEn: "Financier, platform risk",
    capabilitiesZh: ["FinancierPool", "BankVault", "ReceivableLoan", "RestrictedReceivableToken"],
    capabilitiesEn: ["FinancierPool", "BankVault", "ReceivableLoan", "RestrictedReceivableToken"],
  },
];

export const dataArchitecture: ArchitectureLayer[] = [
  {
    id: "trade-case",
    titleZh: "Trade Case 主数据",
    titleEn: "Trade Case master data",
    ownerZh: "平台业务服务",
    ownerEn: "Platform business services",
    capabilitiesZh: ["tradeId", "PO / Invoice", "商品、数量、价格", "付款条款", "应收金额"],
    capabilitiesEn: ["tradeId", "PO / Invoice", "goods, quantity, price", "payment terms", "receivable amount"],
  },
  {
    id: "document-evidence",
    titleZh: "文档与证据数据",
    titleEn: "Document and evidence data",
    ownerZh: "Evidence Service + Evidence Agent",
    ownerEn: "Evidence Service + Evidence Agent",
    capabilitiesZh: ["documentId", "documentType", "hash", "URI", "issuer", "linkedGateId", "extractedFields"],
    capabilitiesEn: ["documentId", "documentType", "hash", "URI", "issuer", "linkedGateId", "extractedFields"],
  },
  {
    id: "agent-output",
    titleZh: "Agent 输出数据",
    titleEn: "Agent output data",
    ownerZh: "Agent Orchestrator",
    ownerEn: "Agent Orchestrator",
    capabilitiesZh: ["classification", "field extraction", "gap list", "next actions", "risk memo", "confidence"],
    capabilitiesEn: ["classification", "field extraction", "gap list", "next actions", "risk memo", "confidence"],
  },
  {
    id: "gate-state",
    titleZh: "Gate 状态数据",
    titleEn: "Gate state data",
    ownerZh: "链上合约 + Indexer",
    ownerEn: "Smart contracts + indexer",
    capabilitiesZh: ["Pending", "Verified", "Blocked", "Rejected", "Expired"],
    capabilitiesEn: ["Pending", "Verified", "Blocked", "Rejected", "Expired"],
  },
  {
    id: "readiness-pack",
    titleZh: "融资评分与材料包",
    titleEn: "Readiness and financing pack",
    ownerZh: "Readiness Service + Risk Agent",
    ownerEn: "Readiness Service + Risk Agent",
    capabilitiesZh: ["score", "riskFlags", "approvalConditions", "memo", "machineDecision"],
    capabilitiesEn: ["score", "riskFlags", "approvalConditions", "memo", "machineDecision"],
  },
  {
    id: "finance-events",
    titleZh: "资金与合约事件",
    titleEn: "Funding and contract events",
    ownerZh: "FinancierPool / BankVault / ReceivableLoan",
    ownerEn: "FinancierPool / BankVault / ReceivableLoan",
    capabilitiesZh: ["deposit", "fundVault", "creditLine", "disbursement", "repayment", "default"],
    capabilitiesEn: ["deposit", "fundVault", "creditLine", "disbursement", "repayment", "default"],
  },
];

export const technicalArchitecture: ArchitectureLayer[] = [
  {
    id: "frontend",
    titleZh: "前端层",
    titleEn: "Frontend layer",
    ownerZh: "Next.js / React / TypeScript",
    ownerEn: "Next.js / React / TypeScript",
    capabilitiesZh: ["业务工作台", "融资评分", "Agent 工作台", "合约控制台", "资金方视图"],
    capabilitiesEn: ["Business workspace", "Readiness report", "Agent workbench", "Contract console", "Financier view"],
  },
  {
    id: "api",
    titleZh: "API 层",
    titleEn: "API layer",
    ownerZh: "Next API Routes",
    ownerEn: "Next API Routes",
    capabilitiesZh: ["/api/financing-pack", "未来 /api/trades", "未来 /api/evidence", "未来 /api/agents", "未来 /api/loans"],
    capabilitiesEn: ["/api/financing-pack", "future /api/trades", "future /api/evidence", "future /api/agents", "future /api/loans"],
  },
  {
    id: "agent-services",
    titleZh: "AI Agent 服务层",
    titleEn: "AI Agent service layer",
    ownerZh: "Agent Orchestrator / LLM / OCR / Tool Calling",
    ownerEn: "Agent Orchestrator / LLM / OCR / Tool Calling",
    capabilitiesZh: ["文档分类", "字段抽取", "Gate 匹配", "缺口检测", "自动催办", "Memo 生成"],
    capabilitiesEn: ["document classification", "field extraction", "gate matching", "gap detection", "automated chasing", "memo generation"],
  },
  {
    id: "contracts",
    titleZh: "智能合约层",
    titleEn: "Smart contract layer",
    ownerZh: "Solidity / Hardhat / Base Sepolia",
    ownerEn: "Solidity / Hardhat / Base Sepolia",
    capabilitiesZh: ["TradeSigningRegistry", "LogisticsEvidenceRegistry", "FinancierPool", "BankVault", "ReceivableLoan"],
    capabilitiesEn: ["TradeSigningRegistry", "LogisticsEvidenceRegistry", "FinancierPool", "BankVault", "ReceivableLoan"],
  },
  {
    id: "storage",
    titleZh: "存储层",
    titleEn: "Storage layer",
    ownerZh: "未来 PostgreSQL / Object Storage / Vector Store / Indexer DB",
    ownerEn: "Future PostgreSQL / Object Storage / Vector Store / Indexer DB",
    capabilitiesZh: ["贸易主数据", "文档 metadata", "原文文件", "Agent 输出", "合约事件", "审计日志"],
    capabilitiesEn: ["Trade master data", "document metadata", "raw files", "agent outputs", "contract events", "audit logs"],
  },
  {
    id: "devops",
    titleZh: "DevOps / CI/CD",
    titleEn: "DevOps / CI/CD",
    ownerZh: "GitHub Actions / Vercel",
    ownerEn: "GitHub Actions / Vercel",
    capabilitiesZh: ["合约编译", "合约测试", "Hardhat dev 部署", "案例部署", "Vercel 发布"],
    capabilitiesEn: ["Contract compile", "contract test", "Hardhat dev deploy", "case deploy", "Vercel release"],
  },
];

export const architectureRoadmap: ArchitectureRoadmap[] = [
  {
    phase: "Phase 0",
    titleZh: "Demo 验证",
    titleEn: "Demo validation",
    goalZh: "越南咖啡案例、融资评分、融资包 API、链上 gate 和贷款原型跑通。",
    goalEn: "Vietnam coffee case, readiness score, financing-pack API, on-chain gates, and loan prototype work end to end.",
    deliverablesZh: ["/business-readiness", "/api/financing-pack", "Financier Memo", "FinancierPool + BankVault + ReceivableLoan"],
    deliverablesEn: ["/business-readiness", "/api/financing-pack", "Financier Memo", "FinancierPool + BankVault + ReceivableLoan"],
  },
  {
    phase: "Phase 1",
    titleZh: "Agent-first MVP",
    titleEn: "Agent-first MVP",
    goalZh: "真实小企业上传一笔贸易资料后，AI Agent 自动分类、抽取、匹配 gate、生成缺口和融资材料包。",
    goalEn: "After a real SME uploads one trade case, AI agents classify, extract, match gates, generate gaps, and create the financing pack.",
    deliverablesZh: ["Document Upload", "Evidence Agent", "Gate Agent", "Evidence Gap Agent", "Financier Memo", "PDF Export"],
    deliverablesEn: ["Document Upload", "Evidence Agent", "Gate Agent", "Evidence Gap Agent", "Financier Memo", "PDF Export"],
  },
  {
    phase: "Phase 2",
    titleZh: "Pilot",
    titleEn: "Pilot",
    goalZh: "找 3-5 个小贸易商和 1-2 个资金方验证 Agent 生成的 memo 是否真的减少人工尽调。",
    goalEn: "Test with 3-5 small traders and 1-2 financiers whether agent-generated memo actually reduces manual due diligence.",
    deliverablesZh: ["真实贸易 case", "资金方访谈", "证据缺口模板", "Agent 命中率", "融资预审反馈"],
    deliverablesEn: ["Real trade cases", "financier interviews", "evidence-gap template", "agent hit rate", "pre-review feedback"],
  },
  {
    phase: "Phase 3",
    titleZh: "Controlled Financing",
    titleEn: "Controlled Financing",
    goalZh: "接入真实资金方，小额真实融资，不做公开 RWA。",
    goalEn: "Connect real financiers for small controlled financing, without public RWA issuance.",
    deliverablesZh: ["KYC", "法律债权转让", "审批流", "真实还款记录", "违约处理"],
    deliverablesEn: ["KYC", "legal receivable assignment", "approval workflow", "real repayment records", "default handling"],
  },
];
