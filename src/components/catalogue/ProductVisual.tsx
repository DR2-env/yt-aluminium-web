import Image from "next/image";
import { PHOTOS, SECTIONS, type Item } from "@/lib/catalogue";
import { SectionDrawing } from "./SectionDrawing";
import { Thumb3D } from "./Thumb3D";

export function toViewItem(c: Item) {
  return {
    kind: c.kind,
    rubber: c.rubber,
    spool: c.spool,
    mesh: c.mesh,
    w: c.w,
    h: c.h,
    t: c.t,
    section: c.sec ? SECTIONS[c.sec] : undefined,
  };
}

/** The small picture used on product cards: section drawing, photo, lazy 3D, or a code plate. */
export function ProductVisual({ item, finish }: { item: Item; finish: string }) {
  if (item.sec && SECTIONS[item.sec]) {
    return <SectionDrawing section={SECTIONS[item.sec]} finish={finish} className="h-full w-full text-ink" title={`${item.name} cross section`} />;
  }
  if (item.kind === "photo" && item.img && PHOTOS[item.img]) {
    return (
      <Image
        src={PHOTOS[item.img]}
        alt={item.name}
        width={480}
        height={360}
        className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
        sizes="(min-width: 1024px) 22vw, 45vw"
      />
    );
  }
  if (item.kind === "none") {
    return (
      <div className="grid h-full w-full place-items-center">
        <div className="text-center">
          <p className="font-mono text-lg font-semibold tracking-tight">{item.code}</p>
          <p className="mt-1 text-xs text-muted">Photo coming soon</p>
        </div>
      </div>
    );
  }
  return <Thumb3D thumbKey={`${item.id}|${item.variantIndex}|${finish}`} item={toViewItem(item)} finish={finish} alt={item.name} />;
}
