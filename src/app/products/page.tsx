import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogueBrowser, type BrowserEntry } from "@/components/catalogue/CatalogueBrowser";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { CODE_COUNT, PRODUCTS, RANGES } from "@/lib/catalogue";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products",
  description: `Search all ${CODE_COUNT} codes in the YT Aluminium trade range: shopfront, doors, security, flyscreen, mesh, partitions, blinds, hardware and locks.`,
};

export default function ProductsPage() {
  const products = Object.values(PRODUCTS);
  const entries: BrowserEntry[] = products.map((p) => ({
    id: p.id,
    tag: p.tag,
    text: [p.code, p.id, p.name, p.grp ?? "", ...(p.variants ?? []).flatMap((v) => [v.code, v.label])].join(" ").toLowerCase(),
  }));
  const cards = Object.fromEntries(products.map((p) => [p.id, <ProductCard key={p.id} product={p} />]));

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-10 md:px-8 md:pt-14">
      <h1 className="text-4xl font-semibold tracking-tighter md:text-6xl">Products</h1>
      <p className="mt-4 max-w-[60ch] text-muted">
        {CODE_COUNT} codes from our price list dated {SITE.priceListDate}. Prices are for trade accounts: add items to your quote list and we will send pricing back.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-[60vh] animate-pulse rounded-2xl bg-surface-2" />}>
          <CatalogueBrowser ranges={RANGES.map((r) => ({ id: r.id, name: r.name, items: r.items }))} entries={entries} cards={cards} />
        </Suspense>
      </div>
    </div>
  );
}
