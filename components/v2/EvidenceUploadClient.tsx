"use client";

import { useEffect, useState } from "react";
import { evidenceTypes, type EvidenceListItemV2, type EvidenceTypeV2 } from "@/lib/v2/evidence-types";
import { tradeStages, type TradeStage } from "@/lib/v2/trade-case-types";

type Props = {
  zh: boolean;
  caseId: string;
  userEmail: string;
};

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function EvidenceUploadClient({ zh, caseId, userEmail }: Props) {
  const [evidenceType, setEvidenceType] = useState<EvidenceTypeV2>("INVOICE");
  const [stageCode, setStageCode] = useState<TradeStage>("S2_SHIPMENT");
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<EvidenceListItemV2[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadEvidence() {
    const res = await fetch(`/api/trade-cases/${caseId}/evidences`, {
      headers: { "x-chaintrace-user-email": userEmail },
      cache: "no-store",
    });
    const json = await res.json();
    if (json.ok && json.data?.evidence) setItems(json.data.evidence);
  }

  useEffect(() => {
    loadEvidence().catch(() => undefined);
  }, [caseId, userEmail]);

  async function uploadEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("evidenceType", evidenceType);
      form.set("stageCode", stageCode);
      form.set("file", file);
      const res = await fetch(`/api/trade-cases/${caseId}/evidences`, {
        method: "POST",
        headers: { "x-chaintrace-user-email": userEmail },
        body: form,
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to upload evidence.");
      setMessage(t(zh, "Evidence 已上传并生成真实 SHA-256。", "Evidence uploaded and real SHA-256 generated."));
      setFile(null);
      await loadEvidence();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload evidence.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="proof-flow-card" id="evidence-upload">
      <div className="section-heading compact-heading">
        <span>{t(zh, "Evidence Registry", "Evidence Registry")}</span>
        <h2>{t(zh, "上传证据并生成 SHA-256", "Upload evidence and generate SHA-256")}</h2>
        <p>{t(zh, "v2.1 当前保存 metadata/hash；raw file 不公开。", "v2.1 currently stores metadata/hash; raw file is not public.")}</p>
      </div>

      <form className="workspace-form" onSubmit={uploadEvidence}>
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
        <button className="primary-button" disabled={!file || busy}>{busy ? t(zh, "上传中…", "Uploading…") : t(zh, "上传 Evidence", "Upload Evidence")}</button>
        {message ? <p className="form-note">{message}</p> : null}
      </form>

      <div className="proof-flow-grid">
        {items.length ? items.map((item) => (
          <article className="proof-flow-card" key={item.id}>
            <strong>{item.evidenceType}</strong>
            <span>{item.stageCode} · {item.status}</span>
            <span>{item.file?.filename ?? "metadata"}</span>
            <span className="hash-value">{item.file?.sha256 ?? item.evidenceHash}</span>
          </article>
        )) : (
          <div className="empty-state-card">{t(zh, "还没有 Evidence。", "No evidence yet.")}</div>
        )}
      </div>
    </section>
  );
}
