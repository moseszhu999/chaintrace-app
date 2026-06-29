export type FundDirection = "inflow" | "outflow";
export type FundStatus = "paid" | "pending" | "blocked" | "planned";

export type FundItem = {
  id: string;
  direction: FundDirection;
  titleZh: string;
  titleEn: string;
  amountUsd: number;
  dueDate: string;
  status: FundStatus;
  relatedPartyId: string;
  relatedDocumentId?: string;
  noteZh: string;
  noteEn: string;
};

export const concreteFundItems: FundItem[] = [
  {
    id: "fund_opening_cash",
    direction: "inflow",
    titleZh: "期初可用现金",
    titleEn: "Opening available cash",
    amountUsd: 8200,
    dueDate: "2026-04-02",
    status: "paid",
    relatedPartyId: "party_exporter",
    noteZh: "出口商账户当前可用于本单周转的现金。",
    noteEn: "Cash currently available for this order's working capital.",
  },
  {
    id: "fund_deposit",
    direction: "inflow",
    titleZh: "30% 预付款",
    titleEn: "30% buyer deposit",
    amountUsd: 15840,
    dueDate: "2026-04-03",
    status: "paid",
    relatedPartyId: "party_buyer",
    relatedDocumentId: "doc_po",
    noteZh: "买家已支付，支持采购和装运前现金周转。",
    noteEn: "Paid by buyer; supports procurement and pre-shipment working capital.",
  },
  {
    id: "fund_supplier_payable",
    direction: "outflow",
    titleZh: "供应商货款",
    titleEn: "Supplier payable",
    amountUsd: 31000,
    dueDate: "2026-04-11",
    status: "pending",
    relatedPartyId: "party_exporter",
    relatedDocumentId: "doc_invoice",
    noteZh: "咖啡豆采购成本，发货后 7 天内应付。",
    noteEn: "Coffee procurement cost, payable within 7 days after shipment.",
  },
  {
    id: "fund_logistics_fee",
    direction: "outflow",
    titleZh: "物流与港杂费",
    titleEn: "Logistics and port charges",
    amountUsd: 2400,
    dueDate: "2026-04-12",
    status: "pending",
    relatedPartyId: "party_logistics",
    relatedDocumentId: "doc_bl",
    noteZh: "物流商费用；提单签章核验后付款。",
    noteEn: "Logistics provider fee; payable after bill-of-lading stamp verification.",
  },
  {
    id: "fund_warehouse_fee",
    direction: "outflow",
    titleZh: "新加坡仓储入库费",
    titleEn: "Singapore warehouse entry fee",
    amountUsd: 680,
    dueDate: "2026-04-18",
    status: "blocked",
    relatedPartyId: "party_warehouse",
    relatedDocumentId: "doc_warehouse",
    noteZh: "入库确认未收到，暂不付款。",
    noteEn: "Warehouse entry confirmation missing; payment is held.",
  },
  {
    id: "fund_balance_receivable",
    direction: "inflow",
    titleZh: "70% 尾款应收",
    titleEn: "70% balance receivable",
    amountUsd: 36960,
    dueDate: "2026-04-20",
    status: "blocked",
    relatedPartyId: "party_buyer",
    relatedDocumentId: "doc_acceptance",
    noteZh: "需要买家验收确认后才能催收。",
    noteEn: "Requires buyer acceptance before collection.",
  },
  {
    id: "fund_possible_financing",
    direction: "inflow",
    titleZh: "可能的应收账款融资",
    titleEn: "Potential receivable financing",
    amountUsd: 29500,
    dueDate: "2026-04-21",
    status: "planned",
    relatedPartyId: "party_financier",
    relatedDocumentId: "doc_acceptance",
    noteZh: "仅在入库、验收、提单核验补齐后才可正式提交。",
    noteEn: "Only eligible after warehouse entry, buyer acceptance, and bill-of-lading verification are complete.",
  }
];

export function formatUsd(amount: number) {
  return `USD ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
