"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { getChainExplorerTxUrl, isProofRegistryConfigured, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { sha256File, shortHash } from "@/lib/hash";
import { waitForProofRegistered } from "@/lib/publicChain";
import type { ProofDraft, ProofType } from "@/lib/types";
import { connectWallet, getConnectedAccount, hasInjectedWallet, registerProofOnChain, switchToEthereumSepolia } from "@/lib/wallet";

const proofTypes: { label: string; value: ProofType; description: string }[] = [
  { label: "Product Proof", value: "product", description: "Prove product origin, batch, or authenticity." },
  { label: "Shipment Proof", value: "shipment", description: "Prove shipping or logistics evidence." },
  { label: "Invoice Proof", value: "invoice", description: "Prove an invoice existed at a specific time." },
  { label: "Inspection Proof", value: "inspection", description: "Prove quality inspection evidence." },
  { label: "Delivery Proof", value: "delivery", description: "Prove goods were delivered." },
  { label: "Acceptance Proof", value: "acceptance", description: "Prove buyer acceptance or confirmation." },
];

export default function Home() {
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

  useEffect(() => {
    let cancelled = false;

    async function detectWallet() {
      if (!hasInjectedWallet()) return;
      const account = await getConnectedAccount();
      if (!cancelled && account) {
        setWalletAddress(account);
        setChainStatus("Wallet already connected.");
      }
    }

    detectWallet().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

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
      setError(caught instanceof Error ? caught.message : "Failed to calculate file hash.");
    } finally {
      setIsHashing(false);
    }
  }

  async function handleConnectWallet() {
    setError("");
    setChainStatus("Opening MetaMask connection request...");

    if (!hasInjectedWallet()) {
      setChainStatus("");
      setError("No injected wallet detected. Open this page in a browser with MetaMask installed, or use the MetaMask in-app browser on mobile.");
      return;
    }

    try {
      const account = await connectWallet();
      setWalletAddress(account);
      setChainStatus("Wallet connected.");
    } catch (caught) {
      setChainStatus("");
      setError(caught instanceof Error ? caught.message : "Failed to connect wallet.");
    }
  }

  async function handleAnchorProof() {
    setError("");
    setChainStatus("");
    setTxHash("");
    setProofId(null);

    if (!proofDraft) {
      setError("Generate a file hash before anchoring a proof.");
      return;
    }

    if (!walletAddress) {
      setError("Connect your wallet first.");
      return;
    }

    if (!proofRegistryAddress || !isProofRegistryConfigured()) {
      setError("ProofRegistry contract address is not configured.");
      return;
    }

    try {
      setIsAnchoring(true);
      setChainStatus("Switching to Ethereum Sepolia...");
      await switchToEthereumSepolia();
      setChainStatus("Waiting for wallet confirmation...");

      const hash = await registerProofOnChain({
        account: walletAddress,
        contractAddress: proofRegistryAddress,
        fileHash: proofDraft.fileHash as `0x${string}`,
        proofType: proofDraft.proofType,
        uri: "",
      });

      setTxHash(hash);
      setChainStatus("Transaction submitted. Waiting for confirmation...");

      const event = await waitForProofRegistered(hash);
      setProofId(event.proofId);
      setChainStatus(`Proof confirmed. Shareable proof ID: ${event.proofId.toString()}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to anchor proof on-chain.");
      setChainStatus("");
    } finally {
      setIsAnchoring(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Proof Page MVP</div>
        <h1>Make your product, shipment, or invoice verifiable.</h1>
        <p>
          Upload evidence, generate a browser-side SHA-256 hash, and preview a public proof page.
          Then anchor the hash on Ethereum Sepolia to create an on-chain proof trail.
        </p>
        <div className="hero-actions">
          <a href="#create-proof" className="primary-button">Create proof</a>
          <a href="https://github.com/moseszhu999/chaintrace-protocol" className="secondary-button" target="_blank" rel="noreferrer">
            Protocol repo
          </a>
        </div>
      </section>

      <section className="principles-grid">
        <article>
          <strong>Proof, not exposure</strong>
          <span>Share verifiable facts without revealing sensitive business data.</span>
        </article>
        <article>
          <strong>Small businesses first</strong>
          <span>Start from a simple proof page, then grow into a business passport.</span>
        </article>
        <article>
          <strong>AI-agent ready</strong>
          <span>Give agents a verifiable memory layer for supply chain facts.</span>
        </article>
      </section>

      <section id="create-proof" className="workspace">
        <div className="panel form-panel">
          <div className="section-heading">
            <span>Step 1</span>
            <h2>Create a proof draft</h2>
            <p>For the first MVP, the browser calculates the file hash locally. The file itself is not uploaded to a server.</p>
          </div>

          <label>
            Proof type
            <select value={proofType} onChange={(event) => setProofType(event.target.value as ProofType)}>
              {proofTypes.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <div className="type-help">{selectedProofType?.description}</div>

          <label>
            Proof title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          <label>
            Business name
            <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
          </label>

          <label>
            Batch / order / shipment ID
            <input value={batchId} onChange={(event) => setBatchId(event.target.value)} />
          </label>

          <label>
            Evidence file
            <input type="file" onChange={handleFileChange} />
          </label>

          {isHashing && <div className="notice">Calculating SHA-256 hash in your browser...</div>}
          {error && <div className="error">{error}</div>}

          <label>
            Public note
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} />
          </label>
        </div>

        <div className="panel preview-panel">
          <div className="section-heading">
            <span>Step 2</span>
            <h2>Proof page preview</h2>
            <p>This is the trust page a small business can share with a buyer, logistics partner, or financier.</p>
          </div>

          {!proofDraft ? (
            <div className="empty-state">
              <div className="empty-icon">◇</div>
              <h3>Upload an evidence file to generate a proof preview.</h3>
              <p>The first generated value will be a SHA-256 hash. Blockchain anchoring comes next.</p>
            </div>
          ) : (
            <article className="proof-card">
              <div className="proof-card-header">
                <div>
                  <span className="proof-type">{proofDraft.proofType}</span>
                  <h3>{proofDraft.title}</h3>
                </div>
                <div className="status-pill">{proofId ? "Proof confirmed" : txHash ? "On-chain submitted" : "Hash generated"}</div>
              </div>

              <dl className="proof-details">
                <div>
                  <dt>Business</dt>
                  <dd>{proofDraft.businessName}</dd>
                </div>
                <div>
                  <dt>Batch / order ID</dt>
                  <dd>{proofDraft.batchId}</dd>
                </div>
                <div>
                  <dt>File</dt>
                  <dd>{proofDraft.fileName} · {(proofDraft.fileSize / 1024).toFixed(2)} KB</dd>
                </div>
                <div>
                  <dt>SHA-256</dt>
                  <dd className="hash-value" title={proofDraft.fileHash}>{shortHash(proofDraft.fileHash)}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{new Date(proofDraft.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Wallet</dt>
                  <dd>{walletAddress ? shortHash(walletAddress) : "Not connected"}</dd>
                </div>
                <div>
                  <dt>Contract</dt>
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
                <strong>On-chain anchoring</strong>
                <span>
                  {chainStatus ||
                    "Connect a wallet, switch to Ethereum Sepolia, and submit this proof hash to ProofRegistry."}
                </span>
                <div className="chain-actions">
                  <button type="button" className="secondary-button button-reset" onClick={handleConnectWallet}>
                    {walletAddress ? "Wallet connected" : "Connect wallet"}
                  </button>
                  <button type="button" className="primary-button button-reset" onClick={handleAnchorProof} disabled={isAnchoring || !walletAddress || !fileHash}>
                    {isAnchoring ? "Submitting..." : "Anchor proof"}
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
