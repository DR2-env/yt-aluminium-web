import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CaretRight } from "@phosphor-icons/react/ssr";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ProductConfigurator, type ConfigProduct } from "@/components/catalogue/ProductConfigurator";
import {
  PHOTOS,
  PRODUCTS,
  SECTIONS,
  getProductBySlug,
  getRange,
  hasHandBuiltModel,
  isStandinSection,
  productHref,
  productSlug,
  productsInRange,
  rangeHref,
  renderSrc,
  resolveItem,
  sectionKeyFor,
  type Product,
  type Section,
} from "@/lib/catalogue";
import { SITE } from "@/lib/site";
import { finishNameMap, fmt, getDictionary, isLocale, localePath, packLabel, tc, type Locale } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

// Every valid path is prerendered from the price list, so a blocking shell is fine here.
export const instant = false;

export function generateStaticParams() {
  return Object.values(PRODUCTS).map((p) => ({ slug: productSlug(p) }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/item/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getProductBySlug(slug);
  if (!isLocale(lang) || !p) return {};
  const range = getRange(p.ranges[0]);
  const name = tc(lang, p.name);
  return {
    title: `${p.code} ${name}`,
    description: [name, range ? tc(lang, range.name) : "", tc(lang, p.len)].filter(Boolean).join(" | "),
    alternates: alternatesFor(lang, productHref(p)),
  };
}

function toConfig(p: Product, lang: Locale): ConfigProduct {
  const d = getDictionary(lang);
  const count = p.variants?.length || 1;
  const variants = Array.from({ length: count }, (_, i) => {
    const c = resolveItem(p, i);
    return {
      code: c.code,
      label: c.label,
      fin: c.fin,
      sec: sectionKeyFor(c),
      dims: c.dims,
      len: tc(lang, c.len),
      packText: packLabel(lang, d, c),
      w: c.w,
      h: c.h,
      t: c.t,
    };
  });
  // Only ship the section outlines this product needs.
  const sections: Record<string, Section> = {};
  variants.forEach((v) => {
    if (v.sec && SECTIONS[v.sec]) sections[v.sec] = SECTIONS[v.sec];
  });
  const base = resolveItem(p);
  return {
    id: p.id,
    nameEn: p.name,
    name: tc(lang, p.name),
    kind: p.kind,
    unit: p.unit,
    mesh: p.mesh,
    spool: p.spool,
    rubber: p.rubber,
    photo: p.kind === "photo" && p.img ? PHOTOS[p.img] : undefined,
    poster: renderSrc(p),
    note: isStandinSection(base) ? "standin" : hasHandBuiltModel(p.id) ? "model" : base.sec ? "section" : "model",
    variants,
    sections,
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/products/item/[slug]">) {
  const { lang, slug } = await params;
  const p = getProductBySlug(slug);
  if (!isLocale(lang) || !p) notFound();
  const d = getDictionary(lang);
  const range = getRange(p.ranges[0]);
  const suits = p.suits ? PRODUCTS[p.suits] : undefined;
  const related = range ? productsInRange(range).filter((x) => x.id !== p.id).slice(0, 4) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tc(lang, p.name),
    sku: p.code,
    category: range ? tc(lang, range.name) : undefined,
    brand: { "@type": "Brand", name: SITE.name },
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-8 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label={d.catalogue.breadcrumb} className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href={localePath(lang, "/products")} className="hover:text-ink">{d.nav.products}</Link>
        {range && (
          <>
            <CaretRight size={12} className="rtl:-scale-x-100" />
            <Link href={localePath(lang, rangeHref(range))} className="hover:text-ink">{tc(lang, range.name)}</Link>
          </>
        )}
        <CaretRight size={12} className="rtl:-scale-x-100" />
        <span className="text-ink" dir="ltr">{p.code}</span>
      </nav>

      <Suspense fallback={<div className="aspect-[4/3] rounded-md bg-surface-2 lg:w-7/12" />}>
        <ProductConfigurator
          product={toConfig(p, lang)}
          s={{
            ...d.product,
            // Messages land with YT staff, so the pre-filled WhatsApp text is always in English.
            askMessage: getDictionary("en").product.askMessage,
            tag: p.tag === "New" ? d.catalogue.new : p.tag === "Special" ? d.catalogue.special : undefined,
            units: d.units as Record<string, string[]>,
            finishNames: finishNameMap(lang),
            quoteHref: localePath(lang, "/quote"),
          }}
        />
      </Suspense>

      {(p.note || suits) && (
        <div className="mt-8 space-y-1 rounded-md border border-line bg-surface-2 p-4 text-sm leading-relaxed lg:ms-auto lg:w-5/12">
          {p.note && <p>{tc(lang, p.note)}</p>}
          {suits && (() => {
            // Split the sentence around {item} so the link sits where each language needs it.
            const [before, after] = d.product.suits.split("{item}");
            return (
              <p>
                {before}
                <Link href={localePath(lang, productHref(suits))} className="font-medium text-accent hover:underline">
                  <span dir="ltr">{suits.code}</span> {tc(lang, suits.name)}
                </Link>
                {after}
              </p>
            );
          })()}
        </div>
      )}

      {related.length > 0 && range && (
        <section className="mt-20">
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
            <h2 className="text-lg font-semibold">{fmt(d.catalogue.moreFrom, { range: tc(lang, range.name) })}</h2>
            <Link href={localePath(lang, rangeHref(range))} className="shrink-0 text-sm text-muted hover:text-ink">
              {d.catalogue.wholeRange}
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
