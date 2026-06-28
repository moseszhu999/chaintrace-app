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
  const proofTypeText = dictionary[locale].proofTypes;
  const zh = locale === "zh-CN";

  const proofTemplates = useMemo<Record<ProofType, { title: string; note: string }>>(
    () => ({
      order: { title: zh ? "咖啡出口订单证明" : "Coffee Export Order Proof", note: zh ? "订单是供应链故事的起点：谁向谁采购、采购什么、对应哪个批次或合同。先把这个事实固定下来，后续发票、发货、质检、交付、验收才有共同锚点。" : "The order is the start of the supply-chain story: who is buying from whom, what is being purchased, and which batch or contract it belongs to. Anchor this fact first, then connect invoice, shipment, inspection, delivery, and acceptance evidence to the same ID." },
      product: { title: zh ? "产品批次真实性证明" : "Product Batch Authenticity Proof", note: zh ? "该证明用于说明供应链上真实存在的产品批次、产地或真实性证据。它增强企业档案和货物可信度，但不计入应收账款证明包的六个必需槽位。" : "This proof shows that a real product batch, origin claim, or authenticity record exists in the supply chain. It enriches the business passport and product trust, but it is not one of the six required receivable pack slots." },
      shipment: { title: zh ? "发货与物流证明" : "Shipment and Logistics Proof", note: zh ? "发货证明说明货物已经离开上游节点，进入物流流转。它把供应链从纸面订单推进到真实移动，是证明包里的关键事实节点。" : "Shipment proof shows that goods have left the upstream node and entered logistics flow. It moves the supply chain from paper order to real movement, making it a key fact node in the proof pack." },
      invoice: { title: zh ? "发票存在性证明" : "Invoice Existence Proof", note: zh ? "发票证明把供应链事实转化为应收账款主张：不是只说货在流转，而是说明这笔交易已经形成可追踪的收款凭据。" : "Invoice proof turns supply-chain activity into a receivable claim: not only that goods are moving, but that this transaction has created a traceable payment document." },
      inspection: { title: zh ? "质检报告证明" : "Quality Inspection Proof", note: zh ? "质检证明回答供应链里最常见的问题：货是不是合格、是否符合约定标准。它降低买家、资金方和后续节点的不确定性。" : "Inspection proof answers one of the most common supply-chain questions: whether the goods meet the agreed standard. It reduces uncertainty for buyers, financiers, and downstream nodes." },
      delivery: { title: zh ? "交付或入库回执证明" : "Delivery Receipt Proof", note: zh ? "交付证明说明货物已经到达下游节点或买方指定位置。供应链故事到这里不再只是运输中，而是进入履约完成阶段。" : "Delivery proof shows that goods reached a downstream node or buyer-designated location. At this point, the supply-chain story moves from in-transit to fulfilled delivery." },
      acceptance: { title: zh ? "买家验收证明" : "Buyer Acceptance Proof", note: zh ? "验收证明是供应链事实闭环的最后一块：买家确认收到并接受。缺少验收时，证明包通常不应显示 Ready。" : "Acceptance proof closes the supply-chain fact loop: the buyer confirms receipt and acceptance. Without acceptance, the proof pack should usually remain Missing evidence." },
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
    { title: zh ? "上游：订单不是一句口头承诺" : "Upstream: an order is not just a promise", text: zh ? "供应商、小工厂、贸易商先把订单、合同、产品批次这些事实固定下来，让后续所有证据都围绕同一个批次 / 订单号展开。" : "Suppliers, factories, and traders first anchor orders, contracts, and product batches so every later record can connect to the same batch / order ID." },
    { title: zh ? "中游：货物移动要留下事实轨迹" : "Midstream: movement needs a fact trail", text: zh ? "发货、物流、质检不再只是聊天截图或附件，而是供应链流转中的可验证节点，别人可以看到每一步有没有证据。" : "Shipment, logistics, and inspection stop being scattered screenshots or attachments. They become verifiable nodes in the supply-chain flow." },
    { title: zh ? "下游：交付和验收形成闭环" : "Downstream: delivery and acceptance close the loop", text: zh ? "当交付和验收也被补齐，这条供应链事实链才从 Missing evidence 走向 Ready，可以分享给买家、资金方和合作伙伴。" : "When delivery and acceptance are added, the supply-chain fact chain moves from Missing evidence to Ready and can be shared with buyers, financiers, and partners." },
  ];
  const audienceCards = [
    { label: zh ? "供应商 / 小工厂" : "Suppliers / small factories", text: zh ? "证明自己确实接单、生产、发货，不再只靠聊天记录解释。" : "Show that you actually received the order, produced the goods, and shipped them without relying on chat history." },
    { label: zh ? "贸易商 / 出口商" : "Traders / exporters", text: zh ? "把分散在上下游的文件串成一个客户和资金方都能看懂的供应链故事。" : "Connect documents from upstream and downstream into a supply-chain story customers and financiers can understand." },
    { label: zh ? "买家 / 采购方" : "Buyers / procurement teams", text: zh ? "快速判断这批货是否有订单、发货、质检、交付和验收证据。" : "Quickly see whether this batch has order, shipment, inspection, delivery, and acceptance evidence." },
    { label: zh ? "资金方 / AI Agent" : "Financiers / AI agents", text: zh ? "先读取供应链事实完整度，再决定是否进入风控、融资或自动协作流程。" : "Read supply-chain fact completeness first, then decide whether to enter risk, financing, or automated collaboration workflows." },
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
            <div className="eyebrow">{zh ? "ChainTrace · 供应链事实轨道" : "ChainTrace · Supply Chain Fact Rail"}</div>
            <h1>{zh ? "让一条供应链，从订单到验收都有可信记录。" : "Give every supply chain a trusted record from order to acceptance."}</h1>
            <p>{zh ? "ChainTrace 帮小企业把订单、发票、发货、质检、交付、验收这些关键节点，串成一条可分享、可校验、可审计的供应链事实链。" : "ChainTrace helps small businesses connect order, invoice, shipment, inspection, delivery, and acceptance into a shareable, verifiable, audit-friendly supply-chain fact chain."}</p>
            <div className="hero-actions">
              <a href="/platform" className="primary-button">{zh ? "平台应用" : "Platform app"}</a>
              <a href="#create-proof" className="secondary-button">{zh ? "开始记录一个节点" : "Record a supply-chain node"}</a>
              <a href="/cases" className="secondary-button">{zh ? "复杂案例" : "Case studies"}</a>
              <a href="/passport" className="secondary-button">{zh ? "企业事实档案" : "Business fact passports"}</a>
              <a href="/receivable-pack" className="secondary-button">{zh ? "证明包" : "Proof packs"}</a>
            </div>
            <div className="hero-badges"><span className="badge-chip">{zh ? "供应链事实层" : "Supply-chain fact layer"}</span><span className="badge-chip">Ready / Missing evidence</span><span className="badge-chip">{zh ? "链接 + 二维码分享" : "Link + QR sharing"}</span></div>
          </div>
          <div className="hero-visual">
            <div className="atmosphere-orb orb-one" /><div className="atmosphere-orb orb-two" />
            <div className="signal-board">
              <div className="signal-board-header"><span>{zh ? "供应链事实链" : "Supply-chain fact chain"}</span><strong>COFFEE-VN-2026-0001</strong></div>
              <div className="signal-card-grid">{receivableProofTypes.map((item, index) => <div key={item} className={`mini-proof-card ${index < 4 ? "present" : "pending"}`}><span>{proofTypeText[item]}</span><strong>{index < 4 ? (zh ? "已记录" : "Recorded") : (zh ? "待补齐" : "Pending")}</strong></div>)}</div>
              <div className="signal-status-box"><span>{zh ? "当前供应链状态" : "Current supply-chain status"}</span><strong>Missing evidence</strong><p>{zh ? "这批货已经有订单、发票、发货和质检记录；补齐交付和验收后，事实链就会显示 Ready。" : "This batch already has order, invoice, shipment, and inspection records. Add delivery and acceptance to make the fact chain Ready."}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="clarity-strip">
        <article><span>{zh ? "我们在做什么" : "What we do"}</span><strong>{zh ? "给供应链关键节点建立事实记录。" : "Create fact records for key supply-chain nodes."}</strong></article>
        <article><span>{zh ? "为什么有用" : "Why it matters"}</span><strong>{zh ? "让上下游一眼看懂这批货走到哪一步。" : "Let every party see where a batch stands at a glance."}</strong></article>
        <article><span>{zh ? "最后产出" : "Output"}</span><strong>{zh ? "供应链事实链 + 企业档案 + Ready / Missing evidence。" : "Fact chain + business passport + Ready / Missing evidence."}</strong></article>
      </section>

      <section className="story-grid">{storyCards.map((card) => <article key={card.title} className="story-card"><strong>{card.title}</strong><p>{card.text}</p></article>)}</section>

      <section className="panel product-showcase">
        <div className="section-heading"><span>{zh ? "供应链逻辑" : "Supply-chain logic"}</span><h2>{zh ? "一条供应链，每个关键节点都应该留下可验证事实。" : "Every key node in a supply chain should leave a verifiable fact."}</h2><p>{zh ? "用户不需要懂区块链，也不需要重型 ERP。只要围绕同一个批次 / 订单号记录证据，ChainTrace 就负责生成哈希、保存索引、形成企业可信档案。" : "Users do not need to understand blockchain or run a heavyweight ERP. They simply record evidence around the same batch / order ID, and ChainTrace handles hashing, indexing, and trust-profile presentation."}</p></div>
        <div className="pack-step-grid">{receivableProofTypes.map((item, index) => <button key={item} type="button" className={`pack-step-card button-reset ${proofType === item ? "active" : ""}`} onClick={() => handleProofTypeChange(item)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{proofTypeText[item]}</strong><p>{proofTypeText[`${item}Description` as keyof typeof proofTypeText]}</p></button>)}</div>
      </section>

      <section className="audience-grid">{audienceCards.map((card) => <article key={card.label} className="audience-card"><strong>{card.label}</strong><p>{card.text}</p></article>)}</section>

      <section className="workspace" id="create-proof">
        <div className="panel form-panel">
          <div className="section-heading"><span>{zh ? "记录供应链节点" : "Record a supply-chain node"}</span><h2>{zh ? "先上传一个节点证据，让 ChainTrace 为这条供应链生成可信记录。" : "Upload one node of evidence and let ChainTrace turn it into a trusted supply-chain record."}</h2><p>{zh ? "先从订单或发货开始，然后逐步补齐质检、交付、验收，形成完整事实链。" : "Start with an order or shipment, then add inspection, delivery, and acceptance to complete the fact chain."}</p></div>
          <div className="proof-flow-card"><strong>{zh ? "当前正在记录：" : "Current node:"} {proofTypeText[proofType]}</strong><span>{isReceivablePackSlot ? (zh ? `这是供应链事实链第 ${currentPackPosition + 1} / ${receivableProofTypes.length} 个核心节点。` : `This is core supply-chain node ${currentPackPosition + 1} / ${receivableProofTypes.length}.`) : (zh ? "产品证明会增强企业档案，但不是 Ready 判断的必需节点。" : "Product proof enriches the business passport, but it is not required for Ready status.")}</span></div>
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
          <div className="section-heading"><span>{zh ? "你将得到什么" : "What you get"}</span><h2>{zh ? "一个可以发给上下游看的供应链事实页。" : "A supply-chain fact page you can send to upstream and downstream partners."}</h2><p>{zh ? "这不是内部技术数据，而是面向买家、供应商、资金方、审计方的可理解页面。" : "This is not an internal technical artifact. It is a page buyers, suppliers, financiers, and auditors can understand."}</p></div>
          {!proofDraft ? <div className="empty-state"><div className="empty-icon">◇</div><h3>{t.uploadPrompt}</h3><p>{t.uploadPromptHelp}</p></div> : <article className="proof-card">
            <div className="proof-card-header"><div><span className="proof-type">{proofTypeText[proofDraft.proofType]}</span><h3>{proofDraft.title}</h3></div><div className="status-pill">{proofId ? t.proofConfirmed : txHash ? t.onchainSubmitted : t.hashGenerated}</div></div>
            <dl className="proof-details">
              <div><dt>{zh ? "供应链节点" : "Supply-chain node"}</dt><dd>{proofTypeText[proofDraft.proofType]}<br /><span>{isReceivablePackSlot ? (zh ? "计入供应链事实链完整度。" : "Counts toward supply-chain fact-chain completeness.") : (zh ? "企业档案增强项。" : "Business passport enrichment item.")}</span></dd></div>
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
