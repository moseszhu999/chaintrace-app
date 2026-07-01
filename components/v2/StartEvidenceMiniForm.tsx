"use client";

import { useEffect, useMemo, useState } from "react";
import { evidenceTypes, type EvidenceTypeV2 } from "@/lib/v2/evidence-types";
import { tradeStages, type TradeStage } from "@/lib/v2/trade-case-types";

type Props = {
  zh: boolean;
  onDone?: () => void;
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
    evidenceType: EvidenceTypeV2;
    stageCode: TradeStage;
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

const localTradeCasesKey = "chaintrace_v2_trade_cases";
const localEvidenceKey = "chaintrace_v2_evidence_bundles";

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

async function sha256HexFromBytes(bytes: ArrayBuffer) {
  return hexFromDigest(await crypto.subtle.digest("SHA-256", bytes));
}

async function sha256HexFromText(text: string) {
  const data = new TextEncoder().encode(text);
  return hexFromDigest(await crypto.subtle.digest("SHA-256", data));
}

function readCaseBundles(): LocalTradeCaseBundle[] {
  const raw = window.localStorage.getItem(localTradeCasesKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => {
      const bundle = item as LocalTradeCaseBundle;
      return bundle.version === "chaintrace-local-trade-case-v1" && Boolean(bundle.case?.id && bundle.proof?.caseRootHash);
    }) as LocalTradeCaseBundle[] : [];
  } catch {
    window.localStorage.removeItem(localTradeCasesKey);
    return [];
  }
}

function readEvidenceBundles(): LocalEvidenceBundle[] {
  const raw = window.localStorage.getItem(localEvidenceKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => {
      const bundle = item as LocalEvidenceBundle;
      return bundle.version === "chaintrace-local-evidence-bundle-v1" && Boolean(bundle.evidence?.id && bundle.proof?.evidenceHash);
    }) as LocalEvidenceBundle[] : [];
  } catch {
    window.localStorage.removeItem(localEvidenceKey);
    return [];
  }
}

async function computeEvidenceRootHash(caseRootHash: string, bundles: LocalEvidenceBundle[]) {
  const evidenceHashes = bundles
    .filter((bundle) => bundle.proof.caseRootHash === caseRootHash)
    .map((bundle) => bundle.proof.evidenceHash)
    .sort();
  return sha256HexFromText(stableStringify({ caseRootHash, evidenceHashes }));
}

export function StartEvidenceMiniForm({ zh, onDone }: Props) {
  const [caseBundles, setCaseBundles] = useState<LocalTradeCaseBundle[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [evidenceType, setEvidenceType] = useState<EvidenceTypeV2>("INVOICE");
  const [stageCode, setStageCode] = useState<TradeStage>("S2_SHIPMENT");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const cases = readCaseBundles();
    setCaseBundles(cases);
    setSelectedCaseId((previous) => previous || cases[0]?.case.id || "");
  }, []);

  const selectedCase = useMemo(() => caseBundles.find((bundle) => bundle.case.id === selectedCaseId) ?? null, [caseBundles, selectedCaseId]);
  const canAttach = Boolean(selectedCase && file && !busy);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCase || !file || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const uploadedAt = new Date().toISOString();
      const fileSha256 = await sha256HexFromBytes(await file.arrayBuffer());
      const evidence = {
        id: `local-evidence-${fileSha256.slice(0, 16)}`,
        caseId: selectedCase.case.id,
        caseRootHash: selectedCase.proof.caseRootHash,
        evidenceType,
        stageCode,
        filename: file.name,
        mimeType: file.type || null,
        fileSize: file.size,
        fileSha256,
        uploadedAt,
      };
      const evidenceHash = await sha256HexFromText(stableStringify(evidence));
      const existing = readEvidenceBundles();
      const provisional: LocalEvidenceBundle = {
        version: "chaintrace-local-evidence-bundle-v1",
        evidence,
        proof: {
          proofType: "EVIDENCE_FILE_HASH",
          algorithm: "SHA-256",
          evidenceHash,
          evidenceRootHash: evidenceHash,
          caseRootHash: selectedCase.proof.caseRootHash,
          evidenceCountForCase: 1,
          chainCommitStatus: "NOT_COMMITTED",
          rawFileStored: "USER_LOCAL_ONLY",
        },
      };
      const nextWithoutRoot = [provisional, ...existing.filter((bundle) => bundle.evidence.id !== evidence.id)];
      const evidenceRootHash = await computeEvidenceRootHash(selectedCase.proof.caseRootHash, nextWithoutRoot);
      const evidenceCountForCase = nextWithoutRoot.filter((bundle) => bundle.proof.caseRootHash === selectedCase.proof.caseRootHash).length;
      const finalBundle: LocalEvidenceBundle = {
        ...provisional,
        proof: {
          ...provisional.proof,
          evidenceRootHash,
          evidenceCountForCase,
        },
      };
      const nextBundles = [finalBundle, ...existing.filter((bundle) => bundle.evidence.id !== evidence.id)];
      window.localStorage.setItem(localEvidenceKey, JSON.stringify(nextBundles));
      setFile(null);
      setMessage(t(zh, "Evidence 已本地哈希并生成 Evidence Kit。", "Evidence hashed locally and Evidence Kit generated."));
      onDone?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to hash evidence locally.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="proof-flow-card">
      <div className="section-heading compact-heading">
        <span>{t(zh, "Step 3", "Step 3")}</span>
        <h2>{t(zh, "添加 Evidence Hash", "Attach Evidence Hash")}</h2>
        <p>{t(zh, "选择本地贸易文件，浏览器本地计算 fileSha256。原文件不上传、不保存。", "Select a local trade file and compute fileSha256 in the browser. The raw file is not uploaded or stored.")}</p>
      </div>
      <form className="workspace-form" onSubmit={submit}>
        <label>{t(zh, "选择 Case", "Select Case")}
          <select value={selectedCaseId} onChange={(event) => setSelectedCaseId(event.target.value)}>
            {caseBundles.map((bundle) => <option key={bundle.case.id} value={bundle.case.id}>{bundle.case.caseName}</option>)}
          </select>
        </label>
        <label>{t(zh, "证据类型", "Evidence type")}
          <select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as EvidenceTypeV2)}>
            {evidenceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>{t(zh, "贸易阶段", "Trade stage")}
          <select value={stageCode} onChange={(event) => setStageCode(event.target.value as TradeStage)}>
            {tradeStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
          </select>
        </label>
        <label>{t(zh, "本地文件", "Local file")}
          <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
        <button className="primary-button" type="submit" disabled={!canAttach}>
          {busy ? t(zh, "计算中…", "Hashing…") : t(zh, "生成 Evidence Hash", "Generate Evidence Hash")}
        </button>
        {!caseBundles.length ? <p className="form-note">{t(zh, "请先完成 Step 2 Trade Case。", "Complete Step 2 Trade Case first.")}</p> : null}
        {file ? <p className="form-note">{file.name} / {file.size} bytes</p> : null}
        {message ? <p className="form-note">{message}</p> : null}
      </form>
    </section>
  );
}
