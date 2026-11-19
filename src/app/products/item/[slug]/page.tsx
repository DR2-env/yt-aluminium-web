import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaretRight, Info } from "@phosphor-icons/react/ssr";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ProductConfigurator, type ConfigProduct } from "@/components/catalogue/ProductConfigurator";
import {
  PHOTOS,
  PRODUCTS,
  SECTIONS,
  getProductBySlug,
  getRange,
  packText,
  productHref,
  productSlug,
  productsInRange,
  rangeHref,
  resolveItem,
  type Product,
  type Section,
} from "@/lib/catalogue";
import { SITE } from "@/lib/site";

// Every valid path is prerendered from the price list, so a blocking shell is fine here.
export const instant = false;

export function generateStaticParams() {
  return Object.values(PRODUCTS).map((p) => ({ slug: productSlug(p) }));
}

export async function generateMetadata({ params }: PageProps<"/products/item/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return {};
  const range = getRange(p.ranges[0]);
  return {
    title: `${p.code} ${p.name}`,
    description: `${p.name} (${p.code})${range ? `, ${range.name}` : ""}. ${p.len}, ${packText(resolveItem(p)).toLowerCase()}. Available in ${p.fin.length} finish${p.fin.length === 1 ? "" : "es"}. Trade supply from Milperra NSW.`,
  };
}

function toConfig(p: Product): ConfigProduct {
  const count = p.variants?.length || 1;
  const variants = Array.from({ length: count }, (_, i) => {
    const c = resolveItem(p, i);
    return { code: c.code, label: c.label, fin: c.fin, sec: c.sec, dims: c.dims, len: c.len, pack: c.pack, packText: packText(c), w: c.w, h: c.h, t: c.t };
  });
  // Only ship the section outlines this product needs.
  const sections: Record<string, Section> = {};
  variants.forEach((v) => {
    if (v.sec && SECTIONS[v.sec]) sections[v.sec] = SECTIONS[v.sec];
  });
  return {
    id: p.id,
    name: p.name,
    kind: p.kind,
    unit: p.unit,
    tag: p.tag,
    mesh: p.mesh,
    spool: p.spool,
    rubber: p.rubber,
    photo: p.kind === "photo" && p.img ? PHOTOS[p.img] : undefined,
    variants,
    sections,
  };
}

export default async function ProductPage({ params }: PageProps<"/products/item/[slug]">) {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) notFound();
  const range = getRange(p.ranges[0]);
  const suits = p.suits ? PRODUCTS[p.suits] : undefined;
  const related = range ? productsInRange(range).filter((x) => x.id !== p.id).slice(0, 4) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.code,
    category: range?.name,
    brand: { "@type": "Brand", name: SITE.name },
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-8 md:px-8 md:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/products" className="hover:text-ink">Products</Link>
        {range && (
          <>
            <CaretRight size={12} />
            <Link href={rangeHref(range)} className="hover:text-ink">{range.name}</Link>
          </>
        )}
        <CaretRight size={12} />
        <span className="text-ink">{p.code}</span>
      </nav>

      <Suspense fallback={<div className="aspect-[4/3] animate-pulse rounded-2xl bg-surface-2 lg:w-7/12" />}>
        <ProductConfigurator product={toConfig(p)} />
      </Suspense>

      {(p.note || suits) && (
        <div className="mt-10 flex max-w-3xl gap-3 rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed lg:ml-auto lg:w-5/12">
          <Info size={20} className="mt-0.5 shrink-0 text-accent" />
          <div className="space-y-2">
            {p.note && <p>{p.note}</p>}
            {suits && (
              <p>
                Suits{" "}
                <Link href={productHref(suits)} className="font-semibold underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {suits.code} {suits.name}
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      )}

      {related.length > 0 && range && (
        <section className="mt-24">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">More from {range.name}</h2>
            <Link href={rangeHref(range)} className="shrink-0 text-sm font-medium text-muted hover:text-ink">
              Whole range
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
