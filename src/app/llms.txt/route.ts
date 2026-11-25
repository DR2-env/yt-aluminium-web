import { llmsTxt } from "@/lib/llms";

// Prerendered at build time: the content only depends on the catalogue data.
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
