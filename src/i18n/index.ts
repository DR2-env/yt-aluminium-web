import en, { type Dictionary } from "./dictionaries/en";
import zh from "./dictionaries/zh";
import ko from "./dictionaries/ko";
import ar from "./dictionaries/ar";
import zhCat from "./catalogue/zh";
import koCat from "./catalogue/ko";
import arCat from "./catalogue/ar";
import type { Locale } from "./config";
import { finishOf } from "@/lib/finishes";

export type { Dictionary };
export * from "./config";

const DICTS: Record<Locale, Dictionary> = { en, zh, ko, ar };
const CATALOGUE: Record<Locale, Record<string, string>> = { en: {}, zh: zhCat, ko: koCat, ar: arCat };

export const getDictionary = (lang: Locale): Dictionary => DICTS[lang];

/** Translate a catalogue string (product name, range, group, length, note). Falls back to English. */
export const tc = (lang: Locale, s: string | undefined): string => (s ? (CATALOGUE[lang][s] ?? s) : "");

/** Fill {placeholders} in a dictionary string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export function unitName(dict: Dictionary, unit: string, n: number): string {
  const pair = (dict.units as Record<string, string[]>)[unit] ?? dict.units.item;
  return pair[n === 1 ? 0 : 1];
}

/** "Bundles of 2", "Packs of 50" and so on, in the page language. */
export function packLabel(lang: Locale, dict: Dictionary, c: { packtext?: string; unit: string; pack: number }): string {
  if (c.packtext) return tc(lang, c.packtext);
  if (c.unit === "length") return c.pack > 1 ? fmt(dict.pack.bundles, { n: c.pack }) : dict.pack.single;
  if (c.unit === "pack" || c.pack > 1) return fmt(dict.pack.packs, { n: c.pack });
  return fmt(dict.pack.per, { unit: unitName(dict, c.unit, 1) });
}

/**
 * Colour name as shown to customers. The English name always appears, because it is what YT
 * uses on the price list and in MYOB; other languages add their translation in brackets.
 */
export function finishName(lang: Locale, code: string): string {
  const en = finishOf(code).name;
  const local = tc(lang, en);
  if (lang === "en" || local === en) return en;
  return local.includes(en) ? local : `${en} (${local})`;
}
export const finishType = (lang: Locale, code: string) => tc(lang, finishOf(code).type);

import { FINISHES } from "@/lib/finishes";

/** Every finish code mapped to its name in the given language, for client components. */
export const finishNameMap = (lang: Locale): Record<string, string> =>
  Object.fromEntries(Object.keys(FINISHES).map((code) => [code, finishName(lang, code)]));
