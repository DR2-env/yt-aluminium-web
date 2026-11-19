import type { Metadata } from "next";
import { LOCALES, LOCALE_META, localePath, type Locale } from "./config";

/** Canonical URL and hreflang alternates for a page path (as English sees it, e.g. "/products"). */
export function alternatesFor(lang: Locale, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  LOCALES.forEach((l) => (languages[LOCALE_META[l].htmlLang] = localePath(l, path)));
  languages["x-default"] = localePath("en", path);
  return { canonical: localePath(lang, path), languages };
}
