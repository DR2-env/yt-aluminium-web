import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqList, type FaqCategory } from "@/components/faq/FaqList";
import { SITE, fullAddress } from "@/lib/site";
import { fmt, getDictionary, isLocale } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return { title: d.faqPage.title, description: d.faqPage.items.map((i) => i.q).join(" "), alternates: alternatesFor(lang, "/faq") };
}

// Category of each FAQ item, by position in the dictionary list (same order in every language).
const CATEGORIES: FaqCategory[] = ["order", "order", "order", "delivery", "delivery", "products", "products", "products"];

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const vars = { address: fullAddress, hours: d.site.hours, phone: SITE.phone };
  const items = d.faqPage.items.map((i, n) => ({ q: i.q, a: fmt(i.a, vars), cat: CATEGORIES[n] ?? "order" }));
  const [introBefore, introAfter = ""] = d.faqPage.intro.split("{phone}");
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-12 md:px-8 md:pt-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <h1 className="display text-5xl md:text-7xl">{d.faqPage.title}</h1>
        <p className="mt-5 text-lg text-muted">
          {introBefore}
          <a href={SITE.phoneHref} className="text-ink hover:text-accent" dir="ltr">
            {SITE.phone}
          </a>
          {introAfter}
        </p>
        <FaqList items={items} filters={d.faqPage.filters} />
      </div>
    </>
  );
}
