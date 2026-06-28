import { DashboardView } from "@/components/workspace/DashboardView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";

export default async function AppDemoPage() {
  const zh = await getIsZhRequest();

  return (
    <WorkspaceShell zh={zh} active="dashboard" actionSlot={<a className="primary-button" href="/evidence">{zh ? "处理下一个缺口" : "Resolve next gap"}</a>}>
      <DashboardView zh={zh} />
    </WorkspaceShell>
  );
}
