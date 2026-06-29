import { AssistantView } from "@/components/workspace/AssistantView";
import { WorkspaceFrame } from "@/components/workspace/WorkspaceFrame";
import { getWorkspaceRouteContext } from "@/lib/workspace-route-context";

export default async function CustomerAssistantPage() {
  const { zh, workspace } = await getWorkspaceRouteContext();

  return (
    <WorkspaceFrame zh={zh} active="assistant" workspace={workspace} action={{ href: "/assistant/approvals", labelZh: "进入审批", labelEn: "Open approvals" }}>
      <AssistantView zh={zh} workspace={workspace} />
    </WorkspaceFrame>
  );
}
