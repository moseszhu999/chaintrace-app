import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { AppDemo } from "@/components/AppDemo";

export default async function AppDemoPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return <AppDemo zh={zh} />;
}
