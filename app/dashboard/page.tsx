import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { ChainTraceWorkspaceApp } from "@/components/ChainTraceWorkspaceApp";

export default async function DashboardRoute() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return <ChainTraceWorkspaceApp zh={zh} initialView="dashboard" />;
}
