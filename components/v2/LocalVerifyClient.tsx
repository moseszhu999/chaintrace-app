"use client";

import { useState } from "react";
import { verifyMessage } from "viem";

type CheckResult = {
  label: string;
  status: "PASS" | "FAIL" | "WARN" | "INFO";
  detail: string;
};

type VerifyResult = {
  kitType: "Organization Recovery Kit" | "Trade Case Kit" | "Evidence Kit" | "Unknown";
  status: "PASS" | "FAIL" | "WARN";
  summary: string;
  claimedHash?: string;
  recomputedHash?: string;
  signerAddress?: string;
  signatureStatus?: "VERIFIED" | "FAILED" | "NOT_PROVIDED";
  chainCommitStatus?: string;
  checks: CheckResult[];
};

type LocalVerifyClientProps = {
  zh: boolean;
};

function label(zh: boolean, cn: string, en: string) {
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function statusClass(status: CheckResult["status"] | VerifyResult["status"]) {
  if (status === "PASS") return "success";
  if (status === "WARN") return "warning";
  return "danger";
}

async function verifyOrganizationKit(input: Record<string, unknown>): Promise<VerifyResult> {
  const checks: CheckResult[] = [];
  const organization = asRecord(input.organization);
  const privateProfile = input.privateProfile;
  const proof = asRecord(input.proof);

  if (!organization || !privateProfile || !proof) {
    return {
      kitType: "Organization Recovery Kit",
      status: "FAIL",
      summary: "Invalid organization kit shape.",
      checks: [{ label: "Shape", status: "FAIL", detail: "organization, privateProfile, and proof are required." }],
    };
  }

  const claimedHash = typeof proof.orgProfileHash === "string" ? proof.orgProfileHash : undefined;
  const orgRegistryHash = typeof organization.orgRegistryHash === "string" ? organization.orgRegistryHash : undefined;
  const recomputedHash = await sha256Hex(stableStringify(privateProfile));

  checks.push({ label: "Profile hash", status: claimedHash === recomputedHash ? "PASS" : "FAIL", detail: `SHA-256(canonical privateProfile) ${claimedHash === recomputedHash ? "matches" : "does not match"} proof.orgProfileHash.` });
  checks.push({ label: "Organization hash mirror", status: orgRegistryHash === claimedHash ? "PASS" : "FAIL", detail: "organization.orgRegistryHash should mirror proof.orgProfileHash." });

  let signatureStatus: VerifyResult["signatureStatus"] = "NOT_PROVIDED";
  const signerAddress = typeof proof.signerAddress === "string" ? proof.signerAddress : undefined;
  const signature = typeof proof.signature === "string" ? proof.signature : undefined;
  const signedMessage = typeof proof.signedMessage === "string" ? proof.signedMessage : undefined;

  if (signerAddress && signature && signedMessage) {
    const messageContainsHash = claimedHash ? signedMessage.includes(claimedHash) : false;
    checks.push({ label: "Signed message hash binding", status: messageContainsHash ? "PASS" : "FAIL", detail: "signedMessage must include the org profile hash." });
    try {
      const verified = await verifyMessage({ address: signerAddress as `0x${string}`, message: signedMessage, signature: signature as `0x${string}` });
      signatureStatus = verified ? "VERIFIED" : "FAILED";
      checks.push({ label: "Wallet signature", status: verified ? "PASS" : "FAIL", detail: verified ? "Signature recovers the claimed signer address." : "Signature does not recover the claimed signer address." });
    } catch (error) {
      signatureStatus = "FAILED";
      checks.push({ label: "Wallet signature", status: "FAIL", detail: error instanceof Error ? error.message : "Signature verification failed." });
    }
  } else {
    checks.push({ label: "Wallet signature", status: "WARN", detail: "No wallet signature was provided." });
  }

  const failed = checks.some((check) => check.status === "FAIL");
  const warned = checks.some((check) => check.status === "WARN");
  return {
    kitType: "Organization Recovery Kit",
    status: failed ? "FAIL" : warned ? "WARN" : "PASS",
    summary: failed ? "Organization proof failed verification." : warned ? "Organization proof hash is valid, but signature is missing." : "Organization proof passed verification.",
    claimedHash,
    recomputedHash,
    signerAddress,
    signatureStatus,
    chainCommitStatus: typeof proof.chainCommitStatus === "string" ? proof.chainCommitStatus : undefined,
    checks,
  };
}

async function verifyTradeCaseKit(input: Record<string, unknown>): Promise<VerifyResult> {
  const checks: CheckResult[] = [];
  const tradeCase = asRecord(input.case);
  const privateData = input.privateData;
  const proof = asRecord(input.proof);

  if (!tradeCase || !privateData || !proof) {
    return {
      kitType: "Trade Case Kit",
      status: "FAIL",
      summary: "Invalid trade case kit shape.",
      checks: [{ label: "Shape", status: "FAIL", detail: "case, privateData, and proof are required." }],
    };
  }

  const claimedHash = typeof proof.caseRootHash === "string" ? proof.caseRootHash : undefined;
  const caseRecordHash = typeof tradeCase.caseRootHash === "string" ? tradeCase.caseRootHash : undefined;
  const recomputedHash = await sha256Hex(stableStringify(privateData));
  const sellerOrgProfileHash = typeof proof.sellerOrgProfileHash === "string" ? proof.sellerOrgProfileHash : null;
  const privateRecord = asRecord(privateData);
  const privateSellerHash = typeof privateRecord?.sellerOrgProfileHash === "string" ? privateRecord.sellerOrgProfileHash : null;

  checks.push({ label: "Case root hash", status: claimedHash === recomputedHash ? "PASS" : "FAIL", detail: `SHA-256(canonical privateData) ${claimedHash === recomputedHash ? "matches" : "does not match"} proof.caseRootHash.` });
  checks.push({ label: "Case hash mirror", status: caseRecordHash === claimedHash ? "PASS" : "FAIL", detail: "case.caseRootHash should mirror proof.caseRootHash." });
  checks.push({ label: "Seller organization linkage", status: sellerOrgProfileHash === privateSellerHash ? "PASS" : "WARN", detail: "proof.sellerOrgProfileHash should match privateData.sellerOrgProfileHash when present." });

  const failed = checks.some((check) => check.status === "FAIL");
  const warned = checks.some((check) => check.status === "WARN");
  return {
    kitType: "Trade Case Kit",
    status: failed ? "FAIL" : warned ? "WARN" : "PASS",
    summary: failed ? "Trade Case proof failed verification." : warned ? "Trade Case hash is valid, but seller linkage is incomplete." : "Trade Case proof passed verification.",
    claimedHash,
    recomputedHash,
    signatureStatus: "NOT_PROVIDED",
    chainCommitStatus: typeof proof.chainCommitStatus === "string" ? proof.chainCommitStatus : undefined,
    checks,
  };
}

async function verifyEvidenceKit(input: Record<string, unknown>): Promise<VerifyResult> {
  const checks: CheckResult[] = [];
  const evidence = asRecord(input.evidence);
  const proof = asRecord(input.proof);

  if (!evidence || !proof) {
    return {
      kitType: "Evidence Kit",
      status: "FAIL",
      summary: "Invalid evidence kit shape.",
      checks: [{ label: "Shape", status: "FAIL", detail: "evidence and proof are required." }],
    };
  }

  const claimedHash = typeof proof.evidenceHash === "string" ? proof.evidenceHash : undefined;
  const recomputedHash = await sha256Hex(stableStringify(evidence));
  const caseRootHash = typeof proof.caseRootHash === "string" ? proof.caseRootHash : undefined;
  const evidenceCaseRootHash = typeof evidence.caseRootHash === "string" ? evidence.caseRootHash : undefined;
  const fileSha256 = typeof evidence.fileSha256 === "string" ? evidence.fileSha256 : undefined;
  const evidenceRootHash = typeof proof.evidenceRootHash === "string" ? proof.evidenceRootHash : undefined;

  checks.push({ label: "Evidence hash", status: claimedHash === recomputedHash ? "PASS" : "FAIL", detail: `SHA-256(canonical evidence manifest) ${claimedHash === recomputedHash ? "matches" : "does not match"} proof.evidenceHash.` });
  checks.push({ label: "Case root binding", status: caseRootHash === evidenceCaseRootHash ? "PASS" : "FAIL", detail: "proof.caseRootHash should match evidence.caseRootHash." });
  checks.push({ label: "File SHA-256 present", status: fileSha256 ? "PASS" : "FAIL", detail: "Evidence manifest must include the original file SHA-256." });
  checks.push({ label: "Evidence root present", status: evidenceRootHash ? "PASS" : "WARN", detail: "Evidence root anchors the case-level evidence set." });

  const failed = checks.some((check) => check.status === "FAIL");
  const warned = checks.some((check) => check.status === "WARN");
  return {
    kitType: "Evidence Kit",
    status: failed ? "FAIL" : warned ? "WARN" : "PASS",
    summary: failed ? "Evidence proof failed verification." : warned ? "Evidence hash is valid, but evidence root is incomplete." : "Evidence proof passed verification.",
    claimedHash,
    recomputedHash,
    signatureStatus: "NOT_PROVIDED",
    chainCommitStatus: typeof proof.chainCommitStatus === "string" ? proof.chainCommitStatus : undefined,
    checks,
  };
}

async function verifyKit(raw: string): Promise<VerifyResult> {
  const parsed = JSON.parse(raw) as unknown;
  const input = asRecord(parsed);
  if (!input) {
    return {
      kitType: "Unknown",
      status: "FAIL",
      summary: "Input must be a JSON object.",
      checks: [{ label: "JSON", status: "FAIL", detail: "Parsed value is not an object." }],
    };
  }

  if (input.version === "chaintrace-local-org-proof-v1") return verifyOrganizationKit(input);
  if (input.version === "chaintrace-local-trade-case-v1") return verifyTradeCaseKit(input);
  if (input.version === "chaintrace-local-evidence-bundle-v1") return verifyEvidenceKit(input);

  return {
    kitType: "Unknown",
    status: "FAIL",
    summary: "Unsupported kit version.",
    checks: [{ label: "Version", status: "FAIL", detail: `Unsupported version: ${String(input.version ?? "missing")}` }],
  };
}

export function LocalVerifyClient({ zh }: LocalVerifyClientProps) {
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function runVerification() {
    setBusy(true);
    setResult(null);
    try {
      const nextResult = await verifyKit(raw);
      setResult(nextResult);
    } catch (error) {
      setResult({
        kitType: "Unknown",
        status: "FAIL",
        summary: error instanceof Error ? error.message : "Verification failed.",
        checks: [{ label: "Verifier", status: "FAIL", detail: "Could not parse or verify the supplied JSON." }],
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workspace-stack">
      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{label(zh, "Proof-safe Verify", "Proof-safe Verify")}</span>
          <h2>{label(zh, "本地验证 Recovery / Case / Evidence Kit", "Locally verify a Recovery / Case / Evidence Kit")}</h2>
          <p>{label(zh, "把 JSON 粘贴到这里。验证在浏览器本地完成，不上传服务器，不写数据库。", "Paste JSON here. Verification runs in your browser only; nothing is uploaded or stored.")}</p>
        </div>
        <textarea
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          rows={14}
          placeholder={label(zh, "粘贴 chaintrace-local-org-proof-v1 / chaintrace-local-trade-case-v1 / chaintrace-local-evidence-bundle-v1 JSON", "Paste chaintrace-local-org-proof-v1 / chaintrace-local-trade-case-v1 / chaintrace-local-evidence-bundle-v1 JSON")}
        />
        <button className="primary-button" type="button" onClick={runVerification} disabled={!raw.trim() || busy}>
          {busy ? label(zh, "验证中…", "Verifying…") : label(zh, "本地验证 Proof", "Verify Proof Locally")}
        </button>
      </section>

      {result ? (
        <section className="proof-flow-card">
          <div className="section-heading compact-heading">
            <span>{result.kitType}</span>
            <h2 className={statusClass(result.status)}>{result.status}</h2>
            <p>{result.summary}</p>
          </div>

          <div className="stats-grid">
            <article className="metric-card">
              <span>{label(zh, "Claimed Hash", "Claimed Hash")}</span>
              <strong>{result.claimedHash ? result.claimedHash.slice(0, 16) + "…" : "—"}</strong>
              <small>{result.claimedHash ?? label(zh, "未提供", "Not provided")}</small>
            </article>
            <article className="metric-card">
              <span>{label(zh, "Recomputed Hash", "Recomputed Hash")}</span>
              <strong>{result.recomputedHash ? result.recomputedHash.slice(0, 16) + "…" : "—"}</strong>
              <small>{result.recomputedHash ?? label(zh, "未计算", "Not computed")}</small>
            </article>
            <article className="metric-card">
              <span>{label(zh, "Signature", "Signature")}</span>
              <strong>{result.signatureStatus ?? "—"}</strong>
              <small>{result.signerAddress ?? label(zh, "未提供 signer", "No signer provided")}</small>
            </article>
          </div>

          <div className="table-like-list">
            {result.checks.map((check) => (
              <div className="table-like-row" key={`${check.label}-${check.detail}`}>
                <div>
                  <strong>{check.label}</strong>
                  <span>{check.detail}</span>
                </div>
                <div>
                  <strong className={statusClass(check.status)}>{check.status}</strong>
                  <span>{result.chainCommitStatus ?? "LOCAL_ONLY"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="empty-state-card">
        <strong>{label(zh, "边界", "Boundary")}</strong>
        <p>{label(zh, "这个页面只能证明 bundle 内部 hash / 签名一致，不能证明公司法律身份、贸易真实性、信用质量或融资资格。", "This page only verifies internal hash/signature consistency. It does not verify legal identity, trade truth, credit quality, or financing eligibility.")}</p>
      </section>
    </div>
  );
}
