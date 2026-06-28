"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { getChainExplorerTxUrl, isProofRegistryConfigured, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { sha256File, shortHash } from "@/lib/hash";
import { dictionary, type Locale, normalizeLocale } from "@/lib/i18n";
import { waitForProofRegistered } from "@/lib/publicChain";
import type { ProofDraft, ProofType } from "@/lib/types";
import { connectWallet, getConnectedAccount, hasInjectedWallet, registerProofOnChain, switchToEthereumSepolia } from "@/lib/wallet";

const proofTypes: { value: ProofType; description: string }[] = [
  { value: "product", description: "Prove product origin, batch, or authenticity." },
  { value: "shipment", description: "Prove shipping or logistics evidence." },
  { value: "invoice", description: "Prove an invoice existed at a specific time." },
  { value: "inspection", description: "Prove quality inspection evidence." },
  { value: "delivery", description: "Prove goods were delivered." },
  { value: "acceptance", description: "Prove buyer acceptance or confirmation." },
];

type SaveProofResponse = {
  item?: {
    id?: string;
  };
};

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
  const [proofType, setProofType] = useState<ProofType>("product");
  const [title, setTitle] = useState("Vietnam Coffee Batch Proof");
  const [businessName, setBusinessName] = useState("Example Small Exporter");
  const [batchId, setBatchId] = useState("COFFEE-VN-2026-0001");
  const [note, setNote] = useState("This proof anchors an evidence file hash for a product batch. The original file can be verified later by recalculating its SHA-256 hash.");
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

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function detectWallet() {
      if (!hasInjectedWallet()) return;
      const account = await getConnectedAccount();
      if (!cancelled && account) {
        setWalletAddress(account);
        setChainStatus(locale === "zh-CN" ? "钱包已连接。" : "Wallet already connected.");
      }
    }

    detectWallet().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const selectedProofType = useMemo(
    () => proofTypes.find((item) => item.value === proofType),
    [proofType]
  );

  const proofDraft: ProofDraft | null = useMemo(() => {
    if (!fileHash) return null;

    return {
      proofType,
      title,
      businessName,
      batchId,
      fileName,
      fileSize,
      fileHash,
      note,
      createdAt: new Date().toISOString(),
    };
  }, [batchId, businessName, fileHash, fileName, fileSize, note, proofType, title]);

  const shareableProofUrl = proofId === null ? "" : `/proof/${proofId.toString()}`;
  const demoProofUrl = proofDraft ? buildDemoProofUrl(proofDraft) : "";

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setTxHash("");
    setProofId(null);

    if (!file) return;

    try {
      setIsHashing(true);
      setFileName(file.name);
      setFileSize(file.size);
      const hash = await sha256File(file);
      setFileHash(hash);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : locale === "zh-CN" ? "文件哈希计算失败。" : "Failed to calculate file hash.");
    } finally {
      setIsHashing(false);
    }
  }

  async function handleConnectWallet() {
    setError("");
    setChainStatus(locale === "zh-CN" ? "正在打开 MetaMask 连接请求..." : "Opening MetaMask connection request...");

    if (!hasInjectedWallet()) {
      setChainStatus("");
      setError(locale === "zh-CN" ? "没有检测到钱包插件。请使用安装 MetaMask 的浏览器打开，或在移动端使用 MetaMask 内置浏览器。" : "No injected wallet detected. Open this page in a browser with MetaMask installed, or use the MetaMask in-app browser on mobile.");
      return;
    }

    try {
      const account = await connectWallet();
      setWalletAddress(account);
      setChainStatus(locale === "zh-CN" ? "钱包已连接。" : "Wallet connected.");
    } catch (caught) {
      setChainStatus("");
      setError(getReadableError(caught, locale));
    }
  }

  async function handleCreateDemoProof() {
    setError("");

    if (!proofDraft) {
      setError(locale === "zh-CN" ? "请先生成文件哈希，再创建 Demo Proof。" : "Generate a file hash before creating a demo proof.");
      return;
    }

    const demoUrl = buildDemoProofUrl(proofDraft);

    try {
      setIsSavingDemo(true);
      setChainStatus(locale === "zh-CN" ? "正在保存 Demo Proof 元数据..." : "Saving demo proof metadata...");
      const result = await saveProofMetadata({
        proofMode: "demo",
        proofType: proofDraft.proofType,
        title: proofDraft.title,
        businessName: proofDraft.businessName,
        batchId: proofDraft.batchId,
        fileName: proofDraft.fileName,
        fileHash: proofDraft.fileHash,
        note: proofDraft.note,
        walletAddress: walletAddress || null,
        demoUrl,
      });
      window.location.href = result.item?.id ? `/proof-index/${result.item.id}` : demoUrl;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : locale === "zh-CN" ? "保存 Demo Proof 元数据失败。" : "Failed to save demo proof metadata.");
      setChainStatus("");
    } finally {
      setIsSavingDemo(false);
    }
  }

  async function handleAnchorProof() {
    setError("");
    setChainStatus("");
    setTxHash("");
    setProofId(null);

    if (!proofDraft) {
      setError(locale === "zh-CN" ? "请先生成文件哈希，再进行链上锚定。" : "Generate a file hash before anchoring a proof.");
      return;
    }

    if (!walletAddress) {
      setError(locale === "zh-CN" ? "请先连接钱包。" : "Connect your wallet first.");
      return;
    }

    if (!proofRegistryAddress || !isProofRegistryConfigured()) {
      setError(locale === "zh-CN" ? "ProofRegistry 合约地址尚未配置。" : "ProofRegistry contract address is not configured.");
      return;
    }

    try {
      setIsAnchoring(true);
      setChainStatus(locale === "zh-CN" ? "正在切换到 Ethereum Sepolia..." : "Switching to Ethereum Sepolia...");
      await switchToEthereumSepolia();
      setChainStatus(locale === "zh-CN" ? "等待钱包确认..." : "Waiting for wallet confirmation...");

      const hash = await registerProofOnChain({
        account: walletAddress,
        contractAddress: proofRegistryAddress,
        fileHash: proofDraft.fileHash as `0x${string}`,
        proofType: proofDraft.proofType,
        uri: "",
      });

      setTxHash(hash);
      setChainStatus(locale === "zh-CN" ? "交易已提交，等待确认..." : "Transaction submitted. Waiting for confirmation...");

      const event = await waitForProofRegistered(hash);
      setProofId(event.proofId);

      await saveProofMetadata({
        proofMode: "onchain",
        proofType: proofDraft.proofType,
        title: proofDraft.title,
        businessName: proofDraft.businessName,
        batchId: proofDraft.batchId,
        fileName: proofDraft.fileName,
        fileHash: proofDraft.fileHash,
        note: proofDraft.note,
        walletAddress,
        chainId: 11155111,
        contractAddress: proofRegistryAddress,
        transactionHash: hash,
        onchainProofId: event.proofId.toString(),
      });

      setChainStatus(locale === "zh-CN" ? `证明已确认并写入索引。Proof ID：${event.proofId.toString()}。` : `Proof confirmed and indexed. Shareable proof ID: ${event.proofId.toString()}.`);
    } catch (caught) {
      setError(getReadableError(caught, locale));
      setChainStatus("");
    } finally {
      setIsAnchoring(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        <div className="hero-actions">
          <a href="#create-proof" className="primary-button">{common.createProof}</a>
          <a href="/passport" className="secondary-button">{common.businessPassport}</a>
          <a href="https://github.com/moseszhu999/chaintrace-protocol" className="secondary-button" target="_blank" rel="noreferrer">
            {t.protocolRepo}
          </a>
        </div>
      </section>

      <section className="principles-grid">
        <article>
          <strong>{t.proofNotExposure}</strong>
          <span>{t.proofNotExposureText}</span>
        </article>
        <article>
          <strong>{t.gasFreeTesting}</strong>
          <span>{t.gasFreeTestingText}</span>
        </article>
        <article>
          <strong>{t.aiAgentReady}</strong>
          <span>{t.aiAgentReadyText}</span>
        </article>
      </section>

      <section id="create-proof" className="workspace">
        <div className="panel form-panel">
          <div className="section-heading">
            <span>{t.step1}</span>
            <h2>{t.createDraft}</h2>
            <p>{t.createDraftHelp}</p>
          </div>

          <label>
            {t.proofType}
            <select value={proofType} onChange={(event) => setProofType(event.target.value as ProofType)}>
              {proofTypes.map((item) => (
                <option key={item.value} value={item.value}>{proofTypeText[item.value]}</option>
              ))}
            </select>
          </label>

          <div className="type-help">{locale === "zh-CN" ? proofTypeText[`${proofType}Description` as keyof typeof proofTypeText] : selectedProofType?.description}</div>

          <label>
            {t.proofTitle}
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          <label>
            {t.businessName}
            <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
          </label>

          <label>
            {t.batchId}
            <input value={batchId} onChange={(event) => setBatchId(event.target.value)} />
          </label>

          <label>
            {t.evidenceFile}
            <input type="file" onChange={handleFileChange} />
          </label>

          {isHashing && <div className="notice">{t.calculatingHash}</div>}
          {error && <div className="error">{error}</div>}

          <label>
            {t.publicNote}
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} />
          </label>
        </div>

        <div className="panel preview-panel">
          <div className="section-heading">
            <span>{t.step2}</span>
            <h2>{t.proofPreview}</h2>
            <p>{t.proofPreviewHelp}</p>
          </div>

          {!proofDraft ? (
            <div className="empty-state">
              <div className="empty-icon">◇</div>
              <h3>{t.uploadPrompt}</h3>
              <p>{t.uploadPromptHelp}</p>
            </div>
          ) : (
            <article className="proof-card">
              <div className="proof-card-header">
                <div>
                  <span className="proof-type">{proofTypeText[proofDraft.proofType]}</span>
                  <h3>{proofDraft.title}</h3>
                </div>
                <div className="status-pill">{proofId ? t.proofConfirmed : txHash ? t.onchainSubmitted : t.hashGenerated}</div>
              </div>

              <dl className="proof-details">
                <div>
                  <dt>{t.business}</dt>
                  <dd>{proofDraft.businessName}</dd>
                </div>
                <div>
                  <dt>{t.batchId}</dt>
                  <dd>{proofDraft.batchId}</dd>
                </div>
                <div>
                  <dt>{t.file}</dt>
                  <dd>{proofDraft.fileName} · {(proofDraft.fileSize / 1024).toFixed(2)} KB</dd>
                </div>
                <div>
                  <dt>SHA-256</dt>
                  <dd className="hash-value" title={proofDraft.fileHash}>{shortHash(proofDraft.fileHash)}</dd>
                </div>
                <div>
                  <dt>{t.created}</dt>
                  <dd>{new Date(proofDraft.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt>{t.wallet}</dt>
                  <dd>{walletAddress ? shortHash(walletAddress) : t.notConnected}</dd>
                </div>
                <div>
                  <dt>{t.contract}</dt>
                  <dd>{proofRegistryAddress ? shortHash(proofRegistryAddress) : "Not configured"}</dd>
                </div>
                {proofId !== null && (
                  <div>
                    <dt>Proof ID</dt>
                    <dd>
                      <a href={shareableProofUrl} className="inline-link">
                        #{proofId.toString()} public proof page
                      </a>
                    </dd>
                  </div>
                )}
                {txHash && (
                  <div>
                    <dt>Transaction</dt>
                    <dd>
                      <a href={getChainExplorerTxUrl(txHash)} target="_blank" rel="noreferrer" className="inline-link">
                        {shortHash(txHash)}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              <p className="proof-note">{proofDraft.note}</p>

              <div className="future-chain-box">
                <strong>{t.testingAndAnchoring}</strong>
                <span>{chainStatus || t.defaultChainStatus}</span>
                <div className="chain-actions">
                  <button type="button" className="secondary-button button-reset" onClick={handleCreateDemoProof} disabled={!demoProofUrl || isSavingDemo}>
                    {isSavingDemo ? t.saving : t.demoProofNoGas}
                  </button>
                  <button type="button" className="secondary-button button-reset" onClick={handleConnectWallet}>
                    {walletAddress ? t.walletConnected : t.connectWallet}
                  </button>
                  <button type="button" className="primary-button button-reset" onClick={handleAnchorProof} disabled={isAnchoring || !walletAddress || !fileHash}>
                    {isAnchoring ? t.submitting : t.anchorProof}
                  </button>
                </div>
                {!isProofRegistryConfigured() && (
                  <span>Contract address missing. Set NEXT_PUBLIC_PROOF_REGISTRY_ADDRESS after deploying ProofRegistry.</span>
                )}
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
