// Structured data (schema.org JSON-LD) shared across pages. Search engines and AI assistants
// read this to understand who YT is, where the trade counter is and when it is open.
import { SITE } from "./site";

export const BUSINESS_ID = `${SITE.url}/#business`;

export function businessJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "HomeAndConstructionBusiness"],
    "@id": BUSINESS_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    taxID: `ABN ${SITE.abn}`,
    description,
    url: SITE.url,
    logo: `${SITE.url}/icon.png`,
    image: `${SITE.url}/og.png`,
    telephone: "+61287392494",
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.suburb,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.postcode,
      addressCountry: "AU",
    },
    hasMap: SITE.mapsUrl,
    areaServed: { "@type": "City", name: "Sydney" },
    knowsLanguage: ["en", "zh", "ko", "ar"],
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "16:30" },
    ],
    contactPoint: [
      { "@type": "ContactPoint", contactType: "sales", telephone: "+61287392494", email: SITE.email, areaServed: "AU", availableLanguage: ["English", "Chinese", "Korean", "Arabic"] },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

/** Escape "<" so catalogue text can never close the surrounding <script> tag. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
