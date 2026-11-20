import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE, fullAddress } from "@/lib/site";
import { fmt, getDictionary, isLocale } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return { title: d.faqPage.title, description: d.faqPage.items.map((i) => i.q).join(" "), alternates: alternatesFor(lang, "/faq") };
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const vars = { address: fullAddress, hours: d.site.hours, phone: SITE.phone };
  const items = d.faqPage.items.map((i) => ({ q: i.q, a: fmt(i.a, vars) }));
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
        <dl className="mt-12 border-t border-line">
          {items.map((item, i) => (
            <div key={item.q} className="grid gap-3 border-b border-line py-7 md:grid-cols-12 md:gap-8">
              <dt className="flex gap-4 md:col-span-5">
                <span className="eyebrow pt-1.5 text-muted" dir="ltr">[{String(i + 1).padStart(2, "0")}]</span>
                <span className="text-xl font-light leading-snug">{item.q}</span>
              </dt>
              <dd className="leading-relaxed text-muted md:col-span-7">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
