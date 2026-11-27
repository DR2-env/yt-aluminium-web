"use client";

import Link from "next/link";
import { ClipboardText, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react";
import { useQuote } from "@/lib/quote-store";
import { SITE, whatsappLink } from "@/lib/site";
import type { LayoutStrings } from "./types";

// Call, WhatsApp and quote (or directions while quotes are off) within thumb reach on phones.
export function MobileActionBar({ s }: { s: LayoutStrings }) {
  const lines = useQuote();
  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium";
  return (
    <nav aria-label="Quick actions" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      <a href={SITE.phoneHref} className={item}>
        <Phone size={20} aria-hidden />
        {s.call}
      </a>
      <a href={whatsappLink("Hi YT Aluminium, ")} className={item} target="_blank" rel="noopener noreferrer">
        <WhatsappLogo size={20} aria-hidden />
        {s.whatsapp}
      </a>
      {s.quote ? (
      <Link href={s.quote.href} className={`${item} text-accent`}>
        <span className="relative">
          <ClipboardText size={20} aria-hidden />
          {lines.length > 0 && (
            <span className="absolute -end-3 -top-1.5 min-w-4 rounded-sm bg-accent px-1 text-center font-mono text-[10px] leading-4 text-accent-ink">{lines.length}</span>
          )}
        </span>
        {s.quote.label}
      </Link>
      ) : (
        <a href={SITE.mapsUrl} className={item} target="_blank" rel="noopener noreferrer">
          <MapPin size={20} aria-hidden />
          {s.directions}
        </a>
      )}
    </nav>
  );
}
