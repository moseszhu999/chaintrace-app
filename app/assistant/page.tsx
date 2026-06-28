import { AssistantView } from "@/components/workspace/AssistantView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getIsZhRequest } from "@/lib/request-locale";

export default async function AssistantPage() {
  const zh = await getIsZhRequest();

  return (
    <WorkspaceShell zh={zh} active="assistant" actionSlot={<a className="primary-button" href="/assistant/approvals">{zh ? "进入审批" : "Open approvals"}</a>}>
      <AssistantView zh={zh} />
    </WorkspaceShell>
  );
}
