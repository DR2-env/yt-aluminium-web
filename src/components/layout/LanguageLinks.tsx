"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_META, localePath, stripLocale, type Locale } from "@/i18n/config";

/** The four languages as short, plain links (no dropdown), each in its own script. */
export function LanguageLinks({ lang, label, className = "" }: { lang: Locale; label: string; className?: string }) {
  const base = stripLocale(usePathname());
  const remember = () => {
    // A deliberate choice: stop suggesting another language.
    try {
      window.localStorage.setItem("yt-lang-suggest-dismissed", "1");
    } catch {
      // storage blocked
    }
  };
  return (
    <nav aria-label={label} className={`flex items-center ${className}`}>
      {LOCALES.map((l, i) => (
        <Link
          key={l}
          href={localePath(l, base)}
          hrefLang={LOCALE_META[l].htmlLang}
          lang={LOCALE_META[l].htmlLang}
          title={LOCALE_META[l].label}
          prefetch={false}
          onClick={remember}
          aria-current={l === lang ? "true" : undefined}
          className={`px-2 text-[13px] transition-colors ${i > 0 ? "border-s border-line-strong" : ""} ${l === lang ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}
        >
          {LOCALE_META[l].short}
        </Link>
      ))}
    </nav>
  );
}
