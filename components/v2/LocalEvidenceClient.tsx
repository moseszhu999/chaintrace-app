"use client";

import { useEffect, useMemo, useState } from "react";
import { evidenceTypes, type EvidenceTypeV2 } from "@/lib/v2/evidence-types";
import { tradeStages, type TradeStage, type TradeCaseRecordV2 } from "@/lib/v2/trade-case-types";

type LocalEvidenceClientProps = {
  zh: boolean;
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

type LocalEvidenceManifest = {
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

type LocalEvidenceBundle = {
  version: "chaintrace-local-evidence-bundle-v1";
  evidence: LocalEvidenceManifest;
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

async function sha256HexFromBytes(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256HexFromText(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "evidence";
}

function readCaseBundles(): LocalTradeCaseBundle[] {
  const raw = window.localStorage.getItem(localTradeCasesKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalTradeCaseBundle[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.case?.id && item.proof?.caseRootHash) : [];
  } catch {
    window.localStorage.removeItem(localTradeCasesKey);
    return [];
  }
}

function readEvidenceBundles(): LocalEvidenceBundle[] {
  const raw = window.localStorage.getItem(localEvidenceKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalEvidenceBundle[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.evidence?.id && item.proof?.evidenceHash) : [];
  } catch {
    window.localStorage.removeItem(localEvidenceKey);
    return [];
  }
}

function writeEvidenceBundles(bundles: LocalEvidenceBundle[]) {
  window.localStorage.setItem(localEvidenceKey, JSON.stringify(bundles));
}

async function computeEvidenceRootHash(caseRootHash: string, bundles: LocalEvidenceBundle[]) {
  const evidenceHashes = bundles
    .filter((bundle) => bundle.proof.caseRootHash === caseRootHash)
    .map((bundle) => bundle.proof.evidenceHash)
    .sort();
  return sha256HexFromText(stableStringify({ caseRootHash, evidenceHashes }));
}

export function LocalEvidenceClient({ zh }: LocalEvidenceClientProps) {
  const [caseBundles, setCaseBundles] = useState<LocalTradeCaseBundle[]>([]);
  const [evidenceBundles, setEvidenceBundles] = useState<LocalEvidenceBundle[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [evidenceType, setEvidenceType] = useState<EvidenceTypeV2>("INVOICE");
  const [stageCode, setStageCode] = useState<TradeStage>("S2_SHIPMENT");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const localCases = readCaseBundles();
    const localEvidence = readEvidenceBundles();
    setCaseBundles(localCases);
    setEvidenceBundles(localEvidence);
    setSelectedCaseId((previous) => previous || localCases[0]?.case.id || "");
  }, []);

  const selectedCase = useMemo(() => caseBundles.find((bundle) => bundle.case.id === selectedCaseId) ?? null, [caseBundles, selectedCaseId]);
  const selectedCaseEvidence = useMemo(() => evidenceBundles.filter((bundle) => bundle.evidence.caseId === selectedCaseId), [evidenceBundles, selectedCaseId]);
  const canHash = Boolean(selectedCase && file && !busy);

  async function attachEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCase || !file || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const uploadedAt = new Date().toISOString();
      const fileSha256 = await sha256HexFromBytes(await file.arrayBuffer());
      const evidence: LocalEvidenceManifest = {
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
      const nextBundlesWithoutRoot = [provisional, ...evidenceBundles.filter((bundle) => bundle.evidence.id !== evidence.id)];
      const evidenceRootHash = await computeEvidenceRootHash(selectedCase.proof.caseRootHash, nextBundlesWithoutRoot);
      const evidenceCountForCase = nextBundlesWithoutRoot.filter((bundle) => bundle.proof.caseRootHash === selectedCase.proof.caseRootHash).length;
      const finalBundle: LocalEvidenceBundle = {
        ...provisional,
        proof: {
          ...provisional.proof,
          evidenceRootHash,
          evidenceCountForCase,
        },
      };
      const nextBundles = [finalBundle, ...evidenceBundles.filter((bundle) => bundle.evidence.id !== evidence.id)];
      writeEvidenceBundles(nextBundles);
      setEvidenceBundles(nextBundles);
      setFile(null);
      setMessage(t(zh, "Evidence 已本地哈希并挂到 Case root。", "Evidence hashed locally and attached to the case root."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to hash evidence locally.");
    } finally {
      setBusy(false);
    }
  }

  function downloadEvidenceKit(bundle: LocalEvidenceBundle) {
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chaintrace-evidence-${safeFileName(bundle.evidence.filename)}-${bundle.proof.evidenceHash.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(t(zh, "Evidence Kit 已下载。", "Evidence Kit downloaded."));
  }

  async function copyHash(hash: string, labelText: string) {
    await navigator.clipboard.writeText(hash);
    setMessage(t(zh, `${labelText} 已复制。`, `${labelText} copied.`));
  }

  async function importEvidenceKit(event: React.ChangeEvent<HTMLInputElement>) {
    const importedFile = event.target.files?.[0];
    event.target.value = "";
    if (!importedFile) return;
    setBusy(true);
    setMessage(null);
    try {
      const text = await importedFile.text();
      const imported = JSON.parse(text) as LocalEvidenceBundle;
      if (imported.version !== "chaintrace-local-evidence-bundle-v1") throw new Error("Unsupported Evidence Kit version.");
      if (!imported.evidence || !imported.proof?.evidenceHash) throw new Error("Invalid Evidence Kit.");
      const recomputedEvidenceHash = await sha256HexFromText(stableStringify(imported.evidence));
      if (recomputedEvidenceHash !== imported.proof.evidenceHash) throw new Error("Evidence Kit hash verification failed.");
      const nextBundles = [imported, ...evidenceBundles.filter((bundle) => bundle.evidence.id !== imported.evidence.id)];
      writeEvidenceBundles(nextBundles);
      setEvidenceBundles(nextBundles);
      setMessage(t(zh, "Evidence Kit 已导入并通过 hash 校验。", "Evidence Kit imported and hash-verified."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to import Evidence Kit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workspace-stack">
      <div className="stats-grid">
        <article className="metric-card">
          <span>{t(zh, "本地 Case", "Local Cases")}</span>
          <strong>{caseBundles.length}</strong>
          <small>{t(zh, "来自浏览器 localStorage。", "Loaded from browser localStorage.")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "本地 Evidence", "Local Evidence")}</span>
          <strong>{evidenceBundles.length}</strong>
          <small>{t(zh, "只保存 hash 和 metadata，不保存文件。", "Stores hash and metadata only, not raw files.")}</small>
        </article>
        <article className="metric-card">
          <span>{t(zh, "信任锚", "Trust anchor")}</span>
          <strong>SHA-256</strong>
          <small>{t(zh, "文件内容在浏览器本地哈希。", "File bytes are hashed in the browser.")}</small>
        </article>
      </div>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Local Evidence", "Local Evidence")}</span>
          <h2>{t(zh, "上传文件并本地生成 Evidence Hash", "Upload a file and generate local Evidence Hash")}</h2>
          <p>{t(zh, "文件不会上传服务器；浏览器只保存文件 SHA-256、metadata 和 evidenceRootHash。", "The file is not uploaded; the browser stores only SHA-256, metadata, and evidenceRootHash.")}</p>
        </div>

        {caseBundles.length ? (
          <form className="workspace-form" onSubmit={attachEvidence}>
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
            <label>{t(zh, "业务阶段", "Business stage")}
              <select value={stageCode} onChange={(event) => setStageCode(event.target.value as TradeStage)}>
                {tradeStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </label>
            <label>{t(zh, "文件", "File")}
              <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </label>
            <button className="primary-button" disabled={!canHash}>{busy ? t(zh, "哈希中…", "Hashing…") : t(zh, "生成 Evidence Hash", "Generate Evidence Hash")}</button>
            {message ? <p className="form-note">{message}</p> : null}
          </form>
        ) : (
          <div className="empty-state-card">{t(zh, "还没有本地 Case。请先到 Trade Cases 生成 Case Root Hash。", "No local case yet. Generate a Case Root Hash in Trade Cases first.")}</div>
        )}
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Recovery", "Recovery")}</span>
          <h2>{t(zh, "导入 Evidence Kit", "Import Evidence Kit")}</h2>
        </div>
        <label className="secondary-button">
          {t(zh, "导入 Evidence Kit", "Import Evidence Kit")}
          <input type="file" accept="application/json,.json" onChange={importEvidenceKit} style={{ display: "none" }} />
        </label>
      </section>

      <section className="proof-flow-card">
        <div className="section-heading compact-heading">
          <span>{t(zh, "Evidence List", "Evidence List")}</span>
          <h2>{t(zh, "本地 Evidence Proof Bundles", "Local Evidence Proof Bundles")}</h2>
        </div>
        <div className="proof-flow-grid">
          {selectedCaseEvidence.length ? selectedCaseEvidence.map((bundle) => (
            <article className="proof-flow-card" key={bundle.evidence.id}>
              <strong>{bundle.evidence.evidenceType}</strong>
              <span>{bundle.evidence.stageCode}</span>
              <span>{bundle.evidence.filename}</span>
              <span>{bundle.evidence.fileSize} bytes</span>
              <span>file: {bundle.evidence.fileSha256.slice(0, 24)}…</span>
              <span>evidence: {bundle.proof.evidenceHash.slice(0, 24)}…</span>
              <span>root: {bundle.proof.evidenceRootHash.slice(0, 24)}…</span>
              <button className="secondary-button" type="button" onClick={() => copyHash(bundle.evidence.fileSha256, "File SHA-256")}>File Hash</button>
              <button className="secondary-button" type="button" onClick={() => copyHash(bundle.proof.evidenceRootHash, "Evidence Root Hash")}>Evidence Root</button>
              <button className="secondary-button" type="button" onClick={() => downloadEvidenceKit(bundle)}>{t(zh, "下载 Evidence Kit", "Download Evidence Kit")}</button>
            </article>
          )) : (
            <div className="empty-state-card">{t(zh, "当前 Case 还没有 Evidence。", "No evidence for the selected case yet.")}</div>
          )}
        </div>
      </section>
    </div>
  );
}
