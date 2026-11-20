"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaretDown, Globe } from "@phosphor-icons/react";
import { LOCALES, LOCALE_META, localePath, stripLocale, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const base = stripLocale(pathname);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when the page changes, on a click outside, or on Escape.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={label}
        className="flex h-9 items-center gap-1.5 rounded px-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
      >
        <Globe size={16} aria-hidden />
        <span>{LOCALE_META[lang].label}</span>
        <CaretDown size={12} aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute end-0 top-full z-50 mt-1 min-w-36 rounded-md border border-line bg-surface p-1 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)]">
          {LOCALES.map((l) => (
            <li key={l}>
              <Link
                href={localePath(l, base)}
                // No prefetch: see LanguageSuggest. Prefetching across languages loops endlessly.
                prefetch={false}
                hrefLang={LOCALE_META[l].htmlLang}
                lang={LOCALE_META[l].htmlLang}
                onClick={() => {
                  setOpen(false);
                  // A deliberate choice: stop suggesting another language.
                  try {
                    window.localStorage.setItem("yt-lang-suggest-dismissed", "1");
                  } catch {
                    // storage blocked
                  }
                }}
                className={`block rounded px-3 py-2 text-sm hover:bg-surface-2 ${l === lang ? "font-semibold" : ""}`}
                aria-current={l === lang ? "true" : undefined}
              >
                {LOCALE_META[l].label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
