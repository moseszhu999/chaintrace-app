import { ProofPacksView } from "@/components/workspace/ProofPacksView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function ProofPacksPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="proofPacks" workspace={workspace} action={{ href: "/evidence", labelZh: "补证据", labelEn: "Complete evidence" }}>
      <ProofPacksView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
