import { ProfessionalReviewView } from "@/components/workspace/ProfessionalReviewView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getFallbackEvidenceRecords } from "@/lib/evidence-fallback";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";
import { getCurrentTradeCase, listEvidenceRecords } from "@/lib/repositories/chaintrace-repository";

export const dynamic = "force-dynamic";

async function getProfessionalReviewEvidenceRecords() {
  try {
    const trade = await getCurrentTradeCase();
    return await listEvidenceRecords(trade.id);
  } catch (error) {
    console.error("Falling back to seeded evidence records for professional review", error);
    return getFallbackEvidenceRecords();
  }
}

export default async function BusinessProfessionalReviewPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();
  const evidenceRecords = await getProfessionalReviewEvidenceRecords();

  return (
    <WorkspaceFrame
      zh={zh}
      active="professionalReview"
      workspace={workspace}
      header={{
        eyebrowZh: "专业审查视图",
        eyebrowEn: "Professional review",
        titleZh: "银行 / 律所例外审查",
        titleEn: "Bank / law firm exception review",
        subtitleZh: "授信、合规、法律结构、争议和重大例外",
        subtitleEn: "Underwriting, compliance, legal structure, disputes, and material exceptions",
      }}
      action={{ href: "/business-ops", labelZh: "Agent 工作台", labelEn: "Agent workbench" }}
    >
      <ProfessionalReviewView zh={zh} workspace={workspace} evidenceRecords={evidenceRecords} />
    </WorkspaceFrame>
  );
}
