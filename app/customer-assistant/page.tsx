import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { CustomerAssistantDemo } from "@/components/CustomerAssistantDemo";

export default async function CustomerAssistantPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return <CustomerAssistantDemo zh={zh} />;
}
