import { getAgentWorkflowPersistenceMode, resetRuntimeWorkflowStore } from "@/lib/agent-workflow-store";
import { resetEvidenceTaskStore } from "@/lib/evidence-task-store";
import { resetProfessionalReviewActions } from "@/lib/professional-review-actions";
import { getEvidencePersistenceMode, resetRuntimeEvidenceRepository } from "@/lib/repositories/chaintrace-repository";

export function resetDemoWorkspace() {
  const evidencePersistenceMode = getEvidencePersistenceMode();
  const workflowPersistenceMode = getAgentWorkflowPersistenceMode();

  if (evidencePersistenceMode === "runtime_evidence_store") {
    resetRuntimeEvidenceRepository();
  }
  if (workflowPersistenceMode === "runtime_workflow_store") {
    resetRuntimeWorkflowStore();
  }

  resetEvidenceTaskStore();
  resetProfessionalReviewActions();

  return {
    resetAt: new Date().toISOString(),
    evidencePersistenceMode,
    workflowPersistenceMode,
    resetRuntimeStores: [
      "runtime_evidence_store",
      "runtime_workflow_store",
      "evidence_task_store",
      "professional_review_action_store",
    ],
    skippedPersistentStores: [
      evidencePersistenceMode === "neon_evidence_store" ? "neon_evidence_store" : null,
      workflowPersistenceMode === "neon_workflow_store" ? "neon_workflow_store" : null,
    ].filter(Boolean),
    boundary: "admin demo reset only; persistent Neon rows are not destructively deleted",
  };
}

