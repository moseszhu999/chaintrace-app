export type ProfessionalReviewStatus = "auto-cleared" | "needs-review" | "blocked";

export type ProfessionalReviewItem = {
  id: string;
  areaZh: string;
  areaEn: string;
  ownerZh: string;
  ownerEn: string;
  status: ProfessionalReviewStatus;
  agentPrecheckZh: string;
  agentPrecheckEn: string;
  professionalRoleZh: string;
  professionalRoleEn: string;
  exceptionZh: string;
  exceptionEn: string;
};

export type ProfessionalMetric = {
  labelZh: string;
  labelEn: string;
  valueZh: string;
  valueEn: string;
  noteZh: string;
  noteEn: string;
};

export const professionalReviewMetrics: ProfessionalMetric[] = [
  {
    labelZh: "重复人工核验",
    labelEn: "Repetitive review",
    valueZh: "由 Agent 初筛",
    valueEn: "Agent pre-check",
    noteZh: "银行/律所不再从零翻单证，而是审查例外和高风险项。",
    noteEn: "Banks/law firms no longer start from raw documents; they review exceptions and high-risk items.",
  },
  {
    labelZh: "放款状态",
    labelEn: "Disbursement status",
    valueZh: "Blocked",
    valueEn: "Blocked",
    noteZh: "gate 未齐，合约阻断正式放款。",
    noteEn: "Gates incomplete; contract blocks formal disbursement.",
  },
  {
    labelZh: "专业机构职责",
    labelEn: "Professional role",
    valueZh: "例外审查",
    valueEn: "Exception review",
    noteZh: "银行负责授信/合规；律所负责法律结构/争议/重大例外。",
    noteEn: "Banks handle underwriting/compliance; law firms handle legal structure, disputes, and material exceptions.",
  },
];

export const professionalReviewItems: ProfessionalReviewItem[] = [
  {
    id: "underwriting",
    areaZh: "授信与放款条件",
    areaEn: "Underwriting and disbursement conditions",
    ownerZh: "银行 / 资金方",
    ownerEn: "Bank / financier",
    status: "blocked",
    agentPrecheckZh: "Readiness Score 62/100，仅可预审；贷款 gate 6/12 passed。",
    agentPrecheckEn: "Readiness Score 62/100, pre-review only; loan gates 6/12 passed.",
    professionalRoleZh: "确认是否保留 USDC 29,500 额度预审；正式放款前重新核验 gate。",
    professionalRoleEn: "Decide whether to reserve USDC 29,500 review capacity; re-check gates before formal disbursement.",
    exceptionZh: "GATES_NOT_PASSED，不能正式放款。",
    exceptionEn: "GATES_NOT_PASSED; formal disbursement not allowed.",
  },
  {
    id: "legal-assignment",
    areaZh: "应收账款法律结构",
    areaEn: "Receivable legal structure",
    ownerZh: "律所 / 法务",
    ownerEn: "Law firm / legal counsel",
    status: "needs-review",
    agentPrecheckZh: "贸易金额、尾款、买家、卖家、付款条件已结构化；买家验收未完成。",
    agentPrecheckEn: "Trade value, balance, buyer, seller, and payment terms are structured; buyer acceptance incomplete.",
    professionalRoleZh: "审查债权转让、通知义务、买家抗辩和扣款条款。",
    professionalRoleEn: "Review receivable assignment, notice obligations, buyer defenses, and discount clauses.",
    exceptionZh: "到港水分争议可能影响尾款金额和可转让应收范围。",
    exceptionEn: "Arrival moisture dispute may affect balance amount and assignable receivable scope.",
  },
  {
    id: "compliance",
    areaZh: "合规与 KYC",
    areaEn: "Compliance and KYC",
    ownerZh: "银行 / 合规顾问",
    ownerEn: "Bank / compliance advisor",
    status: "needs-review",
    agentPrecheckZh: "交易路径为越南出口至新加坡，资金资产为 USDC，当前为受控融资原型。",
    agentPrecheckEn: "Trade route is Vietnam to Singapore, funding asset is USDC, currently controlled-financing prototype.",
    professionalRoleZh: "确认 KYC、制裁名单、稳定币使用边界、资金方白名单。",
    professionalRoleEn: "Confirm KYC, sanctions screening, stablecoin-use boundary, and financier allowlist.",
    exceptionZh: "真实 pilot 前必须完成 KYC / AML 和稳定币合规边界确认。",
    exceptionEn: "KYC / AML and stablecoin-compliance boundary must be confirmed before a real pilot.",
  },
  {
    id: "qc-dispute",
    areaZh: "质检争议",
    areaEn: "QC dispute",
    ownerZh: "律所 / 质检顾问 / 资金方风控",
    ownerEn: "Law firm / QC advisor / financier risk",
    status: "blocked",
    agentPrecheckZh: "装运前水分 12.1% 通过；到港快检 13.2% 超过合同上限 12.5%。",
    agentPrecheckEn: "Pre-shipment moisture 12.1% passed; arrival quick test 13.2% exceeds 12.5% contractual cap.",
    professionalRoleZh: "判断买家是否可扣款、拒收或要求第三方复检。",
    professionalRoleEn: "Assess whether buyer may discount, reject, or require third-party retest.",
    exceptionZh: "第三方实验室结果未出，尾款是否无争议尚不能确认。",
    exceptionEn: "Third-party lab result pending; undisputed balance cannot be confirmed yet.",
  },
  {
    id: "template-governance",
    areaZh: "模板治理",
    areaEn: "Template governance",
    ownerZh: "律所 / 平台法务",
    ownerEn: "Law firm / platform legal",
    status: "auto-cleared",
    agentPrecheckZh: "本案使用标准预审 memo 和前置条件模板。",
    agentPrecheckEn: "This case uses standard pre-review memo and approval-condition templates.",
    professionalRoleZh: "定期维护模板，不逐笔重写同类条款。",
    professionalRoleEn: "Maintain templates periodically rather than rewriting similar clauses case by case.",
    exceptionZh: "本案暂无模板层重大例外。",
    exceptionEn: "No material template-level exception in this case.",
  },
];
