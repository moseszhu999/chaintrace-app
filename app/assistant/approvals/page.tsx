import { cookies } from "next/headers";
import { ApprovalsView } from "@/components/workspace/ApprovalsView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { normalizeLocale } from "@/lib/i18n";

export default async function AssistantApprovalsPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <WorkspaceShell zh={zh} active="approvals" actionSlot={<a className="secondary-button" href="/assistant">{zh ? "返回助手" : "Back to assistant"}</a>}>
      <ApprovalsView zh={zh} />
    </WorkspaceShell>
  );
}
