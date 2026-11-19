import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/catalogue";
import { COLOUR_CODES, finishOf, swatchBackground } from "@/lib/finishes";
import { finishName, finishType, fmt, getDictionary, isLocale } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/finishes">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return { title: d.meta.finishesTitle, description: d.meta.finishesDescription, alternates: alternatesFor(lang, "/finishes") };
}

export default async function FinishesPage({ params }: PageProps<"/[lang]/finishes">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const products = Object.values(PRODUCTS);
  const count = (code: string) => products.filter((p) => p.fin.includes(code) || p.variants?.some((v) => v.fin?.includes(code))).length;
  const groups = [
    { title: d.finishesPage.groups.anodised, codes: COLOUR_CODES.filter((c) => ["Mill finish", "Anodised"].includes(finishOf(c).type)) },
    { title: d.finishesPage.groups.powder, codes: COLOUR_CODES.filter((c) => finishOf(c).type.includes("owder coat")) },
    { title: d.finishesPage.groups.timber, codes: COLOUR_CODES.filter((c) => finishOf(c).type === "Timber finish") },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-10 md:px-8 md:pt-12">
      <h1 className="text-3xl font-semibold md:text-4xl">{d.finishesPage.title}</h1>
      <p className="mt-3 max-w-[70ch] leading-relaxed text-muted">{d.finishesPage.intro}</p>
      {groups.map((g) => (
        <section key={g.title} className="mt-12">
          <h2 className="border-b border-line pb-2 text-lg font-semibold">{g.title}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {g.codes.map((code) => (
              <div key={code} className="overflow-hidden rounded-md border border-line">
                <div className="aspect-[4/3]" style={{ background: swatchBackground(code) }} />
                <div className="border-t border-line p-3">
                  <p className="text-sm font-medium">{finishName(lang, code)}</p>
                  <p className="text-xs text-muted">{finishType(lang, code)}</p>
                  <p className="mt-2 flex justify-between text-xs text-muted">
                    <span className="font-mono" dir="ltr">{code}</span>
                    <span>{fmt(d.finishesPage.products, { n: count(code) })}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
