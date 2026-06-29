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
    summaryZh: "把小企业跨境贸易证据转化为可融资的应收账款状态机。",
    summaryEn: "Turn SME cross-border trade evidence into finance-ready receivable state machines.",
    pointsZh: ["第一阶段聚焦融资证据操作系统。", "中期接入资金方和受限 RWA。", "长期成为小企业跨境贸易信用基础设施。"],
    pointsEn: ["Phase one focuses on a trade-finance evidence operating system.", "Mid-term connects financiers and restricted RWA workflows.", "Long-term becomes SME cross-border trade credit infrastructure."],
  },
  {
    id: "innovation-focus",
    titleZh: "Innovation Focus / 创新焦点",
    titleEn: "Innovation Focus",
    summaryZh: "不是上链存证，而是证据驱动放款。",
    summaryEn: "Not on-chain notarization, but evidence-driven disbursement.",
    pointsZh: ["签章 Gate 证明商业义务。", "物流 Gate 证明货物状态。", "Readiness Score 和 Financing Pack 把事实转成资金方语言。"],
    pointsEn: ["Signing gates prove commercial obligations.", "Logistics gates prove cargo state.", "Readiness Score and Financing Pack translate facts into financier language."],
  },
  {
    id: "business-design",
    titleZh: "Business Design / 业务设计",
    titleEn: "Business Design",
    summaryZh: "早期卖点不是 RWA，而是融资材料包、证据工作流和资金方预审。",
    summaryEn: "The early business is not RWA issuance; it is financing packs, evidence workflow, and financier pre-review.",
    pointsZh: ["出口商用系统整理证据并降低融资沟通成本。", "资金方用系统降低尽调成本。", "平台可收 SaaS 费、材料包费、预审服务费和融资成功服务费。"],
    pointsEn: ["Exporters use the system to organize evidence and reduce financing communication cost.", "Financiers use it to reduce due-diligence cost.", "The platform can charge SaaS, pack generation, pre-review, and success fees."],
  },
];

export const scenarioFlow: ArchitectureSection = {
  id: "scenario-flow",
  titleZh: "核心场景流程",
  titleEn: "Core scenario flow",
  summaryZh: "越南咖啡出口新加坡：USD 52,800 贸易额，USD 36,960 尾款被质检和验收卡住，出口商申请 USDC 29,500 垫款。",
  summaryEn: "Vietnam coffee export to Singapore: USD 52,800 trade value, USD 36,960 balance blocked by QC and acceptance, exporter requests USDC 29,500 advance.",
  pointsZh: [
    "创建贸易 Case，录入 PO、发票、货物、付款条款。",
    "创建签章 Gate：PO、发票、QC、B/L、仓库、买家验收。",
    "创建物流 Gate：装箱、VGM、出口放行、进口许可、仓库回执、到港 QC。",
    "生成 Readiness Score、Financing Pack 和资金方 Memo。",
    "满足 Gate 后由 FinancierPool → BankVault → ReceivableLoan 放款。",
  ],
  pointsEn: [
    "Create trade case with PO, invoice, goods, and payment terms.",
    "Create signing gates for PO, invoice, QC, B/L, warehouse, and buyer acceptance.",
    "Create logistics gates for packing, VGM, export release, import permit, warehouse receipt, and arrival QC.",
    "Generate Readiness Score, Financing Pack, and financier memo.",
    "After gates pass, FinancierPool → BankVault → ReceivableLoan disburses funds.",
  ],
};

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
    ownerZh: "Evidence Service",
    ownerEn: "Evidence Service",
    capabilitiesZh: ["documentId", "documentType", "hash", "URI", "issuer", "linkedGateId"],
    capabilitiesEn: ["documentId", "documentType", "hash", "URI", "issuer", "linkedGateId"],
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
    ownerZh: "Readiness Service",
    ownerEn: "Readiness Service",
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
    capabilitiesZh: ["业务工作台", "融资评分", "合约控制台", "资金方视图"],
    capabilitiesEn: ["Business workspace", "Readiness report", "Contract console", "Financier view"],
  },
  {
    id: "api",
    titleZh: "API 层",
    titleEn: "API layer",
    ownerZh: "Next API Routes",
    ownerEn: "Next API Routes",
    capabilitiesZh: ["/api/financing-pack", "未来 /api/trades", "未来 /api/evidence", "未来 /api/loans"],
    capabilitiesEn: ["/api/financing-pack", "future /api/trades", "future /api/evidence", "future /api/loans"],
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
    ownerZh: "未来 PostgreSQL / Object Storage / Indexer DB",
    ownerEn: "Future PostgreSQL / Object Storage / Indexer DB",
    capabilitiesZh: ["贸易主数据", "文档 metadata", "原文文件", "合约事件", "审计日志"],
    capabilitiesEn: ["Trade master data", "document metadata", "raw files", "contract events", "audit logs"],
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
    titleZh: "MVP",
    titleEn: "MVP",
    goalZh: "真实小企业可以上传一笔贸易资料，系统生成融资评分和材料包。",
    goalEn: "A real SME can upload one trade case and generate a readiness score and financing pack.",
    deliverablesZh: ["Trade Case 创建", "Document Upload", "Evidence Checklist", "PDF Export", "资金方视图"],
    deliverablesEn: ["Trade Case creation", "Document Upload", "Evidence Checklist", "PDF Export", "Financier view"],
  },
  {
    phase: "Phase 2",
    titleZh: "Pilot",
    titleEn: "Pilot",
    goalZh: "找 3-5 个小贸易商和 1-2 个资金方验证 memo 是否真的有用。",
    goalEn: "Test with 3-5 small traders and 1-2 financiers whether the memo is actually useful.",
    deliverablesZh: ["真实贸易 case", "资金方访谈", "证据缺口模板", "融资预审反馈"],
    deliverablesEn: ["Real trade cases", "financier interviews", "evidence-gap template", "pre-review feedback"],
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
