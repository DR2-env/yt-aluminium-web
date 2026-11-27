// Measures each pre-rendered product image and records whether the part itself is light or dark,
// so light parts (white nylon, mill aluminium, pale powder coat) can sit on a dark tile.
// Run after regenerating renders:  node scripts/render-tones.mjs
import { readdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
const dir = `${root}public/renders`;
const tones = {};
for (const file of readdirSync(dir).filter((f) => f.endsWith(".webp")).sort()) {
  const { data, info } = await sharp(`${dir}/${file}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let sum = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 230) continue; // skip background and the soft shadow
    sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    n++;
  }
  const lum = n ? sum / n : 0;
  tones[file.replace(/\.webp$/, "")] = Math.round(lum * 100) / 100;
}
writeFileSync(`${root}src/data/render-tones.json`, JSON.stringify(tones, null, 0) + "\n");
const light = Object.entries(tones).filter(([, v]) => v >= 0.62).map(([k]) => k);
console.log(`${Object.keys(tones).length} renders, ${light.length} light:`, light.join(" "));
