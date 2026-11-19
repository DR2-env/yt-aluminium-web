const UNITS: Record<string, [string, string]> = {
  length: ["length", "lengths"],
  roll: ["roll", "rolls"],
  pack: ["pack", "packs"],
  piece: ["piece", "pieces"],
  set: ["set", "sets"],
  pair: ["pair", "pairs"],
  sheet: ["sheet", "sheets"],
  each: ["each", "each"],
  spool: ["spool", "spools"],
};

export const unitLabel = (unit: string, n: number) => (UNITS[unit] ?? ["item", "items"])[n === 1 ? 0 : 1];
