"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDown, Globe } from "@phosphor-icons/react";
import { LOCALES, LOCALE_META, localePath, stripLocale, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const base = stripLocale(pathname);
  return (
    <details className="group relative">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded px-2 text-sm text-muted hover:bg-surface-2 hover:text-ink [&::-webkit-details-marker]:hidden" aria-label={label}>
        <Globe size={16} aria-hidden />
        <span>{LOCALE_META[lang].label}</span>
        <CaretDown size={12} aria-hidden className="transition-transform group-open:rotate-180" />
      </summary>
      <ul className="absolute end-0 top-full z-50 mt-1 min-w-36 rounded-md border border-line bg-surface p-1 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)]">
        {LOCALES.map((l) => (
          <li key={l}>
            <Link
              href={localePath(l, base)}
              hrefLang={LOCALE_META[l].htmlLang}
              lang={LOCALE_META[l].htmlLang}
              className={`block rounded px-3 py-2 text-sm hover:bg-surface-2 ${l === lang ? "font-semibold" : ""}`}
              aria-current={l === lang ? "true" : undefined}
            >
              {LOCALE_META[l].label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
