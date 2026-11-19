"use client";

import { useState } from "react";
import type { ViewItem } from "@/components/three/scene";

export interface BenchItem {
  slug: string;
  code: string;
  name: string;
  finish: string;
  view: ViewItem;
}

export function RenderBench({ items }: { items: BenchItem[] }) {
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
      <div className="mt-6 grid grid-cols-6 gap-3">
        {items.map((it) => (
          <figure key={it.slug} className="rounded border bg-surface p-2" data-slug={it.slug}>
            {images[it.slug] ? (
              // eslint-disable-next-line @next/next/no-img-element -- dev tool
              <img src={images[it.slug]} alt={it.name} className="aspect-[4/3] w-full object-contain" />
            ) : (
              <div className="aspect-[4/3] bg-surface-2" />
            )}
            <figcaption className="mt-1 text-xs">
              <b className="font-mono">{it.code}</b> {it.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
