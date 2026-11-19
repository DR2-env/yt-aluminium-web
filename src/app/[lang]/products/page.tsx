import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogueBrowser, type BrowserEntry } from "@/components/catalogue/CatalogueBrowser";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { CODE_COUNT, PRODUCTS, RANGES, rangeHref } from "@/lib/catalogue";
import { SITE } from "@/lib/site";
import { fmt, getDictionary, isLocale, localePath, tc } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return { title: d.meta.productsTitle, description: d.meta.productsDescription, alternates: alternatesFor(lang, "/products") };
}

export default async function ProductsPage({ params }: PageProps<"/[lang]/products">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const products = Object.values(PRODUCTS);
  const entries: BrowserEntry[] = products.map((p) => ({
    id: p.id,
    tag: p.tag,
    text: [p.code, p.id, p.name, tc(lang, p.name), p.grp ?? "", tc(lang, p.grp), ...(p.variants ?? []).flatMap((v) => [v.code, v.label])].join(" ").toLowerCase(),
  }));
  const cards = Object.fromEntries(products.map((p) => [p.id, <ProductCard key={p.id} product={p} lang={lang} />]));

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-10 md:px-8 md:pt-12">
      <h1 className="text-3xl font-semibold md:text-4xl">{d.meta.productsTitle}</h1>
      <p className="mt-3 max-w-[65ch] text-muted">{fmt(d.catalogue.intro, { codes: CODE_COUNT, date: "16/02/2026" })}</p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-[60vh] rounded-md bg-surface-2" />}>
          <CatalogueBrowser
            ranges={RANGES.map((r) => ({ id: r.id, name: tc(lang, r.name), href: localePath(lang, rangeHref(r)), items: r.items }))}
            entries={entries}
            cards={cards}
            s={{
              searchLabel: d.catalogue.searchLabel,
              searchPlaceholder: d.catalogue.searchPlaceholder,
              clearSearch: d.catalogue.clearSearch,
              all: d.catalogue.all,
              new: d.catalogue.new,
              results: d.catalogue.results,
              result: d.catalogue.result,
              noResults: d.catalogue.noResults,
              noResultsText: d.catalogue.noResultsText,
              askUs: d.catalogue.askUs,
              rangePage: d.catalogue.rangePage,
              contactHref: localePath(lang, "/contact"),
            }}
          />
        </Suspense>
      </div>
      <p className="sr-only">{SITE.name}</p>
    </div>
  );
}
