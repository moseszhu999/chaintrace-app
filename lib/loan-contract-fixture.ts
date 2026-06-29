export type LoanContractStatus = "draft" | "gated" | "ready" | "disbursed" | "repaid" | "defaulted";
export type LoanGateStatus = "passed" | "pending" | "blocked";
export type LoanEventStatus = "confirmed" | "pending" | "blocked" | "draft";
export type LoanGateSource = "commercial" | "logistics" | "quality" | "funds";

export type LoanSmartContract = {
  id: string;
  nameZh: string;
  nameEn: string;
  network: "Base" | "Polygon";
  address: string;
  tradeId: string;
  borrowerPartyId: string;
  financierPartyId: string;
  escrowWalletId: string;
  receivableAmount: string;
  advanceAmount: string;
  advanceRate: string;
  asset: "USDC";
  tenorDays: number;
  feeRate: string;
  status: LoanContractStatus;
  policyZh: string;
  policyEn: string;
};

export type LoanGate = {
  id: string;
  titleZh: string;
  titleEn: string;
  status: LoanGateStatus;
  source: LoanGateSource;
  linkedSigningSlotId?: string;
  linkedDocumentId?: string;
  linkedLogisticsGateId?: string;
  unlocksZh: string;
  unlocksEn: string;
};

export type LoanEvent = {
  id: string;
  titleZh: string;
  titleEn: string;
  status: LoanEventStatus;
  amount?: string;
  txHash?: string;
  dueDate?: string;
  noteZh: string;
  noteEn: string;
};

export const receivableLoanContract: LoanSmartContract = {
  id: "loan_receivable_vn_sg_0007",
  nameZh: "咖啡豆应收账款 USDC 贷款合约",
  nameEn: "Coffee receivable USDC loan contract",
  network: "Base",
  address: "0xL0AN...7007",
  tradeId: "trade_vn_coffee_sg_2026_0007",
  borrowerPartyId: "party_exporter",
  financierPartyId: "party_financier",
  escrowWalletId: "wallet_rwa_escrow_base",
  receivableAmount: "USD 36,960",
  advanceAmount: "USDC 29,500",
  advanceRate: "79.8%",
  asset: "USDC",
  tenorDays: 45,
  feeRate: "2.5%",
  status: "gated",
  policyZh: "贷款合约只在商业单证、物流证据、到港质检和买家验收达到必要状态后允许放款；回款进入托管钱包后按规则还款、赎回或结清。",
  policyEn: "The loan contract only allows disbursement after commercial documents, logistics evidence, arrival QC, and buyer acceptance reach required states; repayments enter escrow and then settle, redeem, or close by rule.",
};

export const loanGates: LoanGate[] = [
  {
    id: "gate_po_signed",
    titleZh: "采购订单已签字",
    titleEn: "Purchase order signed",
    status: "passed",
    source: "commercial",
    linkedSigningSlotId: "sign_po_buyer",
    linkedDocumentId: "doc_po",
    unlocksZh: "确认买家付款义务来源。",
    unlocksEn: "Confirms the source of the buyer payment obligation.",
  },
  {
    id: "gate_invoice_sealed",
    titleZh: "发票已盖章",
    titleEn: "Invoice sealed",
    status: "passed",
    source: "commercial",
    linkedSigningSlotId: "seal_invoice_exporter",
    linkedDocumentId: "doc_invoice",
    unlocksZh: "确认应收账款金额。",
    unlocksEn: "Confirms the receivable amount.",
  },
  {
    id: "gate_packing_verified",
    titleZh: "装箱单与柜号匹配",
    titleEn: "Packing list matches container",
    status: "passed",
    source: "logistics",
    linkedDocumentId: "doc_packing",
    linkedLogisticsGateId: "log_stuffing",
    unlocksZh: "确认袋数、重量、柜号与贸易文件一致。",
    unlocksEn: "Confirms bag count, weight, and container match trade documents.",
  },
  {
    id: "gate_quality_sealed",
    titleZh: "装运前质检证书已盖章",
    titleEn: "Pre-shipment quality certificate sealed",
    status: "passed",
    source: "quality",
    linkedSigningSlotId: "seal_quality_exporter",
    linkedDocumentId: "doc_quality",
    unlocksZh: "确认出口商装运前质量事实。",
    unlocksEn: "Confirms exporter pre-shipment quality facts.",
  },
  {
    id: "gate_seal_vgm_verified",
    titleZh: "铅封与 VGM 已核验",
    titleEn: "Seal and VGM verified",
    status: "passed",
    source: "logistics",
    linkedDocumentId: "doc_vgm",
    linkedLogisticsGateId: "log_vgm",
    unlocksZh: "确认封条、重量和装船条件。",
    unlocksEn: "Confirms seal, weight, and carrier loading basis.",
  },
  {
    id: "gate_export_customs_released",
    titleZh: "越南出口报关放行",
    titleEn: "Vietnam export customs released",
    status: "passed",
    source: "logistics",
    linkedDocumentId: "doc_export_customs",
    linkedLogisticsGateId: "log_export_clearance",
    unlocksZh: "确认货物已经具备合法出口路径。",
    unlocksEn: "Confirms the cargo has a lawful export path.",
  },
  {
    id: "gate_bl_sealed",
    titleZh: "提单签章核验",
    titleEn: "Bill of lading seal verified",
    status: "pending",
    source: "logistics",
    linkedSigningSlotId: "seal_bl_logistics",
    linkedDocumentId: "doc_bl",
    linkedLogisticsGateId: "log_loaded",
    unlocksZh: "确认货物已装船，支持贷前预审进入下一步。",
    unlocksEn: "Confirms shipment and lets pre-disbursement review move forward.",
  },
  {
    id: "gate_sg_permit_status",
    titleZh: "新加坡进口许可状态",
    titleEn: "Singapore import permit status",
    status: "pending",
    source: "logistics",
    linkedDocumentId: "doc_sg_permit",
    linkedLogisticsGateId: "log_sg_permit",
    unlocksZh: "确认进口侧监管流程没有显性阻塞。",
    unlocksEn: "Confirms the import-side regulatory process has no visible blocker.",
  },
  {
    id: "gate_warehouse_entry",
    titleZh: "仓库入库签章",
    titleEn: "Warehouse entry seal",
    status: "blocked",
    source: "logistics",
    linkedSigningSlotId: "seal_warehouse_entry",
    linkedDocumentId: "doc_warehouse",
    linkedLogisticsGateId: "log_warehouse",
    unlocksZh: "确认货物已进入指定仓库，资金方可判断货权到仓。",
    unlocksEn: "Confirms goods entered the designated warehouse so the financier can verify warehouse arrival.",
  },
  {
    id: "gate_arrival_qc",
    titleZh: "到港质检结论",
    titleEn: "Arrival QC conclusion",
    status: "blocked",
    source: "quality",
    linkedDocumentId: "doc_arrival_qc",
    linkedLogisticsGateId: "log_qc_acceptance",
    unlocksZh: "确认水分争议是否接受、扣款或拒收。",
    unlocksEn: "Confirms whether the moisture dispute resolves as accept, discount, or reject.",
  },
  {
    id: "gate_buyer_acceptance",
    titleZh: "买家验收签字",
    titleEn: "Buyer acceptance signature",
    status: "blocked",
    source: "commercial",
    linkedSigningSlotId: "sign_buyer_acceptance",
    linkedDocumentId: "doc_acceptance",
    linkedLogisticsGateId: "log_qc_acceptance",
    unlocksZh: "触发 70% 尾款应收，并允许正式放款。",
    unlocksEn: "Triggers the 70% balance receivable and allows formal disbursement.",
  },
  {
    id: "gate_financier_multisig",
    titleZh: "资金方放款多签",
    titleEn: "Financier disbursement multisig",
    status: "blocked",
    source: "funds",
    linkedSigningSlotId: "multisig_rwa_issuance",
    linkedDocumentId: "doc_acceptance",
    unlocksZh: "允许托管钱包向企业业务钱包释放 USDC。",
    unlocksEn: "Allows escrow wallet to release USDC to the business wallet.",
  }
];

export const loanEvents: LoanEvent[] = [
  {
    id: "event_contract_created",
    titleZh: "贷款合约草稿创建",
    titleEn: "Loan contract draft created",
    status: "confirmed",
    txHash: "0x7007...1001",
    noteZh: "合约已绑定交易、借款方、资金方、托管钱包、应收账款和物流证据 gate。",
    noteEn: "Contract binds trade, borrower, financier, escrow wallet, receivable, and logistics evidence gates.",
  },
  {
    id: "event_gates_checked",
    titleZh: "商业 + 物流 + 质检条件检查",
    titleEn: "Commercial + logistics + QC gates checked",
    status: "confirmed",
    txHash: "0x7007...1002",
    noteZh: "6 个条件通过，2 个待核验，4 个阻塞；当前只能融资预审，不能正式放款。",
    noteEn: "6 gates passed, 2 pending, 4 blocked; only financing pre-review is possible, not formal disbursement.",
  },
  {
    id: "event_disbursement_draft",
    titleZh: "USDC 放款草稿",
    titleEn: "USDC disbursement draft",
    status: "blocked",
    amount: "USDC 29,500",
    dueDate: "2026-04-21",
    noteZh: "最终提单、进口许可状态、仓库入库、到港质检、买家验收和资金方多签未完成，不能执行放款。",
    noteEn: "Final B/L, import permit status, warehouse receipt, arrival QC, buyer acceptance, and financier multisig are not complete, so disbursement cannot execute.",
  },
  {
    id: "event_repayment_rule",
    titleZh: "回款还款规则",
    titleEn: "Collection repayment rule",
    status: "draft",
    amount: "USD 36,960",
    dueDate: "2026-05-20",
    noteZh: "买家尾款进入托管钱包后，优先归还本金和费用，剩余释放给出口商；若质检扣款则按折扣后的回款金额重算。",
    noteEn: "When buyer balance enters escrow, repay principal and fee first, then release the remainder to the exporter; if QC causes a discount, recalculate from the discounted collection amount.",
  }
];