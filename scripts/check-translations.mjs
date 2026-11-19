// Fails if any catalogue string has no translation in zh, ko or ar.
import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const data = JSON.parse(readFileSync(`${root}src/data/catalogue.json`, "utf8"));
const finishes = readFileSync(`${root}src/lib/finishes.ts`, "utf8");
const ps = Object.values(data.products);
const need = new Set([
  ...data.ranges.flatMap((r) => [r.name, r.blurb]),
  ...ps.flatMap((p) => [p.name, p.grp, p.len, p.packtext, p.note, ...(p.variants ?? []).map((v) => v.len)]),
  ...[...finishes.matchAll(/name: "([^"]+)", type: "([^"]+)"/g)].flatMap((m) => [m[1], m[2]]),
].filter(Boolean));
let failed = false;
for (const lang of ["zh", "ko", "ar"]) {
  const src = readFileSync(`${root}src/i18n/catalogue/${lang}.ts`, "utf8");
  const keys = new Set([...src.matchAll(/^\s*(?:"((?:[^"\\]|\\.)*)"|([A-Za-z]+)):/gm)].map((m) => m[1] ?? m[2]));
  const missing = [...need].filter((s) => !keys.has(s));
  if (missing.length) {
    failed = true;
    console.error(`${lang}: ${missing.length} missing`, missing);
  }
}
if (failed) process.exit(1);
console.log(`All ${need.size} catalogue strings translated in zh, ko and ar.`);
