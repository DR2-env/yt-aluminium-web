// Pulls the catalogue data out of the standalone yt-catalogue.html (built from the
// 16/02/2026 price list) and writes it as JSON + image files the Next.js site can use.
// Usage: node scripts/extract-catalogue.mjs "/path/to/yt-catalogue.html"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const source = process.argv[2];
if (!source) {
  console.error("Pass the path to yt-catalogue.html");
  process.exit(1);
}

const html = readFileSync(source, "utf8");
const line = html.split("\n").find((l) => l.startsWith("const DATA = "));
if (!line) throw new Error("Could not find `const DATA = ` in the catalogue file");
const data = JSON.parse(line.replace(/^const DATA = /, "").replace(/;\s*$/, ""));

const root = new URL("..", import.meta.url).pathname;
const photoDir = join(root, "public", "products");
mkdirSync(photoDir, { recursive: true });

const photoFiles = {};
for (const [key, dataUrl] of Object.entries(data.photos)) {
  const match = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error(`Unexpected photo format for ${key}`);
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const file = `${key}.${ext}`;
  writeFileSync(join(photoDir, file), Buffer.from(match[2], "base64"));
  photoFiles[key] = `/products/${file}`;
}

const out = { ranges: data.ranges, products: data.products, sections: data.sections, photos: photoFiles };
writeFileSync(join(root, "src", "data", "catalogue.json"), JSON.stringify(out));
console.log(
  `ranges ${out.ranges.length}, products ${Object.keys(out.products).length}, sections ${Object.keys(out.sections).length}, photos ${Object.keys(photoFiles).length}`,
);
