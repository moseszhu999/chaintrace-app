"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { sha256File, shortHash } from "@/lib/hash";

type LocaleAwareText = {
  zh: string;
  en: string;
};

type EvidenceDocumentType = "invoice" | "purchase_order" | "bill_of_lading" | "warehouse_receipt" | "quality_report" | "buyer_acceptance";

type ReceivableCandidate = {
  tradeId: "VN-COFFEE-SG-2026-0007";
  source: "browser-local-pdf";
  documentType: EvidenceDocumentType;
  fileName: string;
  fileHash: string;
  receivableAmount: "USD 36,960";
  requestedAdvance: "USDC 29,500";
  readinessScore: 62;
  blockerCode: "GATES_NOT_PASSED";
  disbursementAllowed: false;
  onchainStatus: "candidate_ready_for_wallet_signature";
  contractIntent: string[];
};

const documentTypes: Array<{ value: EvidenceDocumentType } & LocaleAwareText> = [
  { value: "invoice", zh: "商业发票", en: "Commercial invoice" },
  { value: "purchase_order", zh: "采购订单 / 销售合同", en: "Purchase order / sales contract" },
  { value: "bill_of_lading", zh: "提单", en: "Bill of lading" },
  { value: "warehouse_receipt", zh: "仓库回执", en: "Warehouse receipt" },
  { value: "quality_report", zh: "质检报告", en: "Quality report" },
  { value: "buyer_acceptance", zh: "买家验收", en: "Buyer acceptance" },
];

const chainSteps: LocaleAwareText[] = [
  {
    zh: "TradeSigningRegistry 记录 PO / 发票 / 买家验收等签章 gate。",
    en: "TradeSigningRegistry records PO, invoice, and buyer-acceptance signing gates.",
  },
  {
    zh: "LogisticsEvidenceRegistry 记录提单、仓储、质检和物流 gate。",
    en: "LogisticsEvidenceRegistry records B/L, warehouse, QC, and logistics gates.",
  },
  {
    zh: "LoanRequestRegistry.submitPreReviewRequest 写入预审融资申请和 evidence pack hash。",
    en: "LoanRequestRegistry.submitPreReviewRequest writes the pre-review request and evidence-pack hash.",
  },
  {
    zh: "RestrictedReceivableToken 只在专业审查、KYC 和全部 gate 完成后才允许受限发行。",
    en: "RestrictedReceivableToken issuance stays locked until professional review, KYC, and all gates are complete.",
  },
];

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

async function sha256Text(value: string) {
  const buffer = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return `0x${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function ClientReceivableConverter({ zh }: { zh: boolean }) {
  const [documentType, setDocumentType] = useState<EvidenceDocumentType>("invoice");
  const [fileName, setFileName] = useState("Vietnam-coffee-invoice-demo.pdf");
  const [fileHash, setFileHash] = useState("0x7f5c9a4e2b18d42a8d0f9f1d4f9f93d3e98a2c4d6b71a0e6c2d44e7b8f0b1a63");
  const [candidateHash, setCandidateHash] = useState("0x91f3d4a6b2c88e24f3dd2a71bc4ec46ea7fbd61a9ac1bd522c36f9f7d2ed1a04");
  const [isHashing, setIsHashing] = useState(false);
  const [error, setError] = useState("");

  const candidate: ReceivableCandidate = useMemo(() => ({
    tradeId: "VN-COFFEE-SG-2026-0007",
    source: "browser-local-pdf",
    documentType,
    fileName,
    fileHash,
    receivableAmount: "USD 36,960",
    requestedAdvance: "USDC 29,500",
    readinessScore: 62,
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    onchainStatus: "candidate_ready_for_wallet_signature",
    contractIntent: [
      "TradeSigningRegistry.attestEvidenceHash",
      "LogisticsEvidenceRegistry.attestEvidenceHash",
      "LoanRequestRegistry.submitPreReviewRequest",
      "RestrictedReceivableToken.lockedUntilAllGatesPass",
    ],
  }), [documentType, fileHash, fileName]);

  async function refreshCandidateHash(nextCandidate: ReceivableCandidate) {
    const normalized = JSON.stringify(nextCandidate, Object.keys(nextCandidate).sort());
    setCandidateHash(await sha256Text(normalized));
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) return;
    if (file.type && file.type !== "application/pdf") {
      setError(t(zh, "请选择 PDF 文件。", "Select a PDF file."));
      return;
    }

    try {
      setIsHashing(true);
      const nextHash = await sha256File(file);
      const nextCandidate: ReceivableCandidate = {
        ...candidate,
        fileName: file.name,
        fileHash: nextHash,
      };
      setFileName(file.name);
      setFileHash(nextHash);
      await refreshCandidateHash(nextCandidate);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(zh, "无法在浏览器中计算文件哈希。", "Could not calculate the file hash in the browser."));
    } finally {
      setIsHashing(false);
    }
  }

  async function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextType = event.target.value as EvidenceDocumentType;
    const nextCandidate: ReceivableCandidate = {
      ...candidate,
      documentType: nextType,
    };
    setDocumentType(nextType);
    await refreshCandidateHash(nextCandidate);
  }

  return (
    <section className="panel receivable-converter" id="pdf-to-receivable">
      <div className="converter-grid">
        <div>
          <div className="section-heading">
            <span>{t(zh, "PDF → 链上应收账款候选", "PDF → on-chain receivable candidate")}</span>
            <h2>{t(zh, "把跨境贸易 PDF 变成可融资应收账款候选。", "Turn a cross-border trade PDF into a receivable financing candidate.")}</h2>
            <p>
              {t(
                zh,
                "PDF 原文留在浏览器/用户侧。ChainTrace 计算 SHA-256，生成应收账款候选、预审申请哈希和合约调用意图；gate 不通过时仍然阻断正式放款。",
                "The raw PDF stays in the browser/user side. ChainTrace calculates SHA-256, creates a receivable candidate, pre-review request hash, and contract-call intent; formal disbursement remains blocked while gates fail.",
              )}
            </p>
          </div>

          <label>
            {t(zh, "选择贸易 PDF", "Select trade PDF")}
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
          </label>

          <label>
            {t(zh, "单证类型", "Document type")}
            <select value={documentType} onChange={handleTypeChange}>
              {documentTypes.map((item) => <option value={item.value} key={item.value}>{t(zh, item.zh, item.en)}</option>)}
            </select>
          </label>

          {isHashing && <div className="notice">{t(zh, "正在浏览器本地计算 PDF 哈希...", "Calculating the PDF hash locally in the browser...")}</div>}
          {error && <div className="error">{error}</div>}

          <div className="converter-actions">
            <a className="primary-button" href="/login">{t(zh, "签名并进入工作台", "Sign and enter workspace")}</a>
            <a className="secondary-button" href="/login">{t(zh, "登录查看链上状态机", "Login to view on-chain state machine")}</a>
          </div>
        </div>

        <div className="converter-board">
          <div className="converter-status-row">
            <span>{t(zh, "候选状态", "Candidate status")}</span>
            <strong>Pre-review only</strong>
          </div>
          <dl className="converter-facts">
            <div><dt>tradeId</dt><dd>VN-COFFEE-SG-2026-0007</dd></div>
            <div><dt>{t(zh, "文件", "File")}</dt><dd>{fileName}</dd></div>
            <div><dt>{t(zh, "文件哈希", "File hash")}</dt><dd title={fileHash}>{shortHash(fileHash)}</dd></div>
            <div><dt>{t(zh, "候选哈希", "Candidate hash")}</dt><dd title={candidateHash}>{shortHash(candidateHash)}</dd></div>
            <div><dt>{t(zh, "应收账款", "Receivable")}</dt><dd>USD 36,960</dd></div>
            <div><dt>{t(zh, "申请垫款", "Advance")}</dt><dd>USDC 29,500</dd></div>
          </dl>
          <div className="signal-status-box converter-blocker">
            <span>{t(zh, "合规阻断", "Compliance blocker")}</span>
            <strong>GATES_NOT_PASSED</strong>
            <p>disbursementAllowed=false</p>
          </div>
        </div>
      </div>

      <div className="converter-chain">
        {chainSteps.map((step, index) => (
          <article key={step.en}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{t(zh, step.zh, step.en)}</strong>
          </article>
        ))}
      </div>

      <pre className="candidate-json" aria-label="ReceivableCandidate JSON">{JSON.stringify(candidate, null, 2)}</pre>
    </section>
  );
}
