"use client";

import { useEffect, useState } from "react";
import { localeLabels, type Locale, normalizeLocale, supportedLocales } from "@/lib/i18n";

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )chaintrace_locale=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : undefined);
}

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  function handleChange(nextLocale: Locale) {
    document.cookie = `chaintrace_locale=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000`;
    setLocale(nextLocale);
    window.location.reload();
  }

  return (
    <div
      aria-label="Language selector"
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 50,
        display: "flex",
        gap: 8,
        padding: 6,
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 999,
        background: "rgba(255,253,248,0.92)",
        boxShadow: "0 12px 30px rgba(20,17,12,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      {supportedLocales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => handleChange(item)}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: 800,
            background: locale === item ? "#111827" : "transparent",
            color: locale === item ? "#fff" : "#171411",
          }}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  );
}
