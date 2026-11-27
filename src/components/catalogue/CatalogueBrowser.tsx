"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
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

/** Category > range > price-list group > product ids, already translated. */
export interface BrowserCategory {
  id: string;
  name: string;
  text: string;
  ranges: { id: string; name: string; href: string; groups: { name: string; items: string[] }[] }[];
}

interface Props {
  categories: BrowserCategory[];
  entries: BrowserEntry[];
  cards: Record<string, ReactNode>;
  s: BrowserStrings;
}

const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

// Filters live in the URL (?q=, ?tag=, ?cat=, and ?range= from older links) but are read in the
// browser only, so the server sends the full product list. useSearchParams would make the list
// client-only and invisible to search engines. Native history.replaceState stays in sync with Next.
const URL_EVENT = "yt-catalogue-url";
const subscribeUrl = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(URL_EVENT, cb);
  };
};
const replaceUrl = (url: string) => {
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(URL_EVENT));
};

export function CatalogueBrowser({ categories, entries, cards, s }: Props) {
  const search = useSyncExternalStore(subscribeUrl, () => window.location.search, () => "");
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const tag = params.get("tag") ?? "";
  const rangeParam = params.get("range") ?? "";
  // Older links filter by range; show that range's category with only that range in it.
  const catFilter = params.get("cat") ?? categories.find((c) => c.ranges.some((r) => r.id === rangeParam))?.id ?? "";

  const setParams = (next: Record<string, string>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    const str = p.toString();
    replaceUrl(str ? `${pathname}?${str}` : pathname);
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

  const visible = categories
    .filter((c) => !catFilter || c.id === catFilter)
    .map((c) => ({
      ...c,
      ranges: c.ranges
        .filter((r) => !rangeParam || r.id === rangeParam)
        .map((r) => ({ ...r, groups: r.groups.map((g) => ({ ...g, items: g.items.filter((id) => matches.has(id)) })).filter((g) => g.items.length) }))
        .filter((r) => r.groups.length),
    }))
    .filter((c) => c.ranges.length);
  const total = new Set(visible.flatMap((c) => c.ranges.flatMap((r) => r.groups.flatMap((g) => g.items)))).size;
  const countIn = (c: (typeof visible)[number]) => new Set(c.ranges.flatMap((r) => r.groups.flatMap((g) => g.items))).size;

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-muted hover:border-ink hover:text-ink"}`;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-bg px-4 py-3 md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block shrink-0 lg:w-80">
            <span className="sr-only">{s.searchLabel}</span>
            <MagnifyingGlass size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setParams({ q: e.target.value })}
              placeholder={s.searchPlaceholder}
              className="h-10 w-full rounded-full border border-line-strong bg-surface pe-9 ps-9 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
              autoComplete="off"
            />
            {q && (
              <button type="button" onClick={() => setParams({ q: "" })} className="absolute end-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink" aria-label={s.clearSearch}>
                <X size={14} />
              </button>
            )}
          </label>
          <ScrollRow className="-mx-4 px-4 lg:mx-0 lg:flex-1 lg:px-0" label={s.all}>
            <button type="button" aria-pressed={!catFilter && !tag} className={chip(!catFilter && !tag)} onClick={() => setParams({ cat: "", range: "", tag: "" })}>
              {s.all}
            </button>
            <button type="button" aria-pressed={tag === "new"} className={chip(tag === "new")} onClick={() => setParams({ tag: tag === "new" ? "" : "new" })}>
              {s.new}
            </button>
            {categories.map((c) => (
              <button key={c.id} type="button" aria-pressed={catFilter === c.id} className={chip(catFilter === c.id)} onClick={() => setParams({ cat: catFilter === c.id ? "" : c.id, range: "" })}>
                {c.name}
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
        visible.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`cat-${c.id}`} className="mt-14 scroll-mt-40 first-of-type:mt-6">
            <div className="border-b border-ink pb-4">
              <h2 id={`cat-${c.id}`} className="text-2xl font-semibold md:text-3xl">
                {c.name} <span className="text-base font-normal text-muted">({countIn(c)})</span>
              </h2>
              <p className="mt-1 max-w-[70ch] text-[15px] text-muted">{c.text}</p>
            </div>
            {c.ranges.map((r) => (
              <div key={r.id} className="mt-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold">{r.name}</h3>
                  <Link href={r.href} className="shrink-0 text-sm text-muted hover:text-ink">
                    {s.rangePage}
                  </Link>
                </div>
                {r.groups.map((g) => (
                  <div key={g.name || "all"} className="mt-3">
                    {g.name && r.groups.length > 1 && <h4 className="eyebrow mb-2 text-muted">{g.name}</h4>}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                      {g.items.map((id) => (
                        <div key={id} className="contents">
                          {cards[id]}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
