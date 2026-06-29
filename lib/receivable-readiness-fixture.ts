export type ReadinessStatus = "passed" | "pending" | "blocked";

export type ReadinessCategory = {
  id: string;
  titleZh: string;
  titleEn: string;
  score: number;
  maxScore: number;
  status: ReadinessStatus;
  summaryZh: string;
  summaryEn: string;
  evidenceIds: string[];
  missingZh: string[];
  missingEn: string[];
};

export type FinancingPackSection = {
  id: string;
  titleZh: string;
  titleEn: string;
  status: ReadinessStatus;
  detailZh: string;
  detailEn: string;
};

export type FinancierMemoItem = {
  labelZh: string;
  labelEn: string;
  valueZh: string;
  valueEn: string;
};

export type FinancierMemo = {
  titleZh: string;
  titleEn: string;
  executiveDecisionZh: string;
  executiveDecisionEn: string;
  items: FinancierMemoItem[];
  riskFlagsZh: string[];
  riskFlagsEn: string[];
  approvalConditionsZh: string[];
  approvalConditionsEn: string[];
  memoTextZh: string;
  memoTextEn: string;
};

export type ReceivableReadinessReport = {
  tradeId: string;
  score: number;
  maxScore: number;
  statusZh: string;
  statusEn: string;
  recommendationZh: string;
  recommendationEn: string;
  categories: ReadinessCategory[];
  financingPack: FinancingPackSection[];
  financierMemo: FinancierMemo;
  nextActionsZh: string[];
  nextActionsEn: string[];
};

export const receivableReadinessReport: ReceivableReadinessReport = {
  tradeId: "trade_vn_coffee_sg_2026_0007",
  score: 62,
  maxScore: 100,
  statusZh: "仅可融资预审",
  statusEn: "Pre-review only",
  recommendationZh: "PO、发票、装箱、装运前 QC、VGM、出口放行已经支持资金方预审；但最终提单、新加坡进口许可、仓库入库、到港质检和买家验收尚未完成，不能把 USD 36,960 尾款认定为无争议应收，也不能正式放款。",
  recommendationEn: "PO, invoice, packing, pre-shipment QC, VGM, and export clearance support financier pre-review; however final B/L, Singapore import permit, warehouse receipt, arrival QC, and buyer acceptance are incomplete, so the USD 36,960 balance cannot yet be treated as an undisputed receivable or formally disbursed.",
  categories: [
    {
      id: "commercial",
      titleZh: "商业义务",
      titleEn: "Commercial obligation",
      score: 18,
      maxScore: 25,
      status: "pending",
      summaryZh: "PO 和发票已经核验，70% 尾款条件清楚；买家最终验收签字缺失。",
      summaryEn: "PO and invoice are verified and the 70% balance condition is clear; buyer final acceptance is still missing.",
      evidenceIds: ["doc_po", "doc_invoice", "doc_acceptance"],
      missingZh: ["买家 accept / discount / reject 决定", "尾款触发签章"],
      missingEn: ["Buyer accept / discount / reject decision", "Balance-trigger signature"],
    },
    {
      id: "logistics",
      titleZh: "物流事实",
      titleEn: "Logistics facts",
      score: 19,
      maxScore: 30,
      status: "pending",
      summaryZh: "装箱、柜号、VGM 和越南出口放行已核验；最终提单、新加坡许可和仓库回执仍待确认。",
      summaryEn: "Packing, container, VGM, and Vietnam export release are verified; final B/L, Singapore permit, and warehouse receipt are still pending.",
      evidenceIds: ["doc_packing", "doc_vgm", "doc_export_customs", "doc_bl", "doc_sg_permit", "doc_warehouse"],
      missingZh: ["最终 on-board B/L 签章", "新加坡进口许可最终状态", "仓库入库回执"],
      missingEn: ["Final on-board B/L seal", "Final Singapore import permit status", "Warehouse receipt"],
    },
    {
      id: "quality",
      titleZh: "质检与争议",
      titleEn: "Quality and dispute",
      score: 10,
      maxScore: 20,
      status: "blocked",
      summaryZh: "装运前水分 12.1% 通过，但到港快检 13.2% 超过合同上限 12.5%，第三方实验室结论未出。",
      summaryEn: "Pre-shipment moisture of 12.1% passed, but arrival quick test shows 13.2% above the 12.5% cap; third-party lab result is pending.",
      evidenceIds: ["doc_quality", "doc_arrival_qc"],
      missingZh: ["到港质检正式报告", "第三方实验室结果", "争议处理结论"],
      missingEn: ["Formal arrival QC report", "Third-party lab result", "Dispute resolution decision"],
    },
    {
      id: "finance",
      titleZh: "融资可执行性",
      titleEn: "Financing executability",
      score: 15,
      maxScore: 25,
      status: "blocked",
      summaryZh: "资金池、金库、贷款合约路径成立；但贷款 gate 只有 6/12 通过，不能执行 USDC 29,500 放款。",
      summaryEn: "FinancierPool, BankVault, and loan-contract route are valid; but only 6/12 loan gates passed, so the USDC 29,500 disbursement cannot execute.",
      evidenceIds: ["loan_receivable_vn_sg_0007"],
      missingZh: ["最终提单", "进口许可", "仓库入库", "到港质检", "买家验收", "资金方放款多签"],
      missingEn: ["Final B/L", "Import permit", "Warehouse receipt", "Arrival QC", "Buyer acceptance", "Financier disbursement multisig"],
    },
  ],
  financingPack: [
    {
      id: "trade_summary",
      titleZh: "贸易摘要",
      titleEn: "Trade summary",
      status: "passed",
      detailZh: "越南罗布斯塔生咖啡豆 10.8 吨，PO-SG-88421，INV-VN-2026-0318，总额 USD 52,800，70% 尾款 USD 36,960。",
      detailEn: "Vietnam Robusta green coffee beans, 10.8 tons, PO-SG-88421, INV-VN-2026-0318, total USD 52,800, 70% balance USD 36,960.",
    },
    {
      id: "verified_evidence",
      titleZh: "已核验证据",
      titleEn: "Verified evidence",
      status: "passed",
      detailZh: "PO、发票、装箱单、装运前质检、VGM、越南出口放行已形成融资预审证据包。",
      detailEn: "PO, invoice, packing list, pre-shipment QC, VGM, and Vietnam export release form a pre-review evidence pack.",
    },
    {
      id: "open_blockers",
      titleZh: "未决阻塞",
      titleEn: "Open blockers",
      status: "blocked",
      detailZh: "最终提单、新加坡进口许可、仓库入库、到港质检、买家验收仍未完成。",
      detailEn: "Final B/L, Singapore import permit, warehouse receipt, arrival QC, and buyer acceptance are incomplete.",
    },
    {
      id: "finance_decision",
      titleZh: "融资建议",
      titleEn: "Financing recommendation",
      status: "pending",
      detailZh: "建议资金方进入预审，不建议正式放款；待买家验收或扣款结论明确后再计算 advance rate。",
      detailEn: "Recommend financier pre-review, not formal disbursement; calculate advance rate only after buyer acceptance or discount decision is clear.",
    },
  ],
  financierMemo: {
    titleZh: "资金方预审备忘录",
    titleEn: "Financier pre-review memo",
    executiveDecisionZh: "建议进入预审队列；暂不批准 USDC 29,500 正式放款。",
    executiveDecisionEn: "Move to pre-review queue; do not approve the USDC 29,500 formal disbursement yet.",
    items: [
      { labelZh: "交易", labelEn: "Trade", valueZh: "越南罗布斯塔生咖啡豆 10.8 吨 → 新加坡买家", valueEn: "Vietnam Robusta green coffee beans, 10.8 tons → Singapore buyer" },
      { labelZh: "贸易金额", labelEn: "Trade value", valueZh: "USD 52,800", valueEn: "USD 52,800" },
      { labelZh: "拟融资应收", labelEn: "Receivable", valueZh: "70% 尾款 USD 36,960", valueEn: "70% balance USD 36,960" },
      { labelZh: "申请垫款", labelEn: "Requested advance", valueZh: "USDC 29,500", valueEn: "USDC 29,500" },
      { labelZh: "融资评分", labelEn: "Readiness score", valueZh: "62/100，仅可预审", valueEn: "62/100, pre-review only" },
      { labelZh: "链上 gate", labelEn: "On-chain gates", valueZh: "6/12 已通过", valueEn: "6/12 passed" },
    ],
    riskFlagsZh: [
      "到港快检水分 13.2%，超过合同上限 12.5%。",
      "买家尚未签署 accept / discount / reject。",
      "仓库入库回执未形成。",
      "最终提单和新加坡进口许可仍未最终核验。",
    ],
    riskFlagsEn: [
      "Arrival quick-test moisture is 13.2%, above the 12.5% contractual cap.",
      "Buyer has not signed accept / discount / reject.",
      "Warehouse receipt is not available yet.",
      "Final B/L and Singapore import permit have not been finally verified.",
    ],
    approvalConditionsZh: [
      "最终 on-board B/L 由物流方签章。",
      "新加坡进口许可状态由买家或报关代理确认。",
      "Jurong 仓库入库回执绑定柜号、铅封、袋数和重量。",
      "到港质检争议形成实验室结论。",
      "买家签署接受、扣款或拒收决定。",
    ],
    approvalConditionsEn: [
      "Final on-board B/L sealed by logistics provider.",
      "Singapore import permit status confirmed by buyer or customs agent.",
      "Jurong warehouse receipt binds container, seal, bag count, and weight.",
      "Arrival QC dispute has a lab result.",
      "Buyer signs accept, discount, or reject decision.",
    ],
    memoTextZh: "本案具备融资预审基础：PO、发票、装箱单、装运前质检、VGM 与越南出口放行已形成初步贸易事实链。但由于到港水分争议、仓库回执、最终提单、新加坡进口许可及买家验收仍未闭合，当前不建议正式放款。建议资金方保留 USDC 29,500 额度预审，待关键 gate 完成后重新计算 advance rate 与放款条件。",
    memoTextEn: "This case is suitable for financing pre-review: PO, invoice, packing list, pre-shipment QC, VGM, and Vietnam export release form an initial trade-fact chain. However, because arrival moisture dispute, warehouse receipt, final B/L, Singapore import permit, and buyer acceptance remain open, formal disbursement is not recommended yet. The financier may reserve the USDC 29,500 review capacity and recalculate advance rate and disbursement conditions after the key gates close.",
  },
  nextActionsZh: [
    "要求物流商补最终 on-board B/L 签章。",
    "要求买家或报关代理补新加坡进口许可最终状态。",
    "要求仓库签发入库回执并绑定柜号、铅封、袋数、重量。",
    "锁定到港取样照片和第三方实验室结果。",
    "要求买家签署 accept / discount / reject 决定。",
  ],
  nextActionsEn: [
    "Ask logistics provider to verify final on-board B/L seal.",
    "Ask buyer or customs agent to update final Singapore import permit status.",
    "Ask warehouse to issue receipt with container, seal, bag count, and weight.",
    "Lock arrival sampling photos and third-party lab result.",
    "Ask buyer to sign accept / discount / reject decision.",
  ],
};
