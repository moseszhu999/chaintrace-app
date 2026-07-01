import { LocalProofPackClient } from "@/components/v2/LocalProofPackClient";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export const dynamic = "force-dynamic";

export default async function ProofPacksPage() {
  const context = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame
      zh={context.zh}
      active="proofPacks"
      workspace={context.workspace}
      role={context.role}
      action={{ href: "/verify/local", labelZh: "本地验证", labelEn: "Local verify" }}
      header={{
        eyebrowZh: "local-first passport",
        eyebrowEn: "local-first passport",
        titleZh: "Proof Pack / Passport",
        titleEn: "Proof Pack / Passport",
        subtitleZh: "把组织、Case、Evidence proof 合成一个可交付、可验证的贸易证据护照。",
        subtitleEn: "Bundle organization, case, and evidence proofs into a deliverable, verifiable trade evidence passport.",
      }}
    >
      <LocalProofPackClient zh={context.zh} />
    </WorkspaceFrame>
  );
}
