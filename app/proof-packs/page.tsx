import { ProofPacksView } from "@/components/workspace/ProofPacksView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function ProofPacksPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="proofPacks" workspace={workspace} actionSlot={<a className="primary-button" href="/evidence">{zh ? "补证据" : "Complete evidence"}</a>}>
      <ProofPacksView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
