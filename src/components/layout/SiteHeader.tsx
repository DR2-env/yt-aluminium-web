"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, Phone, X } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { NAV } from "./nav";
import { QuoteCount } from "./QuoteCount";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-4 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(n.href) ? "text-ink" : "text-muted hover:text-ink"}`}
              aria-current={isActive(n.href) ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={SITE.phoneHref} className="hidden items-center gap-2 px-2 font-mono text-sm text-muted transition-colors hover:text-ink xl:flex">
            <Phone size={16} aria-hidden />
            {SITE.phone}
          </a>
          <div className="hidden sm:block">
            <QuoteCount />
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg border border-line-strong lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-bg px-4 pb-28 pt-6 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {[{ href: "/", label: "Home" }, ...NAV, { href: "/quote", label: "Quote list" }].map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-line py-4 text-2xl font-semibold tracking-tight">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 space-y-1 text-sm text-muted">
            <p>{SITE.hours}</p>
            <p>
              {SITE.address.street}, {SITE.address.suburb}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
