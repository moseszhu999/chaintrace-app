export type AgentRunStatus = "done" | "running" | "blocked";

export type AgentRun = {
  id: string;
  agentZh: string;
  agentEn: string;
  status: AgentRunStatus;
  replacedManualWorkZh: string;
  replacedManualWorkEn: string;
  inputZh: string;
  inputEn: string;
  outputZh: string;
  outputEn: string;
  frictionReducedZh: string[];
  frictionReducedEn: string[];
};

export type AgentMetric = {
  labelZh: string;
  labelEn: string;
  valueZh: string;
  valueEn: string;
  noteZh: string;
  noteEn: string;
};

export const agentWorkbenchMetrics: AgentMetric[] = [
  {
    labelZh: "人工环节压缩",
    labelEn: "Manual work compressed",
    valueZh: "5 个环节",
    valueEn: "5 steps",
    noteZh: "单证分类、gate 匹配、缺口识别、memo 初稿、催办任务。",
    noteEn: "Document triage, gate matching, gap detection, memo draft, and follow-up tasks.",
  },
  {
    labelZh: "融资判断",
    labelEn: "Financing decision",
    valueZh: "62/100",
    valueEn: "62/100",
    noteZh: "仅可预审；不能正式放款。",
    noteEn: "Pre-review only; no formal disbursement.",
  },
  {
    labelZh: "中介工作重构",
    labelEn: "Intermediary work reshaped",
    valueZh: "例外审查",
    valueEn: "Exception review",
    noteZh: "银行/律所从重复核验退到授信、合规、争议和重大例外。",
    noteEn: "Banks/law firms move from repetitive checks to underwriting, compliance, disputes, and material exceptions.",
  },
];

export const agentRuns: AgentRun[] = [
  {
    id: "evidence-agent",
    agentZh: "Evidence Agent",
    agentEn: "Evidence Agent",
    status: "done",
    replacedManualWorkZh: "人工打开 PDF / 图片判断单证类型并摘录编号、金额、柜号、铅封、重量。",
    replacedManualWorkEn: "Human opens PDFs/images to identify document type and copy numbers, amount, container, seal, and weight.",
    inputZh: "PO、发票、装箱单、装运前 QC、VGM、出口放行、B/L、进口许可、仓库、到港 QC、买家验收。",
    inputEn: "PO, invoice, packing list, pre-shipment QC, VGM, export release, B/L, import permit, warehouse, arrival QC, buyer acceptance.",
    outputZh: "识别 11 类证据；6 个证据可用于预审；5 个证据仍待补齐或争议未闭合。",
    outputEn: "Classified 11 evidence types; 6 evidence items support pre-review; 5 items remain missing or unresolved.",
    frictionReducedZh: ["减少人工翻单证", "减少复制粘贴字段", "减少银行/律所初筛材料时间"],
    frictionReducedEn: ["Less manual document reading", "less copy-paste of fields", "less bank/law-firm initial screening time"],
  },
  {
    id: "gate-agent",
    agentZh: "Gate Agent",
    agentEn: "Gate Agent",
    status: "done",
    replacedManualWorkZh: "人工把单证逐项对照融资 checklist，判断哪些 signing gate / logistics gate 已通过。",
    replacedManualWorkEn: "Human maps documents to the financing checklist and decides which signing/logistics gates passed.",
    inputZh: "签章 registry + 物流 registry + 证据 metadata。",
    inputEn: "Signing registry + logistics registry + evidence metadata.",
    outputZh: "贷款 gate 当前 6/12 passed；最终 B/L、进口许可、仓库回执、到港 QC、买家验收、资金方多签未完成。",
    outputEn: "Loan gates are 6/12 passed; final B/L, import permit, warehouse receipt, arrival QC, buyer acceptance, and financier multisig are incomplete.",
    frictionReducedZh: ["减少 Excel checklist 对账", "减少多方状态同步", "减少资金方放款前人工复核"],
    frictionReducedEn: ["Less Excel checklist reconciliation", "less multi-party status sync", "less pre-disbursement manual re-check"],
  },
  {
    id: "gap-agent",
    agentZh: "Evidence Gap Agent",
    agentEn: "Evidence Gap Agent",
    status: "done",
    replacedManualWorkZh: "运营人员人工问货代、仓库、买家、质检方还差什么材料。",
    replacedManualWorkEn: "Ops manually asks forwarder, warehouse, buyer, and QC provider what is still missing.",
    inputZh: "未通过 gate + 缺失证据 + 当前 dispute 状态。",
    inputEn: "Unpassed gates + missing evidence + current dispute state.",
    outputZh: "生成 5 个下一步动作：补最终 B/L、进口许可、仓库回执、第三方实验室结果、买家 accept/discount/reject。",
    outputEn: "Generated 5 next actions: final B/L, import permit, warehouse receipt, third-party lab result, buyer accept/discount/reject.",
    frictionReducedZh: ["减少催办沟通成本", "减少责任方不清", "减少中介机构反复问材料"],
    frictionReducedEn: ["Less follow-up communication cost", "clearer responsible party", "less repetitive document chasing by intermediaries"],
  },
  {
    id: "risk-agent",
    agentZh: "Risk Agent",
    agentEn: "Risk Agent",
    status: "done",
    replacedManualWorkZh: "风控经理或律师助理人工写预审 memo、risk flags、approval conditions。",
    replacedManualWorkEn: "Risk manager or legal assistant manually writes pre-review memo, risk flags, and approval conditions.",
    inputZh: "融资评分、gate 状态、到港水分争议、缺失材料。",
    inputEn: "Readiness score, gate states, arrival moisture dispute, missing materials.",
    outputZh: "生成资金方 memo：建议进入预审，不批准 USDC 29,500 正式放款。",
    outputEn: "Generated financier memo: move to pre-review, do not approve USDC 29,500 formal disbursement.",
    frictionReducedZh: ["减少 memo 初稿人工", "减少律所/银行初审文本工作", "减少口径不一致"],
    frictionReducedEn: ["Less manual memo drafting", "less bank/law-firm first-review paperwork", "more consistent review language"],
  },
  {
    id: "contract-agent",
    agentZh: "Contract Execution Agent",
    agentEn: "Contract Execution Agent",
    status: "blocked",
    replacedManualWorkZh: "人工确认所有放款条件齐备后通知资金方执行放款。",
    replacedManualWorkEn: "Human confirms all disbursement conditions and asks financier to release funds.",
    inputZh: "ReceivableLoan.checkGates() + BankVault 授信 + FinancierPool 资金。",
    inputEn: "ReceivableLoan.checkGates() + BankVault credit line + FinancierPool liquidity.",
    outputZh: "当前阻断放款：GATES_NOT_PASSED。合约减少人为误放款和条件漏查。",
    outputEn: "Disbursement currently blocked: GATES_NOT_PASSED. Contracts reduce accidental disbursement and missed-condition risk.",
    frictionReducedZh: ["减少人工放款条件检查", "减少银行内部重复复核", "减少事后争议"],
    frictionReducedEn: ["Less manual disbursement-condition checking", "less repeated bank re-checking", "less post-fact dispute"],
  },
];
