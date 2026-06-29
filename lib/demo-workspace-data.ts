import {
  findContextLabel,
  sampleApprovalRecords,
  sampleBusinessContext,
  sampleCustomerMemories,
  sampleDrafts,
  sampleEvidenceItems,
  sampleEvidenceSlots,
  sampleOrganization,
  sampleProofPack,
  sampleRiskGaps,
  sampleShareLink,
  sampleSuggestions,
  sampleTasks,
  sampleUser,
  type EvidenceSlot,
} from "@/lib/assistant-product-model";
import { sampleBusinessModules, sampleBusinessStages, sampleOperatingSummary } from "@/lib/sme-business-model";

export const demoWorkspace = {
  organization: sampleOrganization,
  user: sampleUser,
  operatingSummary: sampleOperatingSummary,
  businessModules: sampleBusinessModules,
  businessStages: sampleBusinessStages,
  businessContext: sampleBusinessContext,
  proofPack: sampleProofPack,
  evidenceSlots: sampleEvidenceSlots,
  evidenceItems: sampleEvidenceItems,
  riskGaps: sampleRiskGaps,
  tasks: sampleTasks,
  memories: sampleCustomerMemories,
  suggestions: sampleSuggestions,
  drafts: sampleDrafts,
  approvals: sampleApprovalRecords,
  shareLink: sampleShareLink,
};

export function getVerifiedEvidenceCount(slots: EvidenceSlot[] = demoWorkspace.evidenceSlots) {
  return slots.filter((slot) => slot.status === "verified").length;
}

export function getMissingEvidenceSlots(slots: EvidenceSlot[] = demoWorkspace.evidenceSlots) {
  return slots.filter((slot) => slot.status !== "verified");
}

export function getReadyScore(slots: EvidenceSlot[] = demoWorkspace.evidenceSlots) {
  if (slots.length === 0) return 0;
  return Math.round((getVerifiedEvidenceCount(slots) / slots.length) * 100);
}

export function getBlockerText(zh: boolean, slots: EvidenceSlot[] = demoWorkspace.evidenceSlots) {
  const missingSlots = getMissingEvidenceSlots(slots);
  if (missingSlots.length === 0) {
    return zh ? "这票货已经 Ready，可以生成公开验证链接。" : "This shipment is Ready and can generate a public verification link.";
  }
  return missingSlots.map((slot) => (zh ? slot.nameZh : slot.nameEn)).join(" / ");
}

export function getContextLabel(ref: string, zh: boolean) {
  return findContextLabel(ref, zh);
}
