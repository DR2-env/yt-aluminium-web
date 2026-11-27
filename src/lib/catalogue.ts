import raw from "@/data/catalogue.json";
import { HAND_BUILT_MODELS, SECTION_STANDINS } from "./models-index";
import tones from "@/data/render-tones.json";

export type Kind = "profile" | "cap" | "flat" | "photo" | "none" | "spool" | "packer" | "roll" | "sheet";
export type Point = [number, number];

export interface Section {
  w: number;
  h: number;
  depth?: number;
  shapes: { outer: Point[]; holes: Point[][] }[];
}

export interface Variant {
  code: string;
  label: string;
  t?: number;
  len?: string;
  w?: number;
  h?: number;
  sec?: string;
  fin?: string[];
  pack?: number;
  dims?: [number, number];
}

export interface Product {
  id: string;
  code: string;
  name: string;
  kind: Kind;
  grp?: string;
  pack: number;
  len: string;
  unit: string;
  fin: string[];
  sec?: string;
  dims?: [number, number];
  ranges: string[];
  note?: string;
  suits?: string;
  rubber?: boolean;
  img?: string;
  tag?: "New" | "Special";
  packtext?: string;
  spool?: string;
  variants?: Variant[];
  mesh?: string;
  w?: number;
  h?: number;
  t?: number;
}

export interface Range {
  id: string;
  name: string;
  blurb: string;
  items: string[];
}

/** A product with one size variant merged in. This is what the viewer and quote list work with. */
export interface Item extends Omit<Product, "variants"> {
  label?: string;
  variantIndex: number;
  variantCount: number;
}

interface CatalogueData {
  ranges: Range[];
  products: Record<string, Product>;
  sections: Record<string, Section>;
  photos: Record<string, string>;
}

const data = raw as unknown as CatalogueData;

export const RANGES = data.ranges;
export const PRODUCTS = data.products;
// Rectangular channel with a slot underneath, used to draw the curtain rod (AU055), which has no
// sketch in the price list. Shape taken from the price list photo; dimensions are indicative.
function slottedChannel(w: number, h: number, wall: number, slot: number): Section {
  const x = w / 2, y = h / 2, s = slot / 2, t = wall;
  const outer: Point[] = [[-x, -y], [-s, -y], [-s, -y + t], [-x + t, -y + t], [-x + t, y - t], [x - t, y - t], [x - t, -y + t], [s, -y + t], [s, -y], [x, -y], [x, y], [-x, y]];
  return { w, h, shapes: [{ outer, holes: [] }] };
}

export const SECTIONS: Record<string, Section> = { ...data.sections, RODC: slottedChannel(30, 20, 1.4, 8) };
export const PHOTOS = data.photos;

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const productSlug = (p: Pick<Product, "id">) => slugify(p.id);
export const productHref = (p: Pick<Product, "id">) => `/products/item/${productSlug(p)}`;
export const rangeHref = (r: Pick<Range, "id">) => `/products/${r.id}`;

export const hasSection = (kind: Kind) => kind === "profile" || kind === "cap" || kind === "flat";
export const is3D = (kind: Kind) => hasSection(kind) || ["spool", "roll", "sheet", "packer"].includes(kind);

export function resolveItem(p: Product, variantIndex = 0): Item {
  const v = p.variants?.[variantIndex] ?? p.variants?.[0];
  const { variants, ...base } = p;
  return {
    ...base,
    ...(v ?? {}),
    name: p.name,
    label: v?.label,
    variantIndex: v ? Math.max(0, variantIndex) : 0,
    variantCount: variants?.length ?? 0,
  };
}

export function getProductBySlug(slug: string): Product | undefined {
  return Object.values(PRODUCTS).find((p) => productSlug(p) === slug);
}

export function getRange(id: string): Range | undefined {
  return RANGES.find((r) => r.id === id);
}

export function productsInRange(r: Range): Product[] {
  return r.items.map((id) => PRODUCTS[id]).filter((p): p is Product => Boolean(p));
}

/** Total number of orderable codes, counting each size variant. */
export const CODE_COUNT = Object.values(PRODUCTS).reduce((n, p) => n + (p.variants?.length || 1), 0);

export { unitLabel } from "./units";
import { unitLabel } from "./units";

export function packText(c: Pick<Item, "packtext" | "unit" | "pack">): string {
  if (c.packtext) return c.packtext;
  if (c.unit === "length") return c.pack > 1 ? `Bundles of ${c.pack}` : "Single lengths";
  if (c.unit === "pack" || c.pack > 1) return `Packs of ${c.pack}`;
  return `Per ${unitLabel(c.unit, 1)}`;
}

export function defaultFinish(fin: string[], preferred = "MM"): string {
  if (fin.includes(preferred)) return preferred;
  if (fin.includes("MM")) return "MM";
  return fin[0] ?? "NA";
}

/** Every searchable code (product and variant) pointing back to its product and size. */
export const CODE_INDEX: { code: string; pid: string; variantIndex: number }[] = Object.values(PRODUCTS).flatMap((p) =>
  p.variants?.length
    ? p.variants.map((v, i) => ({ code: v.code, pid: p.id, variantIndex: i }))
    : [{ code: p.code, pid: p.id, variantIndex: 0 }],
);

/** The section key used to draw an item: its own, or a stand-in when the price list has no sketch. */
export const sectionKeyFor = (c: Pick<Item, "id" | "sec">): string | undefined => c.sec ?? SECTION_STANDINS[c.id];

/** True when the section is a stand-in rather than traced from the price list. */
export const isStandinSection = (c: Pick<Item, "id" | "sec">) => !c.sec && Boolean(SECTION_STANDINS[c.id]);

export const hasHandBuiltModel = (id: string) => HAND_BUILT_MODELS.has(id);

export const renderSrc = (p: Pick<Product, "id">) => `/renders/${productSlug(p)}.webp`;

/**
 * The 17 ranges grouped into five plain categories. Order matches d.home.groups (titles and
 * blurbs are translated there). Used on the home page and to organise the products page.
 */
export const CATEGORIES: { id: string; ranges: string[] }[] = [
  { id: "doors-windows", ranges: ["shopfront", "hinged-door", "bifold", "double-glaze", "partition", "angle"] },
  { id: "security-flyscreen", ranges: ["security", "door-window-acc", "flyscreen"] },
  { id: "mesh", ranges: ["mesh", "ss-mesh", "grill"] },
  { id: "hardware", ranges: ["hardware", "locks", "pile-wedge"] },
  { id: "blinds-curtains", ranges: ["blinds", "curtain"] },
];

/** Products marked NEW in the current price list, in catalogue order. */
export const NEW_PRODUCTS: Product[] = Object.values(PRODUCTS).filter((p) => p.tag === "New");

/**
 * True when a product's catalogue picture shows a light part (white nylon, mill aluminium, pale
 * powder coat). Light parts sit on a dark tile so the colour reads clearly. Values come from
 * scripts/render-tones.mjs (average brightness of the part in its render).
 */
export const isLightRender = (p: Pick<Product, "id">) => ((tones as Record<string, number>)[productSlug(p)] ?? 0) >= 0.62;

/** True for a pale finish colour (relative luminance of its swatch). */
export function isLightHex(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255) > 0.35;
}
