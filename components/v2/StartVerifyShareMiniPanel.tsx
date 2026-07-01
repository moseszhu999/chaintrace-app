"use client";

import { useEffect, useMemo, useState } from "react";
import { verifyMessage } from "viem";

type Props = {
  zh: boolean;
};

type CheckResult = {
  label: string;
  status: "PASS" | "FAIL" | "WARN" | "INFO";
  detail: string;
};

type VerifyResult = {
  status: "PASS" | "FAIL" | "WARN";
  summary: string;
  claimedHash?: string;
  recomputedHash?: string;
  rawFileHash?: string;
  signerAddress?: string;
  signatureStatus: "VERIFIED" | "FAILED" | "NOT_PROVIDED";
  checks: CheckResult[];
};

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

function hexFromDigest(digest: ArrayBuffer) {
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  return hexFromDigest(await crypto.subtle.digest("SHA-256", data));
}

async function sha256File(file: File) {
  return hexFromDigest(await crypto.subtle.digest("SHA-256", await file.arrayBuffer()));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function readLatestProofPackText() {
  const raw = window.localStorage.getItem(localProofPacksKey);
  if (!raw) return "";
  try {
    const packs = JSON.parse(raw) as unknown;
    if (!Array.isArray(packs) || !packs.length) return "";
    return JSON.stringify(packs[0], null, 2);
  } catch {
    window.localStorage.removeItem(localProofPacksKey);
    return "";
  }
}

function finalStatus(checks: CheckResult[]): VerifyResult["status"] {
  if (checks.some((check) => check.status === "FAIL")) return "FAIL";
  if (checks.some((check) => check.status === "WARN")) return "WARN";
  return "PASS";
}

async function verifyProofPack(input: Record<string, unknown>, rawFileHash?: string): Promise<VerifyResult> {
  const checks: CheckResult[] = [];
  const proof = asRecord(input.proof);
  const caseProof = asRecord(input.caseProof);
  const organizationProof = asRecord(input.organizationProof);
  const evidenceProofs = Array.isArray(input.evidenceProofs) ? input.evidenceProofs : null;

  if (!proof || !caseProof || !evidenceProofs) {
    return {
      status: "FAIL",
      summary: "Invalid Proof Pack shape.",
      signatureStatus: "NOT_PROVIDED",
      checks: [{ label: "Shape", status: "FAIL", detail: "proof, caseProof, and evidenceProofs are required." }],
    };
  }

  const claimedHash = typeof proof.passportRootHash === "string" ? proof.passportRootHash : undefined;
  const orgProfileHash = typeof proof.orgProfileHash === "string" ? proof.orgProfileHash : null;
  const caseRootHash = typeof proof.caseRootHash === "string" ? proof.caseRootHash : undefined;
  const claimedEvidenceRootHash = typeof proof.evidenceRootHash === "string" ? proof.evidenceRootHash : undefined;
  const claimedEvidenceCount = typeof proof.evidenceCount === "number" ? proof.evidenceCount : undefined;
  const signerAddress = typeof proof.signerAddress === "string" ? proof.signerAddress : undefined;
  const signature = typeof proof.signature === "string" ? proof.signature : undefined;
  const signedMessage = typeof proof.signedMessage === "string" ? proof.signedMessage : undefined;

  const caseProofProof = asRecord(caseProof.proof);
  const caseProofHash = typeof caseProofProof?.caseRootHash === "string" ? caseProofProof.caseRootHash : undefined;
  const orgProofProof = asRecord(organizationProof?.proof);
  const orgProofHash = typeof orgProofProof?.orgProfileHash === "string" ? orgProofProof.orgProfileHash : null;

  const evidenceRecords = evidenceProofs.map((item) => asRecord(item));
  const evidenceHashes = evidenceRecords
    .map((item) => asRecord(item?.proof)?.evidenceHash)
    .filter((hash): hash is string => typeof hash === "string")
    .sort();
  const fileHashes = evidenceRecords
    .map((item) => asRecord(item?.evidence)?.fileSha256)
    .filter((hash): hash is string => typeof hash === "string");

  const recomputedEvidenceRootHash = await sha256Hex(stableStringify({ caseRootHash, evidenceHashes }));
  const recomputedHash = await sha256Hex(stableStringify({
    version: "chaintrace-local-proof-pack-v1",
    orgProfileHash,
    caseRootHash,
    evidenceRootHash: recomputedEvidenceRootHash,
    evidenceHashes,
  }));

  checks.push({ label: "Passport root hash", status: claimedHash === recomputedHash ? "PASS" : "FAIL", detail: "passportRootHash must match the recomputed passport root." });
  checks.push({ label: "Evidence root hash", status: claimedEvidenceRootHash === recomputedEvidenceRootHash ? "PASS" : "FAIL", detail: "evidenceRootHash must match the sorted evidence hash set." });
  checks.push({ label: "Case root binding", status: caseRootHash === caseProofHash ? "PASS" : "FAIL", detail: "proof.caseRootHash should match caseProof.proof.caseRootHash." });
  checks.push({ label: "Organization binding", status: orgProfileHash === orgProofHash || orgProfileHash === null ? "PASS" : "WARN", detail: "proof.orgProfileHash should match organizationProof.proof.orgProfileHash when present." });
  checks.push({ label: "Evidence count", status: claimedEvidenceCount === evidenceHashes.length ? "PASS" : "FAIL", detail: "proof.evidenceCount should match evidenceProofs length." });
  checks.push(rawFileHash
    ? { label: "Raw file appears in pack", status: fileHashes.includes(rawFileHash) ? "PASS" : "FAIL", detail: fileHashes.includes(rawFileHash) ? "Uploaded raw file matches one evidence.fileSha256 in this Proof Pack." : "Uploaded raw file does not match any evidence.fileSha256 in this Proof Pack." }
    : { label: "Raw file re-verify", status: "INFO", detail: "No raw file was provided for byte-level re-verification." });

  let signatureStatus: VerifyResult["signatureStatus"] = "NOT_PROVIDED";
  if (signerAddress && signature && signedMessage) {
    const messageContainsHash = claimedHash ? signedMessage.includes(claimedHash) : false;
    checks.push({ label: "Passport signed message binding", status: messageContainsHash ? "PASS" : "FAIL", detail: "signedMessage must include passportRootHash." });
    try {
      const verified = await verifyMessage({ address: signerAddress as `0x${string}`, message: signedMessage, signature: signature as `0x${string}` });
      signatureStatus = verified ? "VERIFIED" : "FAILED";
      checks.push({ label: "Passport wallet signature", status: verified ? "PASS" : "FAIL", detail: verified ? "Signature recovers the claimed signer address." : "Signature does not recover the claimed signer address." });
    } catch (error) {
      signatureStatus = "FAILED";
      checks.push({ label: "Passport wallet signature", status: "FAIL", detail: error instanceof Error ? error.message : "Signature verification failed." });
    }
  } else {
    checks.push({ label: "Passport wallet signature", status: "WARN", detail: "No passportRootHash wallet signature was provided." });
  }

  const status = finalStatus(checks);
  return {
    status,
    summary: status === "FAIL" ? "Proof Pack failed verification." : status === "WARN" ? "Proof Pack hash is valid, but signature or optional binding is incomplete." : "Proof Pack passed verification.",
    claimedHash,
    recomputedHash,
    rawFileHash,
    signerAddress,
    signatureStatus,
    checks,
  };
}

export function StartVerifyShareMiniPanel({ zh }: Props) {
  const [jsonText, setJsonText] = useState("");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setJsonText(readLatestProofPackText());
  }, []);

  const latestHash = useMemo(() => {
    try {
      const parsed = asRecord(JSON.parse(jsonText));
      const proof = asRecord(parsed?.proof);
      return typeof proof?.passportRootHash === "string" ? proof.passportRootHash : null;
    } catch {
      return null;
    }
  }, [jsonText]);

  async function verify() {
    setBusy(true);
    setMessage(null);
    setResult(null);
    try {
      const parsed = asRecord(JSON.parse(jsonText));
      if (!parsed) throw new Error("JSON must be an object.");
      if (parsed.version !== "chaintrace-local-proof-pack-v1") throw new Error("Start quick verifier currently expects a Proof Pack JSON.");
      const rawFileHash = rawFile ? await sha256File(rawFile) : undefined;
      const verifyResult = await verifyProofPack(parsed, rawFileHash);
      setResult(verifyResult);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to verify Proof Pack.");
    } finally {
      setBusy(false);
    }
  }

  async function copyJson() {
    await navigator.clipboard.writeText(jsonText);
    setMessage(t(zh, "Proof Pack JSON 已复制。", "Proof Pack JSON copied."));
  }

  function reloadLatest() {
    setJsonText(readLatestProofPackText());
    setResult(null);
    setMessage(t(zh, "已重新读取最新本地 Proof Pack。", "Latest local Proof Pack reloaded."));
  }

  return (
    <section className="proof-flow-card">
      <div className="section-heading compact-heading">
        <span>{t(zh, "Step 5", "Step 5")}</span>
        <h2>{t(zh, "验证 / 分享 Proof Pack", "Verify / Share Proof Pack")}</h2>
        <p>{t(zh, "在本页快速验证最新 Proof Pack；也可以粘贴外部 Proof Pack JSON，并可选上传原文件重验 fileSha256。", "Quick-verify the latest Proof Pack here; you can also paste an external Proof Pack JSON and optionally upload the raw file to re-verify fileSha256.")}</p>
      </div>
      <div className="workspace-form">
        <label>{t(zh, "Proof Pack JSON", "Proof Pack JSON")}
          <textarea rows={10} value={jsonText} onChange={(event) => setJsonText(event.target.value)} placeholder="Paste Proof Pack JSON here" />
        </label>
        <label>{t(zh, "可选：原始文件重验", "Optional: raw file re-verify")}
          <input type="file" onChange={(event) => setRawFile(event.target.files?.[0] ?? null)} />
        </label>
        <div className="hero-actions">
          <button className="primary-button" type="button" disabled={!jsonText.trim() || busy} onClick={verify}>
            {busy ? t(zh, "验证中…", "Verifying…") : t(zh, "验证 Proof Pack", "Verify Proof Pack")}
          </button>
          <button className="secondary-button" type="button" onClick={reloadLatest}>{t(zh, "读取最新本地 Proof Pack", "Load latest local Proof Pack")}</button>
          <button className="secondary-button" type="button" disabled={!jsonText.trim()} onClick={copyJson}>{t(zh, "复制 JSON", "Copy JSON")}</button>
        </div>
        {latestHash ? <p className="form-note">passportRootHash: {latestHash.slice(0, 24)}...</p> : null}
        {rawFile ? <p className="form-note">{rawFile.name} / {rawFile.size} bytes</p> : null}
        {message ? <p className="form-note">{message}</p> : null}
      </div>
      {result ? (
        <div className="proof-flow-card">
          <div className="section-heading compact-heading">
            <span>{result.status}</span>
            <h2>{result.summary}</h2>
            <p>{t(zh, "这个结果只证明 hash / signature 一致性，不证明贸易真实性、信用质量或融资资格。", "This result only proves hash / signature consistency, not trade truth, credit quality, or financing eligibility.")}</p>
          </div>
          <div className="proof-details">
            <div><dt>claimed</dt><dd>{result.claimedHash?.slice(0, 24) ?? "N/A"}</dd></div>
            <div><dt>recomputed</dt><dd>{result.recomputedHash?.slice(0, 24) ?? "N/A"}</dd></div>
            <div><dt>signature</dt><dd>{result.signatureStatus}</dd></div>
            <div><dt>raw file</dt><dd>{result.rawFileHash?.slice(0, 24) ?? "not provided"}</dd></div>
          </div>
          <div className="table-like-list">
            {result.checks.map((check) => (
              <div className="table-like-row" key={check.label}>
                <div><strong>{check.label}</strong><span>{check.detail}</span></div>
                <div><strong>{check.status}</strong><span>local verifier</span></div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
