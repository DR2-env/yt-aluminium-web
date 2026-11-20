"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { ScrollRow } from "@/components/ui/ScrollRow";

export interface BrowserEntry {
  id: string;
  /** Lower-cased code, variant codes, English and translated names, for matching. */
  text: string;
  tag?: string;
}

export interface BrowserStrings {
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  all: string;
  new: string;
  results: string;
  result: string;
  noResults: string;
  noResultsText: string;
  askUs: string;
  rangePage: string;
  contactHref: string;
}

interface Props {
  ranges: { id: string; name: string; href: string; items: string[] }[];
  entries: BrowserEntry[];
  cards: Record<string, ReactNode>;
  s: BrowserStrings;
}

const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

export function CatalogueBrowser({ ranges, entries, cards, s }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const tag = params.get("tag") ?? "";
  const rangeFilter = params.get("range") ?? "";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const str = next.toString();
    router.replace(str ? `${pathname}?${str}` : pathname, { scroll: false });
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

  const visible = ranges
    .filter((r) => !rangeFilter || r.id === rangeFilter)
    .map((r) => ({ ...r, items: r.items.filter((id) => matches.has(id)) }))
    .filter((r) => r.items.length);
  const total = new Set(visible.flatMap((r) => r.items)).size;

  const chip = (active: boolean) =>
    `shrink-0 rounded border px-3 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"}`;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-bg px-4 py-3 md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block shrink-0 lg:w-96">
            <span className="sr-only">{s.searchLabel}</span>
            <MagnifyingGlass size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder={s.searchPlaceholder}
              className="h-10 w-full rounded border border-line-strong bg-surface pe-9 ps-9 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
              autoComplete="off"
            />
            {q && (
              <button type="button" onClick={() => setParam("q", "")} className="absolute end-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink" aria-label={s.clearSearch}>
                <X size={14} />
              </button>
            )}
          </label>
          <ScrollRow className="-mx-4 px-4 lg:mx-0 lg:flex-1 lg:px-0" label={s.all}>
            <button type="button" className={chip(!rangeFilter && !tag)} onClick={() => router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false })}>
              {s.all}
            </button>
            <button type="button" className={chip(tag === "new")} onClick={() => setParam("tag", tag === "new" ? "" : "new")}>
              {s.new}
            </button>
            {ranges.map((r) => (
              <button key={r.id} type="button" className={chip(rangeFilter === r.id)} onClick={() => setParam("range", rangeFilter === r.id ? "" : r.id)}>
                {r.name}
              </button>
            ))}
          </ScrollRow>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted" aria-live="polite">
        {total === 1 ? s.result : fill(s.results, { n: total })}
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-md border border-line bg-surface-2 p-10 text-center">
          <p className="font-medium">{fill(s.noResults, { q })}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">{s.noResultsText}</p>
          <Link href={s.contactHref} className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
            {s.askUs}
          </Link>
        </div>
      ) : (
        visible.map((r) => (
          <section key={r.id} className="mt-10 first-of-type:mt-5">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
              <h2 className="text-lg font-semibold">{r.name}</h2>
              <Link href={r.href} className="shrink-0 text-sm text-muted hover:text-ink">
                {s.rangePage}
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
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
