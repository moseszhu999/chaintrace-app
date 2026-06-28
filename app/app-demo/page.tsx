import { DashboardView } from "@/components/workspace/DashboardView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export default async function AppDemoPage() {
  const zh = await getIsZhRequest();
  const workspace = await getWorkspaceSnapshot();

  return (
    <WorkspaceShell zh={zh} active="dashboard" workspace={workspace} actionSlot={<a className="primary-button" href="/evidence">{zh ? "处理下一个缺口" : "Resolve next gap"}</a>}>
      <DashboardView zh={zh} workspace={workspace} />
    </WorkspaceShell>
  );
}
