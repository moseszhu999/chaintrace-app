import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { normalizeLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainTrace Proof Page",
  description: "Create verifiable proof pages for products, shipments, invoices, and trade records.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);

  return (
    <html lang={locale === "zh-CN" ? "zh-CN" : "en"}>
      <body>
        <LanguageSwitcher />
        {children}
      </body>
    </html>
  );
}
