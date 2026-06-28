"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProofVerifier } from "@/components/ProofVerifier";
import { SharePanel } from "@/components/SharePanel";
import { type Locale, normalizeLocale } from "@/lib/i18n";

function getValue(params: URLSearchParams, key: string, fallback: string): string {
  return params.get(key) || fallback;
}

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )chaintrace_locale=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}

export function DemoProofClient() {
  const params = useSearchParams();
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  const zh = locale === "zh-CN";
  const fileHash = getValue(params, "hash", "") as `0x${string}`;
  const proofType = getValue(params, "type", "demo");
  const title = getValue(params, "title", zh ? "Demo 证明" : "Demo Proof");
  const business = getValue(params, "business", zh ? "Demo 企业" : "Demo Business");
  const batch = getValue(params, "batch", "DEMO-BATCH");
  const fileName = getValue(params, "file", zh ? "原始文件" : "Original file");
  const created = getValue(params, "created", new Date().toISOString());
  const sharePath = `/demo-proof?${params.toString()}`;

  if (!fileHash.startsWith("0x")) {
    return (
      <main className="page-shell">
        <section className="hero">
          <div className="eyebrow">ChainTrace Demo Proof</div>
          <h1>{zh ? "Demo 证明无法加载。" : "Demo proof could not be loaded."}</h1>
          <p>{zh ? "这个 Demo 证明链接不包含有效的文件哈希。" : "This demo proof link does not contain a valid file hash."}</p>
          <div className="hero-actions">
            <Link href="/" className="primary-button">{zh ? "创建 Demo 证明" : "Create a demo proof"}</Link>
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
          {zh
            ? "这是一个无 Gas Demo 证明。它使用同样的浏览器本地 SHA-256 校验流程，但没有进行链上锚定，适合产品测试和演示。"
            : "This is a gas-free demo proof. It uses the same browser-side SHA-256 verification flow, but it is not anchored on-chain. Use this mode for product testing and UI demos."}
        </p>
        <div className="hero-actions">
          <Link href="/" className="primary-button">{zh ? "创建自己的证明" : "Create your own proof"}</Link>
        </div>
      </section>

      <section className="workspace single-column">
        <article className="panel proof-card public-proof-card">
          <div className="proof-card-header">
            <div>
              <span className="proof-type">{proofType}</span>
              <h3>{zh ? "无 Gas Demo 证明" : "Gas-free demo proof"}</h3>
            </div>
            <div className="status-pill">{zh ? "Demo 模式" : "Demo mode"}</div>
          </div>

          <dl className="proof-details">
            <div>
              <dt>{zh ? "模式" : "Mode"}</dt>
              <dd>{zh ? "Demo 证明，未上链" : "Demo proof, not on-chain"}</dd>
            </div>
            <div>
              <dt>{zh ? "企业" : "Business"}</dt>
              <dd>{business}</dd>
            </div>
            <div>
              <dt>{zh ? "批次 / 订单号" : "Batch / order ID"}</dt>
              <dd>{batch}</dd>
            </div>
            <div>
              <dt>{zh ? "文件" : "File"}</dt>
              <dd>{fileName}</dd>
            </div>
            <div>
              <dt>{zh ? "文件哈希" : "File hash"}</dt>
              <dd className="hash-value" title={fileHash}>{fileHash}</dd>
            </div>
            <div>
              <dt>{zh ? "创建时间" : "Created"}</dt>
              <dd>{new Date(created).toLocaleString()}</dd>
            </div>
          </dl>

          <p className="proof-note">
            {zh
              ? "这个链接适合在不使用钱包 gas 或 faucet 的情况下测试 ChainTrace 用户体验。生产级可信证明应将同一个文件哈希锚定到公开链。"
              : "This link is useful for testing the ChainTrace user experience without wallet gas or faucets. For production trust, anchor the same file hash on a public chain."}
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
