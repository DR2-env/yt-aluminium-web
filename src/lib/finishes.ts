// Finish codes used in the price list, with display colours for swatches and 3D materials.
// Screen colours are a guide only; customers should ask for a physical sample.
export interface Finish {
  name: string;
  type: string;
  hex: string;
  metal?: number;
  rough: number;
  cc?: number;
  wood?: boolean;
  css?: string;
}

export const FINISHES: Record<string, Finish> = {
  ML: { name: "Mill", type: "Mill finish", hex: "#c3c6c9", metal: 1, rough: 0.42, css: "linear-gradient(135deg,#e9ebed,#aeb2b6 55%,#d7dadd)" },
  CA: { name: "Clear Anodised", type: "Anodised", hex: "#d5d8db", metal: 1, rough: 0.24, css: "linear-gradient(135deg,#f4f5f6,#bfc3c7 55%,#e5e7e9)" },
  PW: { name: "Pearl White", type: "Powder coat", hex: "#f2f1eb", rough: 0.32, cc: 0.6 },
  SF: { name: "Surfmist", type: "Powder coat", hex: "#e9e7dc", rough: 0.38, cc: 0.4 },
  WB: { name: "White Birch", type: "Powder coat", hex: "#e3d9c6", rough: 0.38, cc: 0.4 },
  SB: { name: "Stone Beige", type: "Powder coat", hex: "#cfae7e", rough: 0.4, cc: 0.3 },
  PR: { name: "Primrose", type: "Powder coat", hex: "#e3cfa0", rough: 0.38, cc: 0.4 },
  PS: { name: "Precious Silver Pearl", type: "Pearl powder coat", hex: "#a19f9a", metal: 0.7, rough: 0.34, cc: 0.4, css: "linear-gradient(135deg,#c4c2bd,#8b8984 55%,#b3b1ac)" },
  AG: { name: "Apo Grey", type: "Powder coat", hex: "#c2c3c0", rough: 0.4, cc: 0.3 },
  US: { name: "Ultra Silver", type: "Pearl powder coat", hex: "#b1b9ba", metal: 0.75, rough: 0.3, cc: 0.4, css: "linear-gradient(135deg,#d5dbdc,#98a1a2 55%,#c3cacb)" },
  WG: { name: "Woodland Grey", type: "Powder coat", hex: "#52595d", rough: 0.42, cc: 0.3 },
  MM: { name: "Monument", type: "Powder coat", hex: "#383e42", rough: 0.42, cc: 0.3 },
  BR: { name: "Brown", type: "Powder coat", hex: "#4c2b20", rough: 0.42, cc: 0.3 },
  BA: { name: "Bronze Anodised", type: "Anodised", hex: "#5a4331", metal: 0.85, rough: 0.33, css: "linear-gradient(135deg,#7d6450,#4a3526 55%,#6b5341)" },
  CC: { name: "Charcoal", type: "Powder coat", hex: "#2f3a42", rough: 0.42, cc: 0.3 },
  BK: { name: "Black", type: "Powder coat", hex: "#232325", rough: 0.45, cc: 0.3 },
  DM: { name: "Dune Matte", type: "Matt powder coat", hex: "#b7b3a8", rough: 0.75 },
  ND: { name: "Notre Dame", type: "Powder coat", hex: "#596064", rough: 0.42, cc: 0.3 },
  WRC: { name: "Western Red Cedar", type: "Timber finish", hex: "#974026", rough: 0.55, wood: true, css: "repeating-linear-gradient(100deg,#8a3a22 0 3px,#a8502f 3px 7px,#7c321d 7px 9px)" },
  RB: { name: "Black rubber", type: "Rubber", hex: "#1b1b1d", rough: 0.92 },
  NA: { name: "Standard", type: "Standard finish", hex: "#8c939b", rough: 0.55, css: "repeating-linear-gradient(45deg,#d9dde2 0 4px,#c4c9cf 4px 8px)" },
};

/** The 19 customer-facing colours, in price list order (excludes rubber and "standard"). */
export const COLOUR_CODES = ["ML", "CA", "PW", "SF", "WB", "SB", "PR", "PS", "AG", "US", "WG", "MM", "BR", "BA", "CC", "BK", "DM", "ND", "WRC"] as const;

export const DEFAULT_FINISH = "MM";

export const finishOf = (code: string): Finish => FINISHES[code] ?? FINISHES.NA;
export const swatchBackground = (code: string): string => finishOf(code).css ?? finishOf(code).hex;
