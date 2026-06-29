export type LoanGateStatus = "passed" | "pending" | "blocked";

export type LoanGateChecklistItem = {
  id: string;
  labelZh: string;
  labelEn: string;
  status: LoanGateStatus;
  evidenceId: string;
};

export type LoanGateSummary = {
  passed: number;
  total: number;
  preReviewAllowed: true;
  disbursementAllowed: false;
  blockerCode: "GATES_NOT_PASSED";
};

const loanGateChecklist: LoanGateChecklistItem[] = [
  { id: "po_signed", labelZh: "采购订单已签署", labelEn: "Purchase order signed", status: "passed", evidenceId: "doc_po" },
  { id: "invoice_matched", labelZh: "发票与 PO 匹配", labelEn: "Invoice matches PO", status: "passed", evidenceId: "doc_invoice" },
  { id: "packing_verified", labelZh: "装箱单绑定柜号", labelEn: "Packing list binds container", status: "passed", evidenceId: "doc_packing" },
  { id: "pre_qc_passed", labelZh: "装运前质检通过", labelEn: "Pre-shipment QC passed", status: "passed", evidenceId: "doc_quality" },
  { id: "vgm_verified", labelZh: "VGM 重量声明已核验", labelEn: "VGM verified", status: "passed", evidenceId: "doc_vgm" },
  { id: "export_released", labelZh: "越南出口放行", labelEn: "Vietnam export released", status: "passed", evidenceId: "doc_export_customs" },
  { id: "final_bl", labelZh: "最终 on-board B/L", labelEn: "Final on-board B/L", status: "pending", evidenceId: "doc_bl" },
  { id: "sg_import_permit", labelZh: "新加坡进口许可最终确认", labelEn: "Singapore import permit final confirmation", status: "pending", evidenceId: "doc_sg_permit" },
  { id: "warehouse_receipt", labelZh: "仓库入库回执", labelEn: "Warehouse receipt", status: "blocked", evidenceId: "doc_warehouse" },
  { id: "arrival_qc", labelZh: "到港质检争议闭合", labelEn: "Arrival QC dispute closed", status: "blocked", evidenceId: "doc_arrival_qc" },
  { id: "buyer_acceptance", labelZh: "买家验收 / 扣款 / 拒收决定", labelEn: "Buyer accept / discount / reject decision", status: "blocked", evidenceId: "doc_acceptance" },
  { id: "financier_multisig", labelZh: "资金方放款多签", labelEn: "Financier disbursement multisig", status: "blocked", evidenceId: "loan_receivable_vn_sg_0007" },
];

export function getLoanGateChecklist() {
  return [...loanGateChecklist];
}

export function getLoanGateSummary(): LoanGateSummary {
  return {
    passed: loanGateChecklist.filter((gate) => gate.status === "passed").length,
    total: loanGateChecklist.length,
    preReviewAllowed: true,
    disbursementAllowed: false,
    blockerCode: "GATES_NOT_PASSED",
  };
}
