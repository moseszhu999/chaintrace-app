"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProofVerifier } from "@/components/ProofVerifier";
import { SharePanel } from "@/components/SharePanel";

function getValue(params: URLSearchParams, key: string, fallback: string): string {
  return params.get(key) || fallback;
}

export default function DemoProofPage() {
  const params = useSearchParams();

  const fileHash = getValue(params, "hash", "") as `0x${string}`;
  const proofType = getValue(params, "type", "demo");
  const title = getValue(params, "title", "Demo Proof");
  const business = getValue(params, "business", "Demo Business");
  const batch = getValue(params, "batch", "DEMO-BATCH");
  const fileName = getValue(params, "file", "Original file");
  const created = getValue(params, "created", new Date().toISOString());
  const sharePath = `/demo-proof?${params.toString()}`;

  if (!fileHash.startsWith("0x")) {
    return (
      <main className="page-shell">
        <section className="hero">
          <div className="eyebrow">ChainTrace Demo Proof</div>
          <h1>Demo proof could not be loaded.</h1>
          <p>This demo proof link does not contain a valid file hash.</p>
          <div className="hero-actions">
            <Link href="/" className="primary-button">Create a demo proof</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Demo Proof</div>
        <h1>{title}</h1>
        <p>
          This is a gas-free demo proof. It uses the same browser-side SHA-256 verification flow,
          but it is not anchored on-chain. Use this mode for product testing and UI demos.
        </p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">Create your own proof</Link>
        </div>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{proofType}</span>
              <h3>Gas-free demo proof</h3>
            </div>
            <div className="status-pill">Demo mode</div>
          </div>

          <dl className="proof-details">
            <div>
              <dt>Mode</dt>
              <dd>Demo proof, not on-chain</dd>
            </div>
            <div>
              <dt>Business</dt>
              <dd>{business}</dd>
            </div>
            <div>
              <dt>Batch / order ID</dt>
              <dd>{batch}</dd>
            </div>
            <div>
              <dt>File</dt>
              <dd>{fileName}</dd>
            </div>
            <div>
              <dt>File hash</dt>
              <dd className="hash-value" title={fileHash}>{fileHash}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(created).toLocaleString()}</dd>
            </div>
          </dl>

          <p className="proof-note">
            This link is useful for testing the ChainTrace user experience without wallet gas or faucets.
            For production trust, anchor the same file hash on a public chain.
          </p>

          <div className="proof-tools">
            <SharePanel path={sharePath} />
            <ProofVerifier expectedHash={fileHash} />
          </div>
        </article>
      </section>
    </main>
  );
}
