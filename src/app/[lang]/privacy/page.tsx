import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { SITE, fullAddress } from "@/lib/site";
import { getDictionary, isLocale, localePath } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: getDictionary(lang).privacyPage.title,
    description: "How YT Aluminium collects, uses, stores and protects personal information, in line with the Australian Privacy Principles.",
    alternates: alternatesFor(lang, "/privacy"),
  };
}

// Written from how the site actually handles data and structured around the Australian Privacy
// Principles (APP 1 policy contents, APP 5 notice, APP 8 overseas disclosure, APP 12-13 access).
// Update it whenever the site starts collecting data another way (analytics, newsletters, accounts).
const UPDATED = "25 November 2026";

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const contact = `${SITE.mobile}, ${SITE.phone} or ${SITE.email}`;

  const sections: LegalSection[] = [
    [
      "Who we are",
      [
        `This policy covers ${SITE.legalName} (ABN ${SITE.abn}), trading as ${SITE.name}, ${fullAddress}. In this policy "we" and "us" mean YT Aluminium. We handle personal information in line with the Australian Privacy Principles in the Privacy Act 1988 (Cth).`,
      ],
    ],
    [
      "What we collect",
      [
        "When you send a quote request on this website: your name, phone number, company (optional), delivery suburb or pick-up choice, notes, your product list, and any photo or file of your list that you attach.",
        "When you call, email, WhatsApp or WeChat us: the details you give us, such as your name, phone number, address and what you want to order.",
        "When you buy from us: the details needed to supply, deliver and invoice the order.",
        "We do not ask for sensitive information such as health, racial or religious information. Please do not include it in a request. You can ask us about products and prices without giving your name.",
      ],
    ],
    [
      "How we use it",
      [
        "To reply with prices, answer your questions, supply and deliver your order or arrange pick-up, and keep the business and tax records the law requires.",
        "We do not use your details for marketing, we do not send newsletters, and we do not sell or rent your details to anyone.",
        "If you do not give us a contact number or email, we may not be able to reply to your request.",
      ],
    ],
    [
      "Who we share it with",
      [
        "Only the people and services we need to do the job: our staff, the courier or driver delivering your order, and our accountant.",
        "The service providers that run our website and email: Vercel Inc. hosts this website, Resend delivers quote requests sent from the website to our inbox, and Google (Gmail) runs our email. These providers are based in the United States and may store information outside Australia. We use them only to run the website and email.",
        "We may also disclose information when the law requires it.",
      ],
    ],
    [
      "Stored on your device",
      [
        <>
          Your quote list and a few website settings are saved in your own browser, not on our systems. See our <Link href={localePath(lang, "/cookies")}>cookie policy</Link>.
        </>,
      ],
    ],
    [
      "How we keep it safe",
      [
        "The website uses HTTPS encryption. The website itself does not keep a copy of quote requests: they are delivered to our email inbox, which only our staff can access. Paper records are kept at our premises.",
        "We keep details for as long as we need them to deal with your enquiry or order, and for as long as tax and business records must be kept (generally five years). After that we delete or destroy them.",
        "If a data breach is likely to cause you serious harm, we will tell you and, where required, the Office of the Australian Information Commissioner.",
      ],
    ],
    [
      "Seeing or correcting your details",
      [`You can ask to see the personal information we hold about you, or ask us to correct or delete it, by contacting us on ${contact}. We will reply within 30 days. There is no charge.`],
    ],
    [
      "Questions and complaints",
      [
        `Contact us on ${contact} or at ${fullAddress}. We will reply within 30 days.`,
        <>
          If you are not satisfied with our reply, you can complain to the Office of the Australian Information Commissioner at{" "}
          <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
            oaic.gov.au
          </a>{" "}
          or on 1300 363 992.
        </>,
      ],
    ],
    ["Changes to this policy", ["We will update this page if the way we handle information changes. The date at the top shows when it last changed."]],
  ];

  return <LegalPage title={d.privacyPage.title} englishNote={d.privacyPage.englishNote} updated={UPDATED} sections={sections} />;
}
