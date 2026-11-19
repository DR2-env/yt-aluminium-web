import type { Metadata } from "next";
import { EnvelopeSimple, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { SITE, fullAddress, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Visit the YT Aluminium trade counter at ${fullAddress}, call ${SITE.phone} or message us on WhatsApp.`,
};

export default function ContactPage() {
  const channels = [
    { icon: Phone, label: "Office", value: SITE.phone, href: SITE.phoneHref, mono: true },
    { icon: WhatsappLogo, label: "Mobile and WhatsApp", value: SITE.mobile, href: whatsappLink("Hi YT Aluminium, "), mono: true },
    { icon: EnvelopeSimple, label: "Email", value: SITE.email, href: `mailto:${SITE.email}`, mono: false },
    { icon: MapPin, label: "Trade counter", value: fullAddress, href: SITE.mapsUrl, mono: false },
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
    <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-10 md:px-8 md:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <h1 className="text-4xl font-semibold tracking-tighter md:text-6xl">Contact</h1>
      <p className="mt-4 max-w-[56ch] text-muted">
        Open {SITE.hours}. For pricing, the fastest way is to send us your list from the quote page.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <ul className="grid gap-3 lg:col-span-5">
          {channels.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <c.icon size={22} weight="bold" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-muted">{c.label}</span>
                  <span className={`block truncate font-semibold ${c.mono ? "font-mono" : ""}`}>{c.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="min-h-[380px] overflow-hidden rounded-2xl border border-line lg:col-span-7">
          <iframe
            title={`Map showing ${fullAddress}`}
            src={SITE.mapsEmbed}
            className="h-full min-h-[380px] w-full grayscale-[40%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
