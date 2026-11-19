// Renders small 3D product pictures for catalogue cards with one shared offscreen renderer.
import { buildObject, makeStage, placeObject, type Stage, type ViewItem } from "./scene";

let stage: Stage | null = null;
const cache = new Map<string, string>();

export function renderThumb(key: string, item: ViewItem, finish: string): string {
  const cached = cache.get(key);
  if (cached) return cached;
  if (!stage) {
    const canvas = document.createElement("canvas");
    stage = makeStage(canvas, true);
    stage.renderer.setPixelRatio(1);
    stage.renderer.setSize(480, 360, false);
    stage.camera.aspect = 4 / 3;
    stage.camera.updateProjectionMatrix();
  }
  placeObject(stage, buildObject(item, finish));
  stage.renderer.render(stage.scene, stage.camera);
  const url = stage.renderer.domElement.toDataURL("image/png");
  cache.set(key, url);
  return url;
}
