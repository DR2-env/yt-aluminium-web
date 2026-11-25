import { llmsFullTxt } from "@/lib/llms";

// Prerendered at build time: the content only depends on the catalogue data.
export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
