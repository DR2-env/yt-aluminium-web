"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { LanguageLinks } from "./LanguageLinks";
import { useQuote } from "@/lib/quote-store";
import type { LayoutStrings } from "./types";
import { stripLocale } from "@/i18n/config";

// Logo left, navigation centred, languages and the Quote button right. Nothing else.
export function SiteHeader({ s }: { s: LayoutStrings }) {
  const pathname = usePathname();
  const current = stripLocale(pathname);
  const lines = useQuote();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (match: string) => (match === "/" ? current === "/" : current === match || current.startsWith(`${match}/`));
  const quoteActive = isActive("/quote");

  const quoteButton = (extra = "") => (
    <Link
      href={s.quote.href}
      aria-current={quoteActive ? "page" : undefined}
      className={`inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 ${extra}`}
    >
      {s.quote.label}
      {lines.length > 0 && (
        <span className="grid min-w-5 place-items-center rounded-full bg-white px-1.5 text-[11px] leading-5 text-ink tabular-nums">
          {lines.length}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/45 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[1fr_auto] items-center gap-6 px-4 md:px-8 xl:grid-cols-[1fr_auto_1fr]">
        <Logo href={s.home} />

        <nav className="hidden items-center gap-7 xl:flex" aria-label="Main">
          {s.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.match) ? "page" : undefined}
              className={`relative py-1 text-[15px] transition-colors after:absolute after:inset-x-0 after:-bottom-[1px] after:h-px after:bg-ink after:transition-opacity ${
                isActive(n.match) ? "text-ink after:opacity-100" : "text-muted after:opacity-0 hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4">
          <LanguageLinks lang={s.lang} label={s.menu.language} className="hidden xl:flex" />
          <div className="hidden sm:block">{quoteButton()}</div>
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-full border border-line-strong xl:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? s.menu.close : s.menu.open}
          >
            {open ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* Below desktop width: languages stay visible in their own quiet row. */}
      <div className="border-t border-line xl:hidden">
        <LanguageLinks lang={s.lang} label={s.menu.language} className="mx-auto max-w-[1280px] justify-center px-4 py-2 md:px-8" />
      </div>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-6.5rem)] overflow-y-auto border-t border-line bg-bg px-4 pb-28 pt-2 xl:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {[...s.nav, { href: s.quote.href, label: s.quote.label, match: "/quote" }].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(n.match) ? "page" : undefined}
                className={`flex items-center justify-between border-b border-line py-4 text-lg ${isActive(n.match) ? "font-semibold" : ""}`}
              >
                {n.label}
                {n.match === "/quote" && lines.length > 0 && (
                  <span className="grid min-w-6 place-items-center rounded-full bg-ink px-2 text-xs leading-6 text-white">{lines.length}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
