"use client";

import Link from "next/link";
import { ClipboardText } from "@phosphor-icons/react";
import { useQuote } from "@/lib/quote-store";

export function QuoteCount({ className = "" }: { className?: string }) {
  const lines = useQuote();
  return (
    <Link
      href="/quote"
      className={`relative inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-bg transition-transform active:translate-y-px ${className}`}
    >
      <ClipboardText size={18} weight="bold" aria-hidden />
      <span>Quote list</span>
      <span
        className={`min-w-5 rounded-md px-1.5 text-center font-mono text-xs leading-5 tabular-nums ${lines.length ? "bg-accent text-accent-ink" : "bg-bg/15 text-bg"}`}
        aria-label={`${lines.length} items`}
      >
        {lines.length}
      </span>
    </Link>
  );
}
