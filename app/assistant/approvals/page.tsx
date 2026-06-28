import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { AssistantWorkspace } from "@/components/AssistantWorkspace";

export default async function AssistantApprovalsPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return <AssistantWorkspace zh={zh} initialView="approvals" />;
}
