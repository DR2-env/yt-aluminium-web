"use client";

import Link from "next/link";
import { ClipboardText } from "@phosphor-icons/react";
import { useQuote } from "@/lib/quote-store";

export function QuoteLink({ href, label }: { href: string; label: string }) {
  const lines = useQuote();
  return (
    <Link href={href} className="inline-flex h-9 items-center gap-2 rounded bg-accent px-3 text-sm font-medium text-accent-ink hover:bg-accent-hover">
      <ClipboardText size={16} aria-hidden />
      <span>{label}</span>
      <span className="min-w-5 rounded-sm bg-accent-ink/15 px-1 text-center font-mono text-xs leading-5 tabular-nums">{lines.length}</span>
    </Link>
  );
}
