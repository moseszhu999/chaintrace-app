"use client";

import { useEffect, useMemo, useState } from "react";
import { dictionary, type Locale, normalizeLocale } from "@/lib/i18n";

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )chaintrace_locale=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}

export function SharePanel({ proofId, path }: { proofId?: string; path?: string }) {
  const [copyStatus, setCopyStatus] = useState("");
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  const t = dictionary[locale].share;
  const proofPath = path ?? `/proof/${proofId ?? ""}`;

  const proofUrl = useMemo(() => {
    if (typeof window === "undefined") return proofPath;
    return `${window.location.origin}${proofPath}`;
  }, [proofPath]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(proofUrl)}`;

  async function copyProofUrl() {
    try {
      await navigator.clipboard.writeText(proofUrl);
      setCopyStatus(t.copied);
    } catch {
      setCopyStatus(t.copyFailed);
    }
  }

  return (
    <section className="share-box">
      <div className="qr-card">
        <img src={qrUrl} alt="QR code for ChainTrace proof" />
      </div>
      <div className="share-content">
        <strong>{t.shareThisProof}</strong>
        <p>{t.shareText}</p>
        <div className="share-url">{proofUrl}</div>
        <button type="button" className="primary-button button-reset" onClick={copyProofUrl}>
          {t.copyLink}
        </button>
        {copyStatus && <span>{copyStatus}</span>}
      </div>
    </section>
  );
}
