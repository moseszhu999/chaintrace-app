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

type Eip712Field = {
  name: string;
  type: string;
};

type ReceivableCandidateTypedDataPreview = {
  domain: {
    name: "ChainTrace";
    version: "0.1";
    chainId: 0;
    verifyingContract: "0x0000000000000000000000000000000000000000";
  };
  primaryType: "ReceivableCandidate";
  types: {
    EIP712Domain: Eip712Field[];
    ReceivableCandidate: Eip712Field[];
  };
  message: {
    tradeId: ReceivableCandidate["tradeId"];
    documentHash: string;
    candidateHash: string;
    receivableAmount: ReceivableCandidate["receivableAmount"];
    requestedAdvance: ReceivableCandidate["requestedAdvance"];
    blockerCode: ReceivableCandidate["blockerCode"];
    disbursementAllowed: ReceivableCandidate["disbursementAllowed"];
  };
  walletSignatureStatus: "not_requested";
  contractTarget: "LoanRequestRegistry.submitPreReviewRequest";
  registryPath: "LoanRequestRegistry.submitPreReviewRequest(evidencePackURI,evidencePackHash,readinessScore,blockerCode)";
  professionalReviewRequired: true;
  rawPdfPolicy: "raw PDF stays browser-local / off-chain";
};

type SignatureReceiptPreview = {
  signatureStatus: "preview_only";
  walletSignatureStatus: "not_requested";
  signerWallet: "0x0000000000000000000000000000000000000000_mock";
  typedDataDigest: string;
  candidateHash: string;
  documentHash: string;
  signedAt: null;
  registryTarget: "LoanRequestRegistry.submitPreReviewRequest";
  allowedAction: "PRE_REVIEW_ONLY";
  professionalReviewRequired: true;
};

type RegistryHandoffPreview = {
  registryTarget: "LoanRequestRegistry.submitPreReviewRequest";
  method: "submitPreReviewRequest";
  tradeId: ReceivableCandidate["tradeId"];
  evidencePackURI: string;
  evidencePackHash: string;
  documentHash: string;
  candidateHash: string;
  typedDataPrimaryType: "ReceivableCandidate";
  signatureStatus: "preview_only";
  blockerCode: "GATES_NOT_PASSED";
  disbursementAllowed: false;
  allowedAction: "PRE_REVIEW_ONLY";
  contractGuardrail: "contracts block formal disbursement while gates fail";
  rawPdfPolicy: "raw PDF stays browser-local / off-chain";
  professionalReviewRequired: true;
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
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [handoffCopyState, setHandoffCopyState] = useState<"idle" | "copied" | "failed">("idle");

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

  const typedDataPreview: ReceivableCandidateTypedDataPreview = useMemo(() => ({
    domain: {
      name: "ChainTrace",
      version: "0.1",
      chainId: 0,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    primaryType: "ReceivableCandidate",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      ReceivableCandidate: [
        { name: "tradeId", type: "string" },
        { name: "documentHash", type: "bytes32" },
        { name: "candidateHash", type: "bytes32" },
        { name: "receivableAmount", type: "string" },
        { name: "requestedAdvance", type: "string" },
        { name: "blockerCode", type: "string" },
        { name: "disbursementAllowed", type: "bool" },
      ],
    },
    message: {
      tradeId: candidate.tradeId,
      documentHash: candidate.fileHash,
      candidateHash,
      receivableAmount: candidate.receivableAmount,
      requestedAdvance: candidate.requestedAdvance,
      blockerCode: candidate.blockerCode,
      disbursementAllowed: candidate.disbursementAllowed,
    },
    walletSignatureStatus: "not_requested",
    contractTarget: "LoanRequestRegistry.submitPreReviewRequest",
    registryPath: "LoanRequestRegistry.submitPreReviewRequest(evidencePackURI,evidencePackHash,readinessScore,blockerCode)",
    professionalReviewRequired: true,
    rawPdfPolicy: "raw PDF stays browser-local / off-chain",
  }), [candidate, candidateHash]);

  const typedDataJson = useMemo(() => JSON.stringify(typedDataPreview, null, 2), [typedDataPreview]);

  const signatureReceiptPreview: SignatureReceiptPreview = useMemo(() => ({
    signatureStatus: "preview_only",
    walletSignatureStatus: "not_requested",
    signerWallet: "0x0000000000000000000000000000000000000000_mock",
    typedDataDigest: candidateHash,
    candidateHash,
    documentHash: typedDataPreview.message.documentHash,
    signedAt: null,
    registryTarget: "LoanRequestRegistry.submitPreReviewRequest",
    allowedAction: "PRE_REVIEW_ONLY",
    professionalReviewRequired: true,
  }), [candidateHash, typedDataPreview.message.documentHash]);

  const registryHandoffPreview: RegistryHandoffPreview = useMemo(() => ({
    registryTarget: "LoanRequestRegistry.submitPreReviewRequest",
    method: "submitPreReviewRequest",
    tradeId: candidate.tradeId,
    evidencePackURI: `chaintrace://browser-local-preview/${candidate.tradeId}`,
    evidencePackHash: candidateHash,
    documentHash: candidate.fileHash,
    candidateHash,
    typedDataPrimaryType: typedDataPreview.primaryType,
    signatureStatus: signatureReceiptPreview.signatureStatus,
    blockerCode: candidate.blockerCode,
    disbursementAllowed: candidate.disbursementAllowed,
    allowedAction: "PRE_REVIEW_ONLY",
    contractGuardrail: "contracts block formal disbursement while gates fail",
    rawPdfPolicy: "raw PDF stays browser-local / off-chain",
    professionalReviewRequired: true,
  }), [candidate, candidateHash, signatureReceiptPreview.signatureStatus, typedDataPreview.primaryType]);

  const handoffJson = useMemo(() => JSON.stringify({
    signatureReceiptPreview,
    registryHandoffPreview,
  }, null, 2), [registryHandoffPreview, signatureReceiptPreview]);

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

  async function handleCopyTypedData() {
    try {
      await navigator.clipboard.writeText(typedDataJson);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  async function handleCopyHandoff() {
    try {
      await navigator.clipboard.writeText(handoffJson);
      setHandoffCopyState("copied");
    } catch {
      setHandoffCopyState("failed");
    }
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
            <a className="primary-button" href="#typed-data-preview">{t(zh, "预览签名载荷", "Preview signing payload")}</a>
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

      <section className="typed-data-preview" id="typed-data-preview">
        <div className="typed-data-header">
          <div>
            <span>{t(zh, "EIP-712 typed data preview", "EIP-712 typed data preview")}</span>
            <h3>{t(zh, "钱包会看到的结构化签名载荷。", "The structured signing payload a wallet would display.")}</h3>
            <p>
              {t(
                zh,
                "这里仅展示 typed data preview，不请求真实签名、不发交易、不连接 RPC。PDF 原文仍然留在浏览器/用户侧，专业审查仍然必需。",
                "This only shows a typed data preview. It does not request a real signature, send a transaction, or connect RPC. The raw PDF stays browser-local / off-chain, and professional review remains required.",
              )}
            </p>
          </div>
          <div className="typed-data-status">
            <strong>walletSignatureStatus=not_requested</strong>
            <span>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</span>
          </div>
        </div>

        <div className="typed-data-link-grid">
          <article>
            <span>{t(zh, "Document hash input", "Document hash input")}</span>
            <strong title={typedDataPreview.message.documentHash}>{shortHash(typedDataPreview.message.documentHash)}</strong>
            <p>{t(zh, "来自浏览器本地 SHA-256。", "Created by browser-local SHA-256.")}</p>
          </article>
          <article>
            <span>{t(zh, "Candidate hash input", "Candidate hash input")}</span>
            <strong title={typedDataPreview.message.candidateHash}>{shortHash(typedDataPreview.message.candidateHash)}</strong>
            <p>{t(zh, "绑定 ReceivableCandidate JSON。", "Binds the ReceivableCandidate JSON.")}</p>
          </article>
          <article>
            <span>{t(zh, "Contract target", "Contract target")}</span>
            <strong>{typedDataPreview.contractTarget}</strong>
            <p>{typedDataPreview.registryPath}</p>
          </article>
          <article>
            <span>{t(zh, "Review boundary", "Review boundary")}</span>
            <strong>professionalReviewRequired={String(typedDataPreview.professionalReviewRequired)}</strong>
            <p>{typedDataPreview.rawPdfPolicy}</p>
          </article>
        </div>

        <div className="typed-data-panels">
          <article>
            <span>Domain</span>
            <dl>
              <div><dt>name</dt><dd>{typedDataPreview.domain.name}</dd></div>
              <div><dt>version</dt><dd>{typedDataPreview.domain.version}</dd></div>
              <div><dt>chainId</dt><dd>{typedDataPreview.domain.chainId}</dd></div>
              <div><dt>verifyingContract</dt><dd>{typedDataPreview.domain.verifyingContract}</dd></div>
            </dl>
          </article>
          <article>
            <span>Types</span>
            <dl>
              {typedDataPreview.types.ReceivableCandidate.map((field) => (
                <div key={field.name}><dt>{field.name}</dt><dd>{field.type}</dd></div>
              ))}
            </dl>
          </article>
          <article>
            <span>Message</span>
            <dl>
              <div><dt>tradeId</dt><dd>{typedDataPreview.message.tradeId}</dd></div>
              <div><dt>documentHash</dt><dd>{shortHash(typedDataPreview.message.documentHash)}</dd></div>
              <div><dt>candidateHash</dt><dd>{shortHash(typedDataPreview.message.candidateHash)}</dd></div>
              <div><dt>blockerCode</dt><dd>{typedDataPreview.message.blockerCode}</dd></div>
              <div><dt>disbursementAllowed</dt><dd>{String(typedDataPreview.message.disbursementAllowed)}</dd></div>
            </dl>
          </article>
        </div>

        <div className="typed-data-json-header">
          <strong>{t(zh, "开发者 JSON", "Developer JSON")}</strong>
          <button type="button" className="secondary-button button-reset" onClick={handleCopyTypedData}>
            {copyState === "copied" ? t(zh, "已复制", "Copied") : copyState === "failed" ? t(zh, "复制失败", "Copy failed") : t(zh, "复制 JSON", "Copy JSON")}
          </button>
        </div>
        <pre className="candidate-json typed-data-json" aria-label="EIP-712 typed data preview JSON">{typedDataJson}</pre>
      </section>

      <section className="handoff-preview" id="registry-handoff-preview">
        <div className="typed-data-header">
          <div>
            <span>{t(zh, "Signature receipt preview", "Signature receipt preview")}</span>
            <h3>{t(zh, "签名后的回执和 registry handoff 仍然只是预览。", "The post-signature receipt and registry handoff remain preview-only.")}</h3>
            <p>
              {t(
                zh,
                "这里展示钱包确认之后会交给 LoanRequestRegistry 的对象形状，但不会请求真实签名、不会写链、不会连接 RPC，也不会声称贷款已批准。",
                "This shows the object shape that would be handed to LoanRequestRegistry after wallet review, but it does not request a real signature, write chain state, connect RPC, or claim approval.",
              )}
            </p>
          </div>
          <div className="typed-data-status">
            <strong>signatureStatus=preview_only</strong>
            <span>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</span>
          </div>
        </div>

        <div className="handoff-flow" aria-label="Signature receipt registry handoff flow">
          <article>
            <span>01</span>
            <strong>documentHash</strong>
            <p title={registryHandoffPreview.documentHash}>{shortHash(registryHandoffPreview.documentHash)}</p>
          </article>
          <article>
            <span>02</span>
            <strong>candidateHash</strong>
            <p title={registryHandoffPreview.candidateHash}>{shortHash(registryHandoffPreview.candidateHash)}</p>
          </article>
          <article>
            <span>03</span>
            <strong>typedData</strong>
            <p>{typedDataPreview.primaryType}</p>
          </article>
          <article>
            <span>04</span>
            <strong>signature receipt</strong>
            <p>{signatureReceiptPreview.signatureStatus}</p>
          </article>
          <article>
            <span>05</span>
            <strong>registry handoff</strong>
            <p>{registryHandoffPreview.registryTarget}</p>
          </article>
        </div>

        <div className="handoff-panels">
          <article>
            <span>{t(zh, "Mock receipt", "Mock receipt")}</span>
            <dl>
              <div><dt>signatureStatus</dt><dd>{signatureReceiptPreview.signatureStatus}</dd></div>
              <div><dt>walletSignatureStatus</dt><dd>{signatureReceiptPreview.walletSignatureStatus}</dd></div>
              <div><dt>signerWallet</dt><dd>{signatureReceiptPreview.signerWallet}</dd></div>
              <div><dt>typedDataDigest</dt><dd>{shortHash(signatureReceiptPreview.typedDataDigest)}</dd></div>
              <div><dt>signedAt</dt><dd>{String(signatureReceiptPreview.signedAt)}</dd></div>
            </dl>
          </article>
          <article>
            <span>{t(zh, "LoanRequestRegistry handoff preview", "LoanRequestRegistry handoff preview")}</span>
            <dl>
              <div><dt>registryTarget</dt><dd>{registryHandoffPreview.registryTarget}</dd></div>
              <div><dt>evidencePackURI</dt><dd>{registryHandoffPreview.evidencePackURI}</dd></div>
              <div><dt>evidencePackHash</dt><dd>{shortHash(registryHandoffPreview.evidencePackHash)}</dd></div>
              <div><dt>allowedAction</dt><dd>{registryHandoffPreview.allowedAction}</dd></div>
              <div><dt>contractGuardrail</dt><dd>{registryHandoffPreview.contractGuardrail}</dd></div>
            </dl>
          </article>
        </div>

        <div className="typed-data-json-header">
          <strong>{t(zh, "回执 / handoff JSON", "Receipt / handoff JSON")}</strong>
          <button type="button" className="secondary-button button-reset" onClick={handleCopyHandoff}>
            {handoffCopyState === "copied" ? t(zh, "已复制", "Copied") : handoffCopyState === "failed" ? t(zh, "复制失败", "Copy failed") : t(zh, "复制 JSON", "Copy JSON")}
          </button>
        </div>
        <pre className="candidate-json typed-data-json" aria-label="Signature receipt and registry handoff preview JSON">{handoffJson}</pre>
      </section>

      <pre className="candidate-json" aria-label="ReceivableCandidate JSON">{JSON.stringify(candidate, null, 2)}</pre>
    </section>
  );
}
