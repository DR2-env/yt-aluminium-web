// Parametric 3D models for hardware and accessories that have no traced profile drawing
// (locks, hinges, rollers, corners, clips, brackets, curtain fittings, pile and gasket).
// They are representative models built from simple primitives in one consistent style,
// not engineering drawings. Dimensions are in millimetres; the group is scaled to scene units.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { finishOf } from "@/lib/finishes";

type Mat = THREE.Material;

// ---------- materials ----------
const physical = (color: string, rough: number, metal = 0, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, clearcoat: metal ? 0 : 0.25, clearcoatRoughness: 0.4, envMapIntensity: metal ? 1.1 : 0.85, ...extra });

const MATS = {
  zinc: () => physical("#b8bcc1", 0.32, 1),
  stainless: () => physical("#d4d7da", 0.2, 1),
  brass: () => physical("#c9a54e", 0.28, 1),
  nylonBlack: () => physical("#222427", 0.55),
  nylonGrey: () => physical("#7d838a", 0.55),
  nylonWhite: () => physical("#ecebe6", 0.5),
  clear: () => physical("#e8eef2", 0.25, 0, { transparent: true, opacity: 0.72, clearcoat: 0.8 }),
  rubber: () => physical("#1b1b1d", 0.9),
  steel: () => physical("#8e959c", 0.38, 1),
  pile: () => physical("#5b6066", 0.95),
  tape: () => physical("#f1f0ea", 0.85),
};

/** Coloured finish (powder coat / anodised) when the product comes in colours. */
function finishMat(code: string, fallback: () => Mat): Mat {
  if (!code || code === "NA" || code === "RB") return fallback();
  const f = finishOf(code);
  return physical(f.hex, f.rough, f.metal ?? 0, { clearcoat: f.cc ?? 0 });
}

// ---------- primitive helpers (all sizes in mm) ----------
function mesh(geo: THREE.BufferGeometry, mat: Mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}
const rbox = (w: number, h: number, d: number, r: number, mat: Mat) =>
  mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01)), mat);
const cyl = (r: number, h: number, mat: Mat, seg = 48) => mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): T => {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
};

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
const circlePath = (cx: number, cy: number, r: number) => {
  const p = new THREE.Path();
  p.absarc(cx, cy, r, 0, Math.PI * 2, true);
  return p;
};

/** Flat plate (in the XY plane, thickness along Z) with optional round holes and a soft bevel. */
function plate(w: number, h: number, t: number, mat: Mat, holes: [number, number, number][] = [], r = 2) {
  const s = roundedRectShape(w, h, r);
  holes.forEach(([x, y, hr]) => s.holes.push(circlePath(x, y, hr)));
  const bevel = Math.min(0.6, t / 4);
  const g = new THREE.ExtrudeGeometry(s, { depth: t - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 24 });
  g.translate(0, 0, -(t - bevel * 2) / 2);
  return mesh(g, mat);
}

function shapeSolid(s: THREE.Shape, depth: number, mat: Mat, bevel = 0.4) {
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.1, depth - bevel * 2), bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 32 });
  g.translate(0, 0, -(depth - bevel * 2) / 2);
  return mesh(g, mat);
}

function screwHead(r: number, mat: Mat) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat));
  const slot = rbox(r * 1.6, r * 0.25, r * 0.3, 0.05, MATS.nylonBlack());
  slot.position.y = r * 0.85;
  g.add(slot);
  return g;
}

function wheel(r: number, w: number, mat: Mat, hub: Mat) {
  const g = new THREE.Group();
  const tyre = mesh(new THREE.TorusGeometry(r - w * 0.35, w * 0.45, 20, 48), mat);
  g.add(tyre);
  const disc = cyl(r - w * 0.5, w * 0.8, mat, 48);
  disc.rotation.x = Math.PI / 2;
  g.add(disc);
  const axle = cyl(r * 0.25, w * 1.3, hub, 24);
  axle.rotation.x = Math.PI / 2;
  g.add(axle);
  return g;
}

function helix(radius: number, pitch: number, turns: number, wire: number, mat: Mat) {
  const pts: THREE.Vector3[] = [];
  const steps = Math.round(turns * 40);
  for (let i = 0; i <= steps; i++) {
    const a = (i / 40) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, (i / 40) * pitch, Math.sin(a) * radius));
  }
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps * 2, wire, 10), mat);
}

function tubeAlong(points: [number, number, number][], r: number, mat: Mat) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, "catmullrom", 0.2);
  return mesh(new THREE.TubeGeometry(curve, 64, r, 16), mat);
}

// ---------- archetypes ----------
function hinge(leafW: number, leafH: number, t: number, barrelR: number, mat: Mat, holes = 3, openDeg = 150) {
  const g = new THREE.Group();
  const holeList: [number, number, number][] = Array.from({ length: holes }, (_, i) => [0, -leafH / 2 + (leafH / (holes + 1)) * (i + 1), 2.3]);
  for (const side of [-1, 1]) {
    const leaf = plate(leafW, leafH, t, mat, holeList, 1.5);
    const pivot = new THREE.Group();
    leaf.position.x = side * (leafW / 2 + barrelR * 0.6);
    pivot.add(leaf);
    pivot.rotation.y = side * THREE.MathUtils.degToRad((180 - openDeg) / 2);
    g.add(pivot);
  }
  const knuckles = 5;
  for (let i = 0; i < knuckles; i++) {
    const k = cyl(barrelR, leafH / knuckles - 0.6, mat, 32);
    k.position.y = -leafH / 2 + (leafH / knuckles) * (i + 0.5);
    g.add(k);
  }
  const pin = cyl(barrelR * 0.45, leafH + 2, MATS.steel());
  g.add(pin);
  return g;
}

function lCorner(leg: number, w: number, h: number, mat: Mat, ribs = true) {
  const g = new THREE.Group();
  g.add(at(rbox(leg, h, w, 1, mat), leg / 2 - w / 2, 0, 0));
  g.add(at(rbox(w, h, leg, 1, mat), 0, 0, leg / 2 - w / 2));
  if (ribs) {
    for (let i = 1; i <= 3; i++) {
      const p = (leg / 4) * i;
      g.add(at(rbox(0.8, h + 0.6, w + 0.6, 0.3, mat), p, 0, 0));
      g.add(at(rbox(w + 0.6, h + 0.6, 0.8, 0.3, mat), 0, 0, p));
    }
  }
  return g;
}

function lockBody(w: number, h: number, d: number, body: Mat, opts: { lever?: boolean; cylinder?: boolean; knob?: boolean; plateH?: number } = {}) {
  const g = new THREE.Group();
  g.add(rbox(w, h, d, Math.min(4, d / 3), body));
  if (opts.cylinder) {
    const c = cyl(7, 4, MATS.brass(), 40);
    c.rotation.x = Math.PI / 2;
    c.position.set(0, -h * 0.22, d / 2 + 2);
    g.add(c);
    const keyway = rbox(1.2, 7, 1, 0.3, MATS.nylonBlack());
    keyway.position.set(0, -h * 0.22, d / 2 + 4.1);
    g.add(keyway);
  }
  if (opts.lever) {
    const rose = cyl(10, 4, body, 40);
    rose.rotation.x = Math.PI / 2;
    rose.position.set(0, h * 0.18, d / 2 + 2);
    g.add(rose);
    const handle = tubeAlong([[0, h * 0.18, d / 2 + 4], [0, h * 0.18, d / 2 + 16], [8, h * 0.18 - 1, d / 2 + 20], [55, h * 0.18 - 6, d / 2 + 20]], 5, body);
    g.add(handle);
  }
  if (opts.knob) {
    const k = mesh(new THREE.SphereGeometry(9, 32, 20), body);
    k.scale.set(1, 1, 0.7);
    k.position.set(0, h * 0.18, d / 2 + 7);
    g.add(k);
  }
  return g;
}

/** Wall or ceiling bracket: a fixing plate with an arm, optionally ending in a ring for a rod. */
function bracket(w: number, a: number, b: number, t: number, mat: Mat, ring?: number) {
  const g = new THREE.Group();
  g.add(at(plate(w, a, t, mat, [[0, a * 0.18, 2.6], [0, -a * 0.18, 2.6]]), 0, a / 2, 0));
  g.add(at(plate(w, b, t, mat, ring ? [] : [[0, 0, 2.6]]), 0, a - t / 2, b / 2, -Math.PI / 2, 0, 0));
  if (ring) {
    const r = mesh(new THREE.TorusGeometry(ring, 1.8, 16, 48), mat);
    r.position.set(0, a - ring - 1, b + ring - 2);
    r.rotation.y = Math.PI / 2;
    g.add(r);
  }
  return g;
}

function cylinderLock(len: number, double: boolean) {
  const g = new THREE.Group();
  const brass = MATS.brass();
  // Euro profile: circle on top of a narrow tab, extruded along X
  const s = new THREE.Shape();
  s.absarc(0, 0, 8.5, Math.PI * 1.25, Math.PI * 1.75 + Math.PI * 2, false);
  s.lineTo(5, -15);
  s.lineTo(-5, -15);
  s.closePath();
  const body = shapeSolid(s, len, brass, 0.5);
  body.rotation.y = Math.PI / 2;
  g.add(body);
  const cam = rbox(4, 12, 6, 0.8, MATS.steel());
  cam.position.set(0, -10, 0);
  g.add(cam);
  for (const side of double ? [-1, 1] : [1]) {
    const face = cyl(8.6, 0.8, MATS.stainless(), 40);
    face.rotation.z = Math.PI / 2;
    face.position.x = (side * len) / 2;
    g.add(face);
    const keyway = rbox(0.8, 1.4, 9, 0.2, MATS.nylonBlack());
    keyway.position.set(side * (len / 2 + 0.2), 0, 0);
    keyway.rotation.x = Math.PI / 2;
    g.add(keyway);
  }
  // Key in one side: blade in the keyway, bow outside
  const key = new THREE.Group();
  key.add(at(rbox(26, 7, 1.8, 0.6, MATS.stainless()), 13, 0, 0));
  key.add(at(plate(24, 24, 2, MATS.stainless(), [[0, 6, 3]], 9), 36, 0, 0));
  g.add(at(key, len / 2, 0, 0));
  return g;
}

function coil(outerR: number, innerR: number, width: number, mat: Mat, ridges = 10) {
  const g = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(outerR, outerR, width, 64, 1, true), mat);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  for (const side of [-1, 1]) {
    const face = mesh(new THREE.RingGeometry(innerR, outerR, 64), mat);
    face.rotation.y = (side * Math.PI) / 2;
    face.position.x = (side * width) / 2;
    g.add(face);
    for (let i = 1; i < ridges; i++) {
      const rr = innerR + ((outerR - innerR) * i) / ridges;
      const ring = mesh(new THREE.TorusGeometry(rr, 0.35, 6, 64), physical("#000000", 1, 0, { transparent: true, opacity: 0.25 }));
      ring.rotation.y = Math.PI / 2;
      ring.position.x = side * (width / 2 + 0.05);
      g.add(ring);
    }
  }
  const core = mesh(new THREE.CylinderGeometry(innerR, innerR, width + 2, 48, 1, true), physical("#b88d5c", 0.85, 0, { side: THREE.DoubleSide }));
  core.rotation.z = Math.PI / 2;
  g.add(core);
  return g;
}

function endCapFromRect(w: number, h: number, depth: number, mat: Mat) {
  const g = new THREE.Group();
  g.add(rbox(w, h, 2.5, 1, mat));
  g.add(at(rbox(w * 0.78, h * 0.72, depth, 0.6, mat), 0, 0, -depth / 2));
  return g;
}

// ---------- catalogue of models by product id ----------
type Builder = (fin: string) => THREE.Group;

const MODELS: Record<string, Builder> = {
  SPIGOT: () => spigotSet(),
  "SPIGOT-NEW": () => spigotSet(true),

  AU010: () => lCorner(42, 12, 22, MATS.zinc()),
  AU078: () => lCorner(30, 11, 16, MATS.zinc()),
  "AU005/2": () => lCorner(36, 9, 26, MATS.nylonGrey(), false),
  PC01: () => lCorner(22, 7.5, 13.5, MATS.nylonGrey()),
  PC02: () => lCorner(26, 10.3, 16, MATS.nylonGrey()),
  PC03: () => {
    const g = new THREE.Group();
    g.add(rbox(36, 3, 12, 1.2, MATS.nylonBlack()));
    const loop = mesh(new THREE.TorusGeometry(9, 2.2, 16, 40, Math.PI), MATS.nylonBlack());
    loop.position.set(0, 1.5, 0);
    g.add(loop);
    return g;
  },
  "AU007/1": () => {
    const g = new THREE.Group();
    g.add(at(helix(3, 1.6, 14, 0.5, MATS.stainless()), 0, 0, 0));
    g.add(tubeAlong([[3, 22.4, 0], [3, 26, 0], [0, 29, 0], [-2, 29, 0]], 0.5, MATS.stainless()));
    g.add(tubeAlong([[3, 0, 0], [3, -4, 0], [0, -7, 0], [-2, -7, 0]], 0.5, MATS.stainless()));
    g.rotation.z = Math.PI / 2;
    return g;
  },
  "AU007/2": () => {
    const s = new THREE.Shape();
    s.moveTo(-9, 0); s.lineTo(9, 0); s.lineTo(9, 12); s.lineTo(6.5, 12); s.lineTo(6.5, 2.5); s.lineTo(-6.5, 2.5); s.lineTo(-6.5, 12); s.lineTo(-9, 12); s.closePath();
    return group(shapeSolid(s, 10, MATS.clear(), 0.3));
  },
  "AU007/3": () => swivelClip(22),
  "AU007/4": () => swivelClip(34),

  "AU607/1": () => endCapFromRect(25, 45, 8, MATS.nylonBlack()),
  BL01: () => clutch(),
  "BL01/New": () => clutch(true),
  BL03: () => {
    const g = new THREE.Group();
    g.add(rbox(4.5, 6, 30, 0.8, MATS.nylonWhite()));
    for (let i = -2; i <= 2; i++) g.add(at(rbox(5.4, 6.6, 1.2, 0.3, MATS.nylonWhite()), 0, 0, i * 5));
    return g;
  },
  BL05: (fin) => {
    const m = finishMat(fin, MATS.nylonWhite);
    const g = new THREE.Group();
    const flange = cyl(22, 3, m, 64);
    flange.scale.set(1, 1, 0.62);
    g.add(flange);
    const plug = cyl(17, 16, m, 64);
    plug.scale.set(1, 1, 0.6);
    plug.position.y = -9;
    g.add(plug);
    const pin = cyl(4, 10, MATS.steel());
    pin.position.y = 6;
    g.add(pin);
    g.rotation.x = Math.PI / 2;
    return g;
  },

  AU056: () => bracket(16, 40, 34, 2.5, MATS.nylonWhite(), 11),
  AU057: () => {
    const g = new THREE.Group();
    g.add(plate(40, 22, 3, MATS.nylonWhite(), [[-12, 0, 2.4], [12, 0, 2.4]], 4));
    g.children[0].rotation.x = -Math.PI / 2;
    const stem = rbox(10, 14, 6, 1, MATS.nylonWhite());
    stem.position.y = -8;
    g.add(stem);
    const ring = mesh(new THREE.TorusGeometry(11, 1.8, 16, 48), MATS.nylonWhite());
    ring.position.y = -26;
    g.add(ring);
    return g;
  },
  AU058: () => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.TorusGeometry(11, 2, 16, 48), MATS.nylonWhite()));
    const eye = mesh(new THREE.TorusGeometry(3.5, 1.2, 12, 32), MATS.nylonWhite());
    eye.position.y = -16;
    g.add(eye);
    g.add(at(rbox(3, 4, 3, 0.6, MATS.nylonWhite()), 0, -12, 0));
    return g;
  },
  AU059: () => {
    const g = new THREE.Group();
    const sleeve = cyl(10.5, 14, MATS.nylonWhite());
    sleeve.rotation.z = Math.PI / 2;
    g.add(sleeve);
    const dome = mesh(new THREE.SphereGeometry(13, 40, 24), MATS.nylonWhite());
    dome.scale.set(0.8, 1, 1);
    dome.position.x = 12;
    g.add(dome);
    return g;
  },
  "AU087/1": () => curtainGlider(),
  "AU087/2": () => endCapFromRect(28, 20, 10, MATS.nylonWhite()),
  "AU087/3": () => bracket(18, 46, 30, 3, MATS.nylonWhite()),
  "AU087/4": () => {
    const g = new THREE.Group();
    g.add(at(plate(44, 20, 3, MATS.nylonWhite(), [[-13, 0, 2.4], [13, 0, 2.4]], 3), 0, 0, 0, -Math.PI / 2, 0, 0));
    g.add(at(rbox(30, 8, 14, 1, MATS.nylonWhite()), 0, -5, 0));
    return g;
  },
  "AU087/5": () => {
    const g = new THREE.Group();
    g.add(at(plate(70, 20, 3, MATS.nylonWhite(), [[-28, 0, 2.4], [0, 0, 2.4], [28, 0, 2.4]], 3), 0, 0, 0, -Math.PI / 2, 0, 0));
    g.add(at(rbox(26, 8, 14, 1, MATS.nylonWhite()), -18, -5, 0));
    g.add(at(rbox(26, 8, 14, 1, MATS.nylonWhite()), 18, -5, 0));
    return g;
  },
  "AU087/6": () => {
    const g = coil(26, 12, 18, MATS.tape(), 8);
    const hook = mesh(new THREE.TorusGeometry(3, 0.8, 10, 24, Math.PI * 1.4), MATS.nylonWhite());
    hook.position.set(0, -27, 18);
    g.add(hook);
    return g;
  },

  "BS-WOOL": () => pileSpool(),
  "BS-FRINGE": () => pileSpool(true),
  GK45: () => coil(45, 22, 20, MATS.rubber(), 12),

  HG01: (fin) => hinge(22, 60, 2, 3.2, finishMat(fin, MATS.zinc)),
  HG02: () => hinge(26, 75, 2, 3.6, MATS.stainless()),
  HG03: (fin) => hinge(24, 70, 3, 4.2, finishMat(fin, MATS.zinc)),
  HG04: (fin) => hinge(32, 90, 3.5, 5, finishMat(fin, MATS.zinc), 4),
  "HG/Packers": () => {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const p = plate(22, 60, 1, MATS.nylonBlack(), [[0, -16, 2.3], [0, 0, 2.3], [0, 16, 2.3]], 1.5);
      p.rotation.x = -Math.PI / 2;
      p.position.set(i * 3, i * 1.15 + 0.5, i * 2);
      p.rotation.z = i * 0.06;
      g.add(p);
    }
    return g;
  },

  KL20: () => {
    const g = new THREE.Group();
    g.add(rbox(44, 10, 14, 3, MATS.zinc()));
    const lever = rbox(22, 5, 9, 2, MATS.zinc());
    lever.position.set(6, 7, 0);
    lever.rotation.z = 0.25;
    g.add(lever);
    g.add(at(screwHead(2.4, MATS.steel()), -16, 5, 0));
    return g;
  },
  KL09: () => {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    s.absarc(0, 0, 26, 0, Math.PI, false);
    s.closePath();
    g.add(shapeSolid(s, 4, MATS.zinc(), 0.6));
    const knob = mesh(new THREE.SphereGeometry(8, 32, 20), MATS.nylonBlack());
    knob.scale.set(1, 1, 0.8);
    knob.position.set(0, 12, 6);
    g.add(knob);
    return g;
  },
  "KL09/1": () => {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    s.absarc(0, 0, 26, 0, Math.PI, false);
    s.closePath();
    g.add(shapeSolid(s, 4, MATS.zinc(), 0.6));
    g.add(tubeAlong([[-12, 10, 2], [-10, 10, 12], [10, 10, 12], [12, 10, 2]], 2.4, MATS.zinc()));
    return g;
  },
  KL22: () => {
    const g = new THREE.Group();
    g.add(at(rbox(30, 14, 12, 3, MATS.nylonBlack()), -18, 0, 0));
    g.add(at(rbox(4, 10, 8, 1, MATS.steel()), -2, 0, 0));
    g.add(at(rbox(24, 14, 6, 2, MATS.nylonBlack()), 16, 0, 0));
    g.add(at(rbox(3, 9, 7, 1, MATS.steel()), 3, 0, 0));
    return g;
  },
  DC01: (fin) => {
    const m = finishMat(fin, MATS.zinc);
    const g = new THREE.Group();
    const body = cyl(11, 150, m, 48);
    body.rotation.z = Math.PI / 2;
    g.add(body);
    const rod = cyl(3, 70, MATS.stainless());
    rod.rotation.z = Math.PI / 2;
    rod.position.x = 108;
    g.add(rod);
    g.add(at(rbox(14, 26, 10, 2, m), 148, 0, 0));
    g.add(at(rbox(14, 26, 10, 2, m), -80, 0, 0));
    const cap = mesh(new THREE.SphereGeometry(11, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), m);
    cap.rotation.z = -Math.PI / 2;
    cap.position.x = 75;
    g.add(cap);
    return g;
  },
  WR01: () => roller(18, 12, true),
  WR02: () => roller(18, 12, false),
  RL01: () => roller(26, 16, true, true),
  "RL01/1": () => {
    const g = new THREE.Group();
    g.add(rbox(28, 14, 10, 2, MATS.nylonBlack()));
    g.add(at(helix(3.5, 1.4, 9, 0.6, MATS.stainless()), 0, 7, 0));
    return g;
  },
  RL02: () => {
    const g = new THREE.Group();
    g.add(rbox(70, 24, 12, 3, MATS.nylonBlack()));
    g.add(at(wheel(10, 6, MATS.nylonWhite(), MATS.steel()), -18, -10, 0));
    g.add(at(wheel(10, 6, MATS.nylonWhite(), MATS.steel()), 18, -10, 0));
    g.add(at(screwHead(3, MATS.steel()), 0, 6, 6, Math.PI / 2, 0, 0));
    return g;
  },
  AU060: () => {
    const g = new THREE.Group();
    const m = MATS.zinc();
    const a = plate(40, 50, 3, m, [[0, 10, 2.8], [0, -10, 2.8]], 3);
    a.position.set(0, 25, 0);
    g.add(a);
    const b = plate(40, 50, 3, m, [[0, 10, 2.8], [0, -10, 2.8]], 3);
    b.rotation.x = -Math.PI / 2;
    b.position.set(0, 1.5, 25);
    g.add(b);
    const gusset = new THREE.Shape();
    gusset.moveTo(0, 0); gusset.lineTo(22, 0); gusset.lineTo(0, 22); gusset.closePath();
    const gs = shapeSolid(gusset, 3, m, 0.3);
    gs.rotation.y = -Math.PI / 2;
    gs.position.set(0, 1.5, 1.5);
    g.add(gs);
    return g;
  },

  KL01: (fin) => lockBody(70, 120, 24, finishMat(fin, MATS.zinc), { lever: true, cylinder: true }),
  KL03: (fin) => lockBody(42, 140, 22, finishMat(fin, MATS.zinc), { lever: true, cylinder: true }),
  KL16: (fin) => lockBody(60, 100, 22, finishMat(fin, MATS.zinc), { knob: true, cylinder: true }),
  KL18: (fin) => {
    const m = finishMat(fin, MATS.zinc);
    const g = new THREE.Group();
    g.add(rbox(52, 14, 18, 4, m));
    const c = cyl(5.5, 4, MATS.brass(), 32);
    c.position.set(14, 8, 0);
    g.add(c);
    g.add(at(rbox(1, 1, 5, 0.2, MATS.nylonBlack()), 14, 10.1, 0));
    g.add(at(rbox(18, 6, 10, 2, m), -12, 10, 0, 0, 0, 0.2));
    return g;
  },
  KL10: () => threePoint(false),
  KL11: () => threePoint(true),
  KL14: () => {
    const g = new THREE.Group();
    const m = MATS.zinc();
    g.add(at(plate(28, 160, 3, m, [[0, 60, 2.6], [0, -60, 2.6]], 6), -18, 0, 0));
    g.add(at(plate(28, 160, 3, m, [[0, 60, 2.6], [0, -60, 2.6]], 6), 18, 0, 0));
    g.add(at(rbox(14, 50, 16, 5, m), -18, 0, 8));
    g.add(at(rbox(14, 50, 16, 5, m), 18, 0, 8));
    return g;
  },
  "KL01/1": () => cylinderLock(60, true),
  "KL16/1": () => cylinderLock(40, false),
};

function group(...children: THREE.Object3D[]) {
  const g = new THREE.Group();
  children.forEach((c) => g.add(c));
  return g;
}

function spigotSet(newStyle = false) {
  const g = new THREE.Group();
  const m = newStyle ? MATS.stainless() : MATS.zinc();
  for (let i = 0; i < 4; i++) {
    const pin = new THREE.Group();
    pin.add(cyl(4, 30, m, 32));
    const head = cyl(7, 4, m, 32);
    head.position.y = 15;
    pin.add(head);
    if (newStyle) {
      const collar = cyl(5.5, 3, MATS.nylonBlack(), 32);
      collar.position.y = 10;
      pin.add(collar);
    }
    pin.rotation.z = Math.PI / 2;
    pin.position.set(0, 4, i * 18);
    g.add(pin);
  }
  return g;
}

function swivelClip(len: number) {
  const g = new THREE.Group();
  g.add(plate(len, 11, 1.6, MATS.clear(), [[-len / 2 + 5.5, 0, 2]], 5.5));
  g.children[0].rotation.x = -Math.PI / 2;
  g.add(at(screwHead(2.6, MATS.steel()), -len / 2 + 5.5, 0.8, 0));
  return g;
}

function clutch(newStyle = false) {
  const g = new THREE.Group();
  const housing = newStyle ? MATS.nylonBlack() : MATS.nylonWhite();
  g.add(plate(46, 62, 3, housing, [[0, 22, 2.4]], 6));
  const drum = cyl(17, 22, housing, 48);
  drum.rotation.x = Math.PI / 2;
  drum.position.z = 12;
  g.add(drum);
  // Bead chain loop hanging from the drum
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1.6, 12, 8), MATS.nylonWhite(), 70);
  const tmp = new THREE.Object3D();
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2;
    tmp.position.set(Math.cos(a) * 15, -40 + Math.sin(a) * 55, 12);
    tmp.updateMatrix();
    beads.setMatrixAt(i, tmp.matrix);
  }
  beads.castShadow = true;
  g.add(beads);
  return g;
}

function curtainGlider() {
  const g = new THREE.Group();
  g.add(rbox(14, 8, 9, 2, MATS.nylonWhite()));
  g.add(at(wheel(5, 3, MATS.nylonWhite(), MATS.steel()), -6, 4, 0));
  g.add(at(wheel(5, 3, MATS.nylonWhite(), MATS.steel()), 6, 4, 0));
  const eye = mesh(new THREE.TorusGeometry(3, 1, 12, 32), MATS.nylonWhite());
  eye.position.y = -8;
  g.add(eye);
  return g;
}

function pileSpool(fringe = false) {
  const g = new THREE.Group();
  const flange = MATS.nylonWhite();
  const W = 40;
  for (const s of [-1, 1]) {
    const f = cyl(55, 2.5, flange, 64);
    f.rotation.z = Math.PI / 2;
    f.position.x = (s * W) / 2;
    g.add(f);
  }
  const body = cyl(46, W - 2, fringe ? MATS.nylonGrey() : MATS.pile(), 64);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const hole = cyl(12, W + 4, MATS.nylonBlack(), 32);
  hole.rotation.z = Math.PI / 2;
  g.add(hole);
  return g;
}

function roller(len: number, wheelR: number, withWheel: boolean, adjust = false) {
  const g = new THREE.Group();
  g.add(rbox(len * 2.4, 12, 10, 2, MATS.nylonBlack()));
  if (withWheel) g.add(at(wheel(wheelR / 2 + 2, 5, MATS.nylonWhite(), MATS.steel()), 0, -6, 0));
  if (adjust) g.add(at(screwHead(2.6, MATS.steel()), len * 0.8, 6, 0));
  return g;
}

function threePoint(sliding: boolean) {
  const g = new THREE.Group();
  const m = MATS.stainless();
  const L = 600;
  g.add(rbox(20, L, 3, 1, m));
  g.add(at(lockBody(40, 110, 20, MATS.zinc(), { lever: !sliding, cylinder: true }), -22, 0, 0));
  for (const y of [-L / 2 + 40, L / 2 - 40]) {
    g.add(at(rbox(16, 50, 14, 3, MATS.zinc()), -16, y, 0));
    if (sliding) {
      const hook = mesh(new THREE.TorusGeometry(6, 1.8, 12, 24, Math.PI), MATS.steel());
      hook.position.set(4, y, 0);
      hook.rotation.z = -Math.PI / 2;
      g.add(hook);
    } else {
      g.add(at(rbox(14, 8, 8, 2, MATS.steel()), 6, y, 0));
    }
  }
  g.scale.setScalar(0.5);
  return g;
}

const LIE_FLAT = new Set(["KL10", "KL11", "KL14", "HG01", "HG02", "HG03", "HG04"]);

/** Build the representative 3D model for a product, or null if it has no hand-built model. */
export function buildHardware(id: string, finish: string): THREE.Group | null {
  const b = MODELS[id];
  if (!b) return null;
  const inner = b(finish);
  // Long, upright parts read better lying across the frame.
  if (LIE_FLAT.has(id)) inner.rotation.z = -Math.PI / 2;
  const outer = new THREE.Group();
  inner.scale.multiplyScalar(0.01);
  outer.add(inner);
  outer.userData.view = [1.25, 0.75, 1.15];
  return outer;
}

export const MODEL_IDS = Object.keys(MODELS);
