import { ProofPacksView } from "@/components/workspace/ProofPacksView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";

export default async function ProofPacksPage() {
  const zh = await getIsZhRequest();

  return (
    <WorkspaceShell zh={zh} active="proofPacks" actionSlot={<a className="primary-button" href="/evidence">{zh ? "补证据" : "Complete evidence"}</a>}>
      <ProofPacksView zh={zh} />
    </WorkspaceShell>
  );
}
