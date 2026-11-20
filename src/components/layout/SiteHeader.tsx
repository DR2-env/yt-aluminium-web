"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, Phone, X } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { QuoteLink } from "./QuoteLink";
import type { LayoutStrings } from "./types";
import { stripLocale } from "@/i18n/config";
import { SITE } from "@/lib/site";

export function SiteHeader({ s }: { s: LayoutStrings }) {
  const pathname = usePathname();
  const current = stripLocale(pathname);
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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 md:px-8">
        <Logo href={s.home} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {s.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded px-3 py-2 text-sm transition-colors ${isActive(n.match) ? "font-medium text-ink" : "text-muted hover:text-ink"}`}
              aria-current={isActive(n.match) ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <a href={SITE.phoneHref} className="hidden items-center gap-1.5 px-2 text-sm text-muted hover:text-ink xl:flex" dir="ltr">
            <Phone size={16} aria-hidden />
            {SITE.phone}
          </a>
          <LanguageSwitcher lang={s.lang} label={s.menu.language} />
          <div className="hidden sm:block">
            <QuoteLink href={s.quote.href} label={s.quote.label} />
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded border border-line-strong lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? s.menu.close : s.menu.open}
          >
            {open ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-bg px-4 pb-28 pt-4 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {[...s.nav, { href: s.quote.href, label: s.quote.label, match: "/quote" }].map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-line py-4 text-lg font-medium">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 space-y-1 text-sm text-muted">
            <p>{s.hours}</p>
            <p>{s.address}</p>
          </div>
        </div>
      )}
    </header>
  );
}
