"use client";

import { useState } from "react";

export type FaqCategory = "order" | "delivery" | "products";

interface Props {
  items: { q: string; a: string; cat: FaqCategory }[];
  filters: Record<"all" | FaqCategory, string>;
}

// Category chips over the question list. All questions stay in the HTML for search engines.
export function FaqList({ items, filters }: Props) {
  const [active, setActive] = useState<"all" | FaqCategory>("all");
  const keys = Object.keys(filters) as ("all" | FaqCategory)[];

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2" role="group">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={active === k}
            onClick={() => setActive(k)}
            className={`h-10 rounded-full border px-4 text-sm transition-colors ${active === k ? "border-ink bg-ink text-white" : "border-line-strong hover:border-ink"}`}
          >
            {filters[k]}
          </button>
        ))}
      </div>
      <dl className="mt-8 border-t border-line">
        {items.map((item, i) => (
          <div key={item.q} hidden={active !== "all" && active !== item.cat} className="grid gap-3 border-b border-line py-7 md:grid-cols-12 md:gap-8">
            <dt className="flex gap-4 md:col-span-5">
              <span className="eyebrow pt-1.5 text-muted" dir="ltr">[{String(i + 1).padStart(2, "0")}]</span>
              <span className="text-xl font-light leading-snug">{item.q}</span>
            </dt>
            <dd className="leading-relaxed text-muted md:col-span-7">{item.a}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
