export type LoanContractStatus = "draft" | "gated" | "ready" | "disbursed" | "repaid" | "defaulted";
export type LoanGateStatus = "passed" | "pending" | "blocked";
export type LoanEventStatus = "confirmed" | "pending" | "blocked" | "draft";

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
  linkedSigningSlotId?: string;
  linkedDocumentId?: string;
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
  policyZh: "贷款合约只在签章合约完成必要签章后允许放款；回款进入托管钱包后按规则还款、赎回或结清。",
  policyEn: "The loan contract only allows disbursement after required signing-contract slots are complete; repayments enter escrow and then settle, redeem, or close by rule.",
};

export const loanGates: LoanGate[] = [
  {
    id: "gate_po_signed",
    titleZh: "采购订单已签字",
    titleEn: "Purchase order signed",
    status: "passed",
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
    linkedSigningSlotId: "seal_invoice_exporter",
    linkedDocumentId: "doc_invoice",
    unlocksZh: "确认应收账款金额。",
    unlocksEn: "Confirms the receivable amount.",
  },
  {
    id: "gate_quality_sealed",
    titleZh: "质检证书已盖章",
    titleEn: "Quality certificate sealed",
    status: "passed",
    linkedSigningSlotId: "seal_quality_exporter",
    linkedDocumentId: "doc_quality",
    unlocksZh: "确认货物质量事实。",
    unlocksEn: "Confirms quality facts.",
  },
  {
    id: "gate_bl_sealed",
    titleZh: "提单签章核验",
    titleEn: "Bill of lading seal verified",
    status: "pending",
    linkedSigningSlotId: "seal_bl_logistics",
    linkedDocumentId: "doc_bl",
    unlocksZh: "确认货物已装运。",
    unlocksEn: "Confirms shipment.",
  },
  {
    id: "gate_warehouse_entry",
    titleZh: "仓库入库签章",
    titleEn: "Warehouse entry seal",
    status: "blocked",
    linkedSigningSlotId: "seal_warehouse_entry",
    linkedDocumentId: "doc_warehouse",
    unlocksZh: "确认货物已进入指定仓库。",
    unlocksEn: "Confirms goods entered the designated warehouse.",
  },
  {
    id: "gate_buyer_acceptance",
    titleZh: "买家验收签字",
    titleEn: "Buyer acceptance signature",
    status: "blocked",
    linkedSigningSlotId: "sign_buyer_acceptance",
    linkedDocumentId: "doc_acceptance",
    unlocksZh: "触发 70% 尾款应收，并允许正式放款。",
    unlocksEn: "Triggers the 70% balance receivable and allows formal disbursement.",
  },
  {
    id: "gate_financier_multisig",
    titleZh: "资金方放款多签",
    titleEn: "Financier disbursement multisig",
    status: "blocked",
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
    noteZh: "合约已绑定交易、借款方、资金方、托管钱包和应收账款。",
    noteEn: "Contract binds trade, borrower, financier, escrow wallet, and receivable.",
  },
  {
    id: "event_gates_checked",
    titleZh: "签章条件检查",
    titleEn: "Signing gates checked",
    status: "confirmed",
    txHash: "0x7007...1002",
    noteZh: "3 个条件通过，1 个待核验，3 个阻塞。",
    noteEn: "3 gates passed, 1 pending, 3 blocked.",
  },
  {
    id: "event_disbursement_draft",
    titleZh: "USDC 放款草稿",
    titleEn: "USDC disbursement draft",
    status: "blocked",
    amount: "USDC 29,500",
    dueDate: "2026-04-21",
    noteZh: "未满足入库、验收和资金方多签，不能执行放款。",
    noteEn: "Warehouse entry, buyer acceptance, and financier multisig are not complete, so disbursement cannot execute.",
  },
  {
    id: "event_repayment_rule",
    titleZh: "回款还款规则",
    titleEn: "Collection repayment rule",
    status: "draft",
    amount: "USD 36,960",
    dueDate: "2026-05-20",
    noteZh: "买家尾款进入托管钱包后，优先归还本金和费用，剩余释放给出口商。",
    noteEn: "When buyer balance enters escrow, repay principal and fee first, then release the remainder to the exporter.",
  }
];
