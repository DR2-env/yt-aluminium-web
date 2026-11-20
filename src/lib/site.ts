// Business details shown across the site. Edit here, not in components.
export const SITE = {
  name: "YT Aluminium",
  legalName: "YT Aluminium Australia Pty Ltd",
  abn: "60 166 410 037",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ytaluminium.com",
  phone: "02 8739 2494",
  phoneHref: "tel:+61287392494",
  mobile: "0451 569 228",
  mobileHref: "tel:+61451569228",
  // PLACEHOLDERS: set NEXT_PUBLIC_WHATSAPP_NUMBER (international format, digits only,
  // e.g. 61451569228) and NEXT_PUBLIC_WECHAT_ID in Vercel once confirmed. Until then the
  // site shows "to be confirmed", and WhatsApp buttons open WhatsApp without a recipient.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  wechatId: process.env.NEXT_PUBLIC_WECHAT_ID ?? "",
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
  // Christmas closure, as ISO dates (e.g. "2026-12-24"). Leave empty to hide the notice.
  // When set, a notice shows at the top of every page.
  closure: { from: "", to: "" },
} as const;

export const fullAddress = `${SITE.address.street}, ${SITE.address.suburb} ${SITE.address.state} ${SITE.address.postcode}`;

export const whatsappLink = (text: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

/** WhatsApp number formatted for display (61451569228 -> +61 451 569 228), or null if not set. */
export const whatsappDisplay = (): string | null => {
  const n = SITE.whatsapp.replace(/\D/g, "");
  if (!n) return null;
  return n.startsWith("61") && n.length === 11 ? `+61 ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}` : `+${n}`;
};

export const mailtoLink = (subject: string, body: string) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
