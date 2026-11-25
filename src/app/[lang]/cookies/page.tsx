import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { getDictionary, isLocale, localePath } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/cookies">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: getDictionary(lang).cookiesPage.title,
    description: "YT Aluminium does not use advertising or tracking cookies. This page lists what the website saves in your browser and why.",
    alternates: alternatesFor(lang, "/cookies"),
  };
}

// Mirrors what the code actually stores: keys in quote-store.ts, quote-draft.ts and
// LanguageSuggest.tsx, and the click-to-load map on the contact page. Keep them in sync.
const UPDATED = "25 November 2026";

export default async function CookiesPage({ params }: PageProps<"/[lang]/cookies">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);

  const sections: LegalSection[] = [
    [
      "In short",
      [
        "This website does not use advertising cookies, analytics or tracking of any kind, and it does not set cookies of its own. That is why there is no cookie banner.",
        "It saves a few things in your own browser so the site works the way you expect. We cannot see them.",
      ],
    ],
    [
      "What is saved in your browser",
      [
        "Your quote list (yt-quote-v3): the products you add, so the list is still there when you come back. It stays until you remove the items or clear your browser data.",
        "Language banner choice (yt-lang-suggest-dismissed): remembers that you closed the language suggestion or picked a language, so it does not show again.",
        "Quote hand-off (yt-quote-draft): carries what you type or photograph in the box on the home page to the quote page. It is deleted as soon as the quote page reads it, and when you close the tab.",
      ],
    ],
    [
      "Other services",
      [
        "The map on the contact page comes from Google Maps. It only loads when you press Show map, and Google may then set its own cookies under its own privacy policy.",
        "WhatsApp, WeChat and email links open those apps. What you send there is handled under their own policies.",
        "Our hosting provider, Vercel, keeps standard technical logs (such as IP address and browser type) to run and protect the website. It does not use them to track you across other websites.",
      ],
    ],
    [
      "Your choices",
      [
        "You can clear everything this website has saved at any time in your browser settings, or remove items from your quote list on the quote page. The website still works if your browser blocks storage; your quote list just will not be remembered between visits.",
        <>
          For how we handle the details you send us, see our <Link href={localePath(lang, "/privacy")}>privacy policy</Link>.
        </>,
      ],
    ],
  ];

  return <LegalPage title={d.cookiesPage.title} englishNote={d.cookiesPage.englishNote} updated={UPDATED} sections={sections} />;
}
