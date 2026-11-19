"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildObject, fitDistance, makeStage, placeObject, type Stage, type ViewItem } from "./scene";

interface Props {
  item: ViewItem;
  finish: string;
  autoRotate?: boolean;
  /** Bump to re-frame the camera (used by a "reset view" button). */
  resetKey?: number;
  onInteract?: () => void;
  /** Called once the model has been drawn, so a placeholder image can be removed. */
  onReady?: () => void;
}

export default function Viewer3D({ item, finish, autoRotate = true, resetKey = 0, onInteract, onReady }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const onInteractRef = useRef(onInteract);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onInteractRef.current = onInteract;
    onReadyRef.current = onReady;
  });

  // One renderer per mounted viewer; render loop pauses when off screen or tab hidden.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const stage = makeStage(canvas);
    const controls = new OrbitControls(stage.camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotateSpeed = 0.9;
    controls.enablePan = false;
    // Wheel zoom would hijack page scrolling, so the viewer only rotates.
    controls.enableZoom = false;
    // OrbitControls sets touch-action: none; let vertical swipes scroll the page on phones.
    canvas.style.touchAction = "pan-y";
    controls.maxPolarAngle = Math.PI * 0.49;
    stageRef.current = stage;
    controlsRef.current = controls;

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      stage.renderer.setSize(w, h, false);
      stage.camera.aspect = w / h;
      stage.camera.updateProjectionMatrix();
      if (stage.fit) {
        const d = fitDistance(stage.camera, stage.fit.r);
        const dir = stage.camera.position.clone().sub(controls.target).normalize();
        stage.camera.position.copy(controls.target).addScaledVector(dir, d);
        controls.minDistance = d * 0.3;
        controls.maxDistance = d * 2.5;
        controls.update();
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    let visible = true;
    const io = new IntersectionObserver((entries) => (visible = entries[0]?.isIntersecting ?? true));
    io.observe(wrap);

    let raf = 0;
    let readySent = false;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      controls.update();
      stage.renderer.render(stage.scene, stage.camera);
      if (!readySent && stage.obj) {
        readySent = true;
        onReadyRef.current?.();
      }
    };
    loop();

    const stopSpin = () => onInteractRef.current?.();
    canvas.addEventListener("pointerdown", stopSpin);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", stopSpin);
      controls.dispose();
      stage.scene.traverse((n) => {
        if (n instanceof THREE.Mesh) n.geometry.dispose();
      });
      stage.renderer.dispose();
      stageRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  // Rebuild the object when the product, size or finish changes.
  useEffect(() => {
    const stage = stageRef.current;
    const controls = controlsRef.current;
    if (!stage || !controls) return;
    const home = placeObject(stage, buildObject(item, finish));
    controls.target.copy(home.target);
    controls.minDistance = home.dist * 0.3;
    controls.maxDistance = home.dist * 2.5;
    controls.update();
  }, [item, finish, resetKey]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full touch-pan-y cursor-grab active:cursor-grabbing" aria-label="3D view, drag to rotate" />
    </div>
  );
}
