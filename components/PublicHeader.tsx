"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function PublicHeader({ zh }: { zh: boolean }) {
  const navItems = [
    { href: "/business-ops", label: zh ? "交易 Agent" : "Trade agent" },
    { href: "/#workflow", label: zh ? "交易流程" : "Trade flow" },
    { href: "/evidence", label: zh ? "文件" : "Documents" },
    { href: "/tasks", label: zh ? "履约 / 验收" : "Fulfillment" },
    { href: "/business-financing", label: zh ? "融资 / RWA" : "Financing / RWA" },
    { href: "/proof-packs", label: zh ? "证明 / 风控" : "Proof & risk" },
    { href: "/login", label: zh ? "登录" : "Login" },
  ];

  return (
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
        aria-label="Public navigation"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const isPrimary = item.href === "/business-ops";
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 36,
                padding: "0 12px",
                borderRadius: 999,
                color: isPrimary ? "#fff" : "#4d443b",
                background: isPrimary ? "#111827" : "transparent",
                fontSize: 14,
                fontWeight: 850,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <LanguageSwitcher />
    </header>
  );
}
