import { cookies } from "next/headers";
import { TasksView } from "@/components/workspace/TasksView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { normalizeLocale } from "@/lib/i18n";

export default async function TaskCenterPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <WorkspaceShell zh={zh} active="tasks" actionSlot={<a className="primary-button" href="/assistant">{zh ? "让助手生成草稿" : "Ask assistant to draft"}</a>}>
      <TasksView zh={zh} />
    </WorkspaceShell>
  );
}
