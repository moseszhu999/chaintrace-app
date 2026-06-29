export type SigningSlotStatus = "signed" | "pending" | "blocked" | "expired";
export type SigningSlotKind = "signature" | "seal" | "multisig" | "oracle";
export type SigningFlow = "commercial" | "logistics" | "funds" | "information";

export type SigningContract = {
  id: string;
  nameZh: string;
  nameEn: string;
  network: "Base" | "Polygon";
  address: string;
  tradeId: string;
  policyZh: string;
  policyEn: string;
};

export type SigningSlot = {
  id: string;
  contractId: string;
  flow: SigningFlow;
  kind: SigningSlotKind;
  titleZh: string;
  titleEn: string;
  requiredSignerPartyId: string;
  linkedDocumentId: string;
  status: SigningSlotStatus;
  dueDate: string;
  signedAt?: string;
  txHash?: string;
  documentHash?: string;
  unlocksZh: string;
  unlocksEn: string;
  noteZh: string;
  noteEn: string;
};

export const tradeSigningContract: SigningContract = {
  id: "contract_trade_signature_vn_sg_0007",
  nameZh: "咖啡豆交易四流签章合约",
  nameEn: "Coffee trade four-flow signing contract",
  network: "Base",
  address: "0xC0FF...7007",
  tradeId: "trade_vn_coffee_sg_2026_0007",
  policyZh: "原始文件不上链；只上链文件 hash、签章角色、签章状态、时间戳、版本号和触发条件。物流 gate 只记录责任切换点，不替代海关、港口或仓库系统。",
  policyEn: "Raw files do not go on-chain; only file hashes, signing roles, signing status, timestamps, versions, and trigger conditions are recorded. Logistics gates record accountability handoffs; they do not replace customs, port, or warehouse systems.",
};

export const signingSlots: SigningSlot[] = [
  {
    id: "sign_po_buyer",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "commercial",
    kind: "signature",
    titleZh: "买家采购订单签字",
    titleEn: "Buyer PO signature",
    requiredSignerPartyId: "party_buyer",
    linkedDocumentId: "doc_po",
    status: "signed",
    dueDate: "2026-04-02",
    signedAt: "2026-04-02T09:12:00Z",
    txHash: "0xa941...3e10",
    documentHash: "0x7d4b...91aa",
    unlocksZh: "商流成立，允许生成发票和收款计划。",
    unlocksEn: "Commercial flow is formed; invoice and collection plan can be created.",
    noteZh: "买家确认 PO-SG-88421。",
    noteEn: "Buyer confirmed PO-SG-88421.",
  },
  {
    id: "seal_invoice_exporter",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "commercial",
    kind: "seal",
    titleZh: "出口商发票盖章",
    titleEn: "Exporter invoice seal",
    requiredSignerPartyId: "party_exporter",
    linkedDocumentId: "doc_invoice",
    status: "signed",
    dueDate: "2026-04-03",
    signedAt: "2026-04-03T10:22:00Z",
    txHash: "0x122a...9bc0",
    documentHash: "0xa13c...22fe",
    unlocksZh: "发票进入资金方预审材料。",
    unlocksEn: "Invoice enters financier pre-review pack.",
    noteZh: "发票金额与 PO 一致。",
    noteEn: "Invoice amount matches the PO.",
  },
  {
    id: "seal_packing_exporter",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "logistics",
    kind: "seal",
    titleZh: "装箱单盖章",
    titleEn: "Packing list seal",
    requiredSignerPartyId: "party_exporter",
    linkedDocumentId: "doc_packing",
    status: "signed",
    dueDate: "2026-04-10",
    signedAt: "2026-04-10T07:20:00Z",
    txHash: "0xpk10...120c",
    documentHash: "0xpkl1...83bd",
    unlocksZh: "确认袋数、净重、毛重和柜号，进入物流证据包。",
    unlocksEn: "Confirms bag count, net/gross weight, and container number for the logistics pack.",
    noteZh: "180 袋，净重 10,800 kg，柜号 TCLU-482913-2。",
    noteEn: "180 bags, net 10,800 kg, container TCLU-482913-2.",
  },
  {
    id: "seal_quality_exporter",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "information",
    kind: "seal",
    titleZh: "装运前质检证书盖章",
    titleEn: "Pre-shipment quality certificate seal",
    requiredSignerPartyId: "party_exporter",
    linkedDocumentId: "doc_quality",
    status: "signed",
    dueDate: "2026-04-10",
    signedAt: "2026-04-10T07:40:00Z",
    txHash: "0x8d12...f0a1",
    documentHash: "0x39bd...7fa0",
    unlocksZh: "装运前质量事实进入证明包。",
    unlocksEn: "Pre-shipment quality facts enter the proof pack.",
    noteZh: "装运前水分 12.1%，低于合同上限 12.5%。",
    noteEn: "Pre-shipment moisture is 12.1%, below the 12.5% contract cap.",
  },
  {
    id: "oracle_vgm_submitted",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "logistics",
    kind: "oracle",
    titleZh: "VGM 重量提交",
    titleEn: "VGM submitted",
    requiredSignerPartyId: "party_logistics",
    linkedDocumentId: "doc_vgm",
    status: "signed",
    dueDate: "2026-04-10",
    signedAt: "2026-04-10T10:40:00Z",
    txHash: "0xvgm1...19bc",
    documentHash: "0xvgm8...d31f",
    unlocksZh: "确认装船重量口径，允许进入出口放行和装船检查。",
    unlocksEn: "Confirms loading-weight basis and allows export clearance and loading checks.",
    noteZh: "VGM 14,820 kg，Method 2。",
    noteEn: "VGM 14,820 kg, Method 2.",
  },
  {
    id: "seal_export_customs",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "logistics",
    kind: "seal",
    titleZh: "出口报关放行核验",
    titleEn: "Export customs release verified",
    requiredSignerPartyId: "party_logistics",
    linkedDocumentId: "doc_export_customs",
    status: "signed",
    dueDate: "2026-04-11",
    signedAt: "2026-04-11T13:20:00Z",
    txHash: "0xexp1...78ab",
    documentHash: "0xexp7...90ad",
    unlocksZh: "证明出口端合规放行，允许提单作为融资证据。",
    unlocksEn: "Proves origin-side export release and allows B/L to be used as financing evidence.",
    noteZh: "出口放行完成。",
    noteEn: "Export release completed.",
  },
  {
    id: "seal_bl_logistics",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "logistics",
    kind: "seal",
    titleZh: "物流商提单签章",
    titleEn: "Logistics bill-of-lading seal",
    requiredSignerPartyId: "party_logistics",
    linkedDocumentId: "doc_bl",
    status: "pending",
    dueDate: "2026-04-12",
    documentHash: "0xfe91...440c",
    unlocksZh: "物流流可进入到港和入库检查。",
    unlocksEn: "Logistics flow can proceed to arrival and warehouse check.",
    noteZh: "提单已上传，但最终签章和 on-board 状态核验未完成。",
    noteEn: "Bill of lading uploaded, but final seal and on-board status verification are not complete.",
  },
  {
    id: "oracle_sg_import_permit",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "logistics",
    kind: "oracle",
    titleZh: "新加坡进口许可状态",
    titleEn: "Singapore import permit status",
    requiredSignerPartyId: "party_buyer",
    linkedDocumentId: "doc_sg_permit",
    status: "pending",
    dueDate: "2026-04-17",
    documentHash: "0xsgp4...21aa",
    unlocksZh: "确认目的港监管状态，避免把未完成许可的货物直接纳入无争议应收。",
    unlocksEn: "Confirms destination-side regulatory status and avoids treating uncleared cargo as undisputed receivable.",
    noteZh: "TradeNet URN 已记录，但许可状态仍待最终确认。",
    noteEn: "TradeNet URN recorded, but final permit status still awaits confirmation.",
  },
  {
    id: "seal_warehouse_entry",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "logistics",
    kind: "seal",
    titleZh: "仓库入库确认盖章",
    titleEn: "Warehouse entry seal",
    requiredSignerPartyId: "party_warehouse",
    linkedDocumentId: "doc_warehouse",
    status: "blocked",
    dueDate: "2026-04-18",
    unlocksZh: "证明货物已到指定仓库，是买家验收和融资提交前置条件。",
    unlocksEn: "Proves goods reached the designated warehouse; prerequisite for buyer acceptance and financing submission.",
    noteZh: "最终入库回执缺失，无法签章。",
    noteEn: "Final warehouse receipt is missing, so it cannot be sealed.",
  },
  {
    id: "oracle_arrival_qc",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "information",
    kind: "oracle",
    titleZh: "到港质检结果",
    titleEn: "Arrival QC result",
    requiredSignerPartyId: "party_warehouse",
    linkedDocumentId: "doc_arrival_qc",
    status: "blocked",
    dueDate: "2026-04-19",
    unlocksZh: "把水分争议从口头扯皮变成可审计的实验室结论。",
    unlocksEn: "Turns the moisture dispute from verbal argument into auditable lab evidence.",
    noteZh: "仓库快检 13.2%，第三方实验室结果待出。",
    noteEn: "Warehouse quick test is 13.2%; third-party lab result pending.",
  },
  {
    id: "sign_buyer_acceptance",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "logistics",
    kind: "signature",
    titleZh: "买家验收签字",
    titleEn: "Buyer acceptance signature",
    requiredSignerPartyId: "party_buyer",
    linkedDocumentId: "doc_acceptance",
    status: "blocked",
    dueDate: "2026-04-19",
    unlocksZh: "解锁 70% 尾款催收、应收账款融资正式提交和 RWA tokenization 发行条件。",
    unlocksEn: "Unlocks 70% balance collection, formal receivable-financing submission, and RWA tokenization issuance conditions.",
    noteZh: "买家尚未给出接受、扣款或拒收结论，资金流被卡。",
    noteEn: "Buyer has not issued accept, discount, or reject decision, blocking funds flow.",
  },
  {
    id: "multisig_rwa_issuance",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "funds",
    kind: "multisig",
    titleZh: "RWA 代币化发行多签",
    titleEn: "RWA tokenization issuance multisig",
    requiredSignerPartyId: "party_financier",
    linkedDocumentId: "doc_acceptance",
    status: "blocked",
    dueDate: "2026-04-21",
    unlocksZh: "受限应收账款 token 发行、白名单转让和托管钱包放款。",
    unlocksEn: "Restricted receivable token issuance, whitelist transfer, and escrow-wallet disbursement.",
    noteZh: "必须等提单、进口许可、入库、到港质检和买家验收全部闭合后才允许触发。",
    noteEn: "Only trigger after B/L, import permit, warehouse entry, arrival QC, and buyer acceptance all close.",
  }
];
