"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { X } from "@phosphor-icons/react";
import { LOCALE_META, isLocale, localePath, stripLocale, type Locale } from "@/i18n/config";

const DISMISS_KEY = "yt-lang-suggest-dismissed";

/**
 * If the phone or browser is set to Chinese, Korean or Arabic and the page is in another
 * language, offer a one-tap switch, written in the visitor's own language.
 */
const noopSubscribe = () => () => {};

/** The visitor's preferred site language from browser settings, unless they dismissed the banner. */
function detectPreferred(): Locale | null {
  try {
    if (window.localStorage.getItem(DISMISS_KEY)) return null;
  } catch {
    // storage blocked: still suggest
  }
  const found = (navigator.languages ?? [navigator.language]).map((l) => l.toLowerCase().split("-")[0]).find(isLocale);
  return found ?? null;
}

export function LanguageSuggest({ lang, texts }: { lang: Locale; texts: Record<Locale, string> }) {
  const pathname = usePathname();
  const preferred = useSyncExternalStore(noopSubscribe, detectPreferred, () => null);
  const [dismissed, setDismissed] = useState(false);
  const target = !dismissed && preferred && preferred !== lang ? preferred : null;

  if (!target) return null;
  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className="border-b border-line bg-accent-soft" lang={LOCALE_META[target].htmlLang} dir={LOCALE_META[target].dir}>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-2.5 md:px-8">
        {/* No prefetch: each language has its own root layout, and prefetching a bare English path
            from another language loops endlessly. Switching language is a full page load anyway. */}
        <Link href={localePath(target, stripLocale(pathname))} prefetch={false} className="text-[15px] font-medium text-accent underline underline-offset-4" onClick={dismiss}>
          {texts[target]}
        </Link>
        <button type="button" onClick={dismiss} className="grid size-8 place-items-center rounded text-muted hover:text-ink" aria-label="Close">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
