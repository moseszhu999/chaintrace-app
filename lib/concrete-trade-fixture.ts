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
  productZh: "越南罗布斯塔咖啡豆 G1，19.2 吨",
  productEn: "Vietnam Robusta coffee beans G1, 19.2 tons",
  incoterm: "CIF Singapore",
  currency: "USD",
  totalAmount: "USD 52,800",
  quantity: "19.2 tons / 320 bags",
  orderNo: "SO-CT-2026-0007",
  poNo: "PO-SG-88421",
  invoiceNo: "INV-VN-2026-0318",
  shipmentNo: "SHP-HCM-SG-2026-0412",
  containerNo: "TCLU-482913-6",
  origin: "Ho Chi Minh City, Vietnam",
  destination: "Singapore Port / Jurong Warehouse",
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
      roleZh: "买家",
      roleEn: "Buyer",
      name: "Lion City Roasters Pte. Ltd.",
      country: "Singapore",
      contact: "Daniel Tan",
      email: "daniel@lionroasters.example",
    },
    {
      id: "party_logistics",
      roleZh: "物流商",
      roleEn: "Logistics provider",
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
      noteZh: "买家确认采购 19.2 吨咖啡豆，CIF Singapore。",
      noteEn: "Buyer confirms 19.2 tons of coffee beans under CIF Singapore.",
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
      id: "doc_quality",
      typeZh: "质检证书",
      typeEn: "Quality certificate",
      fileName: "QC-MB-2026-0410.pdf",
      documentNo: "QC-MB-2026-0410",
      issuerPartyId: "party_exporter",
      issuedAt: "2026-04-10",
      status: "verified",
      hash: "0x39bd...7fa0",
      noteZh: "水分、杂质、等级通过买家要求。",
      noteEn: "Moisture, impurities, and grade match buyer requirements.",
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
      noteZh: "已上传，等待物流商签章核验。",
      noteEn: "Uploaded and waiting for logistics stamp verification.",
    },
    {
      id: "doc_warehouse",
      typeZh: "入库确认",
      typeEn: "Warehouse entry confirmation",
      fileName: "missing-warehouse-entry.pdf",
      documentNo: "WH-JURONG-PENDING",
      issuerPartyId: "party_warehouse",
      issuedAt: "2026-04-18",
      status: "missing",
      noteZh: "货物预计到港后 24 小时内由仓库出具，目前未收到。",
      noteEn: "Expected within 24 hours after arrival; not received yet.",
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
      titleZh: "发票与质检齐备",
      titleEn: "Invoice and quality certificate ready",
      ownerPartyId: "party_exporter",
      dueDate: "2026-04-10",
      status: "done",
      evidenceIds: ["doc_invoice", "doc_quality"],
      nextActionZh: "可供买家和资金方预审。",
      nextActionEn: "Ready for buyer and financier pre-review.",
    },
    {
      id: "ms_shipping",
      order: 3,
      titleZh: "装船与提单核验",
      titleEn: "Shipment and bill of lading verification",
      ownerPartyId: "party_logistics",
      dueDate: "2026-04-12",
      status: "working",
      evidenceIds: ["doc_bl"],
      blockerZh: "提单已上传但物流商签章未核验。",
      blockerEn: "Bill of lading uploaded but logistics stamp is not verified.",
      nextActionZh: "提醒物流商确认提单签章。",
      nextActionEn: "Ask logistics provider to verify the bill of lading stamp.",
    },
    {
      id: "ms_warehouse",
      order: 4,
      titleZh: "新加坡仓库入库",
      titleEn: "Singapore warehouse entry",
      ownerPartyId: "party_warehouse",
      dueDate: "2026-04-18",
      status: "blocked",
      evidenceIds: ["doc_warehouse"],
      blockerZh: "入库确认缺失，资金方无法判断货物是否到仓。",
      blockerEn: "Warehouse entry is missing, so the financier cannot confirm goods reached the warehouse.",
      nextActionZh: "向仓库发送入库确认请求。",
      nextActionEn: "Send warehouse entry confirmation request.",
    },
    {
      id: "ms_acceptance",
      order: 5,
      titleZh: "买家验收",
      titleEn: "Buyer acceptance",
      ownerPartyId: "party_buyer",
      dueDate: "2026-04-19",
      status: "blocked",
      evidenceIds: ["doc_acceptance"],
      blockerZh: "买家验收缺失，尾款和融资申请都不能正式推进。",
      blockerEn: "Buyer acceptance is missing; balance payment and financing submission cannot formally proceed.",
      nextActionZh: "生成买家验收确认邮件，人工审批后发送。",
      nextActionEn: "Draft buyer acceptance email and send after human approval.",
    },
    {
      id: "ms_financing",
      order: 6,
      titleZh: "应收账款融资准备",
      titleEn: "Receivable financing readiness",
      ownerPartyId: "party_financier",
      dueDate: "2026-04-20",
      status: "waiting",
      evidenceIds: ["doc_po", "doc_invoice", "doc_quality", "doc_bl", "doc_warehouse", "doc_acceptance"],
      blockerZh: "还差入库和买家验收，当前只能做预审，不能正式提交融资。",
      blockerEn: "Warehouse entry and buyer acceptance are missing; only pre-review is possible, not formal financing submission.",
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
      conditionZh: "需要买家验收确认。",
      conditionEn: "Requires buyer acceptance confirmation.",
    }
  ],
};
