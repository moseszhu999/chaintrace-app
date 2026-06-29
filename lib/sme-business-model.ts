export type BusinessStageStatus = "ready" | "working" | "blocked" | "waiting";

export type BusinessStage = {
  id: string;
  order: number;
  titleZh: string;
  titleEn: string;
  ownerZh: string;
  ownerEn: string;
  status: BusinessStageStatus;
  outcomeZh: string;
  outcomeEn: string;
  primaryDocsZh: string[];
  primaryDocsEn: string[];
  nextActionZh: string;
  nextActionEn: string;
};

export type BusinessModule = {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  entryHref: string;
  statusZh: string;
  statusEn: string;
};

export type BusinessOperatingSummary = {
  headlineZh: string;
  headlineEn: string;
  promiseZh: string;
  promiseEn: string;
  activeDealZh: string;
  activeDealEn: string;
};

export const sampleOperatingSummary: BusinessOperatingSummary = {
  headlineZh: "小微企业业务操作台",
  headlineEn: "SME operating workspace",
  promiseZh: "从客户、订单、文件、物流、收款、融资到纠纷处理，都在同一条事实链上推进。",
  promiseEn: "Run customers, orders, documents, logistics, collection, financing, and disputes on one shared fact trail.",
  activeDealZh: "当前主线：UY-BEEF-CN-2026-0001 从发货后文件补齐进入收款和融资准备。",
  activeDealEn: "Active lane: UY-BEEF-CN-2026-0001 is moving from post-shipment document completion into collection and financing readiness.",
};

export const sampleBusinessModules: BusinessModule[] = [
  {
    id: "module_customers",
    titleZh: "客户与交易",
    titleEn: "Customers & deals",
    descriptionZh: "管理买家、供应商、联系人、报价、订单和合同摘要。",
    descriptionEn: "Manage buyers, suppliers, contacts, quotations, orders, and contract summaries.",
    entryHref: "/business",
    statusZh: "当前 3 个交易进行中",
    statusEn: "3 active deals",
  },
  {
    id: "module_documents",
    titleZh: "文件与证据",
    titleEn: "Documents & evidence",
    descriptionZh: "收集订单、发票、质检、物流、入库、验收等业务文件。",
    descriptionEn: "Collect orders, invoices, inspection, logistics, warehouse, and acceptance documents.",
    entryHref: "/evidence",
    statusZh: "2 项关键文件缺失",
    statusEn: "2 critical docs missing",
  },
  {
    id: "module_cashflow",
    titleZh: "收款与融资",
    titleEn: "Collection & financing",
    descriptionZh: "用事实链支持催款、应收账款融资、付款状态说明。",
    descriptionEn: "Use the fact trail for collection, receivable financing, and payment status notes.",
    entryHref: "/assistant/approvals",
    statusZh: "融资前置条件未完成",
    statusEn: "Financing prerequisites incomplete",
  },
  {
    id: "module_operations",
    titleZh: "物流与履约",
    titleEn: "Logistics & fulfillment",
    descriptionZh: "跟踪发货、冷链、清关、入库、交付和验收闭环。",
    descriptionEn: "Track shipment, cold chain, customs, warehouse entry, delivery, and acceptance closure.",
    entryHref: "/tasks",
    statusZh: "入库和验收卡住",
    statusEn: "Warehouse and acceptance blocked",
  },
  {
    id: "module_risk",
    titleZh: "风险与纠纷",
    titleEn: "Risk & disputes",
    descriptionZh: "提前识别缺口，准备理赔、争议、审计或监管证明材料。",
    descriptionEn: "Detect gaps early and prepare claim, dispute, audit, or compliance materials.",
    entryHref: "/tasks",
    statusZh: "3 个风险缺口",
    statusEn: "3 risk gaps",
  },
  {
    id: "module_agent",
    titleZh: "业务助手",
    titleEn: "Business assistant",
    descriptionZh: "把缺口变成任务、草稿、审批和对外沟通，但不越权自动发送。",
    descriptionEn: "Turns gaps into tasks, drafts, approvals, and external communication without sending automatically.",
    entryHref: "/assistant",
    statusZh: "3 个建议动作",
    statusEn: "3 suggested actions",
  },
];

export const sampleBusinessStages: BusinessStage[] = [
  {
    id: "stage_customer",
    order: 1,
    titleZh: "客户 / 供应商建档",
    titleEn: "Customer / supplier setup",
    ownerZh: "老板 / 运营",
    ownerEn: "Owner / ops",
    status: "ready",
    outcomeZh: "确定交易对手、联系人、权限和基础信用信息。",
    outcomeEn: "Confirm counterparties, contacts, permissions, and baseline trust context.",
    primaryDocsZh: ["客户资料", "供应商资料", "联系人权限"],
    primaryDocsEn: ["Customer profile", "Supplier profile", "Contact permissions"],
    nextActionZh: "维护联系人和授权范围。",
    nextActionEn: "Maintain contacts and permission scope.",
  },
  {
    id: "stage_order",
    order: 2,
    titleZh: "报价 / 订单 / 合同",
    titleEn: "Quote / order / contract",
    ownerZh: "销售 / 运营",
    ownerEn: "Sales / ops",
    status: "ready",
    outcomeZh: "把报价、采购订单、销售确认和合同关键条款结构化。",
    outcomeEn: "Structure quotations, purchase orders, sales confirmations, and key contract terms.",
    primaryDocsZh: ["报价单", "采购订单", "合同摘要"],
    primaryDocsEn: ["Quotation", "Purchase order", "Contract summary"],
    nextActionZh: "确认订单金额、交付条件和付款节点。",
    nextActionEn: "Confirm amount, delivery terms, and payment milestones.",
  },
  {
    id: "stage_invoice",
    order: 3,
    titleZh: "发票 / 收款计划",
    titleEn: "Invoice / collection plan",
    ownerZh: "财务",
    ownerEn: "Finance",
    status: "working",
    outcomeZh: "生成发票、收款节点、催款节奏和应收账款状态。",
    outcomeEn: "Prepare invoice, payment milestones, collection cadence, and receivable status.",
    primaryDocsZh: ["商业发票", "付款计划", "应收账款记录"],
    primaryDocsEn: ["Commercial invoice", "Payment plan", "Receivable record"],
    nextActionZh: "等待买家验收后进入催款和融资准备。",
    nextActionEn: "Wait for buyer acceptance before collection and financing readiness.",
  },
  {
    id: "stage_fulfillment",
    order: 4,
    titleZh: "履约 / 物流 / 清关",
    titleEn: "Fulfillment / logistics / customs",
    ownerZh: "运营 / 物流商",
    ownerEn: "Ops / logistics provider",
    status: "blocked",
    outcomeZh: "跟踪发货、质检、冷链、清关、入库和交付。",
    outcomeEn: "Track shipment, inspection, cold chain, customs, warehouse entry, and delivery.",
    primaryDocsZh: ["提单", "质检记录", "冷链记录", "入库记录"],
    primaryDocsEn: ["Bill of lading", "Inspection record", "Cold-chain log", "Warehouse entry"],
    nextActionZh: "催中国仓库补齐入库记录。",
    nextActionEn: "Ask the China warehouse to complete warehouse entry.",
  },
  {
    id: "stage_acceptance",
    order: 5,
    titleZh: "交付 / 验收 / 售后",
    titleEn: "Delivery / acceptance / after-sales",
    ownerZh: "销售 / 买家",
    ownerEn: "Sales / buyer",
    status: "blocked",
    outcomeZh: "形成买家验收、争议记录、售后或理赔入口。",
    outcomeEn: "Create buyer acceptance, dispute record, after-sales, or claim entry.",
    primaryDocsZh: ["交付确认", "买家验收", "异常记录"],
    primaryDocsEn: ["Delivery confirmation", "Buyer acceptance", "Exception record"],
    nextActionZh: "生成买家验收确认请求，人工审批后发送。",
    nextActionEn: "Draft buyer acceptance request and send only after human approval.",
  },
  {
    id: "stage_finance",
    order: 6,
    titleZh: "收款 / 融资 / 对外证明",
    titleEn: "Collection / financing / external proof",
    ownerZh: "老板 / 财务",
    ownerEn: "Owner / finance",
    status: "waiting",
    outcomeZh: "向买家、资金方或合作方提供选择性证明，不暴露商业机密。",
    outcomeEn: "Share selective proof with buyers, financiers, or partners without exposing trade secrets.",
    primaryDocsZh: ["公开验证链接", "收款状态", "融资材料包"],
    primaryDocsEn: ["Public verification link", "Collection status", "Financing pack"],
    nextActionZh: "补齐验收后再生成融资状态说明。",
    nextActionEn: "Generate financing status note after acceptance is completed.",
  },
];
