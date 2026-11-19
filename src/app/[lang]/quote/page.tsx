import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuoteBuilder, type CodeEntry } from "@/components/quote/QuoteBuilder";
import { PRODUCTS, resolveItem } from "@/lib/catalogue";
import { finishNameMap, getDictionary, isLocale, localePath, tc } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/quote">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return { title: d.meta.quoteTitle, description: d.meta.quoteDescription, alternates: alternatesFor(lang, "/quote") };
}

export default async function QuotePage({ params }: PageProps<"/[lang]/quote">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const codes: CodeEntry[] = Object.values(PRODUCTS).flatMap((p) => {
    const n = p.variants?.length || 1;
    return Array.from({ length: n }, (_, i) => {
      const c = resolveItem(p, i);
      return { code: c.code, pid: p.id, name: p.name, localName: tc(lang, p.name), label: c.label, fin: c.fin, unit: p.unit, multi: n > 1 };
    });
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-10 md:px-8 md:pt-12">
      <h1 className="text-3xl font-semibold md:text-4xl">{d.quote.title}</h1>
      <p className="mt-3 max-w-[62ch] text-muted">{d.quote.intro}</p>
      <div className="mt-8">
        <QuoteBuilder codes={codes} q={{ ...d.quote, photoMessage: getDictionary("en").quote.photoMessage }} units={d.units as Record<string, string[]>} finishNames={finishNameMap(lang)} productsHref={localePath(lang, "/products")} wechatPending={d.contactPage.pending} />
      </div>
    </div>
  );
}
