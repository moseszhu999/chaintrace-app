import { demoWorkspace, getBlockerText, getMissingEvidenceSlots, getReadyScore, getVerifiedEvidenceCount } from "@/lib/demo-workspace-data";

export type WorkspaceSnapshot = typeof demoWorkspace;

export async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  return demoWorkspace;
}

export async function getProofPackList() {
  return [demoWorkspace.proofPack];
}

export async function getCurrentProofPack() {
  return demoWorkspace.proofPack;
}

export async function getEvidenceSlots() {
  return demoWorkspace.evidenceSlots;
}

export async function getTaskList() {
  return demoWorkspace.tasks;
}

export async function getAssistantSuggestions() {
  return demoWorkspace.suggestions;
}

export async function getApprovalQueue() {
  return demoWorkspace.approvals;
}

export async function getWorkspaceMetrics(zh: boolean) {
  const slots = demoWorkspace.evidenceSlots;
  return {
    verifiedEvidenceCount: getVerifiedEvidenceCount(slots),
    missingEvidenceCount: getMissingEvidenceSlots(slots).length,
    readyScore: getReadyScore(slots),
    blockerText: getBlockerText(zh, slots),
  };
}
