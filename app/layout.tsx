import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { normalizeLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainTrace | Supply Chain Fact Platform",
  description: "A supply-chain fact platform for proof packs, business passports, scenario cases, and verifiable trade evidence.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  const navItems = [
    { href: "/product", label: zh ? "产品架构" : "Product" },
    { href: "/project-plan", label: zh ? "项目计划" : "Plan" },
    { href: "/platform", label: zh ? "角色痛点" : "Roles" },
    { href: "/cases", label: zh ? "场景案例" : "Cases" },
    { href: "/receivable-pack", label: zh ? "证明包" : "Proof Packs" },
    { href: "/passport", label: zh ? "企业档案" : "Passports" },
    { href: "/#create-proof", label: zh ? "创建证明" : "Create" },
  ];

  return (
    <html lang={zh ? "zh-CN" : "en"}>
      <body>
        <header
          style={{
            width: "min(1180px, calc(100% - 40px))",
            margin: "18px auto 0",
            padding: "12px 14px",
            border: "1px solid rgba(17,24,39,0.08)",
            borderRadius: 999,
            background: "rgba(255,253,248,0.9)",
            boxShadow: "0 18px 44px rgba(20,17,12,0.08)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            position: "sticky",
            top: 12,
            zIndex: 40,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 950,
              letterSpacing: "-0.03em",
              fontSize: 18,
            }}
          >
            <span
              style={{
                display: "inline-grid",
                placeItems: "center",
                width: 34,
                height: 34,
                borderRadius: 999,
                background: "#111827",
                color: "#fff",
                fontSize: 14,
              }}
            >
              CT
            </span>
            <span>ChainTrace</span>
          </Link>

          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
              flex: 1,
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 36,
                  padding: "0 12px",
                  borderRadius: 999,
                  color: "#4d443b",
                  fontSize: 14,
                  fontWeight: 850,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <LanguageSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}
