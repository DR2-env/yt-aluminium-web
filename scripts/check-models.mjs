// Fails if a product has neither a traced section, a stand-in, a generic 3D form, nor a hand-built model.
import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const data = JSON.parse(readFileSync(`${root}src/data/catalogue.json`, "utf8"));
const idx = readFileSync(`${root}src/lib/models-index.ts`, "utf8");
const models = readFileSync(`${root}src/components/three/models.ts`, "utf8");
const listed = new Set([...idx.matchAll(/"([^"]+)"/g), ...idx.matchAll(/\b([A-Z0-9/]+): "/g)].map((m) => m[1]));
const generic = new Set(["spool", "roll", "sheet", "packer"]);
const missing = Object.values(data.products).filter((p) => !p.sec && !generic.has(p.kind) && !listed.has(p.id));
const notBuilt = [...listed].filter((id) => /^[A-Z]/.test(id) && !["RODC", "AU025", "AU026", "AU025A", "AU026A", "AU055"].includes(id) && !models.includes(`"${id}":`) && !models.includes(`  ${id}:`));
if (missing.length || notBuilt.length) {
  console.error("No 3D model for:", missing.map((p) => p.id).join(", ") || "-");
  console.error("Listed but not built:", notBuilt.join(", ") || "-");
  process.exit(1);
}
console.log(`All ${Object.keys(data.products).length} products have a 3D model.`);
