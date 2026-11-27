import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QUOTE_ENABLED } from "@/lib/features";
import { QuoteBuilderClient } from "@/components/quote/QuoteBuilderClient";
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
  // Hidden on the live site until online quotes are switched on (lib/features.ts).
  if (!isLocale(lang) || !QUOTE_ENABLED) notFound();
  const d = getDictionary(lang);
  // Product names in the page language, for display only. The email to YT stays in English.
  const localNames = Object.fromEntries(
    Object.values(PRODUCTS).flatMap((p) => {
      const n = p.variants?.length || 1;
      return Array.from({ length: n }, (_, i) => [resolveItem(p, i).code, tc(lang, p.name)] as const);
    }),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-10 md:px-8 md:pt-12">
      <h1 className="text-3xl font-semibold md:text-4xl">{d.quote.title}</h1>
      <p className="mt-3 max-w-[62ch] text-muted">{d.quote.intro}</p>
      <div className="mt-8">
        <QuoteBuilderClient lang={lang} q={d.quote} units={d.units as Record<string, string[]>} finishNames={finishNameMap(lang)} localNames={localNames} productsHref={localePath(lang, "/products")} privacyHref={localePath(lang, "/privacy")} />
      </div>
    </div>
  );
}
