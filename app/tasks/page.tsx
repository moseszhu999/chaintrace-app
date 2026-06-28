import { TasksView } from "@/components/workspace/TasksView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";

export default async function TaskCenterPage() {
  const zh = await getIsZhRequest();

  return (
    <WorkspaceShell zh={zh} active="tasks" actionSlot={<a className="primary-button" href="/assistant">{zh ? "让助手生成草稿" : "Ask assistant to draft"}</a>}>
      <TasksView zh={zh} />
    </WorkspaceShell>
  );
}
