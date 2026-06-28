"use client";

import { useMemo, useState } from "react";

export function SharePanel({ proofId, path }: { proofId?: string; path?: string }) {
  const [copyStatus, setCopyStatus] = useState("");

  const proofPath = path ?? `/proof/${proofId ?? ""}`;

  const proofUrl = useMemo(() => {
    if (typeof window === "undefined") return proofPath;
    return `${window.location.origin}${proofPath}`;
  }, [proofPath]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(proofUrl)}`;

  async function copyProofUrl() {
    try {
      await navigator.clipboard.writeText(proofUrl);
      setCopyStatus("Copied proof link.");
    } catch {
      setCopyStatus("Could not copy automatically. Select and copy the link manually.");
    }
  }

  return (
    <section className="share-box">
      <div className="qr-card">
        <img src={qrUrl} alt="QR code for ChainTrace proof" />
      </div>
      <div className="share-content">
        <strong>Share this proof</strong>
        <p>Send this link or QR code to a buyer, logistics partner, financier, or auditor.</p>
        <div className="share-url">{proofUrl}</div>
        <button type="button" className="primary-button button-reset" onClick={copyProofUrl}>
          Copy proof link
        </button>
        {copyStatus && <span>{copyStatus}</span>}
      </div>
    </section>
  );
}
