"use client";

import { useState } from "react";
import type { DemoRole } from "@/lib/demo-roles";
import type { ProfessionalExceptionStatus, ProfessionalReviewActionReceipt } from "@/lib/professional-review-actions";

const exceptionStatuses: ProfessionalExceptionStatus[] = ["exception_noted", "professional_blocked", "exception_cleared"];

type ProfessionalReviewActionResponse = {
  accepted?: boolean;
  professionalReviewReceipt?: ProfessionalReviewActionReceipt;
  error?: string;
  message?: string;
};

export function ProfessionalReviewActions({ caseId, role, zh }: { caseId: string; role: DemoRole; zh: boolean }) {
  const [professionalReviewNote, setProfessionalReviewNote] = useState("Professional pre-review note: material exceptions remain pre-review only.");
  const [exceptionStatus, setExceptionStatus] = useState<ProfessionalExceptionStatus>("exception_noted");
  const [receipt, setReceipt] = useState<ProfessionalReviewActionReceipt | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveProfessionalReviewAction() {
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}/professional-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-chaintrace-role": role },
        body: JSON.stringify({ professionalReviewNote, exceptionStatus }),
      });
      const json = (await response.json()) as ProfessionalReviewActionResponse;
      if (!response.ok || !json.accepted || !json.professionalReviewReceipt) {
        throw new Error(json.message ?? json.error ?? "Professional review action was rejected.");
      }
      setReceipt(json.professionalReviewReceipt);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save professional review action.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="panel">
      <div className="section-heading">
        <span>{zh ? "专业审查动作" : "Professional review action"}</span>
        <h2>{zh ? "记录专业审查 note 和 exception status。" : "Record a professional review note and exception status."}</h2>
        <p>Pre-review only · GATES_NOT_PASSED · disbursementAllowed=false</p>
      </div>
      <label>
        professionalReviewNote
        <textarea value={professionalReviewNote} onChange={(event) => setProfessionalReviewNote(event.target.value)} rows={4} />
      </label>
      <label>
        exceptionStatus
        <select value={exceptionStatus} onChange={(event) => setExceptionStatus(event.target.value as ProfessionalExceptionStatus)}>
          {exceptionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <div className="converter-actions" style={{ marginTop: 14 }}>
        <button className="primary-button" type="button" onClick={saveProfessionalReviewAction} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save professional note"}
        </button>
      </div>
      {error && <div className="error" style={{ marginTop: 14 }}>{error}</div>}
      {receipt && (
        <div className="typed-data-status ai-boundary-status" style={{ marginTop: 14 }}>
          <strong>professionalReviewReceipt={receipt.id}</strong>
          <span>exceptionStatus={receipt.exceptionStatus}</span>
          <span>reviewerRole={receipt.reviewerRole}</span>
          <span>{receipt.blockerCode} · disbursementAllowed=false</span>
        </div>
      )}
    </div>
  );
}

