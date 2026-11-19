import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, EnvelopeSimple, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { SITE, fullAddress, whatsappLink } from "@/lib/site";
import { fmt, getDictionary, isLocale } from "@/i18n";
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
  const channels = [
    { icon: Phone, label: c.office, value: SITE.phone, href: SITE.phoneHref, ltr: true },
    { icon: WhatsappLogo, label: c.mobile, value: SITE.mobile, href: whatsappLink("Hi YT Aluminium, "), ltr: true },
    { icon: EnvelopeSimple, label: c.email, value: SITE.email, href: `mailto:${SITE.email}`, ltr: true },
    { icon: MapPin, label: c.address, value: fullAddress, href: SITE.mapsUrl, ltr: true },
    { icon: Clock, label: c.hours, value: d.site.hours, href: null, ltr: false },
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

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-10 md:px-8 md:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <h1 className="text-3xl font-semibold md:text-4xl">{c.title}</h1>
      <p className="mt-3 max-w-[62ch] text-muted">{fmt(c.intro, { hours: d.site.hours })}</p>
      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <ul className="divide-y divide-line self-start rounded-md border border-line lg:col-span-5">
          {channels.map((ch) => {
            const body = (
              <>
                <ch.icon size={20} className="mt-0.5 shrink-0 text-accent" />
                <span className="min-w-0">
                  <span className="block text-sm text-muted">{ch.label}</span>
                  <span className="block truncate font-medium" dir={ch.ltr ? "ltr" : undefined}>
                    {ch.value}
                  </span>
                </span>
              </>
            );
            return (
              <li key={ch.label}>
                {ch.href ? (
                  <a
                    href={ch.href}
                    target={ch.href.startsWith("http") ? "_blank" : undefined}
                    rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex gap-4 p-4 hover:bg-surface-2"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="flex gap-4 p-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="min-h-[380px] overflow-hidden rounded-md border border-line lg:col-span-7">
          <iframe title={fmt(c.map, { address: fullAddress })} src={SITE.mapsEmbed} className="h-full min-h-[380px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}
