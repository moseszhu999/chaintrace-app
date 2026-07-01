"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  zh: boolean;
  onDone?: () => void;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type LocalOrganizationProofBundle = {
  version: "chaintrace-local-org-proof-v1";
  organization: Record<string, unknown> | null;
  membership: Record<string, unknown> | null;
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
  case: {
    id: string;
    caseName: string;
  };
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
    filename: string;
    fileSha256: string;
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

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "proof-pack";
}

function getEthereumProvider(): EthereumProvider | null {
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

export function StartProofPackMiniForm({ zh, onDone }: Props) {
  const [organizationProof, setOrganizationProof] = useState<LocalOrganizationProofBundle | null>(null);
  const [caseBundles, setCaseBundles] = useState<LocalTradeCaseBundle[]>([]);
  const [evidenceBundles, setEvidenceBundles] = useState<LocalEvidenceBundle[]>([]);
  const [proofPacks, setProofPacks] = useState<LocalProofPackBundle[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function refresh() {
    const org = readJson<LocalOrganizationProofBundle | null>(currentOrgStorageKey, null);
    const cases = readJson<LocalTradeCaseBundle[]>(localTradeCasesKey, []);
    const evidences = readJson<LocalEvidenceBundle[]>(localEvidenceKey, []);
    const packs = readJson<LocalProofPackBundle[]>(localProofPacksKey, []);
    const validCases = Array.isArray(cases) ? cases.filter((item) => item.version === "chaintrace-local-trade-case-v1") : [];
    setOrganizationProof(org?.version === "chaintrace-local-org-proof-v1" ? org : null);
    setCaseBundles(validCases);
    setEvidenceBundles(Array.isArray(evidences) ? evidences.filter((item) => item.version === "chaintrace-local-evidence-bundle-v1") : []);
    setProofPacks(Array.isArray(packs) ? packs.filter((item) => item.version === "chaintrace-local-proof-pack-v1") : []);
    setSelectedCaseId((previous) => previous || validCases[0]?.case.id || "");
  }

  useEffect(() => {
    refresh();
  }, []);

  const selectedCase = useMemo(() => caseBundles.find((bundle) => bundle.case.id === selectedCaseId) ?? null, [caseBundles, selectedCaseId]);
  const selectedEvidence = useMemo(() => {
    if (!selectedCase) return [];
    return evidenceBundles.filter((bundle) => bundle.proof.caseRootHash === selectedCase.proof.caseRootHash);
  }, [evidenceBundles, selectedCase]);
  const latestPack = useMemo(() => {
    if (!selectedCase) return null;
    return proofPacks.find((pack) => pack.proof.caseRootHash === selectedCase.proof.caseRootHash) ?? null;
  }, [proofPacks, selectedCase]);

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
      onDone?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate Proof Pack.");
    } finally {
      setBusy(false);
    }
  }

  async function signLatestPack() {
    if (!latestPack || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const provider = getEthereumProvider();
      if (!provider) throw new Error(t(zh, "未检测到钱包。", "No wallet detected."));
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const signer = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : null;
      if (!signer) throw new Error("No wallet signer available.");
      const signedMessage = passportWalletMessage(latestPack);
      const signature = await provider.request({ method: "personal_sign", params: [signedMessage, signer] });
      if (typeof signature !== "string") throw new Error("Wallet did not return a signature.");
      const signedPack: LocalProofPackBundle = {
        ...latestPack,
        proof: {
          ...latestPack.proof,
          signerAddress: signer,
          signature,
          signedMessage,
          signedAt: new Date().toISOString(),
        },
      };
      const nextPacks = [signedPack, ...proofPacks.filter((pack) => pack.proof.passportRootHash !== latestPack.proof.passportRootHash)];
      writeProofPacks(nextPacks);
      setProofPacks(nextPacks);
      setWalletAddress(signer);
      setMessage(t(zh, "Passport Root 已完成钱包签名。", "Passport Root signed with wallet."));
      onDone?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to sign Proof Pack.");
    } finally {
      setBusy(false);
    }
  }

  function downloadLatestPack() {
    if (!latestPack) return;
    const blob = new Blob([JSON.stringify(latestPack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chaintrace-proof-pack-${safeFileName(latestPack.caseProof.case.caseName)}-${latestPack.proof.passportRootHash.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(t(zh, "Proof Pack 已下载。", "Proof Pack downloaded."));
  }

  return (
    <section className="proof-flow-card">
      <div className="section-heading compact-heading">
        <span>{t(zh, "Step 4", "Step 4")}</span>
        <h2>{t(zh, "生成 Proof Pack / Passport", "Generate Proof Pack / Passport")}</h2>
        <p>{t(zh, "聚合 Organization、Trade Case 和 Evidence proof，生成 passportRootHash。", "Bundle Organization, Trade Case, and Evidence proofs into a passportRootHash.")}</p>
      </div>
      <div className="workspace-form">
        <label>{t(zh, "选择 Case", "Select Case")}
          <select value={selectedCaseId} onChange={(event) => setSelectedCaseId(event.target.value)}>
            {caseBundles.map((bundle) => <option key={bundle.case.id} value={bundle.case.id}>{bundle.case.caseName}</option>)}
          </select>
        </label>
        <div className="proof-details">
          <div><dt>{t(zh, "Organization Proof", "Organization Proof")}</dt><dd>{organizationProof ? "READY" : "MISSING"}</dd></div>
          <div><dt>{t(zh, "Evidence Count", "Evidence Count")}</dt><dd>{selectedEvidence.length}</dd></div>
          <div><dt>{t(zh, "Latest Passport", "Latest Passport")}</dt><dd>{latestPack ? latestPack.proof.passportRootHash.slice(0, 16) : "NONE"}</dd></div>
          <div><dt>{t(zh, "Signature", "Signature")}</dt><dd>{latestPack?.proof.signature ? "SIGNED" : walletAddress ? "WALLET_CONNECTED" : "NOT_SIGNED"}</dd></div>
        </div>
        <button className="primary-button" type="button" disabled={!selectedCase || !selectedEvidence.length || busy} onClick={generateProofPack}>
          {busy ? t(zh, "生成中…", "Generating…") : t(zh, "生成 Proof Pack", "Generate Proof Pack")}
        </button>
        <button className="secondary-button" type="button" disabled={!latestPack || busy} onClick={signLatestPack}>
          {t(zh, "钱包签名 Passport Root", "Wallet-sign Passport Root")}
        </button>
        <button className="secondary-button" type="button" disabled={!latestPack} onClick={downloadLatestPack}>
          {t(zh, "下载 Proof Pack", "Download Proof Pack")}
        </button>
        {!caseBundles.length ? <p className="form-note">{t(zh, "请先完成 Step 2 Trade Case。", "Complete Step 2 Trade Case first.")}</p> : null}
        {selectedCase && !selectedEvidence.length ? <p className="form-note">{t(zh, "请先完成 Step 3 Evidence Hash。", "Complete Step 3 Evidence Hash first.")}</p> : null}
        {message ? <p className="form-note">{message}</p> : null}
      </div>
    </section>
  );
}
