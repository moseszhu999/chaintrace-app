"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sha256File, shortHash } from "@/lib/hash";

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

const documentTypes: Array<{ value: EvidenceDocumentType; zh: string; en: string }> = [
  { value: "invoice", zh: "商业发票", en: "Commercial invoice" },
  { value: "purchase_order", zh: "采购订单 / 销售合同", en: "Purchase order / sales contract" },
  { value: "bill_of_lading", zh: "提单", en: "Bill of lading" },
  { value: "warehouse_receipt", zh: "仓库回执", en: "Warehouse receipt" },
  { value: "quality_report", zh: "质检报告", en: "Quality report" },
  { value: "buyer_acceptance", zh: "买家验收", en: "Buyer acceptance" },
];

const chainSteps = [
  "TradeSigningRegistry attestEvidenceHash",
  "LogisticsEvidenceRegistry attestEvidenceHash",
  "LoanRequestRegistry.submitPreReviewRequest",
  "RestrictedReceivableToken lockedUntilAllGatesPass",
];

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

async function sha256Text(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return `0x${Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <button type="button" className="secondary-button button-reset" onClick={copyValue}>
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}
    </button>
  );
}

export function ClientReceivableConverter({ zh }: { zh: boolean }) {
  const router = useRouter();
  const [documentType, setDocumentType] = useState<EvidenceDocumentType>("invoice");
  const [fileName, setFileName] = useState("Vietnam-coffee-invoice-demo.pdf");
  const [fileHash, setFileHash] = useState("0x7f5c9a4e2b18d42a8d0f9f1d4f9f93d3e98a2c4d6b71a0e6c2d44e7b8f0b1a63");
  const [candidateHash, setCandidateHash] = useState("0x91f3d4a6b2c88e24f3dd2a71bc4ec46ea7fbd61a9ac1bd522c36f9f7d2ed1a04");
  const [isHashing, setIsHashing] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState("");
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
    contractIntent: chainSteps,
  }), [documentType, fileHash, fileName]);

  const typedDataPreview = useMemo(() => ({
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
    professionalReviewRequired: true,
    rawPdfPolicy: "raw PDF stays browser-local / off-chain",
  }), [candidate, candidateHash]);

  const agentExtractionReceipt = useMemo(() => ({
    agentRunStatus: "preview_only",
    modelExecutionMode: "demo_fixture_no_llm_call",
    agentDecisionAuthority: "none",
    humanReviewRequired: true,
    professionalReviewRequired: true,
    tradeId: candidate.tradeId,
    documentHash: candidate.fileHash,
    candidateHash,
    fileName: candidate.fileName,
    documentType: candidate.documentType,
    extractedFields: [
      { label: "tradeRoute", value: "Vietnam -> Singapore", confidence: "high", source: "case metadata" },
      { label: "receivableAmount", value: candidate.receivableAmount, confidence: "high", source: "ReceivableCandidate" },
      { label: "requestedAdvance", value: candidate.requestedAdvance, confidence: "medium", source: "operator request draft" },
      { label: "blockedReceivable", value: "USD 36,960", confidence: "blocked", source: "gate evaluation requires missing evidence" },
    ],
    gateReasoningTrace: [
      { gate: "commercial authenticity", status: "pending", reason: "Buyer acceptance still needs operator verification.", nextAction: "Confirm buyer contact and claim." },
      { gate: "logistics evidence", status: "blocked", reason: "B/L, warehouse receipt, and QC evidence are incomplete.", nextAction: "Request missing evidence before review." },
      { gate: "contract disbursement gate", status: "blocked", reason: "GATES_NOT_PASSED keeps pre-review-only mode.", nextAction: "Do not convert until review and gates complete." },
    ],
    missingEvidenceSuggestions: [
      "Upload bill of lading hash proof",
      "Attach warehouse receipt and QC report",
      "Confirm buyer acceptance or dispute status",
      "Escalate material exceptions to professional review",
    ],
    draftNextActions: [
      "Draft buyer acceptance confirmation request",
      "Prepare financier memo with blocker rationale",
      "Route missing-document tasks to operator evidence inbox",
      "Keep wallet signing at preview-only until human approval",
    ],
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    walletSignatureStatus: "not_requested",
    signatureStatus: "preview_only",
    rawPdfPolicy: "raw PDF stays browser-local / off-chain",
  }), [candidate, candidateHash]);

  const signatureReceiptPreview = useMemo(() => ({
    signatureStatus: "preview_only",
    walletSignatureStatus: "not_requested",
    signerWallet: "0x0000000000000000000000000000000000000000_mock",
    typedDataDigest: candidateHash,
    candidateHash,
    documentHash: candidate.fileHash,
    signedAt: null,
    registryTarget: "LoanRequestRegistry.submitPreReviewRequest",
    allowedAction: "PRE_REVIEW_ONLY",
    professionalReviewRequired: true,
  }), [candidate.fileHash, candidateHash]);

  const registryHandoffPreview = useMemo(() => ({
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

  const preReviewTrustPack = useMemo(() => ({
    packVersion: "pre-review-trust-pack.v0.1",
    professionalHandoffStatus: "preview_only",
    professionalHandoffAudience: ["bank pre-review desk", "law firm", "factor", "trade finance operator"],
    tradeId: candidate.tradeId,
    tradeValue: "USD 52,800",
    blockedReceivable: candidate.receivableAmount,
    requestedAdvance: candidate.requestedAdvance,
    readinessScore: 62,
    gatesPassed: "6/12",
    documentHash: candidate.fileHash,
    agentExtractionReceiptId: `agentExtractionReceipt:${shortHash(candidate.fileHash)}:${shortHash(candidateHash)}`,
    candidateHash,
    typedDataSummary: {
      primaryType: typedDataPreview.primaryType,
      walletSignatureStatus: "not_requested",
      verifyingContract: typedDataPreview.domain.verifyingContract,
    },
    signatureStatus: "preview_only",
    registryTarget: registryHandoffPreview.registryTarget,
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    humanReviewRequired: true,
    professionalReviewRequired: true,
    rawPdfPolicy: "raw PDF stays browser-local / off-chain",
    missingEvidence: agentExtractionReceipt.missingEvidenceSuggestions,
    recommendedNextActions: [
      ...agentExtractionReceipt.draftNextActions,
      "professional review required before any formal financing action",
    ],
    handoffPath: ["PDF stays browser-local", "AI extraction preview", "gate reasoning", "typed data", "signature receipt", "registry handoff", "Pre-review Trust Pack preview"],
    boundaryNotes: [
      "This preview pack is not a legal opinion and not a credit approval.",
      "It does not replace underwriting, compliance, KYC, legal structure, or dispute assessment.",
      "Pre-review only / GATES_NOT_PASSED / disbursementAllowed=false.",
    ],
  }), [agentExtractionReceipt.draftNextActions, agentExtractionReceipt.missingEvidenceSuggestions, candidate, candidateHash, registryHandoffPreview.registryTarget, typedDataPreview.domain.verifyingContract, typedDataPreview.primaryType]);

  const professionalReviewIntake = useMemo(() => ({
    intakeVersion: "professional-review-intake.v0.1",
    intakeStatus: "draft_preview",
    source: "public_converter",
    tradeId: preReviewTrustPack.tradeId,
    candidateHash: preReviewTrustPack.candidateHash,
    trustPackReference: `preReviewTrustPack:${shortHash(preReviewTrustPack.documentHash)}:${shortHash(preReviewTrustPack.candidateHash)}`,
    readinessScore: 62,
    gatesPassed: "6/12",
    blockerCode: "GATES_NOT_PASSED",
    disbursementAllowed: false,
    reviewQueues: [
      { queue: "bank pre-review desk", required: true, reason: "Validate advance request and credit policy before any formal action." },
      { queue: "legal exception review", required: true, reason: "Check contract enforceability, buyer acceptance, and dispute status." },
      { queue: "factor operations review", required: true, reason: "Confirm logistics evidence, warehouse/QC gaps, and follow-up tasks." },
      { queue: "operator evidence desk", required: true, reason: "Collect missing documents and decide whether to start Operator OS intake." },
    ],
    bankReviewRequired: true,
    legalReviewRequired: true,
    factorReviewRequired: true,
    operatorDecisionRequired: true,
    missingEvidence: preReviewTrustPack.missingEvidence,
    recommendedNextActions: [
      ...preReviewTrustPack.recommendedNextActions,
      "Open Operator OS after login only if a human chooses to start professional intake.",
      "Keep this intake as draft_preview until data is submitted by an authenticated operator.",
    ],
    targetOperatorSurfaces: ["/dashboard", "/business-professional-review"],
    allowedAction: "PROFESSIONAL_REVIEW_INTAKE_ONLY",
    humanReviewRequired: true,
    professionalReviewRequired: true,
    agentDecisionAuthority: "none",
    walletSignatureStatus: "not_requested",
    signatureStatus: "preview_only",
    rawPdfPolicy: "raw PDF stays browser-local / off-chain",
    intakeBoundaryNotes: [
      "This professionalReviewIntake is a draft preview and has not been submitted.",
      "No backend persistence, reviewer assignment, email, notification, PDF upload, model call, wallet signing, transaction, RPC, secret, or key handling occurs here.",
      "It is not a legal opinion, not a credit approval, and not a regulated lending action.",
      "Allowed action is PROFESSIONAL_REVIEW_INTAKE_ONLY while GATES_NOT_PASSED and disbursementAllowed=false.",
    ],
  }), [preReviewTrustPack]);

  const typedDataJson = useMemo(() => JSON.stringify(typedDataPreview, null, 2), [typedDataPreview]);
  const agentJson = useMemo(() => JSON.stringify(agentExtractionReceipt, null, 2), [agentExtractionReceipt]);
  const handoffJson = useMemo(() => JSON.stringify({ signatureReceiptPreview, registryHandoffPreview }, null, 2), [registryHandoffPreview, signatureReceiptPreview]);
  const trustPackJson = useMemo(() => JSON.stringify(preReviewTrustPack, null, 2), [preReviewTrustPack]);
  const intakeJson = useMemo(() => JSON.stringify(professionalReviewIntake, null, 2), [professionalReviewIntake]);

  async function refreshCandidateHash(nextCandidate: ReceivableCandidate) {
    setCandidateHash(await sha256Text(JSON.stringify(nextCandidate, Object.keys(nextCandidate).sort())));
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
      const nextCandidate = { ...candidate, fileName: file.name, fileHash: nextHash };
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
    setDocumentType(nextType);
    await refreshCandidateHash({ ...candidate, documentType: nextType });
  }

  async function createPreReviewCase() {
    setError("");
    setIsCreatingCase(true);
    setCreatedCaseId("");

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-chaintrace-role": "sme_user" },
        body: JSON.stringify({
          source: "public_converter",
          candidateHash,
          documentHash: candidate.fileHash,
          fileName: candidate.fileName,
          documentType: candidate.documentType,
          documentNo: `${candidate.documentType.toUpperCase()}-${shortHash(candidate.fileHash).replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
          titleZh: "公开转换器预审 Case",
          titleEn: "Public converter pre-review case",
          totalAmount: "USD 52,800",
          receivableAmount: candidate.receivableAmount,
          requestedAdvance: candidate.requestedAdvance,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message ?? "Could not create pre-review case.");
      const caseId = json.data?.caseId ?? json.caseId;
      if (!caseId) throw new Error("Case creation response did not include caseId.");
      setCreatedCaseId(caseId);
      router.push(`/cases/${caseId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(zh, "无法创建预审 Case。", "Could not create pre-review case."));
    } finally {
      setIsCreatingCase(false);
    }
  }

  return (
    <section className="panel receivable-converter" id="pdf-to-receivable">
      <div className="converter-grid">
        <div>
          <div className="section-heading">
            <span>{t(zh, "PDF → 链上应收账款候选", "PDF → on-chain receivable candidate")}</span>
            <h2>{t(zh, "把跨境贸易 PDF 变成预审应收账款候选。", "Turn a cross-border trade PDF into a pre-review receivable candidate.")}</h2>
            <p>{t(zh, "PDF 原文留在浏览器/用户侧。ChainTrace 计算 SHA-256 并展示 AI/crypto/professional intake 预览；gate 不通过时仍然阻断正式放款。", "The raw PDF stays in the browser/user side. ChainTrace calculates SHA-256 and shows AI/crypto/professional intake previews; formal disbursement remains blocked while gates fail.")}</p>
          </div>

          <label>{t(zh, "选择贸易 PDF", "Select trade PDF")}<input type="file" accept="application/pdf" onChange={handleFileChange} /></label>
          <label>{t(zh, "单证类型", "Document type")}<select value={documentType} onChange={handleTypeChange}>{documentTypes.map((item) => <option value={item.value} key={item.value}>{t(zh, item.zh, item.en)}</option>)}</select></label>
          {isHashing && <div className="notice">{t(zh, "正在浏览器本地计算 PDF 哈希...", "Calculating the PDF hash locally in the browser...")}</div>}
          {error && <div className="error">{error}</div>}
          <div className="converter-actions">
            <a className="primary-button" href="#ai-native-preview">{t(zh, "预览 AI 证据推理", "Preview AI evidence reasoning")}</a>
            <a className="secondary-button" href="#typed-data-preview">{t(zh, "预览签名载荷", "Preview signing payload")}</a>
            <a className="secondary-button" href="#professional-review-intake-preview">{t(zh, "预览专业审核入口", "Preview professional intake")}</a>
            <button className="primary-button button-reset" type="button" onClick={createPreReviewCase} disabled={isCreatingCase}>
              {isCreatingCase ? t(zh, "正在创建...", "Creating...") : "Create pre-review case"}
            </button>
            <a className="secondary-button" href="/login">{t(zh, "登录查看链上状态机", "Login to view on-chain state machine")}</a>
          </div>
          <p className="proof-note">
            candidate preview remains visible before case creation · metadata-and-hash-only · raw PDF stays browser-local / off-chain
          </p>
          {createdCaseId && <div className="notice">{t(zh, "已创建预审 Case：", "Created pre-review case: ")}{createdCaseId}</div>}
        </div>

        <div className="converter-board">
          <div className="converter-status-row"><span>{t(zh, "候选状态", "Candidate status")}</span><strong>Pre-review only</strong></div>
          <dl className="converter-facts">
            <div><dt>tradeId</dt><dd>{candidate.tradeId}</dd></div>
            <div><dt>{t(zh, "文件", "File")}</dt><dd>{fileName}</dd></div>
            <div><dt>{t(zh, "文件哈希", "File hash")}</dt><dd title={fileHash}>{shortHash(fileHash)}</dd></div>
            <div><dt>{t(zh, "候选哈希", "Candidate hash")}</dt><dd title={candidateHash}>{shortHash(candidateHash)}</dd></div>
            <div><dt>{t(zh, "应收账款", "Receivable")}</dt><dd>USD 36,960</dd></div>
            <div><dt>{t(zh, "申请垫款", "Advance")}</dt><dd>USDC 29,500</dd></div>
          </dl>
          <div className="signal-status-box converter-blocker"><span>{t(zh, "合规阻断", "Compliance blocker")}</span><strong>GATES_NOT_PASSED</strong><p>disbursementAllowed=false</p></div>
        </div>
      </div>

      <div className="converter-chain">{chainSteps.map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></article>)}</div>

      <section className="ai-native-preview" id="ai-native-preview">
        <div className="typed-data-header"><div><span>AI-native evidence extraction preview</span><h3>{t(zh, "Agent 只做抽取、推理和催办草稿，不做批准。", "The agent only extracts, reasons, and drafts follow-ups; it does not approve.")}</h3><p>{t(zh, "这里是确定性的 demo fixture，不调用真实模型、不上传 PDF、不使用 API key。", "This is a deterministic demo fixture with no model call, no PDF upload, and no API key.")}</p></div><div className="typed-data-status ai-boundary-status"><strong>agentDecisionAuthority=none</strong><span>humanReviewRequired=true · professionalReviewRequired=true</span><span>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</span></div></div>
        <div className="ai-flow">{["documentHash", "AI extraction", "gate reasoning", "candidateHash", "typedData", "registry handoff"].map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong><p>{index === 0 ? shortHash(fileHash) : index === 3 ? shortHash(candidateHash) : index === 5 ? registryHandoffPreview.allowedAction : "preview_only"}</p></article>)}</div>
        <div className="ai-panels"><article><span>Extracted fields</span><dl>{agentExtractionReceipt.extractedFields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd><strong>{field.value}</strong><small>{field.confidence} · {field.source}</small></dd></div>)}</dl></article><article><span>Gate reasoning trace</span><dl>{agentExtractionReceipt.gateReasoningTrace.map((item) => <div key={item.gate}><dt>{item.gate}</dt><dd><strong>{item.status}</strong><small>{item.reason}</small><small>{item.nextAction}</small></dd></div>)}</dl></article><article><span>Missing evidence suggestions</span><ul>{agentExtractionReceipt.missingEvidenceSuggestions.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>Draft next actions</span><ul>{agentExtractionReceipt.draftNextActions.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
        <div className="typed-data-json-header"><strong>Agent extraction receipt JSON</strong><CopyButton label="Copy JSON" value={agentJson} /></div><pre className="candidate-json typed-data-json">{agentJson}</pre>
      </section>

      <section className="typed-data-preview" id="typed-data-preview">
        <div className="typed-data-header"><div><span>EIP-712 typed data preview</span><h3>{t(zh, "钱包会看到的结构化签名载荷。", "The structured signing payload a wallet would display.")}</h3><p>{t(zh, "这里只展示 typed data preview，不请求真实签名、不发交易、不连接 RPC。", "This only shows a typed data preview. It does not request a real signature, write a transaction, or connect RPC.")}</p></div><div className="typed-data-status"><strong>walletSignatureStatus=not_requested</strong><span>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</span></div></div>
        <div className="typed-data-link-grid"><article><span>Document hash input</span><strong>{shortHash(fileHash)}</strong><p>browser-local SHA-256</p></article><article><span>Candidate hash input</span><strong>{shortHash(candidateHash)}</strong><p>ReceivableCandidate JSON</p></article><article><span>Contract target</span><strong>LoanRequestRegistry.submitPreReviewRequest</strong><p>professionalReviewRequired=true</p></article><article><span>Review boundary</span><strong>raw PDF stays browser-local / off-chain</strong><p>{String(typedDataPreview.professionalReviewRequired)}</p></article></div>
        <div className="typed-data-panels"><article><span>Domain</span><dl><div><dt>name</dt><dd>{typedDataPreview.domain.name}</dd></div><div><dt>verifyingContract</dt><dd>{typedDataPreview.domain.verifyingContract}</dd></div></dl></article><article><span>Types</span><dl>{typedDataPreview.types.ReceivableCandidate.map((field) => <div key={field.name}><dt>{field.name}</dt><dd>{field.type}</dd></div>)}</dl></article><article><span>Message</span><dl><div><dt>documentHash</dt><dd>{shortHash(fileHash)}</dd></div><div><dt>candidateHash</dt><dd>{shortHash(candidateHash)}</dd></div><div><dt>disbursementAllowed</dt><dd>false</dd></div></dl></article></div>
        <div className="typed-data-json-header"><strong>Developer JSON</strong><CopyButton label="Copy JSON" value={typedDataJson} /></div><pre className="candidate-json typed-data-json">{typedDataJson}</pre>
      </section>

      <section className="handoff-preview" id="registry-handoff-preview">
        <div className="typed-data-header"><div><span>Signature receipt preview</span><h3>{t(zh, "签名后的回执和 registry handoff 仍然只是预览。", "The post-signature receipt and registry handoff remain preview-only.")}</h3><p>{t(zh, "展示对象形状，不请求真实签名、不写链、不连接 RPC。", "Shows object shape only; no real signature request, chain write, or RPC connection.")}</p></div><div className="typed-data-status"><strong>signatureStatus=preview_only</strong><span>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</span></div></div>
        <div className="handoff-flow">{["documentHash", "candidateHash", "typedData", "signature receipt", "registry handoff"].map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong><p>{index === 4 ? registryHandoffPreview.registryTarget : "preview_only"}</p></article>)}</div>
        <div className="handoff-panels"><article><span>Mock receipt</span><dl><div><dt>signatureStatus</dt><dd>{signatureReceiptPreview.signatureStatus}</dd></div><div><dt>walletSignatureStatus</dt><dd>{signatureReceiptPreview.walletSignatureStatus}</dd></div><div><dt>signerWallet</dt><dd>{signatureReceiptPreview.signerWallet}</dd></div><div><dt>signedAt</dt><dd>{String(signatureReceiptPreview.signedAt)}</dd></div></dl></article><article><span>LoanRequestRegistry handoff preview</span><dl><div><dt>registryTarget</dt><dd>{registryHandoffPreview.registryTarget}</dd></div><div><dt>evidencePackHash</dt><dd>{shortHash(registryHandoffPreview.evidencePackHash)}</dd></div><div><dt>allowedAction</dt><dd>{registryHandoffPreview.allowedAction}</dd></div><div><dt>contractGuardrail</dt><dd>{registryHandoffPreview.contractGuardrail}</dd></div></dl></article></div>
        <div className="typed-data-json-header"><strong>Receipt / handoff JSON</strong><CopyButton label="Copy JSON" value={handoffJson} /></div><pre className="candidate-json typed-data-json">{handoffJson}</pre>
      </section>

      <section className="trust-pack-preview" id="pre-review-trust-pack-preview">
        <div className="typed-data-header"><div><span>Pre-review Trust Pack preview</span><h3>{t(zh, "把 AI 证据推理和 crypto proof handoff 打包给专业机构。", "Package AI evidence reasoning and crypto proof handoff for professional review.")}</h3><p>{t(zh, "Trust Pack 不是正式批准、not a legal opinion、not a credit approval。", "The Trust Pack is not a formal approval, not a legal opinion, and not a credit approval.")}</p></div><div className="typed-data-status trust-pack-status"><strong>professionalHandoffStatus={preReviewTrustPack.professionalHandoffStatus}</strong><span>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</span><span>professional review required before any formal financing action</span></div></div>
        <div className="trust-pack-card"><div><span>Professional handoff</span><strong>{preReviewTrustPack.tradeId}</strong><p>raw PDF stays browser-local / off-chain</p></div><dl><div><dt>tradeValue</dt><dd>{preReviewTrustPack.tradeValue}</dd></div><div><dt>blockedReceivable</dt><dd>{preReviewTrustPack.blockedReceivable}</dd></div><div><dt>requestedAdvance</dt><dd>{preReviewTrustPack.requestedAdvance}</dd></div><div><dt>readinessScore</dt><dd>{preReviewTrustPack.readinessScore}/100</dd></div><div><dt>gatesPassed</dt><dd>{preReviewTrustPack.gatesPassed}</dd></div></dl></div>
        <div className="trust-pack-flow">{preReviewTrustPack.handoffPath.map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></article>)}</div>
        <div className="trust-pack-panels"><article><span>AI / crypto summary</span><dl><div><dt>typedDataSummary</dt><dd>{preReviewTrustPack.typedDataSummary.primaryType}</dd></div><div><dt>signatureStatus</dt><dd>{preReviewTrustPack.signatureStatus}</dd></div><div><dt>registryTarget</dt><dd>{preReviewTrustPack.registryTarget}</dd></div></dl></article><article><span>Professional review queue</span><ul>{preReviewTrustPack.missingEvidence.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>Recommended next actions</span><ul>{preReviewTrustPack.recommendedNextActions.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>Decision boundary</span><ul>{preReviewTrustPack.boundaryNotes.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
        <div className="typed-data-json-header"><strong>Trust Pack JSON</strong><CopyButton label="Copy JSON" value={trustPackJson} /></div><pre className="candidate-json typed-data-json">{trustPackJson}</pre>
      </section>

      <section className="trust-pack-preview" id="professional-review-intake-preview">
        <div className="typed-data-header"><div><span>Professional Review Intake preview</span><h3>{t(zh, "把 Trust Pack 转成 Operator OS 的专业预审入口草稿。", "Turn the Trust Pack into a draft professional intake for Operator OS.")}</h3><p>{t(zh, "这里只展示 intake 对象形状；不会提交、不会保存、不会通知 reviewer。", "This only shows the intake object shape; it does not submit, persist, or notify reviewers.")}</p></div><div className="typed-data-status trust-pack-status"><strong>intakeStatus=draft_preview</strong><span>allowedAction=PROFESSIONAL_REVIEW_INTAKE_ONLY</span><span>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</span></div></div>
        <div className="trust-pack-card"><div><span>Operator OS handoff preview</span><strong>{professionalReviewIntake.tradeId}</strong><p>Open Operator OS after login. This professionalReviewIntake has not been submitted.</p></div><dl><div><dt>source</dt><dd>{professionalReviewIntake.source}</dd></div><div><dt>intakeVersion</dt><dd>{professionalReviewIntake.intakeVersion}</dd></div><div><dt>trustPackReference</dt><dd>{professionalReviewIntake.trustPackReference}</dd></div><div><dt>targetOperatorSurfaces</dt><dd>{professionalReviewIntake.targetOperatorSurfaces.join(" + ")}</dd></div></dl></div>
        <div className="trust-pack-flow">{["Pre-review Trust Pack", "Professional Review Intake draft_preview", "Bank / legal / factor / operator queues", "Operator OS queue handoff preview", "Human decision before any formal action"].map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></article>)}</div>
        <div className="trust-pack-panels"><article><span>Review queues</span><dl>{professionalReviewIntake.reviewQueues.map((queue) => <div key={queue.queue}><dt>{queue.queue}</dt><dd><strong>required={String(queue.required)}</strong><small>{queue.reason}</small></dd></div>)}</dl></article><article><span>Intake requirements</span><dl><div><dt>bankReviewRequired</dt><dd>{String(professionalReviewIntake.bankReviewRequired)}</dd></div><div><dt>legalReviewRequired</dt><dd>{String(professionalReviewIntake.legalReviewRequired)}</dd></div><div><dt>factorReviewRequired</dt><dd>{String(professionalReviewIntake.factorReviewRequired)}</dd></div><div><dt>operatorDecisionRequired</dt><dd>{String(professionalReviewIntake.operatorDecisionRequired)}</dd></div></dl></article><article><span>Missing evidence</span><ul>{professionalReviewIntake.missingEvidence.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>Intake boundary</span><ul>{professionalReviewIntake.intakeBoundaryNotes.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
        <div className="converter-actions"><a className="primary-button" href="/login">Open Operator OS after login</a><a className="secondary-button" href="#pre-review-trust-pack-preview">Back to Trust Pack</a></div>
        <div className="typed-data-json-header"><strong>Professional Review Intake JSON</strong><CopyButton label="Copy JSON" value={intakeJson} /></div><pre className="candidate-json typed-data-json">{intakeJson}</pre>
      </section>

      <pre className="candidate-json" aria-label="ReceivableCandidate JSON">{JSON.stringify(candidate, null, 2)}</pre>
    </section>
  );
}
