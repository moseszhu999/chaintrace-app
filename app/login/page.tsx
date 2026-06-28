import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { LoginPage } from "@/components/LoginPage";

export default async function LoginRoute() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return <LoginPage zh={zh} />;
}
