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
  policyZh: "原始文件不上链；只上链文件 hash、签章角色、签章状态、时间戳、版本号和触发条件。",
  policyEn: "Raw files do not go on-chain; only file hashes, signing roles, signing status, timestamps, versions, and trigger conditions are recorded.",
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
    id: "seal_quality_exporter",
    contractId: "contract_trade_signature_vn_sg_0007",
    flow: "information",
    kind: "seal",
    titleZh: "质检证书盖章",
    titleEn: "Quality certificate seal",
    requiredSignerPartyId: "party_exporter",
    linkedDocumentId: "doc_quality",
    status: "signed",
    dueDate: "2026-04-10",
    signedAt: "2026-04-10T07:40:00Z",
    txHash: "0x8d12...f0a1",
    documentHash: "0x39bd...7fa0",
    unlocksZh: "质量事实进入证明包。",
    unlocksEn: "Quality facts enter the proof pack.",
    noteZh: "咖啡豆等级和水分通过要求。",
    noteEn: "Coffee grade and moisture passed requirements.",
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
    noteZh: "提单已上传，但签章核验未完成。",
    noteEn: "Bill of lading uploaded, but seal verification is not complete.",
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
    unlocksZh: "证明货物已到仓，是买家验收和融资提交前置条件。",
    unlocksEn: "Proves goods reached the warehouse; prerequisite for buyer acceptance and financing submission.",
    noteZh: "入库文件缺失，无法签章。",
    noteEn: "Warehouse entry document is missing, so it cannot be sealed.",
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
    noteZh: "买家验收文件缺失，资金流被卡。",
    noteEn: "Buyer acceptance document is missing, blocking funds flow.",
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
    noteZh: "必须等提单、入库、买家验收全部签章完成后才允许触发。",
    noteEn: "Only trigger after bill of lading, warehouse entry, and buyer acceptance are all signed/sealed.",
  }
];
