"use client";

import { useState } from "react";
import type { ViewItem } from "@/components/three/scene";

export interface BenchItem {
  slug: string;
  code: string;
  name: string;
  finish: string;
  view: ViewItem;
  photo?: string;
  handBuilt: boolean;
}

export function RenderBench({ items: all }: { items: BenchItem[] }) {
  // ?review shows only hand-built models, each next to its price list photo.
  const review = typeof window !== "undefined" && window.location.search.includes("review");
  const items = review ? all.filter((i) => i.handBuilt) : all;
  const [images, setImages] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("idle");

  const run = async (save: boolean) => {
    setStatus("rendering");
    const { buildObject, makeStage, placeObject } = await import("@/components/three/scene");
    const canvas = document.createElement("canvas");
    const stage = makeStage(canvas, true);
    stage.renderer.setPixelRatio(1);
    stage.renderer.setSize(960, 720, false);
    stage.camera.aspect = 4 / 3;
    stage.camera.updateProjectionMatrix();
    const out: Record<string, string> = {};
    for (const it of items) {
      placeObject(stage, buildObject(it.view, it.finish));
      stage.renderer.render(stage.scene, stage.camera);
      const url = canvas.toDataURL("image/webp", 0.9);
      out[it.slug] = url;
      if (save) {
        await fetch("/api/dev/renders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: it.slug, dataUrl: url }) });
      }
    }
    setImages(out);
    setStatus(save ? `saved ${items.length}` : `rendered ${items.length}`);
  };

  return (
    <div className="p-6">
      <div className="flex gap-3">
        <button type="button" className="rounded border px-3 py-1" onClick={() => run(false)}>Render</button>
        <button type="button" className="rounded border px-3 py-1" onClick={() => run(true)}>Render and save</button>
        <span id="bench-status">{status}</span>
      </div>
      <div className={`mt-6 grid gap-3 ${review ? "grid-cols-8" : "grid-cols-6"}`}>
        {items.map((it) => (
          <figure key={it.slug} className="rounded border bg-surface p-2" data-slug={it.slug}>
            {images[it.slug] ? (
              // eslint-disable-next-line @next/next/no-img-element -- dev tool
              <img src={images[it.slug]} alt={it.name} className="aspect-[4/3] w-full object-contain" />
            ) : (
              <div className="aspect-[4/3] bg-surface-2" />
            )}
            {review && (it.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- dev tool
              <img src={it.photo} alt="" className="mt-1 aspect-[4/3] w-full bg-white object-contain" />
            ) : (
              <div className="mt-1 grid aspect-[4/3] place-items-center bg-white text-[10px] text-muted">no photo</div>
            ))}
            <figcaption className="mt-1 text-xs">
              <b className="font-mono">{it.code}</b> {it.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
