import Image from "next/image";
import { SECTIONS, renderSrc, sectionKeyFor, type Item } from "@/lib/catalogue";

export function toViewItem(c: Item) {
  const sec = sectionKeyFor(c);
  return {
    id: c.id,
    kind: c.kind,
    rubber: c.rubber,
    spool: c.spool,
    mesh: c.mesh,
    w: c.w,
    h: c.h,
    t: c.t,
    section: sec ? SECTIONS[sec] : undefined,
  };
}

/**
 * Catalogue picture: a studio render of the product's 3D model, pre-rendered with the same
 * camera and lighting for every product (see /dev/renders in development).
 */
export function ProductVisual({ item, sizes = "(min-width: 1024px) 22vw, 45vw", priority = false }: { item: Item; sizes?: string; priority?: boolean }) {
  return (
    <Image
      src={renderSrc(item)}
      alt={item.name}
      width={960}
      height={720}
      sizes={sizes}
      priority={priority}
      className="h-full w-full object-contain"
    />
  );
}
