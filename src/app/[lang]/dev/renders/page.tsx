import { notFound } from "next/navigation";
import { RenderBench, type BenchItem } from "./RenderBench";
import { PHOTOS, PRODUCTS, defaultFinish, hasHandBuiltModel, isStandinSection, productSlug, resolveItem } from "@/lib/catalogue";

export const instant = false;
import { toViewItem } from "@/components/catalogue/ProductVisual";

// Development tool: renders every product with the same camera and lighting and saves the images.
export default function RendersPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const items: BenchItem[] = Object.values(PRODUCTS).map((p) => {
    const c = resolveItem(p);
    return {
      slug: productSlug(p),
      code: p.code,
      name: p.name,
      finish: defaultFinish(c.fin),
      view: toViewItem(c),
      photo: p.img ? PHOTOS[p.img] : undefined,
      handBuilt: hasHandBuiltModel(p.id) || isStandinSection(c),
    };
  });
  return <RenderBench items={items} />;
}
