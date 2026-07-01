"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrganizationContext } from "@/lib/v2/organization-types";
import type { TradeCaseRecordV2 } from "@/lib/v2/trade-case-types";

type LocalProofPackClientProps = {
  zh: boolean;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type LocalOrganizationProofBundle = {
  version: "chaintrace-local-org-proof-v1";
  organization: OrganizationContext["organization"];
  membership: OrganizationContext["membership"];
  privateProfile: Record<string, unknown>;
  proof: {
    proofType: "ORG_PROFILE_HASH";
    algorithm: "SHA-256";
    orgProfileHash: string;
    chainCommitStatus: "NOT_COMMITTED" | "COMMITTED";
    rawProfileStored: "BROWSER_LOCAL_ONLY";
    signerAddress?: string;
    signature?: string;
    signedMessage?: string;
    signedAt?: string;
  };
};

type LocalTradeCaseBundle = {
  version: "chaintrace-local-trade-case-v1";
  case: TradeCaseRecordV2;
  privateData: Record<string, unknown>;
  proof: {
    proofType: "CASE_ROOT_HASH";
    algorithm: "SHA-256";
    caseRootHash: string;
    sellerOrgProfileHash: string | null;
    chainCommitStatus: "NOT_COMMITTED" | "COMMITTED";
    rawCaseStored: "BROWSER_LOCAL_ONLY";
  };
};

type LocalEvidenceBundle = {
  version: "chaintrace-local-evidence-bundle-v1";
  evidence: {
    id: string;
    caseId: string;
    caseRootHash: string;
    evidenceType: string;
    stageCode: string;
    filename: string;
    mimeType: string | null;
    fileSize: number;
    fileSha256: string;
    uploadedAt: string;
  };
  proof: {
    proofType: "EVIDENCE_FILE_HASH";
    algorithm: "SHA-256";
    evidenceHash: string;
    evidenceRootHash: string;
    caseRootHash: string;
    evidenceCountForCase: number;
    chainCommitStatus: "NOT_COMMITTED" | "COMMITTED";
    rawFileStored: "USER_LOCAL_ONLY";
  };
};

type LocalProofPackBundle = {
  version: "chaintrace-local-proof-pack-v1";
  generatedAt: string;
  organizationProof: LocalOrganizationProofBundle | null;
  caseProof: LocalTradeCaseBundle;
  evidenceProofs: LocalEvidenceBundle[];
  proof: {
    proofType: "TRADE_EVIDENCE_PASSPORT_ROOT";
    algorithm: "SHA-256";
    orgProfileHash: string | null;
    caseRootHash: string;
    evidenceRootHash: string;
    passportRootHash: string;
    evidenceCount: number;
    chainCommitStatus: "NOT_COMMITTED" | "COMMITTED";
    rawFilesIncluded: false;
    signerAddress?: string;
    signature?: string;
    signedMessage?: string;
    signedAt?: string;
  };
};

const currentOrgStorageKey = "chaintrace_v2_current_org";
const localTradeCasesKey = "chaintrace_v2_trade_cases";
const localEvidenceKey = "chaintrace_v2_evidence_bundles";
const localProofPacksKey = "chaintrace_v2_proof_packs";

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "proof-pack";
}

function readJson<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function writeProofPacks(packs: LocalProofPackBundle[]) {
  window.localStorage.setItem(localProofPacksKey, JSON.stringify(packs));
}

function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum ?? null;
}

async function computeEvidenceRootHash(caseRootHash: string, evidenceProofs: LocalEvidenceBundle[]) {
  const evidenceHashes = evidenceProofs.map((bundle) => bundle.proof.evidenceHash).sort();
  return sha256Hex(stableStringify({ caseRootHash, evidenceHashes }));
}

function passportWalletMessage(pack: LocalProofPackBundle) {
  return [
    "ChainTrace Trade Evidence Passport",
    "",
    `Case: ${pack.caseProof.case.caseName}`,
    `Passport Root Hash: ${pack.proof.passportRootHash}`,
    `Case Root Hash: ${pack.proof.caseRootHash}`,
    `Evidence Root Hash: ${pack.proof.evidenceRootHash}`,
    `Evidence Count: ${pack.proof.evidenceCount}`,
    `Generated At: ${pack.generatedAt}`,
    "",
    "I control and sign this trade evidence passport root hash.",
  ].join("\n");
}

export function LocalProofPackClient({ zh }: LocalProofPackClientProps) {
  const [organizationProof, setOrganizationProof] = useState<LocalOrganizationProofBundle | null>(null);
  const [caseBundles, setCaseBundles] = useState<LocalTradeCaseBundle[]>([]);
  const [evidenceBundles, setEvidenceBundles] = useState<LocalEvidenceBundle[]>([]);
  const [proofPacks, setProofPacks] = useState<LocalProofPackBundle[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const org = readJson<LocalOrganizationProofBundle | null>(currentOrgStorageKey, null);
    const cases = readJson<LocalTradeCaseBundle[]>(localTradeCasesKey, []);
    const evidences = readJson<LocalEvidenceBundle[]>(localEvidenceKey, []);
    const packs = readJson<LocalProofPackBundle[]>(localProofPacksKey, []);
    setOrganizationProof(org?.version === "chaintrace-local-org-proof-v1" ? org : null);
    setCaseBundles(Array.isArray(cases) ? cases.filter((item) => item.version === "chaintrace-local-trade-case-v1") : []);
    setEvidenceBundles(Array.isArray(evidences) ? evidences.filter((item) => item.version === "chaintrace-local-evidence-bundle-v1") : []);
    setProofPacks(Array.isArray(packs) ? packs.filter((item) => item.version === "chaintrace-local-proof-pack-v1") : []);
    setSelectedCaseId((previous) => previous || cases[0]?.case.id || "");
  }, []);

  const selectedCase = useMemo(() => caseBundles.find((bundle) => bundle.case.id === selectedCaseId) ?? null, [caseBundles, selectedCaseId]);
  const selectedEvidence = useMemo(() => {
    if (!selectedCase) return [];
    return evidenceBundles.filter((bundle) => bundle.proof.caseRootHash === selectedCase.proof.caseRootHash);
  }, [evidenceBundles, selectedCase]);

  async function generateProofPack() {
    if (!selectedCase || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const generatedAt = new Date().toISOString();
      const caseRootHash = selectedCase.proof.caseRootHash;
      const evidenceRootHash = await computeEvidenceRootHash(caseRootHash, selectedEvidence);
      const orgProfileHash = organizationProof?.proof.orgProfileHash ?? selectedCase.proof.sellerOrgProfileHash ?? null;
      const passportRootHash = await sha256Hex(stableStringify({
        version: "chaintrace-local-proof-pack-v1",
        orgProfileHash,
        caseRootHash,
        evidenceRootHash,
        evidenceHashes: selectedEvidence.map((bundle) => bundle.proof.evidenceHash).sort(),
      }));
      const proofPack: LocalProofPackBundle = {
        version: "chaintrace-local-proof-pack-v1",
        generatedAt,
        organizationProof,
        caseProof: selectedCase,
        evidenceProofs: selectedEvidence,
        proof: {
          proofType: "TRADE_EVIDENCE_PASSPORT_ROOT",
          algorithm: "SHA-256",
          orgProfileHash,
          caseRootHash,
          evidenceRootHash,
          passportRootHash,
          evidenceCount: selectedEvidence.length,
          chainCommitStatus: "NOT_COMMITTED",
          rawFilesIncluded: false,
        },
      };
      const nextPacks = [proofPack, ...proofPacks.filter((pack) => pack.proof.passportRootHash !== passportRootHash)];
      writeProofPacks(nextPacks);
      setProofPacks(nextPacks);
      setMessage(t(zh, "Proof Pack 已生成。", "Proof Pack generated."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate Proof Pack.");
    } finally {
      setBusy(false);
    }
  }

  async function connectWallet() {
    const provider = getEthereumProvider();
    if (!provider) {
      setMessage(t(zh, "未检测到钱包。请安装 MetaMask 或兼容钱包。", "No wallet detected. Install MetaMask or a compatible wallet."));
      return null;
    }
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const account = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : null;
    if (!account) throw new Error("No wallet account returned.");
    setWalletAddress(account);
    setMessage(t(zh, "钱包已连接。", "Wallet connected."));
    return account;
  }

  async function signProofPack(pack: LocalProofPackBundle) {
    setBusy(true);
    setMessage(null);
    try {
      const provider = getEthereumProvider();
      if (!provider) throw new Error(t(zh, "未检测到钱包。", "No wallet detected."));
      const signer = walletAddress ?? await connectWallet();
      if (!signer) throw new Error("No wallet signer available.");
      const signedMessage = passportWalletMessage(pack);
      const signature = await provider.request({ method: "personal_sign", params: [signedMessage, signer] });
      if (typeof signature !== "string") throw new Error("Wallet did not return a signature.");
      const signedPack: LocalProofPackBundle = {
        ...pack,
        proof: {
          ...pack.proof,
          signerAddress: signer,
          signature,
          signedMessage,
          signedAt: new Date().toISOString(),
        },
      };
      const nextPacks = [signedPack, ...proofPacks.filter((item) => item.proof.passportRootHash !== pack.proof.passportRootHash)];
      writeProofPacks(nextPacks);
      setProofPacks(nextPacks);
      setMessage(t(zh, "Passport Root 已由钱包签名。", "Passport Root signed by wallet."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to sign Passport Root.");
    } finally {
      setBusy(false);
    }
  }

  function downloadProofPack(pack: LocalProofPackBundle) {
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chaintrace-proof-pack-${safeFileName(pack.caseProof.case.caseName)}-${pack.proof.passportRootHash.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(t(zh, "Proof Pack 已下载。", "Proof Pack downloaded."));
  }

  async function copyHash(hash: string) {
    await navigator.clipboard.writeText(hash);
    setMessage(t(zh, "Passport Root Hash 已复制。", "Passport Root Hash copied."));
  }

  return (
    <div className="workspace-stack">
      <div className="stats-grid">
        <article className="metric-card">
          <span>{t(zh, "组织 Proof", "Organization Proof")}</span>
          <strong>{organizationProof ? "1" : "0"}</strong>
          <small>{organizationProof?.proof.orgProfileHash?.slice(0, 24) ?? t(zh, "未找到", "Not found")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "本地 Case", "Local Cases")}</span>
          <strong>{caseBundles.length}</strong>
          <small>{t(zh, "从 localStorage 读取。", "Loaded from localStorage.")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "钱包", "Wallet")}</span>
          <strong>{walletAddress ? walletAddress.slice(0, 10) + "…" : "—"}</strong>
          <small>{t(zh, "用于签名 Passport Root。", "Used to sign Passport Root.")}</small>
        </article>
      </div>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Proof Pack", "Proof Pack")}</span>
          <h2>{t(zh, "生成 Trade Evidence Passport", "Generate Trade Evidence Passport")}</h2>
          <p>{t(zh, "把组织、Case、Evidence 的 proof 合成一个可交付 JSON。生成后可用钱包签名 passportRootHash。", "Bundle organization, case, and evidence proofs into a deliverable JSON. After generation, sign passportRootHash with a wallet.")}</p>
        </div>

        {caseBundles.length ? (
          <div className="workspace-form">
            <label>{t(zh, "选择 Case", "Select Case")}
              <select value={selectedCaseId} onChange={(event) => setSelectedCaseId(event.target.value)}>
                {caseBundles.map((bundle) => <option key={bundle.case.id} value={bundle.case.id}>{bundle.case.caseName}</option>)}
              </select>
            </label>
            <div className="proof-details">
              <div><dt>{t(zh, "Case Root", "Case Root")}</dt><dd>{selectedCase?.proof.caseRootHash ?? "—"}</dd></div>
              <div><dt>{t(zh, "Evidence Count", "Evidence Count")}</dt><dd>{selectedEvidence.length}</dd></div>
              <div><dt>{t(zh, "Org Hash", "Org Hash")}</dt><dd>{organizationProof?.proof.orgProfileHash ?? selectedCase?.proof.sellerOrgProfileHash ?? "—"}</dd></div>
            </div>
            <button className="primary-button" type="button" onClick={generateProofPack} disabled={!selectedCase || busy}>
              {busy ? t(zh, "生成中…", "Generating…") : t(zh, "生成 Proof Pack", "Generate Proof Pack")}
            </button>
            <button className="secondary-button" type="button" onClick={connectWallet} disabled={busy}>
              {walletAddress ? t(zh, "钱包已连接", "Wallet connected") : t(zh, "连接钱包", "Connect Wallet")}
            </button>
            {message ? <p className="form-note">{message}</p> : null}
          </div>
        ) : (
          <div className="empty-state-card">{t(zh, "还没有本地 Case。请先创建组织、Case，并添加 Evidence。", "No local case yet. Create organization, case, and evidence first.")}</div>
        )}
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Generated Packs", "Generated Packs")}</span>
          <h2>{t(zh, "本地 Proof Packs", "Local Proof Packs")}</h2>
        </div>
        <div className="proof-flow-grid">
          {proofPacks.length ? proofPacks.map((pack) => (
            <article className="proof-flow-card" key={pack.proof.passportRootHash}>
              <strong>{pack.caseProof.case.caseName}</strong>
              <span>passport: {pack.proof.passportRootHash.slice(0, 24)}…</span>
              <span>case: {pack.proof.caseRootHash.slice(0, 24)}…</span>
              <span>evidence root: {pack.proof.evidenceRootHash.slice(0, 24)}…</span>
              <span>{t(zh, "Evidence 数", "Evidence count")}: {pack.proof.evidenceCount}</span>
              <span>{t(zh, "签名", "Signature")}: {pack.proof.signature ? "SIGNED" : "NOT_SIGNED"}</span>
              <span>{pack.proof.signerAddress ?? t(zh, "未绑定 signer", "No signer bound")}</span>
              <button className="secondary-button" type="button" onClick={() => copyHash(pack.proof.passportRootHash)}>Passport Root</button>
              <button className="secondary-button" type="button" onClick={() => signProofPack(pack)} disabled={busy}>{t(zh, "签名 Passport Root", "Sign Passport Root")}</button>
              <button className="secondary-button" type="button" onClick={() => downloadProofPack(pack)}>{t(zh, "下载 Proof Pack", "Download Proof Pack")}</button>
            </article>
          )) : (
            <div className="empty-state-card">{t(zh, "还没有 Proof Pack。", "No Proof Pack yet.")}</div>
          )}
        </div>
      </section>
    </div>
  );
}
