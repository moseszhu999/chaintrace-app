import { TasksView } from "@/components/workspace/TasksView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function TaskCenterPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="tasks" workspace={workspace} action={{ href: "/assistant", labelZh: "打开助手", labelEn: "Open assistant" }}>
      <TasksView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
