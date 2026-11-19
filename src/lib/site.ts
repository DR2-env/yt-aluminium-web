// Business details shown across the site. Edit here, not in components.
export const SITE = {
  name: "YT Aluminium",
  legalName: "YT Aluminium Australia Pty Ltd",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ytaluminium.com",
  phone: "02 8739 2494",
  phoneHref: "tel:+61287392494",
  mobile: "0451 569 228",
  mobileHref: "tel:+61451569228",
  whatsapp: "61451569228",
  email: "ytaluminium@gmail.com",
  address: {
    street: "3 Marigold Place",
    suburb: "Milperra",
    state: "NSW",
    postcode: "2214",
  },
  hours: "Monday to Friday, 8:30am to 4:30pm",
  hoursShort: "Mon to Fri, 8:30am to 4:30pm",
  mapsUrl: "https://maps.google.com/?q=3+Marigold+Place+Milperra+NSW+2214",
  mapsEmbed: "https://maps.google.com/maps?q=3%20Marigold%20Place%2C%20Milperra%20NSW%202214&z=15&output=embed",
  priceListDate: "16 February 2026",
} as const;

export const fullAddress = `${SITE.address.street}, ${SITE.address.suburb} ${SITE.address.state} ${SITE.address.postcode}`;

export const whatsappLink = (text: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export const mailtoLink = (subject: string, body: string) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
