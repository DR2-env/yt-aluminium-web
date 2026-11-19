import type { MetadataRoute } from "next";
import { PRODUCTS, RANGES, productHref, rangeHref } from "@/lib/catalogue";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/products", "/finishes", "/about", "/contact", "/quote", ...RANGES.map(rangeHref), ...Object.values(PRODUCTS).map(productHref)];
  return paths.map((p) => ({ url: `${SITE.url}${p}` }));
}
