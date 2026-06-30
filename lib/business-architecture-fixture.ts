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
    summaryZh: "小企业跨境贸易的核心痛点不是缺后端系统，而是 PDF 里的贸易事实无法快速变成可签名、可验证、可预审的融资候选。",
    summaryEn: "The core SME cross-border trade pain is not lack of backend systems; it is that trade facts inside PDFs cannot quickly become signable, verifiable, pre-review financing candidates.",
    pointsZh: ["证据散在 PDF、邮件、WhatsApp、Excel、货代和仓库系统。", "资金方难以快速判断应收是否真实、完整、可追索。", "买家验收、质检争议和仓库回执经常卡住尾款。"],
    pointsEn: ["Evidence is scattered across PDFs, email, WhatsApp, Excel, forwarders, and warehouses.", "Financiers cannot quickly judge whether a receivable is real, complete, and enforceable.", "Buyer acceptance, QC disputes, and warehouse receipts often block balance payments."],
  },
  {
    id: "strategic-intent",
    titleZh: "Strategic Intent / 战略意图",
    titleEn: "Strategic Intent",
    summaryZh: "把小企业跨境贸易 PDF 和证据哈希转化为链上应收账款融资候选状态机，并让 AI Agent 替代人工证据运营。",
    summaryEn: "Turn SME cross-border trade PDFs and evidence hashes into on-chain receivable-financing candidate state machines and let AI agents replace manual evidence operations.",
    pointsZh: ["第一阶段聚焦融资证据操作系统。", "中期接入资金方和受限 RWA。", "长期成为 AI Agent 可调用的小企业跨境贸易信用基础设施。"],
    pointsEn: ["Phase one focuses on a trade-finance evidence operating system.", "Mid-term connects financiers and restricted RWA workflows.", "Long-term becomes AI-agent-readable SME cross-border trade credit infrastructure."],
  },
  {
    id: "innovation-focus",
    titleZh: "Innovation Focus / 创新焦点",
    titleEn: "Innovation Focus",
    summaryZh: "不是后端收文件，也不是简单上链存证，而是前端本地证明 + 智能合约 gate 共同驱动的融资候选闭环。",
    summaryEn: "Not backend file intake and not simple notarization, but a frontend-local proof + smart-contract gate loop for financing candidates.",
    pointsZh: ["Evidence Agent 抽取和分类单证，浏览器生成文件哈希。", "Gate Agent 判断签章、物流、质检、买家验收是否满足。", "智能合约把多方确认转成共享状态机，减少反复邮件确认、Excel 对账和人工复核。", "Risk Agent 生成 Readiness Score、Financing Pack 和资金方 memo；正式放款仍受 gate 阻断。"],
    pointsEn: ["Evidence Agent extracts and classifies documents while the browser creates file hashes.", "Gate Agent checks whether signing, logistics, QC, and buyer acceptance gates are satisfied.", "Smart contracts turn multi-party confirmations into a shared state machine, reducing repeated email confirmation, Excel reconciliation, and manual re-checking.", "Risk Agent generates Readiness Score, Financing Pack, and financier memo; formal disbursement remains gate-blocked."],
  },
  {
    id: "business-design",
    titleZh: "Business Design / 业务设计",
    titleEn: "Business Design",
    summaryZh: "早期卖点不是 RWA，而是 AI Agent 替代人工整理证据，智能合约减少流程摩擦，并让银行、律所等中介从重复人工处理退到高价值节点。",
    summaryEn: "The early business is not RWA issuance; it is AI agents replacing manual evidence work, smart contracts reducing process friction, and banks/law firms shifting from repetitive processing to high-value decision points.",
    pointsZh: ["出口商减少整理资料和反复解释的人工成本。", "资金方减少尽调、预审 memo 和放款前人工复核成本。", "智能合约减少多方确认、状态同步、授信占用、放款条件检查中的摩擦。", "银行保留资金、授信、合规和最终审批；律所保留法律结构、模板、争议和重大例外处理。", "平台可收 SaaS 费、Agent 处理费、材料包费、预审服务费、合约执行服务费和融资成功服务费。"],
    pointsEn: ["Exporters reduce manual document preparation and explanation cost.", "Financiers reduce due-diligence, pre-review memo, and pre-disbursement re-check cost.", "Smart contracts reduce friction in multi-party confirmation, state synchronization, credit-line reservation, and disbursement-condition checks.", "Banks retain funding, underwriting, compliance, and final approval; law firms retain legal structuring, templates, disputes, and material exception handling.", "The platform can charge SaaS, agent-processing, pack generation, pre-review, contract-execution, and success fees."],
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
    summaryZh: "价值不是平台自己说了算，而是由买家、物流、仓库、质检、资金方在各自职责内验证；智能合约把这些确认沉淀成共享状态机。",
    summaryEn: "Value is not self-claimed by the platform; it is verified by buyer, logistics provider, warehouse, QC provider, and financier within their roles, while smart contracts turn those confirmations into a shared state machine.",
    pointsZh: ["Signing Gate 验证商业义务。", "Logistics Gate 验证货物流转。", "QC / Acceptance Gate 验证争议状态和尾款触发条件。", "智能合约把多方确认结果写成统一 gate 状态，减少邮件来回确认、截图证明、Excel 对账和人工状态同步。"],
    pointsEn: ["Signing gates verify commercial obligations.", "Logistics gates verify cargo movement.", "QC / acceptance gates verify dispute status and balance-payment triggers.", "Smart contracts write multi-party confirmations into unified gate states, reducing back-and-forth email confirmation, screenshot proof, Excel reconciliation, and manual status synchronization."],
  },
  {
    id: "value-conversion",
    titleZh: "价值转化：证据变融资判断",
    titleEn: "Value conversion: evidence becomes a financing decision",
    summaryZh: "ChainTrace 的核心增值点是把 PDF 哈希和证据链转化为 Readiness Score、Financing Pack、Financier Memo 和链上预审请求。",
    summaryEn: "ChainTrace's core added value is converting PDF hashes and evidence chains into Readiness Score, Financing Pack, Financier Memo, and on-chain pre-review requests.",
    pointsZh: ["资金方不需要人工翻 PDF，而是看风险 flags、缺口、前置条件和 machineDecision。", "AI Agent 替代预审助理和风控文书工作。", "ReceivableLoan 自动读取签章和物流 registry；gate 不通过时不能放款，减少放款前人工复核摩擦。", "银行、保理商和专业审查方通过前端/RPC 读取同一份链上 gate 状态和预审请求。"],
    pointsEn: ["Financiers do not manually read PDFs; they review risk flags, gaps, approval conditions, and machineDecision.", "AI agents replace pre-review assistants and risk-documentation work.", "ReceivableLoan reads signing and logistics registries automatically; if gates do not pass, disbursement cannot happen, reducing pre-disbursement manual re-check friction.", "Banks, factors, and professional reviewers read the same on-chain gate state and pre-review request through the frontend/RPC."],
  },
  {
    id: "intermediary-compression",
    titleZh: "价值重构：中介职能数量级弱化",
    titleEn: "Value restructuring: order-of-magnitude intermediary compression",
    summaryZh: "ChainTrace 不消灭银行和律所，而是把它们过去大量低价值、重复性、人工密集的核验和文书工作压缩到 Agent + 合约工作流里。",
    summaryEn: "ChainTrace does not eliminate banks and law firms; it compresses much of their low-value, repetitive, labor-heavy verification and paperwork into agent + contract workflows.",
    pointsZh: ["银行从人工翻单证、对 checklist、追状态，转向资金、授信、合规、定价和最终审批。", "律所从反复改同类文件、核对附件、确认条件，转向法律结构、模板治理、争议处理和重大例外。", "AI Agent 处理单证分类、字段抽取、memo 初稿、缺口清单和催办话术。", "智能合约处理 gate 状态同步、条件检查、授信占用、放款阻断和审计轨迹。", "结果不是中介归零，而是中介人工工作量和交易摩擦目标性地数量级压缩。"],
    pointsEn: ["Banks move from manually reading documents, checking lists, and chasing status to funding, underwriting, compliance, pricing, and final approval.", "Law firms move from repeatedly editing similar documents, checking attachments, and confirming conditions to legal structuring, template governance, dispute handling, and material exceptions.", "AI agents handle document classification, field extraction, memo drafts, gap lists, and follow-up language.", "Smart contracts handle gate-state synchronization, condition checks, credit-line reservation, disbursement blocking, and audit trails.", "The result is not zero intermediaries, but an order-of-magnitude target reduction in intermediary labor and transaction friction."],
  },
  {
    id: "value-consumption",
    titleZh: "价值消费：资金方与小企业使用结果",
    titleEn: "Value consumption: financiers and SMEs use the result",
    summaryZh: "出口商消费的是融资可得性，资金方消费的是低成本尽调结果，验证方消费的是低摩擦确认入口。",
    summaryEn: "Exporters consume financing accessibility, financiers consume low-cost due diligence output, and verifiers consume low-friction confirmation entry points.",
    pointsZh: ["出口商用它换取更快预审和更高信任。", "资金方用它减少尽调时间、放款条件复核和坏账盲区。", "货代、仓库、质检、买家只需确认自己负责的事实节点，合约自动把确认传递给资金方。"],
    pointsEn: ["Exporters use it for faster pre-review and higher trust.", "Financiers use it to reduce due-diligence time, disbursement-condition re-checking, and blind spots.", "Forwarders, warehouses, QC providers, and buyers only confirm their responsible fact nodes, and contracts automatically propagate the confirmed state to financiers."],
  },
  {
    id: "value-capture",
    titleZh: "价值捕获：平台收入与网络效应",
    titleEn: "Value capture: platform revenue and network effects",
    summaryZh: "平台收入不应先靠发币，而应来自 Agent 处理、融资材料包、SaaS、预审服务、合约执行服务和融资成功服务费。",
    summaryEn: "Platform revenue should not start from token issuance; it should come from agent processing, financing packs, SaaS, pre-review service, contract-execution service, and financing success fees.",
    pointsZh: ["每笔贸易 case 产生可计费的 Agent 工作量。", "每份 Financing Pack 产生可计费的风控交付物。", "每次合约 gate 检查、授信占用、放款执行都减少人工流程摩擦并形成可计费服务。", "越多交易、验证方和资金方接入，Trade Fact Graph 越有复用价值。"],
    pointsEn: ["Each trade case creates billable agent workload.", "Each Financing Pack creates a billable risk deliverable.", "Each contract gate check, credit-line reservation, and disbursement execution reduces manual process friction and becomes a billable service.", "As more trades, verifiers, and financiers connect, the Trade Fact Graph gains reusable value."],
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
    id: "professional-review",
    titleZh: "专业机构例外审查",
    titleEn: "Professional exception review",
    ownerZh: "银行、律所、保理商、合规顾问",
    ownerEn: "Banks, law firms, factors, compliance advisors",
    capabilitiesZh: ["最终授信", "合规确认", "法律结构", "重大例外", "争议处理"],
    capabilitiesEn: ["Final underwriting", "compliance confirmation", "legal structuring", "material exceptions", "dispute handling"],
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
    capabilitiesZh: ["FinancierPool", "BankVault", "ReceivableLoan", "RestrictedReceivableToken", "Gate-based disbursement", "Shared audit trail"],
    capabilitiesEn: ["FinancierPool", "BankVault", "ReceivableLoan", "RestrictedReceivableToken", "Gate-based disbursement", "Shared audit trail"],
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
    id: "professional-decision",
    titleZh: "专业机构决策数据",
    titleEn: "Professional decision data",
    ownerZh: "银行 / 律所 / 保理商",
    ownerEn: "Banks / law firms / factors",
    capabilitiesZh: ["final approval", "legal exception", "compliance note", "dispute opinion", "override reason"],
    capabilitiesEn: ["final approval", "legal exception", "compliance note", "dispute opinion", "override reason"],
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
    capabilitiesZh: ["deposit", "fundVault", "creditLine", "gate check", "disbursement", "repayment", "default"],
    capabilitiesEn: ["deposit", "fundVault", "creditLine", "gate check", "disbursement", "repayment", "default"],
  },
];

export const technicalArchitecture: ArchitectureLayer[] = [
  {
    id: "frontend-wallet",
    titleZh: "前端 + 钱包层",
    titleEn: "Frontend + wallet layer",
    ownerZh: "Next.js / React / TypeScript / Wallet",
    ownerEn: "Next.js / React / TypeScript / Wallet",
    capabilitiesZh: ["浏览器本地 PDF 哈希", "应收账款候选 JSON", "钱包签名", "合约读写", "资金方视图", "专业审查视图"],
    capabilitiesEn: ["Browser-local PDF hashing", "Receivable candidate JSON", "Wallet signature", "Contract read/write", "Financier view", "Professional review view"],
  },
  {
    id: "contract-protocol",
    titleZh: "智能合约协议层",
    titleEn: "Smart contract protocol layer",
    ownerZh: "Solidity / Hardhat / Base Sepolia",
    ownerEn: "Solidity / Hardhat / Base Sepolia",
    capabilitiesZh: ["TradeSigningRegistry", "LogisticsEvidenceRegistry", "LoanRequestRegistry", "ReceivableLoan", "RestrictedReceivableToken", "Automatic gate enforcement"],
    capabilitiesEn: ["TradeSigningRegistry", "LogisticsEvidenceRegistry", "LoanRequestRegistry", "ReceivableLoan", "RestrictedReceivableToken", "Automatic gate enforcement"],
  },
  {
    id: "chain-read-model",
    titleZh: "RPC 读链层",
    titleEn: "RPC chain-read layer",
    ownerZh: "Public RPC / Wallet provider / Contract events",
    ownerEn: "Public RPC / Wallet provider / Contract events",
    capabilitiesZh: ["gate 状态读取", "预审请求读取", "交易回执", "事件时间线", "block explorer 链接", "无应用后端核心依赖"],
    capabilitiesEn: ["Gate-state reads", "pre-review request reads", "transaction receipts", "event timeline", "block-explorer links", "no core app-backend dependency"],
  },
  {
    id: "client-artifacts",
    titleZh: "浏览器产物层",
    titleEn: "Client artifact layer",
    ownerZh: "用户浏览器 / 本地文件 / 用户自有存储",
    ownerEn: "User browser / local files / user-owned storage",
    capabilitiesZh: ["Browser-created candidate JSON/hash", "PDF 原文不上传平台后端", "evidence pack hash", "签名 payload", "可导出审计包"],
    capabilitiesEn: ["Browser-created candidate JSON/hash", "raw PDFs do not upload to a platform backend", "evidence-pack hash", "signature payload", "exportable audit pack"],
  },
  {
    id: "demo-mocks",
    titleZh: "Demo mock 适配层",
    titleEn: "Demo mock adapter layer",
    ownerZh: "仅用于 Vercel demo 和测试夹具",
    ownerEn: "For the Vercel demo and fixtures only",
    capabilitiesZh: ["公开 demo JSON", "固定越南咖啡案例", "本地验证脚本", "不作为生产核心后端", "可被链上读写替换"],
    capabilitiesEn: ["Public demo JSON", "fixed Vietnam coffee case", "local validation scripts", "not the production core backend", "replaceable by on-chain reads/writes"],
  },
  {
    id: "devops",
    titleZh: "静态部署与合约工具链",
    titleEn: "Static deploy and contract toolchain",
    ownerZh: "GitHub Actions / Vercel",
    ownerEn: "GitHub Actions / Vercel",
    capabilitiesZh: ["静态前端发布", "合约编译", "合约测试", "Hardhat dev 部署", "Base Sepolia 部署", "UX / API mock 验证"],
    capabilitiesEn: ["Static frontend release", "contract compile", "contract test", "Hardhat dev deploy", "Base Sepolia deploy", "UX / API mock validation"],
  },
];

export const architectureRoadmap: ArchitectureRoadmap[] = [
  {
    phase: "Phase 0",
    titleZh: "Demo 验证",
    titleEn: "Demo validation",
    goalZh: "越南咖啡案例、浏览器 PDF 哈希、应收账款候选、链上 gate 和贷款原型跑通。",
    goalEn: "Vietnam coffee case, browser PDF hashing, receivable candidate, on-chain gates, and loan prototype work end to end.",
    deliverablesZh: ["PDF → ReceivableCandidate", "LoanRequestRegistry 预审", "Financier Memo", "TradeSigningRegistry + LogisticsEvidenceRegistry + ReceivableLoan"],
    deliverablesEn: ["PDF → ReceivableCandidate", "LoanRequestRegistry pre-review", "Financier Memo", "TradeSigningRegistry + LogisticsEvidenceRegistry + ReceivableLoan"],
  },
  {
    phase: "Phase 1",
    titleZh: "Agent-first MVP",
    titleEn: "Agent-first MVP",
    goalZh: "真实小企业在前端选择贸易资料后，本地生成哈希和候选包，再由钱包签名写入链上 gate。",
    goalEn: "After a real SME selects trade documents in the frontend, the browser creates hashes and candidate packs, then wallet signatures write on-chain gates.",
    deliverablesZh: ["Client PDF hashing", "Evidence Agent in browser/demo mode", "Gate Agent", "Evidence Gap Agent", "Wallet signing", "Exportable audit pack"],
    deliverablesEn: ["Client PDF hashing", "Evidence Agent in browser/demo mode", "Gate Agent", "Evidence Gap Agent", "Wallet signing", "Exportable audit pack"],
  },
  {
    phase: "Phase 2",
    titleZh: "Pilot",
    titleEn: "Pilot",
    goalZh: "找 3-5 个小贸易商、1-2 个资金方、1 个法律/合规顾问验证 Agent + 合约是否真的减少人工尽调和中介流程摩擦。",
    goalEn: "Test with 3-5 small traders, 1-2 financiers, and 1 legal/compliance advisor whether agents + contracts actually reduce manual due diligence and intermediary process friction.",
    deliverablesZh: ["真实贸易 case", "资金方访谈", "法律/合规例外审查", "证据缺口模板", "Agent 命中率", "中介人工工时压缩指标", "融资预审反馈"],
    deliverablesEn: ["Real trade cases", "financier interviews", "legal/compliance exception review", "evidence-gap template", "agent hit rate", "intermediary labor compression metric", "pre-review feedback"],
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
