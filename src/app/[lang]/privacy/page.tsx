import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE, fullAddress } from "@/lib/site";
import { getDictionary, isLocale } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).privacyPage.title, alternates: alternatesFor(lang, "/privacy") };
}

// Plain-language policy written from how this site actually handles data: no server-side
// storage, quote lists kept in the visitor's browser, messages sent from the visitor's own
// WhatsApp, email or WeChat. Update it if the site starts collecting data any other way.
const UPDATED = "20 November 2026";

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);

  const sections: [string, string[]][] = [
    ["Who we are", [`${SITE.legalName} (ABN ${SITE.abn}), ${fullAddress}. Contact us on ${SITE.phone} or ${SITE.email}.`]],
    [
      "What we collect",
      [
        "When you send a quote request, you choose to send us your product list and the details you enter, such as your name, company, phone number, delivery suburb and notes.",
        "These are sent from your own WhatsApp, email or WeChat. This website does not store them on a server.",
        "If you contact us by phone, email or message, we keep the details you give us so we can reply and handle your order.",
      ],
    ],
    [
      "Stored on your device",
      [
        "Your quote list and your language choice are saved in your own browser so they are still there when you come back. You can clear them at any time with the Clear list button or your browser settings. We cannot see them.",
      ],
    ],
    [
      "Other services",
      [
        "The website is hosted by Vercel, which keeps standard technical logs such as IP address and browser type.",
        "The map on the contact page is provided by Google Maps, which has its own privacy policy.",
      ],
    ],
    ["How we use your details", ["To reply with prices, arrange your order, pickup or delivery, and contact you about it. We do not sell your details."]],
    [
      "Access and complaints",
      [
        `You can ask to see or correct the details we hold about you by contacting us on ${SITE.phone} or ${SITE.email}.`,
        "If you are not happy with how we handle a privacy concern, you can contact the Office of the Australian Information Commissioner at oaic.gov.au.",
      ],
    ],
  ];

  return (
    <div className="mx-auto max-w-[860px] px-4 pb-20 pt-12 md:px-8 md:pt-16">
      <h1 className="display text-5xl md:text-6xl">{d.privacyPage.title}</h1>
      {d.privacyPage.englishNote && <p className="mt-4 text-muted">{d.privacyPage.englishNote}</p>}
      <article lang="en" dir="ltr" className="mt-10 space-y-10">
        <p className="eyebrow text-muted">Last updated {UPDATED}</p>
        {sections.map(([title, paras]) => (
          <section key={title}>
            <h2 className="text-2xl font-light">{title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted">
              {paras.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
