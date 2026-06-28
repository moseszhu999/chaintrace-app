import { cookies } from "next/headers";
import { EvidenceView } from "@/components/workspace/EvidenceView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { normalizeLocale } from "@/lib/i18n";

export default async function EvidencePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <WorkspaceShell zh={zh} active="evidence" actionSlot={<a className="secondary-button" href="/tasks">{zh ? "查看任务" : "View tasks"}</a>}>
      <EvidenceView zh={zh} />
    </WorkspaceShell>
  );
}
