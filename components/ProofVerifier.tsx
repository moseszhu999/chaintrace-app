"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { sha256File, shortHash } from "@/lib/hash";
import { type Locale, normalizeLocale } from "@/lib/i18n";

const verifierText = {
  en: {
    title: "Verify the original file",
    description: "Select the original file. ChainTrace will calculate its SHA-256 hash in your browser and compare it with the indexed hash.",
    fileToVerify: "File to verify",
    calculating: "Calculating file hash locally...",
    failed: "Failed to verify file.",
    match: "Hash match",
    mismatch: "Hash mismatch",
    warning: "This file does not match the indexed hash. It may be a different file, modified file, or corrupted copy.",
  },
  "zh-CN": {
    title: "验证原始文件",
    description: "选择原始文件。ChainTrace 会在浏览器本地计算 SHA-256 哈希，并与索引中的哈希进行比对。",
    fileToVerify: "要验证的文件",
    calculating: "正在本地计算文件哈希...",
    failed: "文件验证失败。",
    match: "哈希匹配",
    mismatch: "哈希不匹配",
    warning: "该文件与索引哈希不匹配，可能是不同文件、被修改过的文件，或损坏的副本。",
  },
};

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )chaintrace_locale=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}

export function ProofVerifier({ expectedHash }: { expectedHash: `0x${string}` }) {
  const [fileName, setFileName] = useState("");
  const [calculatedHash, setCalculatedHash] = useState<`0x${string}` | "">("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  const t = verifierText[locale];
  const isMatch = calculatedHash && calculatedHash.toLowerCase() === expectedHash.toLowerCase();
  const isMismatch = calculatedHash && calculatedHash.toLowerCase() !== expectedHash.toLowerCase();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setCalculatedHash("");

    if (!file) return;

    try {
      setIsChecking(true);
      setFileName(file.name);
      const hash = await sha256File(file);
      setCalculatedHash(hash as `0x${string}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.failed);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="verify-box">
      <div>
        <strong>{t.title}</strong>
        <p>{t.description}</p>
      </div>

      <label>
        {t.fileToVerify}
        <input type="file" onChange={handleFileChange} />
      </label>

      {isChecking && <div className="notice">{t.calculating}</div>}
      {error && <div className="error">{error}</div>}

      {calculatedHash && (
        <div className={isMatch ? "verify-result match" : "verify-result mismatch"}>
          <strong>{isMatch ? t.match : t.mismatch}</strong>
          <span>{fileName}</span>
          <span title={calculatedHash}>{shortHash(calculatedHash)}</span>
        </div>
      )}

      {isMismatch && <p className="verify-warning">{t.warning}</p>}
    </section>
  );
}
