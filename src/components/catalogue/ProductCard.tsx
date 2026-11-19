import Link from "next/link";
import { defaultFinish, productHref, resolveItem, type Product } from "@/lib/catalogue";
import { ProductVisual } from "./ProductVisual";
import { SwatchStrip } from "./SwatchStrip";

export function ProductCard({ product }: { product: Product }) {
  const item = resolveItem(product);
  const finish = defaultFinish(item.fin);
  const sizes = product.variants?.length ?? 0;
  return (
    <Link
      href={productHref(product)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-panel"
    >
      <div className="relative aspect-[4/3] bg-surface-2/60 p-6 transition-colors group-hover:bg-surface-2">
        <ProductVisual item={item} finish={finish} />
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-ink">{product.tag}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-mono text-xs font-medium text-muted">{sizes ? `${sizes} sizes` : product.code}</p>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug tracking-tight">{product.name}</h3>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <SwatchStrip fin={item.fin} />
          <span className="text-xs text-muted">{product.len}</span>
        </div>
      </div>
    </Link>
  );
}
