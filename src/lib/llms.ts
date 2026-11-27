// Plain-text (markdown) summaries of the site for AI assistants and agents, served at
// /llms.txt (overview) and /llms-full.txt (every product code). Built from the same data as the pages.
import { CODE_COUNT, PRODUCTS, RANGES, productHref, productsInRange, rangeHref, resolveItem, type Product } from "./catalogue";
import { COLOUR_CODES, finishOf } from "./finishes";
import { SITE, fullAddress } from "./site";
import { QUOTE_ENABLED } from "./features";

const abs = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;

function header(): string {
  return `# ${SITE.name}

> ${SITE.legalName} (ABN ${SITE.abn}) supplies aluminium extrusions, door and window profiles, flyscreen and security mesh, hardware and locks to trade customers and the public from a trade counter in Milperra, Sydney, Australia. Pick up or delivery across Sydney.

## Key facts

- Trade counter: ${fullAddress}, Australia
- Opening hours: ${SITE.hours} (Sydney time)
- Phone: ${SITE.phone} (international +61 2 8739 2494)
- Mobile: ${SITE.mobile}
- Email: ${SITE.email}
- Catalogue: ${CODE_COUNT} product codes from the price list dated ${SITE.priceListDate}
- Prices are not published online. See "How to get a price" below.
- Website languages: English, Simplified Chinese (/zh), Korean (/ko), Arabic (/ar)

## How to get a price

${QUOTE_ENABLED ? `- Quote request form: ${abs("/quote")}. Fields: product list (free text, product codes preferred), optional photo or PDF of the list, name, phone, company (optional), delivery suburb or pick-up, notes. Staff reply by phone or email, usually the same business day.
- Or call ${SITE.phone} during opening hours, or email ${SITE.email}.` : `- Call ${SITE.phone} during opening hours, email ${SITE.email} with a list of product codes and quantities, or visit the trade counter. Staff usually reply with prices the same business day.`}
- Nothing is ordered until the price is agreed with the customer.
`;
}

export function llmsTxt(): string {
  const pages = [
    ["Products", "/products", "The full range by product code"],
    ["Finishes", "/finishes", "Powder coat, anodised, mill and timber look colours"],
    ["About", "/about", "Who YT Aluminium is and who it supplies"],
    ["Contact", "/contact", "Address, hours, phone, email and map"],
    ...(QUOTE_ENABLED ? [["Quote request", "/quote", "Send a list for pricing"]] : []),
    ["FAQ", "/faq", "Ordering, delivery and product questions"],
    ["Privacy policy", "/privacy", ""],
    ["Cookie policy", "/cookies", ""],
  ];
  return `${header()}
## Pages

${pages.map(([t, p, d]) => `- [${t}](${abs(p)})${d ? `: ${d}` : ""}`).join("\n")}

## Product ranges

${RANGES.map((r) => `- [${r.name}](${abs(rangeHref(r))}): ${r.blurb}`).join("\n")}

## Optional

- [Full catalogue as text](${abs("/llms-full.txt")}): every product code with lengths, pack sizes and available finishes
- [Sitemap](${abs("/sitemap.xml")})
`;
}

function productLine(p: Product): string {
  const base = resolveItem(p);
  const parts: string[] = [];
  if (p.variants?.length) parts.push(`sizes: ${p.variants.map((v) => `${v.code} (${v.label})`).join(", ")}`);
  if (base.dims) parts.push(`section ${base.dims[0]} x ${base.dims[1]} mm`);
  if (p.len && !/accessory/i.test(p.len)) parts.push(`length ${p.len}`);
  if (p.pack > 1) parts.push(`sold in packs of ${p.pack}`);
  const fins = p.fin.filter((f) => f !== "NA");
  if (fins.length) parts.push(`finishes: ${fins.map((f) => `${finishOf(f).name} (${f})`).join(", ")}`);
  if (p.tag) parts.push(p.tag.toLowerCase());
  return `- [${p.code} ${p.name}](${abs(productHref(p))})${parts.length ? `: ${parts.join("; ")}` : ""}`;
}

export function llmsFullTxt(): string {
  const listed = new Set<string>();
  const sections = RANGES.map((r) => {
    const items = productsInRange(r).filter((p) => !listed.has(p.id));
    items.forEach((p) => listed.add(p.id));
    return `### ${r.name}\n\n${r.blurb}\n\n${items.map(productLine).join("\n")}`;
  });
  const rest = Object.values(PRODUCTS).filter((p) => !listed.has(p.id));
  if (rest.length) sections.push(`### Other products\n\n${rest.map(productLine).join("\n")}`);
  return `${header()}
## Finishes

Colour codes used in the catalogue. Colours on screen are a guide only; ask for a sample.

${COLOUR_CODES.map((c) => `- ${c}: ${finishOf(c).name}`).join("\n")}

## Catalogue

${sections.join("\n\n")}
`;
}
