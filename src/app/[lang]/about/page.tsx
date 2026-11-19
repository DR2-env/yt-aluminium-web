import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { ProductVisual } from "@/components/catalogue/ProductVisual";
import { CODE_COUNT, PRODUCTS, RANGES, resolveItem } from "@/lib/catalogue";
import { COLOUR_CODES } from "@/lib/finishes";
import { getDictionary, isLocale, localePath, tc } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return { title: d.meta.aboutTitle, description: d.meta.aboutDescription, alternates: alternatesFor(lang, "/about") };
}

// A few representative products from different ranges, shown as renders.
const SHOWCASE = ["AU001", "AU014", "KL01", "AU601"];

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const facts: [string, string][] = [
    [String(RANGES.length), d.aboutPage.facts.ranges],
    [String(CODE_COUNT), d.aboutPage.facts.codes],
    [String(COLOUR_CODES.length), d.aboutPage.facts.finishes],
    ["20+", d.aboutPage.facts.years],
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-10 md:px-8 md:pt-12">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h1 className="text-3xl font-semibold md:text-4xl">{d.aboutPage.title}</h1>
          <div className="mt-6 max-w-[62ch] space-y-4 leading-relaxed text-muted">
            {d.aboutPage.paragraphs.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={localePath(lang, "/products")}>{d.home.viewProducts}</LinkButton>
            <LinkButton href={localePath(lang, "/contact")} variant="secondary">
              {d.nav.contact}
            </LinkButton>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 self-start lg:col-span-6">
          {SHOWCASE.map((id) => PRODUCTS[id]).filter(Boolean).map((p) => (
            <div key={p.id} className="aspect-[4/3] rounded-md border border-line bg-surface-2 p-3">
              <ProductVisual item={{ ...resolveItem(p), name: tc(lang, p.name) }} sizes="(min-width: 1024px) 24vw, 45vw" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-4">
        {facts.map(([n, l]) => (
          <div key={l} className="bg-surface p-5">
            <p className="text-3xl font-semibold">{n}</p>
            <p className="mt-1 text-sm text-muted">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
