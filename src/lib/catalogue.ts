import raw from "@/data/catalogue.json";
import { HAND_BUILT_MODELS, SECTION_STANDINS } from "./models-index";

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
// Round tube used to draw the curtain rod (AU055), which has no sketch in the price list.
function ringSection(od: number, wall: number): Section {
  const circle = (r: number, n = 64): Point[] =>
    Array.from({ length: n }, (_, i) => [r * Math.cos((i / n) * Math.PI * 2), r * Math.sin((i / n) * Math.PI * 2)] as Point);
  return { w: od, h: od, shapes: [{ outer: circle(od / 2), holes: [circle(od / 2 - wall).reverse()] }] };
}

export const SECTIONS: Record<string, Section> = { ...data.sections, ROD19: ringSection(19, 1.2) };
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
