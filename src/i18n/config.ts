export const LOCALES = ["en", "zh", "ko", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<Locale, { label: string; htmlLang: string; dir: "ltr" | "rtl"; ogLocale: string }> = {
  en: { label: "English", htmlLang: "en-AU", dir: "ltr", ogLocale: "en_AU" },
  zh: { label: "中文", htmlLang: "zh-Hans", dir: "ltr", ogLocale: "zh_CN" },
  ko: { label: "한국어", htmlLang: "ko", dir: "ltr", ogLocale: "ko_KR" },
  ar: { label: "العربية", htmlLang: "ar", dir: "rtl", ogLocale: "ar_AR" },
};

export const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s);

/** English lives at the bare path (/products); other languages are prefixed (/zh/products). */
export function localePath(lang: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** Strip a language prefix from a browser path, returning the path as English would see it. */
export function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1] ?? "";
  if (isLocale(seg) && seg !== DEFAULT_LOCALE) {
    const rest = pathname.slice(seg.length + 1);
    return rest || "/";
  }
  return pathname;
}
