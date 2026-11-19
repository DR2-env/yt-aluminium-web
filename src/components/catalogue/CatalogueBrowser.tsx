"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

export interface BrowserEntry {
  id: string;
  /** Lower-cased code, variant codes, name and group, for matching. */
  text: string;
  tag?: string;
}

interface Props {
  ranges: { id: string; name: string; items: string[] }[];
  entries: BrowserEntry[];
  cards: Record<string, ReactNode>;
}

export function CatalogueBrowser({ ranges, entries, cards }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const tag = params.get("tag") ?? "";
  const rangeFilter = params.get("range") ?? "";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const s = next.toString();
    router.replace(s ? `/products?${s}` : "/products", { scroll: false });
  };

  const matches = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return new Set(
      entries
        .filter((e) => (tag ? e.tag?.toLowerCase() === tag.toLowerCase() : true))
        .filter((e) => terms.every((t) => e.text.includes(t)))
        .map((e) => e.id),
    );
  }, [entries, q, tag]);

  const visibleRanges = ranges
    .filter((r) => !rangeFilter || r.id === rangeFilter)
    .map((r) => ({ ...r, items: r.items.filter((id) => matches.has(id)) }))
    .filter((r) => r.items.length);

  const total = new Set(visibleRanges.flatMap((r) => r.items)).size;
  const chip = (active: boolean) =>
    `shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"}`;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-bg/90 px-4 py-4 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block shrink-0 lg:w-96">
            <span className="sr-only">Search by code or name</span>
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search a code or name, e.g. AU014 or flyscreen"
              className="h-11 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-10 text-[15px] placeholder:text-muted focus:border-ink focus:outline-none"
              autoComplete="off"
            />
            {q && (
              <button type="button" onClick={() => setParam("q", "")} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-ink" aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </label>
          <div className="scroll-row -mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <button type="button" className={chip(!rangeFilter && !tag)} onClick={() => router.replace(q ? `/products?q=${encodeURIComponent(q)}` : "/products", { scroll: false })}>
              All
            </button>
            <button type="button" className={chip(tag === "new")} onClick={() => setParam("tag", tag === "new" ? "" : "new")}>
              New
            </button>
            {ranges.map((r) => (
              <button key={r.id} type="button" className={chip(rangeFilter === r.id)} onClick={() => setParam("range", rangeFilter === r.id ? "" : r.id)}>
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {total} {total === 1 ? "product" : "products"}
      </p>

      {visibleRanges.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="text-lg font-semibold">Nothing matches &ldquo;{q}&rdquo;</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Try a shorter code (AU014 rather than AU014-MM), or ask us. We may stock it under another name.
          </p>
          <Link href="/contact" className="mt-5 inline-block text-sm font-semibold text-accent">
            Ask about a product
          </Link>
        </div>
      ) : (
        visibleRanges.map((r) => (
          <section key={r.id} className="mt-10 first-of-type:mt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{r.name}</h2>
              <Link href={`/products/${r.id}`} className="shrink-0 text-sm font-medium text-muted hover:text-ink">
                Range page
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {r.items.map((id) => (
                <div key={id} className="contents">
                  {cards[id]}
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
