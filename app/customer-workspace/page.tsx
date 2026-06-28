import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { CustomerWorkspaceDemo } from "@/components/CustomerWorkspaceDemo";

export default async function CustomerWorkspacePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return <CustomerWorkspaceDemo zh={zh} />;
}
