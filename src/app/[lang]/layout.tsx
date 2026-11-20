import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, IBM_Plex_Sans, Noto_Sans_Arabic, Noto_Sans_KR, Noto_Sans_SC } from "next/font/google";
import "../globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { LanguageSuggest } from "@/components/layout/LanguageSuggest";
import type { LayoutStrings } from "@/components/layout/types";
import { LOCALES, LOCALE_META, getDictionary, isLocale, localePath, type Locale } from "@/i18n";
import { alternatesFor } from "@/i18n/metadata";
import { SITE } from "@/lib/site";

const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });
// Script fonts are only applied (and so only downloaded) on their own language.
const notoSC = Noto_Sans_SC({ variable: "--font-locale", weight: ["400", "500", "600", "700"], preload: false });
const notoKR = Noto_Sans_KR({ variable: "--font-locale", weight: ["400", "500", "600", "700"], preload: false });
const notoAR = Noto_Sans_Arabic({ variable: "--font-locale", subsets: ["arabic"], weight: ["400", "500", "600", "700"], preload: false });
const LOCALE_FONT: Partial<Record<Locale, string>> = { zh: notoSC.variable, ko: notoKR.variable, ar: notoAR.variable };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDictionary(lang);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: d.meta.title, template: "%s | YT Aluminium" },
    description: d.meta.description,
    alternates: alternatesFor(lang, "/"),
    openGraph: { type: "website", siteName: SITE.name, locale: LOCALE_META[lang].ogLocale },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1114" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const p = (path: string) => localePath(lang, path);
  const strings: LayoutStrings = {
    lang,
    home: p("/"),
    nav: [
      { href: p("/products"), label: d.nav.products, match: "/products" },
      { href: p("/finishes"), label: d.nav.finishes, match: "/finishes" },
      { href: p("/about"), label: d.nav.about, match: "/about" },
      { href: p("/contact"), label: d.nav.contact, match: "/contact" },
    ],
    quote: { href: p("/quote"), label: d.nav.quote },
    menu: { open: d.nav.openMenu, close: d.nav.closeMenu, language: d.nav.language },
    call: d.nav.call,
    whatsapp: d.nav.whatsapp,
    hours: d.site.hours,
    address: `${SITE.address.street}, ${SITE.address.suburb}`,
  };

  return (
    <html lang={LOCALE_META[lang].htmlLang} dir={LOCALE_META[lang].dir} className={`${plexSans.variable} ${plexMono.variable} ${LOCALE_FONT[lang] ?? ""}`}>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-4 focus:py-2">
          {d.nav.skip}
        </a>
        <LanguageSuggest lang={lang} texts={Object.fromEntries(LOCALES.map((l) => [l, getDictionary(l).suggest.text])) as Record<Locale, string>} />
        <SiteHeader s={strings} />
        <main id="main">{children}</main>
        <SiteFooter lang={lang} />
        <MobileActionBar s={strings} />
      </body>
    </html>
  );
}
