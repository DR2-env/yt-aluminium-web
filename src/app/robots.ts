import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Open to every search engine and AI crawler. The named AI crawlers are listed explicitly so
// it is clear the business wants to be found and cited by AI assistants, not only search.
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
