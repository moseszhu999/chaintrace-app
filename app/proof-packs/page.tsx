import { ProofPacksView } from "@/components/workspace/ProofPacksView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export default async function ProofPacksPage() {
  const zh = await getIsZhRequest();
  const workspace = await getWorkspaceSnapshot();

  return (
    <WorkspaceShell zh={zh} active="proofPacks" workspace={workspace} actionSlot={<a className="primary-button" href="/evidence">{zh ? "补证据" : "Complete evidence"}</a>}>
      <ProofPacksView zh={zh} workspace={workspace} />
    </WorkspaceShell>
  );
}
