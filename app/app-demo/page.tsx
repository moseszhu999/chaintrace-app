import { cookies } from "next/headers";
import { DashboardView } from "@/components/workspace/DashboardView";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { normalizeLocale } from "@/lib/i18n";

export default async function AppDemoPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <WorkspaceShell zh={zh} active="dashboard" actionSlot={<a className="primary-button" href="/evidence">{zh ? "处理下一个缺口" : "Resolve next gap"}</a>}>
      <DashboardView zh={zh} />
    </WorkspaceShell>
  );
}
