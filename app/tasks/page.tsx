import { TasksView } from "@/components/workspace/TasksView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";
import { getWorkspaceSnapshot } from "@/lib/workspace-repository";

export default async function TaskCenterPage() {
  const zh = await getIsZhRequest();
  const workspace = await getWorkspaceSnapshot();

  return (
    <WorkspaceShell zh={zh} active="tasks" workspace={workspace}>
      <TasksView zh={zh} workspace={workspace} />
    </WorkspaceShell>
  );
}
