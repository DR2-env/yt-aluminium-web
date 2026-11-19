// Three.js scene builders, ported from the standalone catalogue (yt-catalogue.html).
// Client-only: imported dynamically so three.js never lands in the initial bundle.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { finishOf } from "@/lib/finishes";
import type { Section } from "@/lib/catalogue";

/** The subset of an item the 3D builders need. Kept small so pages pass little data to the client. */
export interface ViewItem {
  kind: string;
  rubber?: boolean;
  spool?: string;
  mesh?: string;
  w?: number;
  h?: number;
  t?: number;
  section?: Section;
}

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  key: THREE.DirectionalLight;
  obj: THREE.Group | null;
  fit: { r: number; target: THREE.Vector3 } | null;
}

const texCache = new Map<string, THREE.CanvasTexture>();

function canvasTex(key: string, draw: (g: CanvasRenderingContext2D, s: number) => void, size = 256): THREE.Texture {
  let base = texCache.get(key);
  if (!base) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) draw(ctx, size);
    base = new THREE.CanvasTexture(c);
    base.wrapS = base.wrapT = THREE.RepeatWrapping;
    base.colorSpace = THREE.SRGBColorSpace;
    base.anisotropy = 8;
    texCache.set(key, base);
  }
  const t = base.clone();
  t.needsUpdate = true;
  return t;
}

const woodTex = () =>
  canvasTex(
    "wood",
    (g, s) => {
      g.fillStyle = "#9a4428";
      g.fillRect(0, 0, s, s);
      // deterministic grain so server snapshots and thumbnails stay stable
      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 70; i++) {
        const y = rand() * s;
        const h = 1 + rand() * 4;
        g.fillStyle = `rgba(${90 + rand() * 60},${30 + rand() * 25},${15 + rand() * 12},${0.25 + rand() * 0.4})`;
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x <= s; x += 16) g.lineTo(x, y + Math.sin(x / 40 + i) * 3);
        g.lineTo(s, y + h);
        g.lineTo(0, y + h);
        g.fill();
      }
    },
    512,
  );

// Mesh patterns: white where there is material, transparent where open.
const PATTERNS: Record<string, { cell: number; draw: (g: CanvasRenderingContext2D, s: number) => void }> = {
  fly: { cell: 70, draw(g, s) { g.fillStyle = "#fff"; for (let i = 0; i < s; i += 16) { g.fillRect(i, 0, 6, s); g.fillRect(0, i, s, 6); } } },
  pet: { cell: 70, draw(g, s) { g.fillStyle = "#fff"; for (let i = 0; i < s; i += 32) { g.fillRect(i, 0, 12, s); g.fillRect(0, i, s, 12); } } },
  ss: { cell: 100, draw(g, s) { g.fillStyle = "#fff"; for (let i = 0; i < s; i += 20) { g.fillRect(i, 0, 5, s); g.fillRect(0, i, s, 5); } } },
  diamond: {
    cell: 140,
    draw(g, s) {
      g.strokeStyle = "#fff"; g.lineWidth = 16; g.lineCap = "square";
      for (let k = -s; k <= 2 * s; k += s / 2) {
        g.beginPath(); g.moveTo(k, 0); g.lineTo(k + s, s); g.stroke();
        g.beginPath(); g.moveTo(k, s); g.lineTo(k + s, 0); g.stroke();
      }
    },
  },
  oneway: {
    cell: 260,
    draw(g, s) {
      for (let y = 0; y < s; y += 16) {
        const gr = g.createLinearGradient(0, y, 0, y + 10);
        gr.addColorStop(0, "#fff"); gr.addColorStop(1, "#8a8a8a");
        g.fillStyle = gr; g.fillRect(0, y, s, 10);
      }
      g.fillStyle = "#ddd";
      for (let x = 0; x < s; x += 64) g.fillRect(x, 0, 5, s);
    },
  },
  seconeway: {
    cell: 150,
    draw(g, s) {
      g.fillStyle = "#fff"; g.fillRect(0, 0, s, s); g.globalCompositeOperation = "destination-out";
      for (let y = 0; y < s; y += 32)
        for (let x = ((y / 32) % 2) * 16; x < s + 16; x += 32) {
          g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + 12, y + 16); g.lineTo(x, y + 28); g.lineTo(x - 12, y + 16); g.fill();
        }
    },
  },
  perf: {
    cell: 130,
    draw(g, s) {
      g.fillStyle = "#fff"; g.fillRect(0, 0, s, s); g.globalCompositeOperation = "destination-out";
      for (let y = 0; y < s + 16; y += 28)
        for (let x = ((y / 28) % 2) * 14; x < s + 16; x += 28) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }
    },
  },
};

// No mipmaps: keeps the mesh openings visible instead of averaging them away.
function meshTex(type: string, rx: number, ry: number): THREE.Texture {
  const p = PATTERNS[type] ?? PATTERNS.fly;
  const t = canvasTex(`m-${type}`, p.draw);
  t.repeat.set(rx / p.cell, ry / p.cell);
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearFilter;
  return t;
}
const MESH_COLOR: Record<string, string> = { fly: "#3b3e42", pet: "#252527" };

function makeMaterial(code: string): THREE.MeshPhysicalMaterial {
  const f = finishOf(code);
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(f.wood ? "#ffffff" : f.hex),
    metalness: f.metal ?? 0,
    roughness: f.rough,
    clearcoat: f.cc ?? 0,
    clearcoatRoughness: 0.35,
    envMapIntensity: f.metal ? 1.15 : 0.85,
  });
  if (f.wood) {
    const t = woodTex();
    t.repeat.set(1 / 140, 1 / 140);
    m.map = t;
  }
  return m;
}

function profileGeometry(S: Section, len: number): THREE.ExtrudeGeometry {
  const shapes = S.shapes.map((s) => {
    const sh = new THREE.Shape(s.outer.map(([x, y]) => new THREE.Vector2(x, y)));
    s.holes.forEach((h) => sh.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y)))));
    return sh;
  });
  const g = new THREE.ExtrudeGeometry(shapes, { depth: len, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -len / 2);
  g.rotateY(-Math.PI / 2);
  g.scale(0.01, 0.01, 0.01);
  return g;
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadow;
  return m;
}

export function buildObject(c: ViewItem, fin: string): THREE.Group {
  const g = new THREE.Group();
  const view = (v: [number, number, number]) => (g.userData.view = v);

  if (c.section) {
    const S = c.section;
    const size = Math.max(S.w, S.h);
    const len = S.depth || (c.rubber ? size * 4 : Math.min(Math.max(size * 2.4, 70), 260));
    g.add(mesh(profileGeometry(S, len), makeMaterial(fin)));
    view([1.55, 0.5, 1.0]);
  } else if (c.kind === "spool") {
    const rubber = c.spool === "rubber";
    const Rf = 0.9, W = 0.9, Rw = 0.74;
    const flange = new THREE.MeshPhysicalMaterial({ color: rubber ? "#2b2e33" : "#e9e5da", roughness: 0.55, clearcoat: 0.2 });
    const cord = new THREE.MeshPhysicalMaterial({ color: rubber ? "#1c1c1e" : "#d8d6cf", roughness: rubber ? 0.8 : 0.95 });
    const bump = canvasTex("cord", (x, s) => {
      for (let y = 0; y < s; y += 8) {
        const gr = x.createLinearGradient(0, y, 0, y + 8);
        gr.addColorStop(0, "#000"); gr.addColorStop(0.5, "#fff"); gr.addColorStop(1, "#000");
        x.fillStyle = gr; x.fillRect(0, y, s, 8);
      }
    });
    bump.repeat.set(1, 6);
    bump.colorSpace = THREE.NoColorSpace;
    cord.bumpMap = bump;
    cord.bumpScale = 2.5;
    const body = mesh(new THREE.CylinderGeometry(Rw, Rw, W - 0.1, 72, 1, false), cord);
    body.rotation.z = Math.PI / 2;
    g.add(body);
    for (const s of [-1, 1]) {
      const f = mesh(new THREE.CylinderGeometry(Rf, Rf, 0.05, 72), flange);
      f.rotation.z = Math.PI / 2; f.position.x = (s * W) / 2; g.add(f);
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), new THREE.MeshBasicMaterial({ color: "#0d0e10" }));
      hole.rotation.y = (s * Math.PI) / 2; hole.position.x = s * (W / 2 + 0.026); g.add(hole);
    }
    view([0.55, 0.42, 1.2]);
  } else if (c.kind === "roll") {
    const type = c.mesh ?? "fly";
    const w = (c.w || 900) / 100;
    const R = type === "ss" ? 0.7 : 0.55;
    const col = type === "ss" ? finishOf(fin).hex : MESH_COLOR[type] ?? "#3b3e42";
    const t1 = meshTex(type, 2 * Math.PI * R * 100, w * 100);
    const roll = mesh(
      new THREE.CylinderGeometry(R, R, w, 80, 1, true),
      new THREE.MeshStandardMaterial({ color: col, map: t1, roughness: 0.7, metalness: type === "ss" ? 0.5 : 0, side: THREE.DoubleSide }),
    );
    roll.rotation.z = Math.PI / 2;
    g.add(roll);
    const endMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(col).multiplyScalar(0.6), roughness: 0.9, side: THREE.DoubleSide });
    const coreMat = new THREE.MeshStandardMaterial({ color: "#b88d5c", roughness: 0.85, side: THREE.DoubleSide });
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.RingGeometry(0.22, R, 64), endMat);
      e.rotation.y = Math.PI / 2; e.position.x = (s * w) / 2; g.add(e);
    }
    const core = mesh(new THREE.CylinderGeometry(0.22, 0.22, w + 0.08, 40, 1, true), coreMat);
    core.rotation.z = Math.PI / 2;
    g.add(core);
    const fl = Math.min(w * 0.8, 9);
    const t2 = meshTex(type, w * 100, fl * 100);
    const flap = new THREE.Mesh(
      new THREE.PlaneGeometry(w, fl),
      new THREE.MeshStandardMaterial({ color: col, map: t2, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.7, metalness: type === "ss" ? 0.5 : 0 }),
    );
    flap.rotation.x = -Math.PI / 2;
    flap.position.set(0, -R + 0.004, fl / 2);
    g.add(flap);
    view([0.8, 0.7, 1.25]);
  } else if (c.kind === "sheet") {
    const w = (c.w ?? 900) / 100, h = (c.h ?? 2050) / 100, f = finishOf(fin);
    const t = meshTex(c.mesh ?? "ss", c.w ?? 900, c.h ?? 2050);
    const mat = new THREE.MeshStandardMaterial({ color: f.hex, map: t, alphaTest: 0.3, side: THREE.DoubleSide, metalness: f.metal || 0.15, roughness: 0.45 });
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    sheet.position.y = h / 2;
    g.add(sheet);
    const back = sheet.clone();
    back.position.z = -0.012;
    g.add(back);
    g.rotation.y = -0.42;
    view([0.35, 0.22, 1]);
  } else if (c.kind === "packer") {
    const t = (c.t || 3) / 100;
    const mat = new THREE.MeshPhysicalMaterial({ color: "#3a3f46", roughness: 0.5, clearcoat: 0.3 });
    for (let i = 0; i < 6; i++) {
      const b = mesh(new THREE.BoxGeometry(0.75, t, 0.28), mat);
      b.position.set(i * 0.03, t / 2 + i * t * 1.02, i * 0.02);
      b.rotation.y = (i % 2 ? 1 : -1) * 0.1 + i * 0.05;
      g.add(b);
    }
    view([1, 0.9, 1.2]);
  }
  return g;
}

export function makeStage(canvas: HTMLCanvasElement, keepBuffer = false): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: keepBuffer });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 6;
  scene.add(key, key.target, new THREE.HemisphereLight(0xffffff, 0xdfe3e8, 0.55));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 500);
  return { renderer, scene, camera, key, obj: null, fit: null };
}

export function disposeObject(o: THREE.Object3D) {
  o.traverse((n) => {
    if (n instanceof THREE.Mesh) {
      n.geometry.dispose();
      const mats: THREE.Material[] = Array.isArray(n.material) ? n.material : [n.material];
      mats.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.map?.dispose();
          m.bumpMap?.dispose();
        }
        m.dispose();
      });
    }
  });
}

/** Camera distance that keeps the whole object in view, whichever side of the viewport is narrower. */
export function fitDistance(cam: THREE.PerspectiveCamera, r: number) {
  const v = THREE.MathUtils.degToRad(cam.fov / 2);
  const h = Math.atan(Math.tan(v) * cam.aspect);
  return (r / Math.sin(Math.min(v, h))) * 1.05;
}

export function placeObject(st: Stage, obj: THREE.Group) {
  if (st.obj) {
    st.scene.remove(st.obj);
    disposeObject(st.obj);
  }
  st.obj = obj;
  st.scene.add(obj);
  const box = new THREE.Box3().setFromObject(obj);
  obj.position.y -= box.min.y;
  box.setFromObject(obj);
  const sph = box.getBoundingSphere(new THREE.Sphere());
  const r = sph.radius;
  const target = sph.center.clone();
  st.fit = { r, target };
  const dist = fitDistance(st.camera, r);
  const v = (obj.userData.view as [number, number, number] | undefined) ?? [1.55, 0.5, 1];
  const dir = new THREE.Vector3(...v).normalize();
  st.camera.position.copy(target).addScaledVector(dir, dist);
  st.camera.near = dist / 60;
  st.camera.far = dist * 20;
  st.camera.updateProjectionMatrix();
  st.camera.lookAt(target);
  st.key.position.set(target.x + r * 3.2, target.y + r * 3.6, target.z + r * 1.4);
  st.key.target.position.copy(target);
  Object.assign(st.key.shadow.camera, { left: -r * 1.6, right: r * 1.6, top: r * 1.6, bottom: -r * 1.6, near: r * 0.2, far: r * 12 });
  st.key.shadow.camera.updateProjectionMatrix();
  return { target, dist };
}
