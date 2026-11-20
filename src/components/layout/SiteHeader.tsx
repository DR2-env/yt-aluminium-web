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

// Header: logo, navigation (Quote last, with item count) and the four languages. Nothing else.
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

  const isActive = (match: string) => current === match || current.startsWith(`${match}/`);
  const links = [...s.nav, { href: s.quote.href, label: s.quote.label, match: "/quote" }];
  const count = (match: string) =>
    match === "/quote" && lines.length > 0 ? (
      <span className="ms-1.5 rounded-sm bg-brand px-1.5 font-mono text-[11px] leading-5 text-accent-ink tabular-nums">{lines.length}</span>
    ) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 md:px-8">
        <Logo href={s.home} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`inline-flex items-center rounded px-3 py-2 text-sm transition-colors ${isActive(n.match) ? "font-medium text-ink" : "text-muted hover:text-ink"}`}
              aria-current={isActive(n.match) ? "page" : undefined}
            >
              {n.label}
              {count(n.match)}
            </Link>
          ))}
        </nav>
        <LanguageLinks lang={s.lang} label={s.menu.language} className="hidden lg:flex" />
        <button
          type="button"
          className="relative grid size-10 place-items-center rounded border border-line-strong lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? s.menu.close : s.menu.open}
        >
          {open ? <X size={18} /> : <List size={18} />}
          {!open && lines.length > 0 && (
            <span className="absolute -end-1.5 -top-1.5 min-w-5 rounded-sm bg-brand px-1 text-center font-mono text-[11px] leading-5 text-accent-ink">{lines.length}</span>
          )}
        </button>
      </div>
      {/* Phones and tablets: languages always visible in their own row. */}
      <div className="border-t border-line lg:hidden">
        <LanguageLinks lang={s.lang} label={s.menu.language} className="mx-auto max-w-[1280px] justify-center px-4 py-1.5 md:px-8" />
      </div>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-6.5rem)] overflow-y-auto border-t border-line bg-bg px-4 pb-28 pt-2 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((n) => (
              <Link key={n.href} href={n.href} className="flex items-center border-b border-line py-4 text-lg font-medium">
                {n.label}
                {count(n.match)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
