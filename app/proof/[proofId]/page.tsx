"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProofVerifier } from "@/components/ProofVerifier";
import { SharePanel } from "@/components/SharePanel";
import { getBaseSepoliaExplorerAddressUrl, proofRegistryAddress } from "@/lib/chaintraceConfig";
import { shortHash } from "@/lib/hash";
import { ChainTraceProof, getProofById } from "@/lib/publicChain";

function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unable to read this proof from the ChainTrace ProofRegistry contract.";
}

export default function PublicProofPage({
  params,
}: {
  params: { proofId: string };
}) {
  const { proofId } = params;
  const [proof, setProof] = useState<ChainTraceProof | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const proofIdBigInt = useMemo(() => {
    try {
      return BigInt(proofId);
    } catch {
      return null;
    }
  }, [proofId]);

  useEffect(() => {
    let cancelled = false;

    async function loadProof() {
      setIsLoading(true);
      setError("");
      setProof(null);

      if (proofIdBigInt === null) {
        setError("Invalid proof ID.");
        setIsLoading(false);
        return;
      }

      try {
        const loadedProof = await getProofById(proofIdBigInt);
        if (!cancelled) {
          setProof(loadedProof);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(getErrorMessage(caught));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProof();

    return () => {
      cancelled = true;
    };
  }, [proofIdBigInt]);

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="hero">
          <div className="eyebrow">ChainTrace Public Proof</div>
          <h1>Loading Proof #{proofId}</h1>
          <p>Reading this proof directly from the ChainTrace ProofRegistry contract on Base Sepolia.</p>
        </section>
      </main>
    );
  }

  if (error || !proof) {
    return (
      <main className="page-shell">
        <section className="hero">
          <div className="eyebrow">ChainTrace Public Proof</div>
          <h1>Proof #{proofId} could not be loaded.</h1>
          <p>
            The app could not read this proof from Base Sepolia. The proof ID may not exist yet,
            or the public RPC endpoint may be temporarily unavailable.
          </p>
          <div className="hero-actions">
            <Link href="/" className="primary-button">Create your own proof</Link>
            <a
              href={getBaseSepoliaExplorerAddressUrl(proofRegistryAddress)}
              className="secondary-button"
              target="_blank"
              rel="noreferrer"
            >
              View contract
            </a>
          </div>
        </section>

        <section className="workspace single-column">
          <article className="panel proof-card public-proof-card">
            <div className="proof-card-header">
              <div>
                <span className="proof-type">not loaded</span>
                <h3>Proof read failed</h3>
              </div>
              <div className="status-pill error-pill">Needs check</div>
            </div>

            <dl className="proof-details">
              <div>
                <dt>Requested proof ID</dt>
                <dd>#{proofId}</dd>
              </div>
              <div>
                <dt>Registry</dt>
                <dd>
                  <a
                    href={getBaseSepoliaExplorerAddressUrl(proofRegistryAddress)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-link"
                    title={proofRegistryAddress}
                  >
                    {shortHash(proofRegistryAddress)}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Error</dt>
                <dd>{error || "Unknown read error."}</dd>
              </div>
            </dl>

            <p className="proof-note">
              If you just submitted a transaction, wait a few seconds and refresh. If this keeps failing,
              the actual proof ID may be different from #{proofId}. Use the proof ID shown after a confirmed transaction.
            </p>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">ChainTrace Public Proof</div>
        <h1>Proof #{proofId}</h1>
        <p>
          This page reads directly from the ChainTrace ProofRegistry contract on Base Sepolia.
          It verifies that an evidence hash was anchored on-chain by a wallet address.
        </p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">Create your own proof</Link>
          <a
            href={getBaseSepoliaExplorerAddressUrl(proofRegistryAddress)}
            className="secondary-button"
            target="_blank"
            rel="noreferrer"
          >
            View contract
          </a>
        </div>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{proof.proofType}</span>
              <h3>On-chain proof record</h3>
            </div>
            <div className="status-pill">Verified on-chain</div>
          </div>

          <dl className="proof-details">
            <div>
              <dt>Proof ID</dt>
              <dd>#{proofId}</dd>
            </div>
            <div>
              <dt>Proof type</dt>
              <dd>{proof.proofType}</dd>
            </div>
            <div>
              <dt>Submitter</dt>
              <dd>
                <a
                  href={getBaseSepoliaExplorerAddressUrl(proof.submitter)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-link"
                  title={proof.submitter}
                >
                  {shortHash(proof.submitter)}
                </a>
              </dd>
            </div>
            <div>
              <dt>File hash</dt>
              <dd className="hash-value" title={proof.fileHash}>{proof.fileHash}</dd>
            </div>
            <div>
              <dt>URI / CID</dt>
              <dd>{proof.uri || "Not provided in this MVP transaction"}</dd>
            </div>
            <div>
              <dt>Metadata hash</dt>
              <dd className="hash-value">{proof.metadataHash}</dd>
            </div>
            <div>
              <dt>Timestamp</dt>
              <dd>{formatTimestamp(proof.timestamp)}</dd>
            </div>
            <div>
              <dt>Registry</dt>
              <dd>
                <a
                  href={getBaseSepoliaExplorerAddressUrl(proofRegistryAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-link"
                  title={proofRegistryAddress}
                >
                  {shortHash(proofRegistryAddress)}
                </a>
              </dd>
            </div>
          </dl>

          <p className="proof-note">
            ChainTrace stores hashes and references, not sensitive business files. To verify a document,
            recalculate its SHA-256 hash and compare it with the file hash shown on this page.
          </p>

          <div className="proof-tools">
            <SharePanel proofId={proofId} />
            <ProofVerifier expectedHash={proof.fileHash} />
          </div>
        </article>
      </section>
    </main>
  );
}
