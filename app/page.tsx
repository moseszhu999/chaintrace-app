"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { getChainExplorerTxUrl, isProofRegistryConfigured, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { sha256File, shortHash } from "@/lib/hash";
import { dictionary, type Locale, normalizeLocale } from "@/lib/i18n";
import { waitForProofRegistered } from "@/lib/publicChain";
import type { ProofDraft, ProofType } from "@/lib/types";
import { connectWallet, getConnectedAccount, hasInjectedWallet, registerProofOnChain, switchToEthereumSepolia } from "@/lib/wallet";

const proofTypes: { value: ProofType; description: string }[] = [
  { value: "order", description: "Prove a purchase order, sales contract, or receivable basis document." },
  { value: "product", description: "Prove product origin, batch, or authenticity." },
  { value: "shipment", description: "Prove shipping or logistics evidence." },
  { value: "invoice", description: "Prove an invoice existed at a specific time." },
  { value: "inspection", description: "Prove quality inspection evidence." },
  { value: "delivery", description: "Prove goods were delivered." },
  { value: "acceptance", description: "Prove buyer acceptance or confirmation." },
];

const receivableProofTypes: ProofType[] = ["order", "invoice", "shipment", "inspection", "delivery", "acceptance"];

type SaveProofResponse = { item?: { id?: string } };

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )chaintrace_locale=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}

function getReadableError(error: unknown, locale: Locale): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes("insufficient funds")) {
    return locale === "zh-CN"
      ? "SepoliaETH 不足，无法支付 gas。请补充一点 Ethereum Sepolia 测试币后再点击链上锚定。"
      : "Insufficient SepoliaETH for gas. Add a little more Ethereum Sepolia test ETH to this wallet, then try Anchor proof again.";
  }
  if (message.toLowerCase().includes("user rejected") || message.includes("4001")) {
    return locale === "zh-CN" ? "钱包中已拒绝交易。" : "Transaction rejected in wallet.";
  }
  return message || (locale === "zh-CN" ? "链上锚定失败。" : "Failed to anchor proof on-chain.");
}

function buildDemoProofUrl(proofDraft: ProofDraft): string {
  const params = new URLSearchParams({
    hash: proofDraft.fileHash,
    type: proofDraft.proofType,
    title: proofDraft.title,
    business: proofDraft.businessName,
    batch: proofDraft.batchId,
    file: proofDraft.fileName,
    created: proofDraft.createdAt,
  });
  return `/demo-proof?${params.toString()}`;
}

async function saveProofMetadata(payload: Record<string, unknown>): Promise<SaveProofResponse> {
  const response = await fetch("/api/proofs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to save proof metadata.");
  }
  return response.json();
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [proofType, setProofType] = useState<ProofType>("order");
  const [title, setTitle] = useState("Coffee Export Order Proof");
  const [businessName, setBusinessName] = useState("Example Small Exporter");
  const [batchId, setBatchId] = useState("COFFEE-VN-2026-0001");
  const [note, setNote] = useState("This proof anchors an evidence file hash for a trade order or receivable evidence item. The original file can be verified later by recalculating its SHA-256 hash.");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileHash, setFileHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | "">("");
  const [chainStatus, setChainStatus] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | "">("");
  const [proofId, setProofId] = useState<bigint | null>(null);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isSavingDemo, setIsSavingDemo] = useState(false);

  const t = dictionary[locale].home;
  const common = dictionary[locale].app;
  const proofTypeText = dictionary[locale].proofTypes;
  const zh = locale === "zh-CN";

  const proofTemplates = useMemo<Record<ProofType, { title: string; note: string }>>(
    () => ({
      order: { title: zh ? "咖啡出口订单证明" : "Coffee Export Order Proof", note: zh ? "该证明用于锚定订单、销售合同或应收账款基础文件的哈希。后续可用同一个批次 / 订单号补齐发票、发货、质检、交付和验收证据。" : "This proof anchors the hash of a purchase order, sales contract, or receivable basis document. Use the same batch / order ID to add invoice, shipment, inspection, delivery, and acceptance evidence next." },
      product: { title: zh ? "产品批次真实性证明" : "Product Batch Authenticity Proof", note: zh ? "该证明用于锚定产品批次、产地或真实性证据。产品证明可增强企业档案，但不计入应收账款证明包的六个必需槽位。" : "This proof anchors product batch, origin, or authenticity evidence. Product proof enriches the business passport, but it is not one of the six required receivable pack slots." },
      shipment: { title: zh ? "发货与物流证明" : "Shipment and Logistics Proof", note: zh ? "该证明用于锚定发货单、运单、承运交接或物流记录。它是应收账款证明包的必需证据之一。" : "This proof anchors a shipping note, waybill, carrier handoff, or logistics record. It is one required slot in the receivable proof pack." },
      invoice: { title: zh ? "发票存在性证明" : "Invoice Existence Proof", note: zh ? "该证明用于锚定发票文件哈希和公开元数据，证明发票在某个时间点已经存在。" : "This proof anchors the invoice file hash and public metadata, proving that the invoice existed at a specific time." },
      inspection: { title: zh ? "质检报告证明" : "Quality Inspection Proof", note: zh ? "该证明用于锚定质检报告、验货记录或测试结果，降低买家和资金方对货物质量的不确定性。" : "This proof anchors an inspection report, QC record, or test result, reducing uncertainty for buyers and financiers." },
      delivery: { title: zh ? "交付或入库回执证明" : "Delivery Receipt Proof", note: zh ? "该证明用于锚定交付回执、入库回执或 POD 交付证明，说明货物已经完成交付环节。" : "This proof anchors a delivery receipt, warehouse receipt, or proof of delivery, showing that the delivery step is complete." },
      acceptance: { title: zh ? "买家验收证明" : "Buyer Acceptance Proof", note: zh ? "该证明用于锚定买家验收、确认记录或签收审批。缺少验收时，应收账款证明包通常不应显示 Ready。" : "This proof anchors buyer acceptance, confirmation, or signed approval. Without acceptance evidence, the receivable pack should usually remain Missing evidence." },
    }),
    [zh]
  );

  useEffect(() => { setLocale(getCookieLocale()); }, []);
  useEffect(() => { if (!fileHash) { const template = proofTemplates[proofType]; setTitle(template.title); setNote(template.note); } }, [fileHash, proofTemplates, proofType]);
  useEffect(() => {
    let cancelled = false;
    async function detectWallet() {
      if (!hasInjectedWallet()) return;
      const account = await getConnectedAccount();
      if (!cancelled && account) { setWalletAddress(account); setChainStatus(zh ? "钱包已连接。" : "Wallet already connected."); }
    }
    detectWallet().catch(() => undefined);
    return () => { cancelled = true; };
  }, [zh]);

  const selectedProofType = useMemo(() => proofTypes.find((item) => item.value === proofType), [proofType]);
  const proofDraft: ProofDraft | null = useMemo(() => {
    if (!fileHash) return null;
    return { proofType, title, businessName, batchId, fileName, fileSize, fileHash, note, createdAt: new Date().toISOString() };
  }, [batchId, businessName, fileHash, fileName, fileSize, note, proofType, title]);

  const shareableProofUrl = proofId === null ? "" : `/proof/${proofId.toString()}`;
  const demoProofUrl = proofDraft ? buildDemoProofUrl(proofDraft) : "";
  const passportUrl = `/passport/${encodeURIComponent(businessName)}`;
  const currentPackPosition = receivableProofTypes.indexOf(proofType);
  const isReceivablePackSlot = currentPackPosition >= 0;

  const storyCards = [
    { title: zh ? "把文件变成可信信号" : "Turn files into trust signals", text: zh ? "订单、发票、物流单、质检报告，不再只是散落在微信、邮箱和 ERP 里的附件。" : "Orders, invoices, shipping records, and QC reports stop being scattered attachments in WeChat, email, or ERP." },
    { title: zh ? "把六类证据装进一个证明包" : "Assemble six evidence types into one pack", text: zh ? "围绕同一个批次 / 订单号自动聚合，清楚告诉别人 Ready 还是 Missing evidence。" : "Group everything around the same batch / order ID and clearly show Ready or Missing evidence." },
    { title: zh ? "把企业变成可分享的可信档案" : "Turn the business into a shareable passport", text: zh ? "买家、资金方、审计方、合作 AI Agent 都能通过链接或二维码查看。" : "Buyers, financiers, auditors, and AI agents can review it through a link or QR code." },
  ];
  const audienceCards = [
    { label: zh ? "小出口商 / 小贸易商" : "Small exporters / traders", text: zh ? "不需要重系统，先把关键贸易事实做成可信证明页。" : "No heavyweight system required. Start by turning core trade facts into trust pages." },
    { label: zh ? "买家 / 采购方" : "Buyers / procurement teams", text: zh ? "快速判断是不是还缺发票、质检或验收。" : "Quickly see whether invoice, inspection, or acceptance evidence is still missing." },
    { label: zh ? "资金方 / 风控团队" : "Financiers / risk teams", text: zh ? "先看证据完整度，再决定要不要进入更深的风控流程。" : "Check evidence completeness first, then decide whether to move into deeper risk review." },
    { label: zh ? "AI Agent" : "AI agents", text: zh ? "让 Agent 协作基于可验证事实，而不是基于口头描述和碎片消息。" : "Let agents coordinate on verifiable facts instead of fragmented chats and claims." },
  ];

  function handleProofTypeChange(nextProofType: ProofType) { setProofType(nextProofType); setTitle(proofTemplates[nextProofType].title); setNote(proofTemplates[nextProofType].note); }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(""); setTxHash(""); setProofId(null);
    if (!file) return;
    try { setIsHashing(true); setFileName(file.name); setFileSize(file.size); setFileHash(await sha256File(file)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : zh ? "文件哈希计算失败。" : "Failed to calculate file hash."); }
    finally { setIsHashing(false); }
  }

  async function handleConnectWallet() {
    setError(""); setChainStatus(zh ? "正在打开 MetaMask 连接请求..." : "Opening MetaMask connection request...");
    if (!hasInjectedWallet()) { setChainStatus(""); setError(zh ? "没有检测到钱包插件。请使用安装 MetaMask 的浏览器打开，或在移动端使用 MetaMask 内置浏览器。" : "No injected wallet detected. Open this page in a browser with MetaMask installed, or use the MetaMask in-app browser on mobile."); return; }
    try { const account = await connectWallet(); setWalletAddress(account); setChainStatus(zh ? "钱包已连接。" : "Wallet connected."); }
    catch (caught) { setChainStatus(""); setError(getReadableError(caught, locale)); }
  }

  async function handleCreateDemoProof() {
    setError("");
    if (!proofDraft) { setError(zh ? "请先生成文件哈希，再创建 Demo Proof。" : "Generate a file hash before creating a demo proof."); return; }
    const demoUrl = buildDemoProofUrl(proofDraft);
    try {
      setIsSavingDemo(true); setChainStatus(zh ? "正在保存 Demo Proof 元数据..." : "Saving demo proof metadata...");
      const result = await saveProofMetadata({ proofMode: "demo", proofType: proofDraft.proofType, title: proofDraft.title, businessName: proofDraft.businessName, batchId: proofDraft.batchId, fileName: proofDraft.fileName, fileHash: proofDraft.fileHash, note: proofDraft.note, walletAddress: walletAddress || null, demoUrl });
      window.location.href = result.item?.id ? `/proof-index/${result.item.id}` : demoUrl;
    } catch (caught) { setError(caught instanceof Error ? caught.message : zh ? "保存 Demo Proof 元数据失败。" : "Failed to save demo proof metadata."); setChainStatus(""); }
    finally { setIsSavingDemo(false); }
  }

  async function handleAnchorProof() {
    setError(""); setChainStatus(""); setTxHash(""); setProofId(null);
    if (!proofDraft) { setError(zh ? "请先生成文件哈希，再进行链上锚定。" : "Generate a file hash before anchoring a proof."); return; }
    if (!walletAddress) { setError(zh ? "请先连接钱包。" : "Connect your wallet first."); return; }
    if (!proofRegistryAddress || !isProofRegistryConfigured()) { setError(zh ? "ProofRegistry 合约地址尚未配置。" : "ProofRegistry contract address is not configured."); return; }
    try {
      setIsAnchoring(true); setChainStatus(zh ? "正在切换到 Ethereum Sepolia..." : "Switching to Ethereum Sepolia..."); await switchToEthereumSepolia();
      setChainStatus(zh ? "等待钱包确认..." : "Waiting for wallet confirmation...");
      const hash = await registerProofOnChain({ account: walletAddress, contractAddress: proofRegistryAddress, fileHash: proofDraft.fileHash as `0x${string}`, proofType: proofDraft.proofType, uri: "" });
      setTxHash(hash); setChainStatus(zh ? "交易已提交，等待确认..." : "Transaction submitted. Waiting for confirmation...");
      const event = await waitForProofRegistered(hash); setProofId(event.proofId);
      await saveProofMetadata({ proofMode: "onchain", proofType: proofDraft.proofType, title: proofDraft.title, businessName: proofDraft.businessName, batchId: proofDraft.batchId, fileName: proofDraft.fileName, fileHash: proofDraft.fileHash, note: proofDraft.note, walletAddress, chainId: 11155111, contractAddress: proofRegistryAddress, transactionHash: hash, onchainProofId: event.proofId.toString() });
      setChainStatus(zh ? `证明已确认并写入索引。Proof ID：${event.proofId.toString()}。` : `Proof confirmed and indexed. Shareable proof ID: ${event.proofId.toString()}.`);
    } catch (caught) { setError(getReadableError(caught, locale)); setChainStatus(""); }
    finally { setIsAnchoring(false); }
  }

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "ChainTrace · 供应链可信证明" : "ChainTrace · Supply Chain Trust Proofs"}</div>
            <h1>{zh ? "把贸易文件，变成人人看得懂的可信证明包。" : "Turn trade documents into proof packs people instantly understand."}</h1>
            <p>{zh ? "ChainTrace 帮小企业把订单、发票、发货、质检、交付、验收这些贸易证据，整理成一个可分享、可校验、可审计的公开可信页面。" : "ChainTrace helps small businesses turn orders, invoices, shipment, inspection, delivery, and acceptance evidence into a shareable, verifiable, audit-friendly public trust page."}</p>
            <div className="hero-actions">
              <a href="#create-proof" className="primary-button">{zh ? "开始创建证明" : "Start creating a proof"}</a>
              <a href="/passport" className="secondary-button">{zh ? "查看企业档案" : "View business passports"}</a>
              <a href="/receivable-pack" className="secondary-button">{zh ? "了解证明包" : "Explore proof packs"}</a>
            </div>
            <div className="hero-badges"><span className="badge-chip">{zh ? "小企业友好" : "Small-business friendly"}</span><span className="badge-chip">Ready / Missing evidence</span><span className="badge-chip">{zh ? "链接 + 二维码分享" : "Link + QR sharing"}</span></div>
          </div>
          <div className="hero-visual">
            <div className="atmosphere-orb orb-one" /><div className="atmosphere-orb orb-two" />
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "证明包状态" : "Proof pack status"}</span><strong>COFFEE-VN-2026-0001</strong></div>
              <div className="signal-card-grid">{receivableProofTypes.map((item, index) => <div key={item} className={`mini-proof-card ${index < 4 ? "present" : "pending"}`}><span>{proofTypeText[item]}</span><strong>{index < 4 ? (zh ? "已就绪" : "Present") : (zh ? "待补齐" : "Pending")}</strong></div>)}</div>
              <div className="signal-status-box"><span>{zh ? "当前结果" : "Current result"}</span><strong>Missing evidence</strong><p>{zh ? "补齐交付和验收后，这个批次就会显示 Ready。" : "Add delivery and acceptance, and this batch will switch to Ready."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="clarity-strip">
        <article><span>{zh ? "我们在做什么" : "What we do"}</span><strong>{zh ? "做可信证明，不做复杂 ERP。" : "Trust proofs, not a heavy ERP."}</strong></article>
        <article><span>{zh ? "为什么有用" : "Why it matters"}</span><strong>{zh ? "让别人一眼看懂证据齐不齐。" : "Show whether evidence is complete at a glance."}</strong></article>
        <article><span>{zh ? "最后产出" : "Output"}</span><strong>{zh ? "证明页 + 企业档案 + Ready / Missing evidence。" : "Proof pages + passports + Ready / Missing evidence."}</strong></article>
      </section>

      <section className="story-grid">{storyCards.map((card) => <article key={card.title} className="story-card"><strong>{card.title}</strong><p>{card.text}</p></article>)}</section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "产品逻辑" : "Product logic"}</span><h2>{zh ? "六类证据，形成一个人人看得懂的应收账款证明包。" : "Six evidence types become one receivable proof pack everyone can understand."}</h2><p>{zh ? "用户不需要懂区块链，也不需要懂密码学。只要围绕同一个批次 / 订单号上传证据，ChainTrace 就负责生成哈希、保存索引、形成企业可信档案。" : "Users do not need to understand blockchain or cryptography. They simply upload evidence around the same batch / order ID, and ChainTrace handles hashing, indexing, and trust-profile presentation."}</p></div>
        <div className="pack-step-grid">{receivableProofTypes.map((item, index) => <button key={item} type="button" className={`pack-step-card button-reset ${proofType === item ? "active" : ""}`} onClick={() => handleProofTypeChange(item)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{proofTypeText[item]}</strong><p>{proofTypeText[`${item}Description` as keyof typeof proofTypeText]}</p></button>)}</div>
      </section>

      <section className="audience-grid">{audienceCards.map((card) => <article key={card.label} className="audience-card"><strong>{card.label}</strong><p>{card.text}</p></article>)}</section>

      <section className="workspace" id="create-proof">
        <div className="panel form-panel">
          <div className="section-heading"><span>{zh ? "创建证明" : "Create a proof"}</span><h2>{zh ? "先上传一个证据，让 ChainTrace 为你生成可信记录。" : "Upload one piece of evidence and let ChainTrace turn it into a trust record."}</h2><p>{zh ? "先从一个文件开始，然后逐步补齐整个证明包。" : "Start with one file, then gradually fill the rest of the proof pack."}</p></div>
          <div className="proof-flow-card"><strong>{zh ? "当前正在补充：" : "Current evidence slot:"} {proofTypeText[proofType]}</strong><span>{isReceivablePackSlot ? (zh ? `这是应收账款证明包第 ${currentPackPosition + 1} / ${receivableProofTypes.length} 个必需证据。` : `This is required receivable pack slot ${currentPackPosition + 1} / ${receivableProofTypes.length}.`) : (zh ? "产品证明会增强企业档案，但不是应收账款 Ready 判断的必需项。" : "Product proof enriches the business passport, but it is not required for receivable Ready status.")}</span></div>
          <label>{t.proofType}<select value={proofType} onChange={(event) => handleProofTypeChange(event.target.value as ProofType)}>{proofTypes.map((item) => <option key={item.value} value={item.value}>{proofTypeText[item.value]}</option>)}</select></label>
          <div className="type-help">{zh ? proofTypeText[`${proofType}Description` as keyof typeof proofTypeText] : selectedProofType?.description}</div>
          <label>{t.proofTitle}<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>{t.businessName}<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} /></label>
          <label>{t.batchId}<input value={batchId} onChange={(event) => setBatchId(event.target.value)} /></label>
          <label>{t.evidenceFile}<input type="file" onChange={handleFileChange} /></label>
          {isHashing && <div className="notice">{t.calculatingHash}</div>}{error && <div className="error">{error}</div>}
          <label>{t.publicNote}<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} /></label>
        </div>

        <div className="panel preview-panel">
          <div className="section-heading"><span>{zh ? "你将得到什么" : "What you get"}</span><h2>{zh ? "一个可以发给别人看的公开证明页。" : "A public proof page you can actually send to other people."}</h2><p>{zh ? "这不是内部技术数据，而是面向买家、资金方、审计方的可理解页面。" : "This is not an internal technical artifact. It is a page buyers, financiers, and auditors can understand."}</p></div>
          {!proofDraft ? <div className="empty-state"><div className="empty-icon">◇</div><h3>{t.uploadPrompt}</h3><p>{t.uploadPromptHelp}</p></div> : <article className="proof-card">
            <div className="proof-card-header"><div><span className="proof-type">{proofTypeText[proofDraft.proofType]}</span><h3>{proofDraft.title}</h3></div><div className="status-pill">{proofId ? t.proofConfirmed : txHash ? t.onchainSubmitted : t.hashGenerated}</div></div>
            <dl className="proof-details">
              <div><dt>{zh ? "证明包槽位" : "Pack slot"}</dt><dd>{proofTypeText[proofDraft.proofType]}<br /><span>{isReceivablePackSlot ? (zh ? "计入应收账款证明包完整度。" : "Counts toward receivable proof pack completeness.") : (zh ? "企业档案增强项。" : "Business passport enrichment item.")}</span></dd></div>
              <div><dt>{t.business}</dt><dd>{proofDraft.businessName}</dd></div><div><dt>{t.batchId}</dt><dd>{proofDraft.batchId}</dd></div><div><dt>{t.file}</dt><dd>{proofDraft.fileName} · {(proofDraft.fileSize / 1024).toFixed(2)} KB</dd></div><div><dt>SHA-256</dt><dd className="hash-value" title={proofDraft.fileHash}>{shortHash(proofDraft.fileHash)}</dd></div><div><dt>{t.created}</dt><dd>{new Date(proofDraft.createdAt).toLocaleString()}</dd></div><div><dt>{t.wallet}</dt><dd>{walletAddress ? shortHash(walletAddress) : t.notConnected}</dd></div><div><dt>{t.contract}</dt><dd>{proofRegistryAddress ? shortHash(proofRegistryAddress) : "Not configured"}</dd></div>
              {proofId !== null && <div><dt>Proof ID</dt><dd><a href={shareableProofUrl} className="inline-link">#{proofId.toString()} public proof page</a></dd></div>}{txHash && <div><dt>Transaction</dt><dd><a href={getChainExplorerTxUrl(txHash)} target="_blank" rel="noreferrer" className="inline-link">{shortHash(txHash)}</a></dd></div>}
            </dl>
            <p className="proof-note">{proofDraft.note}</p>
            <div className="proof-tools preview-actions"><a href={passportUrl} className="secondary-button">{zh ? "打开该企业档案" : "Open this business passport"}</a><a href="/receivable-pack" className="secondary-button">{zh ? "查看证明包说明" : "View proof pack guide"}</a></div>
            <div className="future-chain-box"><strong>{t.testingAndAnchoring}</strong><span>{chainStatus || t.defaultChainStatus}</span><div className="chain-actions"><button type="button" className="secondary-button button-reset" onClick={handleCreateDemoProof} disabled={!demoProofUrl || isSavingDemo}>{isSavingDemo ? t.saving : t.demoProofNoGas}</button><button type="button" className="secondary-button button-reset" onClick={handleConnectWallet}>{walletAddress ? t.walletConnected : t.connectWallet}</button><button type="button" className="primary-button button-reset" onClick={handleAnchorProof} disabled={isAnchoring || !walletAddress || !fileHash}>{isAnchoring ? t.submitting : t.anchorProof}</button></div>{!isProofRegistryConfigured() && <span>Contract address missing. Set NEXT_PUBLIC_PROOF_REGISTRY_ADDRESS after deploying ProofRegistry.</span>}</div>
          </article>}
        </div>
      </section>
    </main>
  );
}
