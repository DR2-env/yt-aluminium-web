import Link from "next/link";
import { productHref, resolveItem, type Product } from "@/lib/catalogue";
import { fmt, getDictionary, localePath, tc, type Locale } from "@/i18n";
import { ProductVisual } from "./ProductVisual";
import { SwatchStrip } from "./SwatchStrip";

export function ProductCard({ product, lang }: { product: Product; lang: Locale }) {
  const d = getDictionary(lang);
  const item = resolveItem(product);
  const sizes = product.variants?.length ?? 0;
  const tag = product.tag === "New" ? d.catalogue.new : product.tag === "Special" ? d.catalogue.special : null;
  return (
    <Link
      href={localePath(lang, productHref(product))}
      className="group flex flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-line-strong"
    >
      <div className="relative aspect-[4/3] bg-surface-2 p-3">
        <ProductVisual item={{ ...item, name: tc(lang, item.name) }} />
        {tag && <span className="absolute start-2 top-2 rounded-sm bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-ink">{tag}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-line p-3">
        <div>
          <p className="font-mono text-xs text-muted" dir="ltr">{sizes ? fmt(d.catalogue.sizes, { n: sizes }) : product.code}</p>
          <h3 className="mt-0.5 text-sm font-medium leading-snug group-hover:text-accent">{tc(lang, product.name)}</h3>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <SwatchStrip fin={item.fin} lang={lang} standardLabel={d.catalogue.standardFinish} />
          <span className="text-xs text-muted">{tc(lang, product.len)}</span>
        </div>
      </div>
    </Link>
  );
}
