export type TradeParty = {
  id: string;
  roleZh: string;
  roleEn: string;
  name: string;
  country: string;
  contact: string;
  email: string;
};

export type TradeMilestoneStatus = "done" | "working" | "blocked" | "waiting";

export type TradeMilestone = {
  id: string;
  order: number;
  titleZh: string;
  titleEn: string;
  ownerPartyId: string;
  dueDate: string;
  status: TradeMilestoneStatus;
  evidenceIds: string[];
  blockerZh?: string;
  blockerEn?: string;
  nextActionZh: string;
  nextActionEn: string;
};

export type TradeDocumentStatus = "verified" | "uploaded" | "missing" | "rejected";

export type TradeDocument = {
  id: string;
  typeZh: string;
  typeEn: string;
  fileName: string;
  documentNo: string;
  issuerPartyId: string;
  issuedAt: string;
  status: TradeDocumentStatus;
  hash?: string;
  amount?: string;
  noteZh: string;
  noteEn: string;
};

export type PaymentMilestone = {
  id: string;
  titleZh: string;
  titleEn: string;
  amount: string;
  dueDate: string;
  status: "paid" | "pending" | "blocked";
  conditionZh: string;
  conditionEn: string;
};

export type ConcreteTradeCase = {
  id: string;
  titleZh: string;
  titleEn: string;
  productZh: string;
  productEn: string;
  incoterm: string;
  currency: string;
  totalAmount: string;
  quantity: string;
  orderNo: string;
  poNo: string;
  invoiceNo: string;
  shipmentNo: string;
  containerNo: string;
  origin: string;
  destination: string;
  createdAt: string;
  expectedArrival: string;
  parties: TradeParty[];
  documents: TradeDocument[];
  milestones: TradeMilestone[];
  payments: PaymentMilestone[];
};

export const concreteTradeCase: ConcreteTradeCase = {
  id: "trade_vn_coffee_sg_2026_0007",
  titleZh: "越南咖啡豆出口新加坡 · 应收账款融资准备",
  titleEn: "Vietnam coffee beans to Singapore · receivable financing readiness",
  productZh: "越南罗布斯塔咖啡豆 G1，10.8 吨",
  productEn: "Vietnam Robusta coffee beans G1, 10.8 tons",
  incoterm: "CIF Singapore",
  currency: "USD",
  totalAmount: "USD 52,800",
  quantity: "10.8 tons / 180 bags",
  orderNo: "SO-CT-2026-0007",
  poNo: "PO-SG-88421",
  invoiceNo: "INV-VN-2026-0318",
  shipmentNo: "SHP-HCM-SG-2026-0412",
  containerNo: "TCLU-482913-2",
  origin: "Dak Lak → Cat Lai Port, Vietnam",
  destination: "Singapore PSA / Jurong Warehouse",
  createdAt: "2026-04-02",
  expectedArrival: "2026-04-18",
  parties: [
    {
      id: "party_exporter",
      roleZh: "出口商 / 小微企业",
      roleEn: "Exporter / SME",
      name: "Mekong Bean Trading Co.",
      country: "Vietnam",
      contact: "Linh Nguyen",
      email: "linh@mekongbean.example",
    },
    {
      id: "party_buyer",
      roleZh: "新加坡买家 / 烘焙商",
      roleEn: "Singapore buyer / roaster",
      name: "Lion City Roasters Pte. Ltd.",
      country: "Singapore",
      contact: "Daniel Tan",
      email: "daniel@lionroasters.example",
    },
    {
      id: "party_logistics",
      roleZh: "物流商 / 货代",
      roleEn: "Logistics provider / forwarder",
      name: "BlueBridge Freight Vietnam",
      country: "Vietnam",
      contact: "Mai Tran",
      email: "ops@bluebridge.example",
    },
    {
      id: "party_warehouse",
      roleZh: "收货仓库",
      roleEn: "Receiving warehouse",
      name: "Jurong Cold & Dry Warehouse",
      country: "Singapore",
      contact: "Warehouse Desk",
      email: "inbound@jurongwarehouse.example",
    },
    {
      id: "party_financier",
      roleZh: "应收账款资金方",
      roleEn: "Receivable financier",
      name: "Harbor Receivables Finance",
      country: "Singapore",
      contact: "Priya Nair",
      email: "review@harborfinance.example",
    }
  ],
  documents: [
    {
      id: "doc_po",
      typeZh: "采购订单",
      typeEn: "Purchase order",
      fileName: "PO-SG-88421.pdf",
      documentNo: "PO-SG-88421",
      issuerPartyId: "party_buyer",
      issuedAt: "2026-04-02",
      status: "verified",
      hash: "0x7d4b...91aa",
      amount: "USD 52,800",
      noteZh: "买家确认采购 10.8 吨咖啡豆，CIF Singapore，30% 预付款 + 70% 到港验收后付款。",
      noteEn: "Buyer confirms 10.8 tons of coffee beans under CIF Singapore, 30% deposit plus 70% after arrival acceptance.",
    },
    {
      id: "doc_invoice",
      typeZh: "商业发票",
      typeEn: "Commercial invoice",
      fileName: "INV-VN-2026-0318.pdf",
      documentNo: "INV-VN-2026-0318",
      issuerPartyId: "party_exporter",
      issuedAt: "2026-04-03",
      status: "verified",
      hash: "0xa13c...22fe",
      amount: "USD 52,800",
      noteZh: "发票金额与采购订单一致。",
      noteEn: "Invoice amount matches the purchase order.",
    },
    {
      id: "doc_packing",
      typeZh: "装箱单",
      typeEn: "Packing list",
      fileName: "PKL-VN-2026-0410.pdf",
      documentNo: "PKL-VN-2026-0410",
      issuerPartyId: "party_exporter",
      issuedAt: "2026-04-10",
      status: "verified",
      hash: "0xpkl1...83bd",
      noteZh: "180 袋，净重 10,800 kg，毛重 10,980 kg，绑定柜号 TCLU-482913-2。",
      noteEn: "180 bags, net 10,800 kg, gross 10,980 kg, tied to container TCLU-482913-2.",
    },
    {
      id: "doc_quality",
      typeZh: "装运前质检证书",
      typeEn: "Pre-shipment quality certificate",
      fileName: "QC-MB-2026-0410.pdf",
      documentNo: "QC-MB-2026-0410",
      issuerPartyId: "party_exporter",
      issuedAt: "2026-04-10",
      status: "verified",
      hash: "0x39bd...7fa0",
      noteZh: "装运前水分 12.1%，低于合同上限 12.5%。",
      noteEn: "Pre-shipment moisture is 12.1%, below the 12.5% contract cap.",
    },
    {
      id: "doc_vgm",
      typeZh: "VGM 重量声明",
      typeEn: "VGM declaration",
      fileName: "VGM-HCM-2026-0410-8821.pdf",
      documentNo: "VGM-HCM-2026-0410-8821",
      issuerPartyId: "party_logistics",
      issuedAt: "2026-04-10",
      status: "verified",
      hash: "0xvgm8...d31f",
      noteZh: "VGM 14,820 kg，Method 2，截关前提交。",
      noteEn: "VGM 14,820 kg, Method 2, submitted before cut-off.",
    },
    {
      id: "doc_export_customs",
      typeZh: "越南出口报关放行",
      typeEn: "Vietnam export customs release",
      fileName: "VN-EXP-2026-0318-7782.pdf",
      documentNo: "VN-EXP-2026-0318-7782",
      issuerPartyId: "party_logistics",
      issuedAt: "2026-04-11",
      status: "verified",
      hash: "0xexp7...90ad",
      noteZh: "出口放行已完成，单证与 PO、发票、装箱单一致。",
      noteEn: "Export clearance completed; declaration matches PO, invoice, and packing list.",
    },
    {
      id: "doc_bl",
      typeZh: "提单",
      typeEn: "Bill of lading",
      fileName: "BL-HCM-SIN-448812.pdf",
      documentNo: "BL-HCM-SIN-448812",
      issuerPartyId: "party_logistics",
      issuedAt: "2026-04-12",
      status: "uploaded",
      hash: "0xfe91...440c",
      noteZh: "已上传，等待物流商最终签章核验 on-board 状态。",
      noteEn: "Uploaded and waiting for logistics final seal to verify on-board status.",
    },
    {
      id: "doc_sg_permit",
      typeZh: "新加坡进口许可 / TradeNet URN",
      typeEn: "Singapore import permit / TradeNet URN",
      fileName: "DA20260318-004921.pdf",
      documentNo: "DA20260318-004921",
      issuerPartyId: "party_buyer",
      issuedAt: "2026-04-17",
      status: "uploaded",
      hash: "0xsgp4...21aa",
      noteZh: "买方已提交进口许可申请，状态仍待最终确认。ChainTrace 记录编号和 hash，不替代官方系统。",
      noteEn: "Buyer submitted import permit application; final status still pending. ChainTrace records reference and hash, not replacing official systems.",
    },
    {
      id: "doc_warehouse",
      typeZh: "入库确认",
      typeEn: "Warehouse entry confirmation",
      fileName: "missing-warehouse-entry.pdf",
      documentNo: "WR-SG-2026-0318-07",
      issuerPartyId: "party_warehouse",
      issuedAt: "2026-04-18",
      status: "missing",
      noteZh: "货物预计到港后 24 小时内由仓库出具，目前未收到最终签发回执。",
      noteEn: "Expected within 24 hours after arrival; final warehouse receipt not received yet.",
    },
    {
      id: "doc_arrival_qc",
      typeZh: "到港质检报告",
      typeEn: "Arrival quality inspection report",
      fileName: "QC-SG-PENDING.pdf",
      documentNo: "QC-SG-PENDING",
      issuerPartyId: "party_warehouse",
      issuedAt: "2026-04-19",
      status: "missing",
      noteZh: "仓库快检水分 13.2%，超过合同上限 12.5%，第三方实验室结果待出。",
      noteEn: "Warehouse quick test shows 13.2% moisture, above the 12.5% contract cap; third-party lab result pending.",
    },
    {
      id: "doc_acceptance",
      typeZh: "买家验收确认",
      typeEn: "Buyer acceptance confirmation",
      fileName: "missing-buyer-acceptance.pdf",
      documentNo: "ACC-SG-PENDING",
      issuerPartyId: "party_buyer",
      issuedAt: "2026-04-19",
      status: "missing",
      noteZh: "买家验收是触发 70% 尾款和融资提交的关键条件。",
      noteEn: "Buyer acceptance triggers the 70% balance and financing submission.",
    }
  ],
  milestones: [
    {
      id: "ms_order",
      order: 1,
      titleZh: "订单确认",
      titleEn: "Order confirmed",
      ownerPartyId: "party_buyer",
      dueDate: "2026-04-02",
      status: "done",
      evidenceIds: ["doc_po"],
      nextActionZh: "无需动作。",
      nextActionEn: "No action needed.",
    },
    {
      id: "ms_invoice",
      order: 2,
      titleZh: "发票、装箱单与装运前质检齐备",
      titleEn: "Invoice, packing list, and pre-shipment QC ready",
      ownerPartyId: "party_exporter",
      dueDate: "2026-04-10",
      status: "done",
      evidenceIds: ["doc_invoice", "doc_packing", "doc_quality"],
      nextActionZh: "可供买家和资金方预审。",
      nextActionEn: "Ready for buyer and financier pre-review.",
    },
    {
      id: "ms_vgm_customs",
      order: 3,
      titleZh: "VGM 与出口报关完成",
      titleEn: "VGM and export customs completed",
      ownerPartyId: "party_logistics",
      dueDate: "2026-04-11",
      status: "done",
      evidenceIds: ["doc_vgm", "doc_export_customs"],
      nextActionZh: "等待装船和提单最终签章。",
      nextActionEn: "Wait for vessel loading and final B/L seal.",
    },
    {
      id: "ms_shipping",
      order: 4,
      titleZh: "装船与提单核验",
      titleEn: "Shipment and bill of lading verification",
      ownerPartyId: "party_logistics",
      dueDate: "2026-04-12",
      status: "working",
      evidenceIds: ["doc_bl"],
      blockerZh: "提单已上传但物流商最终签章未核验。",
      blockerEn: "Bill of lading uploaded but logistics final seal is not verified.",
      nextActionZh: "提醒物流商确认提单签章和 on-board 状态。",
      nextActionEn: "Ask logistics provider to verify B/L seal and on-board status.",
    },
    {
      id: "ms_sg_permit",
      order: 5,
      titleZh: "新加坡进口许可状态",
      titleEn: "Singapore import permit status",
      ownerPartyId: "party_buyer",
      dueDate: "2026-04-17",
      status: "working",
      evidenceIds: ["doc_sg_permit"],
      blockerZh: "TradeNet URN 已记录，但许可状态仍待最终确认。",
      blockerEn: "TradeNet URN recorded, but permit status still awaits final confirmation.",
      nextActionZh: "请买方或报关代理补充最终许可状态截图/文件。",
      nextActionEn: "Ask buyer or customs agent to add final permit status proof.",
    },
    {
      id: "ms_warehouse",
      order: 6,
      titleZh: "新加坡仓库入库",
      titleEn: "Singapore warehouse entry",
      ownerPartyId: "party_warehouse",
      dueDate: "2026-04-18",
      status: "blocked",
      evidenceIds: ["doc_warehouse"],
      blockerZh: "入库确认缺失，资金方无法判断货物是否到仓。",
      blockerEn: "Warehouse entry is missing, so the financier cannot confirm goods reached the warehouse.",
      nextActionZh: "向仓库发送入库确认请求，并要求附柜号、铅封、袋数、重量。",
      nextActionEn: "Send warehouse receipt request and require container, seal, bag count, and weight.",
    },
    {
      id: "ms_acceptance",
      order: 7,
      titleZh: "到港质检与买家验收",
      titleEn: "Arrival QC and buyer acceptance",
      ownerPartyId: "party_buyer",
      dueDate: "2026-04-19",
      status: "blocked",
      evidenceIds: ["doc_arrival_qc", "doc_acceptance"],
      blockerZh: "到港快检水分 13.2%，高于合同上限 12.5%；买家验收缺失，尾款和融资申请都不能正式推进。",
      blockerEn: "Arrival quick test shows 13.2% moisture, above the 12.5% cap; buyer acceptance is missing, so balance payment and financing submission cannot formally proceed.",
      nextActionZh: "锁定取样照片、实验室委托单和买方验收/扣款/拒收结论。",
      nextActionEn: "Lock sampling photos, lab request, and buyer accept / discount / reject decision.",
    },
    {
      id: "ms_financing",
      order: 8,
      titleZh: "应收账款融资准备",
      titleEn: "Receivable financing readiness",
      ownerPartyId: "party_financier",
      dueDate: "2026-04-20",
      status: "waiting",
      evidenceIds: ["doc_po", "doc_invoice", "doc_packing", "doc_quality", "doc_vgm", "doc_export_customs", "doc_bl", "doc_sg_permit", "doc_warehouse", "doc_arrival_qc", "doc_acceptance"],
      blockerZh: "还差仓库回执、到港质检结论和买家验收，当前只能做预审，不能正式提交融资。",
      blockerEn: "Warehouse receipt, arrival QC conclusion, and buyer acceptance are missing; only pre-review is possible, not formal financing submission.",
      nextActionZh: "补齐缺口后生成融资材料摘要。",
      nextActionEn: "Generate financing pack summary after gaps are closed.",
    }
  ],
  payments: [
    {
      id: "pay_deposit",
      titleZh: "30% 预付款",
      titleEn: "30% deposit",
      amount: "USD 15,840",
      dueDate: "2026-04-03",
      status: "paid",
      conditionZh: "订单确认后支付。",
      conditionEn: "Paid after order confirmation.",
    },
    {
      id: "pay_balance",
      titleZh: "70% 尾款",
      titleEn: "70% balance",
      amount: "USD 36,960",
      dueDate: "2026-04-20",
      status: "blocked",
      conditionZh: "需要仓库入库、到港质检和买家验收确认。",
      conditionEn: "Requires warehouse receipt, arrival QC, and buyer acceptance confirmation.",
    }
  ],
};
