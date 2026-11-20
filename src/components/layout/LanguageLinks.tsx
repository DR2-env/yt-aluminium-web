"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_META, localePath, stripLocale, type Locale } from "@/i18n/config";

/** All four languages shown as plain links (no dropdown), each written in its own script. */
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
    <nav aria-label={label} className={`flex items-center gap-1 ${className}`}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={localePath(l, base)}
          hrefLang={LOCALE_META[l].htmlLang}
          lang={LOCALE_META[l].htmlLang}
          prefetch={false}
          onClick={remember}
          aria-current={l === lang ? "true" : undefined}
          className={`rounded px-2 py-1 text-sm transition-colors ${l === lang ? "bg-surface-2 font-semibold text-ink" : "text-muted hover:text-ink"}`}
        >
          {LOCALE_META[l].label}
        </Link>
      ))}
    </nav>
  );
}
