// Parametric 3D models for hardware and accessories that have no traced profile drawing
// (locks, hinges, rollers, corners, clips, brackets, curtain fittings, pile and gasket).
// Shapes and colours follow the photos in YT's price list and common Australian trade
// equivalents (Whitco/Lockwood style security door locks, die-cast corner stakes, pneumatic
// screen door closers). They are representative models, not engineering drawings.
// Dimensions are in millimetres; the group is scaled to scene units at the end.
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
  nickel: () => physical("#c6c9cc", 0.22, 1),
  brass: () => physical("#c9a54e", 0.28, 1),
  diecastBlack: () => physical("#25272a", 0.42, 0.35, { clearcoat: 0.3 }),
  nylonBlack: () => physical("#222427", 0.55),
  nylonBlue: () => physical("#2c3f8c", 0.5),
  nylonGrey: () => physical("#8a9097", 0.55),
  nylonWhite: () => physical("#ecebe6", 0.5),
  beige: () => physical("#d9cdb4", 0.55),
  clear: () => physical("#e4ecf1", 0.2, 0, { transparent: true, opacity: 0.7, clearcoat: 0.8 }),
  rubber: () => physical("#1b1b1d", 0.9),
  foam: () => physical("#5f656c", 0.95),
  steel: () => physical("#8e959c", 0.38, 1),
  pileBlack: () => physical("#1e1f21", 1),
  pileBlue: () => physical("#4d5f73", 1),
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
  mesh(new RoundedBoxGeometry(w, h, d, 4, Math.max(0.05, Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01))), mat);
const cyl = (r: number, h: number, mat: Mat, seg = 48) => mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): T => {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
};
const group = (...children: THREE.Object3D[]) => {
  const g = new THREE.Group();
  children.forEach((c) => g.add(c));
  return g;
};

function roundedRectShape(w: number, h: number, r: number, cx = 0, cy = 0) {
  const s = new THREE.Shape();
  const x = cx - w / 2, y = cy - h / 2;
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
/** A stadium-shaped slot hole, for slotted screw holes. */
function slotPath(cx: number, cy: number, len: number, r: number, vertical = true) {
  const p = new THREE.Path();
  const d = len / 2 - r;
  if (vertical) {
    p.absarc(cx, cy + d, r, 0, Math.PI, false);
    p.absarc(cx, cy - d, r, Math.PI, Math.PI * 2, false);
  } else {
    p.absarc(cx + d, cy, r, -Math.PI / 2, Math.PI / 2, false);
    p.absarc(cx - d, cy, r, Math.PI / 2, Math.PI * 1.5, false);
  }
  p.closePath();
  return p;
}

/** Extrude a 2D shape (XY plane) along Z with a soft bevel, centred on Z. */
function shapeSolid(s: THREE.Shape, depth: number, mat: Mat, bevel = 0.4) {
  const b = Math.min(bevel, depth / 4);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.1, depth - b * 2), bevelEnabled: b > 0, bevelSize: b, bevelThickness: b, bevelSegments: 2, curveSegments: 32 });
  g.translate(0, 0, -(depth - b * 2) / 2);
  return mesh(g, mat);
}

/** Flat plate in the XY plane, thickness along Z, with round holes and slots. */
function plate(w: number, h: number, t: number, mat: Mat, holes: [number, number, number][] = [], r = 2, slots: Parameters<typeof slotPath>[] = []) {
  const s = roundedRectShape(w, h, r);
  holes.forEach(([x, y, hr]) => s.holes.push(circlePath(x, y, hr)));
  slots.forEach((a) => s.holes.push(slotPath(...a)));
  return shapeSolid(s, t, mat, Math.min(0.6, t / 4));
}

function screwHead(r: number, mat: Mat) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat));
  g.add(at(rbox(r * 1.6, r * 0.25, r * 0.3, 0.05, MATS.nylonBlack()), 0, r * 0.85, 0));
  return g;
}

/** A wheel lying in the XY plane, axle along Z. */
function wheel(r: number, w: number, tyre: Mat, hub: Mat) {
  const g = new THREE.Group();
  const rim = cyl(r, w, tyre, 48);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  const groove = mesh(new THREE.TorusGeometry(r, w * 0.18, 10, 48), tyre);
  g.add(groove);
  const axle = cyl(r * 0.28, w * 1.4, hub, 24);
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

/** Butt hinge, leaves opened to `openDeg`, barrel along Y. */
function hinge(leafW: number, leafH: number, t: number, barrelR: number, mat: Mat, holes = 3, knuckles = 5, openDeg = 160, slotted = false) {
  const g = new THREE.Group();
  const holeList: [number, number, number][] = slotted ? [] : Array.from({ length: holes }, (_, i) => [0, -leafH / 2 + (leafH / (holes + 1)) * (i + 1), 2.3]);
  const slots: Parameters<typeof slotPath>[] = slotted ? Array.from({ length: holes }, (_, i) => [0, -leafH / 2 + (leafH / (holes + 1)) * (i + 1), 8, 2.2, false]) : [];
  for (const side of [-1, 1]) {
    const leaf = plate(leafW, leafH, t, mat, holeList, 1.5, slots);
    const pivot = new THREE.Group();
    leaf.position.x = side * (leafW / 2 + barrelR * 0.6);
    pivot.add(leaf);
    pivot.rotation.y = side * THREE.MathUtils.degToRad((180 - openDeg) / 2);
    g.add(pivot);
  }
  for (let i = 0; i < knuckles; i++) {
    const k = cyl(barrelR, leafH / knuckles - 0.6, mat, 32);
    k.position.y = -leafH / 2 + (leafH / knuckles) * (i + 0.5);
    g.add(k);
  }
  g.add(cyl(barrelR * 0.45, leafH + 2, MATS.steel()));
  return g;
}

/** L-shaped frame corner key with optional serrated legs (flyscreen corners, corner stakes). */
function lCorner(leg: number, w: number, h: number, mat: Mat, ribs = true) {
  const g = new THREE.Group();
  g.add(at(rbox(leg, h, w, 1, mat), leg / 2 - w / 2, 0, 0));
  g.add(at(rbox(w, h, leg, 1, mat), 0, 0, leg / 2 - w / 2));
  if (ribs) {
    for (let i = 1; i <= 4; i++) {
      const p = (leg / 5) * i + w / 2;
      g.add(at(rbox(0.9, h + 0.8, w + 0.8, 0.3, mat), p - w / 2, 0, 0));
      g.add(at(rbox(w + 0.8, h + 0.8, 0.9, 0.3, mat), 0, 0, p - w / 2));
    }
  }
  return g;
}

/** Die-cast corner stake: a solid L with tapered, toothed legs (HD security door/window corners). */
function cornerStake(leg: number, w: number, h: number) {
  const m = MATS.zinc();
  const g = new THREE.Group();
  g.add(rbox(w + 2, h + 1, w + 2, 1.5, m));
  for (const dir of [0, 1]) {
    const arm = new THREE.Group();
    arm.add(at(rbox(leg, h * 0.8, w * 0.8, 0.8, m), leg / 2 + w / 2, 0, 0));
    for (let i = 0; i < 4; i++) {
      const tooth = rbox(1, h * 0.8 + 1.2, w * 0.8 + 1.2, 0.3, m);
      tooth.position.set(w / 2 + leg * 0.3 + i * (leg * 0.16), 0, 0);
      arm.add(tooth);
    }
    arm.rotation.y = dir ? -Math.PI / 2 : 0;
    g.add(arm);
  }
  return g;
}

/** Coiled strip (pile, gasket tape, carrier tape) with visible winding rings. */
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
      const ring = mesh(new THREE.TorusGeometry(rr, 0.35, 6, 64), physical("#000000", 1, 0, { transparent: true, opacity: 0.2 }));
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

/** Euro profile lock cylinder with a key in one side; thumb turn on the other if `thumbTurn`. */
function euroCylinder(len: number, thumbTurn: boolean) {
  const g = new THREE.Group();
  const nickel = MATS.nickel();
  const s = new THREE.Shape();
  s.absarc(0, 0, 8.5, Math.PI * 1.25, Math.PI * 1.75 + Math.PI * 2, false);
  s.lineTo(5, -16);
  s.lineTo(-5, -16);
  s.closePath();
  const body = shapeSolid(s, len, nickel, 0.5);
  body.rotation.y = Math.PI / 2;
  g.add(body);
  g.add(at(rbox(4, 12, 7, 0.8, MATS.steel()), 0, -11, 0));
  const keyway = (x: number) => at(rbox(0.8, 9, 1.6, 0.2, MATS.nylonBlack()), x, 0, 0);
  g.add(keyway(len / 2 + 0.2));
  if (thumbTurn) {
    g.add(at(cyl(8, 3, nickel), -len / 2 - 1.5, 0, 0, 0, 0, Math.PI / 2));
    g.add(at(rbox(6, 22, 5, 2, nickel), -len / 2 - 6, 0, 0));
  } else {
    g.add(keyway(-len / 2 - 0.2));
  }
  const key = new THREE.Group();
  key.add(at(rbox(26, 7, 1.8, 0.6, MATS.stainless()), 13, 0, 0));
  key.add(at(plate(24, 24, 2, MATS.stainless(), [[0, 6, 3]], 9), 36, 0, 0, 0, Math.PI / 2, 0));
  g.add(at(key, len / 2, 0, 0));
  return g;
}

/**
 * Australian-style security door lock: a narrow, tall escutcheon with a lever (hinged doors)
 * or a vertical D-pull (sliding doors), and the key cylinder below the handle.
 */
function securityDoorLock(body: Mat, kind: "lever" | "pull") {
  const g = new THREE.Group();
  const W = 42, H = 200, T = 14;
  g.add(rbox(W, H, T, 6, body));
  // Key cylinder face
  g.add(at(cyl(8.5, 3, MATS.nickel(), 40), 0, -52, T / 2 + 1, Math.PI / 2, 0, 0));
  g.add(at(rbox(1.4, 8, 1, 0.2, MATS.nylonBlack()), 0, -52, T / 2 + 2.6));
  if (kind === "lever") {
    g.add(at(cyl(11, 6, body, 40), 0, 34, T / 2 + 3, Math.PI / 2, 0, 0));
    g.add(tubeAlong([[0, 34, T / 2 + 5], [0, 34, T / 2 + 20], [10, 32, T / 2 + 25], [95, 22, T / 2 + 25]], 6, body));
  } else {
    // Vertical D-pull standing proud of the plate
    g.add(tubeAlong([[0, 70, T / 2], [0, 66, T / 2 + 22], [0, 40, T / 2 + 26], [0, 0, T / 2 + 26], [0, -14, T / 2 + 22], [0, -18, T / 2]], 6, body));
    g.add(at(rbox(14, 26, 6, 2, body), 0, 52, T / 2 + 2));
  }
  g.add(at(screwHead(2.4, MATS.steel()), 0, 88, T / 2, Math.PI / 2, 0, 0));
  g.add(at(screwHead(2.4, MATS.steel()), 0, -88, T / 2, Math.PI / 2, 0, 0));
  return g;
}

/** Mortice lock with two extension boxes on a faceplate (3 point systems). */
function threePoint(sliding: boolean) {
  const g = new THREE.Group();
  const L = 600;
  g.add(rbox(22, L, 3, 1, MATS.stainless()));
  const body = MATS.diecastBlack();
  g.add(at(rbox(18, 120, 60, 3, body), 0, 0, -31));
  for (const y of [-L / 2 + 50, L / 2 - 50]) {
    g.add(at(rbox(16, 60, 34, 3, body), 0, y, -18));
    if (sliding) {
      const hook = mesh(new THREE.TorusGeometry(7, 2, 12, 24, Math.PI), MATS.steel());
      hook.position.set(0, y, 6);
      hook.rotation.y = Math.PI / 2;
      g.add(hook);
    } else {
      g.add(at(rbox(12, 14, 14, 2, MATS.steel()), 0, y, 7));
    }
  }
  g.add(at(rbox(12, 22, 14, 2, MATS.steel()), 0, 20, 7));
  return g;
}

/** Sliding window or door roller: open-sided housing with the wheel(s) showing and protruding below. */
function roller(len: number, h: number, d: number, wheels: number, wheelR: number, housing: Mat, tyre: Mat, adjust = false) {
  const g = new THREE.Group();
  const wall = 2;
  g.add(at(rbox(len, h, wall, 0.8, housing), 0, 0, -d / 2 + wall / 2));
  g.add(at(rbox(len, h * 0.45, wall, 0.8, housing), 0, h * 0.275, d / 2 - wall / 2));
  g.add(at(rbox(len, wall, d, 0.8, housing), 0, h / 2 - wall / 2, 0));
  for (const x of [-len / 2 + 4, len / 2 - 4]) g.add(at(rbox(8, h, d, 1.5, housing), x, 0, 0));
  for (let i = 0; i < wheels; i++) {
    const x = wheels === 1 ? 0 : (i - (wheels - 1) / 2) * (len * 0.45);
    g.add(at(wheel(wheelR, d - wall * 2 - 1, tyre, MATS.steel()), x, -h / 2 + wheelR * 0.6, 0));
  }
  if (adjust) g.add(at(screwHead(2.6, MATS.steel()), len / 2 - 4, 0, d / 2, Math.PI / 2, 0, 0));
  return g;
}

/** D-shaped half-round body (semicircle latches and pulls). */
function semicircle(r: number, depth: number, mat: Mat) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r, 0, Math.PI, false);
  s.closePath();
  return shapeSolid(s, depth, mat, 1.2);
}

// ---------- catalogue of models by product id ----------
type Builder = (fin: string) => THREE.Group;

const MODELS: Record<string, Builder> = {
  // Toothed die-cast corner key that joins shopfront door stiles and rails.
  SPIGOT: () => spigot(MATS.diecastBlack()),
  "SPIGOT-NEW": () => spigot(MATS.zinc()),

  AU010: () => cornerStake(46, 12, 22),
  AU078: () => cornerStake(32, 11, 16),
  "AU005/2": () => lCorner(36, 9, 26, MATS.nylonBlack(), false),
  PC01: () => lCorner(22, 7.5, 13.5, MATS.nylonBlue()),
  PC02: () => lCorner(26, 10.3, 16, MATS.nylonBlack()),

  // Flat D-loop pull tab that sits under the flyscreen spline.
  PC03: () => {
    const s = roundedRectShape(30, 40, 10);
    s.holes.push(new THREE.Path(roundedRectShape(18, 18, 6, 0, 6).getPoints(12).reverse()));
    const g = group(shapeSolid(s, 2.5, MATS.nylonBlack(), 0.5));
    g.add(at(rbox(30, 10, 1.2, 0.4, MATS.nylonBlack()), 0, -24, -0.6));
    g.rotation.x = -Math.PI / 2;
    return g;
  },
  "AU007/1": () => {
    const g = new THREE.Group();
    g.add(helix(3, 1.6, 14, 0.5, MATS.stainless()));
    g.add(tubeAlong([[3, 22.4, 0], [3, 26, 0], [0, 29, 0], [-2, 29, 0]], 0.5, MATS.stainless()));
    g.add(tubeAlong([[3, 0, 0], [3, -4, 0], [0, -7, 0], [-2, -7, 0]], 0.5, MATS.stainless()));
    g.rotation.z = Math.PI / 2;
    return g;
  },
  // Bent stainless "hat" clip that holds a spreader bar in the screen frame.
  "AU007/2": () => {
    const t = 0.8;
    const s = new THREE.Shape();
    s.moveTo(-14, 0); s.lineTo(-7, 0); s.lineTo(-7, 9); s.lineTo(7, 9); s.lineTo(7, 0); s.lineTo(14, 0);
    s.lineTo(14, t); s.lineTo(7 + t, t); s.lineTo(7 + t, 9 + t); s.lineTo(-7 - t, 9 + t); s.lineTo(-7 - t, t); s.lineTo(-14, t);
    s.closePath();
    return group(shapeSolid(s, 12, MATS.stainless(), 0.2));
  },
  "AU007/3": () => swivelClip(22, 0),
  "AU007/4": () => swivelClip(30, 4),

  "AU607/1": () => {
    const g = new THREE.Group();
    g.add(rbox(25, 45, 2.5, 1, MATS.nylonBlack()));
    g.add(at(rbox(19, 38, 8, 0.6, MATS.nylonBlack()), 0, 0, -5));
    return g;
  },
  BL01: () => clutch(MATS.nylonWhite()),
  "BL01/New": () => clutch(MATS.nylonGrey()),
  BL03: () => {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    s.absellipse(0, 0, 4.5, 3, 0, Math.PI * 2, false, 0);
    const pin = shapeSolid(s, 26, MATS.nylonWhite(), 0.5);
    g.add(pin);
    g.add(at(cyl(5.5, 2, MATS.nylonWhite(), 32), 0, 0, 0, Math.PI / 2, 0, 0));
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
    g.add(at(cyl(4, 10, MATS.steel()), 0, 6, 0));
    g.rotation.x = Math.PI / 2;
    return g;
  },

  // Curtain rod fittings (zinc die-cast in the price list photos).
  AU056: () => {
    const m = MATS.zinc();
    const g = new THREE.Group();
    g.add(plate(18, 50, 3, m, [[0, 14, 2.4], [0, -14, 2.4]], 4));
    g.add(at(rbox(10, 6, 40, 2, m), 0, 20, 20));
    g.add(at(mesh(new THREE.TorusGeometry(10, 2, 14, 40, Math.PI * 1.3), m), 0, 26, 44, 0, Math.PI / 2, -Math.PI * 0.15));
    return g;
  },
  AU057: () => {
    const m = MATS.zinc();
    const g = new THREE.Group();
    g.add(at(plate(40, 20, 3, m, [[-12, 0, 2.4], [12, 0, 2.4]], 4), 0, 0, 0, -Math.PI / 2, 0, 0));
    g.add(at(rbox(8, 26, 8, 2, m), 0, -14, 0));
    g.add(at(mesh(new THREE.TorusGeometry(10, 2, 14, 40, Math.PI * 1.3), m), 0, -36, 0, 0, Math.PI / 2, Math.PI * 0.85));
    return g;
  },
  AU058: () => {
    const g = new THREE.Group();
    g.add(rbox(22, 10, 9, 2, MATS.nylonWhite()));
    g.add(at(wheel(6, 4, MATS.nylonWhite(), MATS.steel()), -7, 6, 0));
    g.add(at(wheel(6, 4, MATS.nylonWhite(), MATS.steel()), 7, 6, 0));
    g.add(at(mesh(new THREE.TorusGeometry(6, 1, 12, 32), MATS.stainless()), 0, -11, 0));
    return g;
  },
  AU059: () => {
    const m = MATS.zinc();
    const g = new THREE.Group();
    g.add(at(cyl(11, 12, m), 0, 0, 0, 0, 0, Math.PI / 2));
    g.add(at(screwHead(2.4, MATS.steel()), 0, 11, 0));
    g.add(at(mesh(new THREE.TorusGeometry(5, 1.4, 12, 32), m), 0, -16, 0));
    return g;
  },
  "AU087/1": () => {
    const g = new THREE.Group();
    g.add(rbox(16, 9, 10, 2, MATS.nylonWhite()));
    g.add(at(wheel(5, 3, MATS.nylonWhite(), MATS.steel()), -6, 5, 0));
    g.add(at(wheel(5, 3, MATS.nylonWhite(), MATS.steel()), 6, 5, 0));
    g.add(at(mesh(new THREE.TorusGeometry(3.5, 1.1, 12, 32), MATS.nylonWhite()), 0, -9, 0));
    return g;
  },
  "AU087/2": () => {
    const g = new THREE.Group();
    g.add(rbox(28, 22, 16, 2, MATS.beige()));
    g.add(at(screwHead(2.6, MATS.steel()), 0, 11, 0));
    return g;
  },
  "AU087/3": () => {
    const g = new THREE.Group();
    const m = MATS.nylonWhite();
    g.add(plate(22, 44, 3, m, [[0, 12, 2.4], [0, -12, 2.4]], 3));
    g.add(at(rbox(14, 6, 50, 2, m), 0, 16, 25));
    g.add(at(rbox(30, 8, 16, 2, m), 0, 12, 52));
    return g;
  },
  "AU087/4": () => {
    const g = new THREE.Group();
    g.add(at(plate(36, 20, 3, MATS.nylonWhite(), [[-11, 0, 2.4], [11, 0, 2.4]], 3), 0, 0, 0, -Math.PI / 2, 0, 0));
    g.add(at(rbox(30, 8, 16, 2, MATS.nylonWhite()), 0, -5.5, 0));
    return g;
  },
  "AU087/5": () => {
    const g = new THREE.Group();
    g.add(at(plate(64, 20, 3, MATS.nylonWhite(), [[-24, 0, 2.4], [0, 0, 2.4], [24, 0, 2.4]], 3), 0, 0, 0, -Math.PI / 2, 0, 0));
    g.add(at(rbox(26, 8, 16, 2, MATS.nylonWhite()), -16, -5.5, 0));
    g.add(at(rbox(26, 8, 16, 2, MATS.nylonWhite()), 16, -5.5, 0));
    return g;
  },
  "AU087/6": () => coil(26, 12, 18, MATS.tape(), 8),

  "BS-WOOL": () => coil(55, 18, 7, MATS.pileBlack(), 14),
  "BS-FRINGE": () => coil(50, 18, 5, MATS.pileBlue(), 12),
  GK45: () => coil(48, 24, 22, MATS.foam(), 12),

  HG01: (fin) => hinge(20, 76, 2, 3.4, finishMat(fin, MATS.zinc), 3, 5),
  HG02: () => hinge(38, 75, 2, 3.8, MATS.stainless(), 3, 3, 170),
  HG03: (fin) => hinge(30, 90, 3, 4.4, finishMat(fin, MATS.zinc), 3, 3, 165, true),
  HG04: (fin) => hinge(34, 100, 4, 5.5, finishMat(fin, MATS.zinc), 4, 3, 165, true),
  "HG/Packers": () => {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const p = plate(18, 90, 1, MATS.zinc(), [], 1.5, [
        [0, -28, 8, 2.2, true],
        [0, 0, 8, 2.2, true],
        [0, 28, 8, 2.2, true],
      ]);
      g.add(at(p, i * 5, i * 1.2 + 0.5, i * 3, -Math.PI / 2, 0, i * 0.08));
    }
    return g;
  },

  // Keyed sliding window lock: black rounded body with a cylinder on top.
  KL20: () => {
    const g = new THREE.Group();
    g.add(rbox(48, 14, 20, 6, MATS.nylonBlack()));
    g.add(at(cyl(6, 3, MATS.nickel(), 32), 4, 7.5, 0));
    g.add(at(rbox(1.2, 1, 6, 0.2, MATS.nylonBlack()), 4, 9.1, 0));
    return g;
  },
  // Semicircle screen door latch: inside latch with a small lever plus the outside pull.
  KL09: () => {
    const g = new THREE.Group();
    g.add(semicircle(26, 12, MATS.nylonBlack()));
    g.add(at(rbox(20, 6, 6, 2, MATS.nylonBlack()), 0, 12, 9));
    g.add(at(semicircle(26, 8, MATS.nylonBlack()), 0, -42, 0));
    return g;
  },
  "KL09/1": () => {
    const g = new THREE.Group();
    g.add(semicircle(30, 14, MATS.nylonBlack()));
    g.add(at(semicircle(20, 8, MATS.nylonGrey()), 0, 2, 5));
    return g;
  },
  KL22: () => {
    const g = new THREE.Group();
    g.add(at(rbox(46, 14, 12, 3, MATS.nylonBlack()), -10, 0, 0));
    g.add(at(rbox(6, 10, 8, 1, MATS.steel()), 15.5, 0, 0));
    g.add(at(plate(12, 40, 2, MATS.stainless(), [[0, 13, 2], [0, -13, 2]], 2), 34, 0, 0, 0, Math.PI / 2, 0));
    return g;
  },
  // Pneumatic screen door closer: tube, piston rod and the two mounting brackets.
  DC01: (fin) => {
    const m = finishMat(fin, MATS.nylonBlack);
    const g = new THREE.Group();
    g.add(at(cyl(12, 230, m, 48), 0, 0, 0, 0, 0, Math.PI / 2));
    g.add(at(cyl(12.6, 8, m, 48), -115, 0, 0, 0, 0, Math.PI / 2));
    g.add(at(cyl(3.2, 110, MATS.stainless()), 170, 0, 0, 0, 0, Math.PI / 2));
    g.add(at(rbox(6, 3, 14, 1, MATS.steel()), 150, 0, 0));
    for (const x of [-128, 232]) {
      g.add(at(plate(18, 36, 3, m, [[0, 10, 2], [0, -10, 2]], 3), x, 0, -16));
      g.add(at(rbox(10, 10, 16, 2, m), x, 0, -6));
    }
    return g;
  },
  WR01: () => roller(46, 14, 12, 1, 9, MATS.nylonBlack(), MATS.nylonWhite()),
  WR02: () => roller(46, 14, 12, 0, 9, MATS.nylonBlack(), MATS.nylonWhite()),
  RL01: () => roller(56, 28, 16, 1, 12, MATS.nylonBlack(), MATS.nylonWhite(), true),
  "RL01/1": () => {
    const g = new THREE.Group();
    g.add(rbox(30, 14, 12, 2, MATS.nylonBlack()));
    g.add(at(helix(3.5, 1.4, 9, 0.6, MATS.stainless()), 0, 7, 0));
    return g;
  },
  // Tandem door roller: zinc U-carriage with two wheels and an adjuster.
  RL02: () => roller(90, 18, 16, 2, 11, MATS.zinc(), MATS.brass(), true),
  // Flat steel strap bracket with slots and holes.
  AU060: () => group(plate(26, 120, 3, MATS.zinc(), [[0, 45, 3], [0, -45, 3]], 3, [
    [0, 18, 16, 3, true],
    [0, -18, 16, 3, true],
  ])),

  KL01: (fin) => securityDoorLock(finishMat(fin, MATS.nylonBlack), "lever"),
  KL03: (fin) => securityDoorLock(finishMat(fin, MATS.nylonBlack), "pull"),
  KL16: (fin) => securityDoorLock(finishMat(fin, MATS.nylonBlack), "lever"),
  // Slim keyed sliding window lock.
  KL18: (fin) => {
    const m = finishMat(fin, MATS.zinc);
    const g = new THREE.Group();
    g.add(rbox(70, 12, 14, 4, m));
    g.add(at(rbox(14, 13, 15, 4, MATS.nylonBlack()), 30, 0, 0));
    g.add(at(cyl(4.5, 2, MATS.nickel(), 32), -18, 6.5, 0));
    g.add(at(rbox(1, 1, 4, 0.2, MATS.nylonBlack()), -18, 7.6, 0));
    return g;
  },
  KL10: () => threePoint(false),
  KL11: () => threePoint(true),
  // Pair of D-pull handles for double-opening sliding doors.
  KL14: () => {
    const g = new THREE.Group();
    const m = MATS.nylonBlack();
    for (const side of [-1, 1]) {
      const h = new THREE.Group();
      h.add(rbox(30, 150, 10, 5, m));
      h.add(tubeAlong([[0, 60, 5], [0, 56, 30], [0, 30, 36], [0, -30, 36], [0, -56, 30], [0, -60, 5]], 7, m));
      h.position.x = side * 28;
      h.rotation.y = side * 0.35;
      g.add(h);
    }
    return g;
  },
  "KL01/1": () => euroCylinder(60, false),
  "KL16/1": () => euroCylinder(45, true),
};

function spigot(mat: Mat) {
  // Outline from the price list photo: a spine with two locating pins on the left, and two
  // serrated arms running right that curl into round hooks.
  const g = new THREE.Group();
  const T = 10;
  g.add(at(rbox(8, 40, T, 1, mat), 4, 0, 0));
  for (const y of [-16, 16]) {
    g.add(at(rbox(34, 7, T, 1, mat), 21, y, 0));
    for (let i = 0; i < 4; i++) g.add(at(rbox(2, 2.4, T, 0.4, mat), 12 + i * 6, y + Math.sign(y) * 4, 0));
    const hook = mesh(new THREE.TorusGeometry(5, 2.6, 16, 32, Math.PI * 1.5), mat);
    hook.scale.z = T / 5.2;
    g.add(at(hook, 41, y - Math.sign(y) * 3.5, 0, 0, 0, y > 0 ? -Math.PI * 0.25 : Math.PI * 0.75));
    g.add(at(cyl(2.2, 12, MATS.steel(), 20), -6, y * 0.55, 0, 0, 0, Math.PI / 2));
  }
  return g;
}

function swivelClip(len: number, offset: number) {
  const g = new THREE.Group();
  const m = MATS.clear();
  g.add(at(plate(12, 12, 1.6, m, [[0, 0, 2]], 5), 0, 0, 0, -Math.PI / 2, 0, 0));
  if (offset) {
    g.add(at(rbox(1.6, offset + 1.6, 10, 0.4, m), 6, offset / 2, 0));
    g.add(at(rbox(len - 12, 1.6, 10, 0.6, m), 6 + (len - 12) / 2, offset, 0));
  } else {
    g.add(at(rbox(len - 12, 1.6, 10, 0.6, m), 6 + (len - 12) / 2, 0, 0));
  }
  g.add(at(screwHead(2.6, MATS.steel()), 0, 0.8, 0));
  return g;
}

function clutch(housing: Mat) {
  const g = new THREE.Group();
  g.add(plate(46, 62, 3, housing, [[0, 22, 2.4]], 6));
  const drum = cyl(17, 22, housing, 48);
  drum.rotation.x = Math.PI / 2;
  drum.position.z = 12;
  g.add(drum);
  g.add(at(cyl(12, 26, housing, 6), 0, 0, 14, Math.PI / 2, 0, 0));
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

// Long, upright parts read better lying across the frame.
const LIE_FLAT = new Set(["KL10", "KL11", "HG01", "HG02", "HG03", "HG04", "AU060"]);

/** Build the representative 3D model for a product, or null if it has no hand-built model. */
export function buildHardware(id: string, finish: string): THREE.Group | null {
  const b = MODELS[id];
  if (!b) return null;
  const inner = b(finish);
  if (LIE_FLAT.has(id)) inner.rotation.z = -Math.PI / 2;
  const outer = new THREE.Group();
  inner.scale.multiplyScalar(0.01);
  outer.add(inner);
  outer.userData.view = [1.25, 0.75, 1.15];
  return outer;
}

export const MODEL_IDS = Object.keys(MODELS);
