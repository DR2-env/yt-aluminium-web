import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { SITE, fullAddress, whatsappDisplay, whatsappLink } from "@/lib/site";
import { fmt, getDictionary, isLocale, localePath } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return { title: d.meta.contactTitle, description: d.meta.contactDescription, alternates: alternatesFor(lang, "/contact") };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const c = d.contactPage;
  // Messaging channels. WhatsApp and WeChat show "to be confirmed" until their env vars are set.
  const messages = [
    { label: c.whatsapp, value: whatsappDisplay() ?? c.pending, href: SITE.whatsapp ? whatsappLink("Hi YT Aluminium, ") : null, ltr: Boolean(SITE.whatsapp) },
    { label: c.wechat, value: SITE.wechatId || c.pending, href: null, ltr: Boolean(SITE.wechatId) },
    { label: c.email, value: SITE.email, href: `mailto:${SITE.email}`, ltr: true },
  ];
  const phones = [
    { label: c.office, value: SITE.phone, href: SITE.phoneHref },
    { label: c.mobile, value: SITE.mobile, href: SITE.mobileHref },
  ];

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: SITE.legalName,
    telephone: "+61287392494",
    email: SITE.email,
    url: SITE.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.suburb,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.postcode,
      addressCountry: "AU",
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "16:30" },
    ],
  };

  // Three groups by what the visitor wants to do: get a price, call, or visit. Text labels only,
  // large tap targets, and every number or address is a link that does the obvious thing.
  const group = "border-t border-ink pt-6";
  const label = "text-sm text-muted";
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-12 md:px-8 md:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <h1 className="display text-5xl md:text-7xl">{c.title}</h1>
      <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">{c.intro}</p>

      <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
        <section className={group} aria-labelledby="c-price">
          <h2 id="c-price" className="text-xl font-medium">{c.priceTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{c.priceText}</p>
          <Link href={localePath(lang, "/quote")} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white hover:opacity-90">
            {d.nav.quoteCta}
            <ArrowRight size={16} className="rtl:-scale-x-100" />
          </Link>
          <p className={`${label} mt-8`}>{c.messageLabel}</p>
          <dl className="mt-2 divide-y divide-line border-y border-line">
            {messages.map((m) => (
              <div key={m.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className={label}>{m.label}</dt>
                <dd className="min-w-0 break-words text-end" dir={m.ltr ? "ltr" : undefined}>
                  {m.href ? (
                    <a href={m.href} target={m.href.startsWith("http") ? "_blank" : undefined} rel={m.href.startsWith("http") ? "noopener noreferrer" : undefined} className="underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                      {m.value}
                    </a>
                  ) : (
                    <span className={m.ltr ? "" : "text-muted"}>{m.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={group} aria-labelledby="c-call">
          <h2 id="c-call" className="text-xl font-medium">{c.callTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{d.site.hours}</p>
          <ul className="mt-6 space-y-5">
            {phones.map((ph) => (
              <li key={ph.label}>
                <p className={label}>{ph.label}</p>
                <a href={ph.href} dir="ltr" className="mt-1 inline-block text-3xl tracking-tight hover:text-accent">
                  {ph.value}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={group} aria-labelledby="c-visit">
          <h2 id="c-visit" className="text-xl font-medium">{c.visitTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{d.site.hours}</p>
          <address className="mt-6 text-xl not-italic leading-snug" dir="ltr">
            {SITE.address.street}
            <br />
            {SITE.address.suburb} {SITE.address.state} {SITE.address.postcode}
          </address>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-[15px] font-medium hover:border-ink">
            {c.directions}
            <ArrowRight size={16} className="rtl:-scale-x-100" />
          </a>
        </section>
      </div>

      <div className="mt-16 overflow-hidden rounded-lg border border-line">
        <iframe title={fmt(c.map, { address: fullAddress })} src={SITE.mapsEmbed} className="block h-[360px] w-full md:h-[440px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </div>
  );
}
