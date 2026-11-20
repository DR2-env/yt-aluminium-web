import type { MetadataRoute } from "next";
import { PRODUCTS, RANGES, productHref, rangeHref } from "@/lib/catalogue";
import { SITE } from "@/lib/site";
import { LOCALES, LOCALE_META, localePath } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/products", "/finishes", "/about", "/contact", "/quote", "/faq", "/privacy", ...RANGES.map(rangeHref), ...Object.values(PRODUCTS).map(productHref)];
  return paths.flatMap((path) =>
    LOCALES.map((lang) => ({
      url: `${SITE.url}${localePath(lang, path)}`,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].htmlLang, `${SITE.url}${localePath(l, path)}`])),
      },
    })),
  );
}
