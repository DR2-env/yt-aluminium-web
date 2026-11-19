import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react/ssr";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { RANGES, getRange, productsInRange, rangeHref } from "@/lib/catalogue";
import { getDictionary, isLocale, localePath, tc } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

// Every valid path is prerendered from the price list, so a blocking shell is fine here.
export const instant = false;

export function generateStaticParams() {
  return RANGES.map((r) => ({ range: r.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[range]">): Promise<Metadata> {
  const { lang, range } = await params;
  const r = getRange(range);
  if (!isLocale(lang) || !r) return {};
  return { title: tc(lang, r.name), description: tc(lang, r.blurb), alternates: alternatesFor(lang, rangeHref(r)) };
}

export default async function RangePage({ params }: PageProps<"/[lang]/products/[range]">) {
  const { lang, range } = await params;
  const r = getRange(range);
  if (!isLocale(lang) || !r) notFound();
  const d = getDictionary(lang);
  const products = productsInRange(r);

  // Keep the price-list grouping (frames, beads, hinges) where the range has it.
  const groups: { name: string; items: typeof products }[] = [];
  for (const p of products) {
    const name = p.grp ?? "";
    const g = groups.find((x) => x.name === name);
    if (g) g.items.push(p);
    else groups.push({ name, items: [p] });
  }
  const idx = RANGES.findIndex((x) => x.id === r.id);
  const next = RANGES[(idx + 1) % RANGES.length];

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-8 md:px-8 md:pt-10">
      <nav aria-label={d.catalogue.breadcrumb} className="flex items-center gap-1.5 text-sm text-muted">
        <Link href={localePath(lang, "/products")} className="hover:text-ink">{d.nav.products}</Link>
        <CaretRight size={12} className="rtl:-scale-x-100" />
        <span className="text-ink">{tc(lang, r.name)}</span>
      </nav>
      <h1 className="mt-5 text-3xl font-semibold md:text-4xl">{tc(lang, r.name)}</h1>
      <p className="mt-3 max-w-[70ch] leading-relaxed text-muted">{tc(lang, r.blurb)}</p>

      {groups.map((g) => (
        <section key={g.name || "all"} className="mt-10">
          {g.name && groups.length > 1 && <h2 className="mb-4 border-b border-line pb-2 text-lg font-semibold">{tc(lang, g.name)}</h2>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {g.items.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </section>
      ))}

      <Link href={localePath(lang, rangeHref(next))} className="group mt-16 flex items-center justify-between rounded-md border border-line p-5 hover:border-line-strong">
        <span>
          <span className="block text-sm text-muted">{d.catalogue.nextRange}</span>
          <span className="mt-1 block text-lg font-semibold group-hover:text-accent">{tc(lang, next.name)}</span>
        </span>
        <CaretRight size={18} className="text-muted rtl:-scale-x-100" />
      </Link>
    </div>
  );
}
