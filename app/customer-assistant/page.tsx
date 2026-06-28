import { cookies } from "next/headers";
import { AssistantView } from "@/components/workspace/AssistantView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { normalizeLocale } from "@/lib/i18n";

export default async function CustomerAssistantPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <WorkspaceShell zh={zh} active="assistant" actionSlot={<a className="primary-button" href="/assistant/approvals">{zh ? "进入审批" : "Open approvals"}</a>}>
      <AssistantView zh={zh} />
    </WorkspaceShell>
  );
}
