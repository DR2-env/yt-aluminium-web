"use client";

import Link from "next/link";
import { ClipboardText, Phone, WhatsappLogo } from "@phosphor-icons/react";
import { useQuote } from "@/lib/quote-store";
import { SITE, whatsappLink } from "@/lib/site";

// Thumb-reach actions for phones: most of YT's customers order from site or the ute.
export function MobileActionBar() {
  const lines = useQuote();
  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold";
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
    >
      <a href={SITE.phoneHref} className={item}>
        <Phone size={20} weight="bold" aria-hidden />
        Call
      </a>
      <a href={whatsappLink("Hi YT Aluminium, ")} className={item} target="_blank" rel="noopener noreferrer">
        <WhatsappLogo size={20} weight="bold" aria-hidden />
        WhatsApp
      </a>
      <Link href="/quote" className={`${item} text-accent`}>
        <span className="relative">
          <ClipboardText size={20} weight="bold" aria-hidden />
          {lines.length > 0 && (
            <span className="absolute -right-3 -top-1.5 min-w-4 rounded bg-accent px-1 text-center font-mono text-[10px] leading-4 text-accent-ink">
              {lines.length}
            </span>
          )}
        </span>
        Quote list
      </Link>
    </nav>
  );
}
