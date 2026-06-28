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
    <div className="language-switcher" aria-label="Language selector">
      {supportedLocales.map((item) => (
        <button
          key={item}
          type="button"
          className={`language-button ${locale === item ? "active" : ""}`}
          onClick={() => handleChange(item)}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  );
}
