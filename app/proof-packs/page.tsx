import { ProofPacksView } from "@/components/workspace/ProofPacksView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function ProofPacksPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="proofPacks" workspace={workspace} action={{ href: "/evidence", labelZh: "查看文件", labelEn: "View documents" }}>
      <ProofPacksView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
