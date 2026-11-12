// Fig 3 · Exposure and remediation: an exposure scale.
// Each finding of the sample report is a precision weight on a weighing platform, its volume proportional to
// the midpoint of its modeled exposure. A phase selector drives lift pins that take each phase's findings off
// the pan; the dial's needle (sum of midpoints) and its lit band (low–high) fall with them.
// node explainers/exposure-scale/build.mjs [--light]

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { kitScript } from "../scripts/inline-kit.mjs";
import { privainiPage } from "../embed.mjs";
import { ES_WEIGHTS, ES_DIAL_MAX, ES_PHASES, ES_REPORT, ES_OTHER, ES_EUR_TO_USD, esExposure, esOpenAt, esReadout } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 600;
const HEIGHT = 360;
const AZIMUTH = 22;

// ---------- world layout (units ≈ px, z up) ----------
const R_TOP = 16; // the largest weight (VPPA) body radius
const RADII = ES_WEIGHTS.map((w) => R_TOP * Math.cbrt(w.mid / ES_WEIGHTS[0].mid)); // volume ∝ midpoint
const GAP_IN = 5; // between weights of one phase
const GAP_PHASE = 12; // between phases
const ROW_LEN = RADII.reduce((s, r) => s + 2 * r, 0) + ES_WEIGHTS.slice(1).reduce((s, w, i) => s + (w.phase === ES_WEIGHTS[i].phase ? GAP_IN : GAP_PHASE), 0);
const MARGIN = 8;

const PLAT_TOP = 26;
const PLAT_H = 5;
const PLATFORM = { x: -24, y: -(ROW_LEN / 2 + MARGIN), w: 48, d: ROW_LEN + 2 * MARGIN, r: 5 };
const HOUSING = { ...k.insetPlan(PLATFORM, 4), r: 3 };
const HOUSE_Z = 4;
const HOUSE_TOP = 18;
const PAD_TOP = PLAT_TOP - PLAT_H;

// weights in one row along y, phase 1 on the left of the screen (+y)
const SPOTS = [];
{
  let y = PLATFORM.y + PLATFORM.d - MARGIN;
  ES_WEIGHTS.forEach((w, i) => {
    if (i) y -= w.phase === ES_WEIGHTS[i - 1].phase ? GAP_IN : GAP_PHASE;
    y -= RADII[i];
    SPOTS.push([0, y]);
    y -= RADII[i];
  });
}
const BODY = 1.2, NECK = 0.22, KNOB = 0.4; // heights as a share of the body radius
const PIN_SHARE = 0.4;
const LIFT = 12; // how far a pin carries its weight off the pan
const PIN_REST = 3; // pin top sits this far below the pan at rest

// pillar, dial head and selector plinth at the right-hand end (−y)
const PILLAR = [-30, PLATFORM.y - 30];
const PLINTH = { x: -42, y: PILLAR[1] - 17, w: 82, d: 34, r: 3 };
const PLINTH_H = 9;
const HEAD = { x: -38, y: PILLAR[1] - 36, w: 13, d: 72, r: 3 };
const HEAD_Z = 50;
const HEAD_H = 74;
const FACE_X = HEAD.x + HEAD.w; // the head's front face
const BEZEL_X = FACE_X + 2.2;
const DIAL = [PILLAR[1], HEAD_Z + HEAD_H / 2]; // y, z of the dial centre
const DIAL_R = 29;
const TICK_R = DIAL_R - 3;
const SWEEP = (270 * Math.PI) / 180;
const KNOB_AT = [16, PILLAR[1]];
const KNOB_R = 7.5;
const KNOB_Z = PLINTH_H + 1;
const KNOB_H = 6;
const DETENT0 = (47 * Math.PI) / 180;
const DETENT_STEP = (50 * Math.PI) / 180;

const BENCH = { x: -50, y: PLINTH.y - 12, w: 106, d: PLATFORM.y + PLATFORM.d + 13 - (PLINTH.y - 12), r: 8 };
const BENCH_H = 10;
const FOOT_H = 5;

const P = k.fitProjection(
  [...k.boxCorners(BENCH, -BENCH_H - FOOT_H, 0), ...k.boxCorners(HEAD, HEAD_Z, HEAD_Z + HEAD_H + 6), [0, SPOTS[0][1], PLAT_TOP + LIFT + R_TOP * 1.85]],
  WIDTH,
  HEIGHT,
  { pad: 16, azimuth: AZIMUTH },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const byDepth = (points) => [...points].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");

// ---------- a round part on a horizontal axis (bezel, hub) ----------
function hull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  for (const p of pts.reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
// a disc of radius r on the +x face plane: axis along x from x0 to x1 (x1 faces the viewer)
function drumX(cy, cz, r, x0, x1, steps = 48) {
  const { sinA, cosA, sinE, cosE } = k.cameraOf(P);
  const ring = (x) => Array.from({ length: steps }, (_, j) => { const t = (j / steps) * Math.PI * 2; return at([x, cy - r * Math.sin(t), cz + r * Math.cos(t)]); });
  const back = ring(x0), front = ring(x1);
  const shades = [[], [], [], []];
  for (let j = 0; j < steps; j++) {
    const t = ((j + 0.5) / steps) * Math.PI * 2;
    const ny = -Math.sin(t), nz = Math.cos(t);
    if (ny * sinA * cosE + nz * sinE <= 0) continue;
    const lit = (ny * cosA * 0.7 + nz * 0.7 + 1) / 2;
    const shade = Math.min(3, Math.max(0, Math.floor(lit * 4)));
    const n = (j + 1) % steps;
    shades[shade].push(k.pathOf([back[j], back[n], front[n], front[j]], true));
  }
  const outline = k.pathOf(hull([...back, ...front]), true);
  return { fill: outline, shades: shades.map((list) => list.join("")), top: k.pathOf(front, true), crease: k.pathOf(front, true), outline };
}

// ---------- the dial face (plane x = BEZEL_X) ----------
const onFace = (u, v, x = BEZEL_X) => at([x, DIAL[0] - u, DIAL[1] + v]); // u to the viewer's right, v up
const angleOf = (value) => -SWEEP / 2 + (SWEEP * Math.min(ES_DIAL_MAX, Math.max(0, value))) / ES_DIAL_MAX;
const polar = (r, a) => [r * Math.sin(a), r * Math.cos(a)];
const faceRing = (r, steps = 72) => k.pathOf(Array.from({ length: steps }, (_, j) => onFace(...polar(r, (j / steps) * Math.PI * 2))), true);
const faceArc = (r, a0, a1, steps) => Array.from({ length: steps + 1 }, (_, j) => onFace(...polar(r, a0 + ((a1 - a0) * j) / steps)));

function needleD(value) {
  const a = angleOf(value);
  return k.pathOf([onFace(...polar(-6, a)), onFace(...polar(TICK_R, a))]);
}
function bandD(low, high) {
  if (high - low < 0.05 && high < 0.05) return "";
  const a0 = angleOf(low), a1 = angleOf(Math.max(high, low + 0.15));
  const steps = Math.max(2, Math.ceil(((a1 - a0) / SWEEP) * 60));
  const outer = faceArc(TICK_R - 0.6, a0, a1, steps);
  const inner = faceArc(TICK_R - 4.2, a1, a0, steps);
  return k.pathOf([...outer, ...inner], true);
}

// ---------- parts ----------
function bench() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BENCH, -BENCH_H - FOOT_H, BENCH_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BENCH, 20))) {
    out.push(S(k.cylinder(x, y, 7, -BENCH_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -BENCH_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BENCH, -BENCH_H, BENCH_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(BENCH, -BENCH_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(BENCH, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(BENCH, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge, ticks hanging from its back edge
  const strip = { x: BENCH.x + BENCH.w - 15, y: BENCH.y + 26, w: 7, d: BENCH.d - 52, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.y + 4, strip.y + strip.d - 4, 4, 5, strip.x + 0.8, 0.6, [1.8, 3.4], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 3.5, strip.y + 1.8, 0.6]), at([strip.x + 3.5, strip.y + strip.d - 1.8, 0.6])], { size: 0.4 }));
  return out.join("");
}

function labelPlate() {
  const plan = { x: BENCH.x + BENCH.w - 34, y: PLATFORM.y + PLATFORM.d - 30, w: 13, d: 30, r: 1.2 };
  const out = [S(k.slabOf(plan, 0, 0.8, P, 3), { tone: "mid", crease: "none" })];
  out.push(L(k.planOutline(k.insetPlan(plan, 1.6), 0.8, P, 3), { tone: "faint" }));
  const rules = [[3.6, 22], [6.4, 16], [9.2, 19]];
  out.push(rules.map(([dx, len]) => L(k.lineOnTop([plan.x + dx, plan.y + plan.d - 4], [plan.x + dx, plan.y + plan.d - 4 - len], 0.8, P), { tone: "lo", free: true })).join(""));
  out.push(D([at([plan.x + plan.w - 2.6, plan.y + 2.6, 0.8]), at([plan.x + plan.w - 2.6, plan.y + plan.d - 2.6, 0.8])], { size: 0.4 }));
  return out.join("");
}

function plinth() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLINTH, 0, PLINTH_H, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(PLINTH, 0, PLINTH_H, P, 4, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLINTH, 3), PLINTH_H, P, 4), { tone: "faint" }));
  out.push(D([[PLINTH.x + 5, PLINTH.y + 5], [PLINTH.x + 5, PLINTH.y + PLINTH.d - 5], [PLINTH.x + PLINTH.w - 5, PLINTH.y + 5], [PLINTH.x + PLINTH.w - 5, PLINTH.y + PLINTH.d - 5]].map(([x, y]) => at([x, y, PLINTH_H])), { size: 0.5 }));
  // pillar flange and its bolts
  out.push(S(k.slabOf({ x: PILLAR[0] - 9, y: PILLAR[1] - 9, w: 18, d: 18, r: 2 }, PLINTH_H, 2, P, 3, 0.4), { tone: "mid" }));
  out.push(D(k.corners({ x: PILLAR[0] - 9, y: PILLAR[1] - 9, w: 18, d: 18 }, 2.6).map(([x, y]) => at([x, y, PLINTH_H + 2])), { size: 0.45 }));
  // spirit level: a vial in a bezel, bubble centred
  const level = [PLINTH.x + PLINTH.w - 9, PLINTH.y + PLINTH.d - 9];
  out.push(S(k.cylinder(level[0], level[1], 4.2, PLINTH_H, 1.2, P, 28, 0.3), { tone: "mid" }));
  out.push(L(k.ring(level[0], level[1], 2.8, PLINTH_H + 1.2, P, 24) + k.ring(level[0], level[1], 1.1, PLINTH_H + 1.2, P, 16), { tone: "lo" }));
  out.push(D([at([level[0], level[1], PLINTH_H + 1.2])], { size: 0.7, tone: "hi" }));
  // selector: detent plate, ticks rooted on its rim ring
  const [kx, ky] = KNOB_AT;
  const rim = KNOB_R + 6;
  out.push(S(k.cylinder(kx, ky, rim + 1, PLINTH_H, 1, P, 48, 0.4), { tone: "lo" }));
  out.push(L(k.ring(kx, ky, rim, KNOB_Z, P, 48), { tone: "lo" }));
  const tick = (i, len) => { const a = DETENT0 + DETENT_STEP * i; const sx = Math.sin(a), sy = -Math.cos(a); return k.lineOnTop([kx + sx * (rim - len), ky + sy * (rim - len)], [kx + sx * rim, ky + sy * rim], KNOB_Z, P); };
  out.push(L(tick(0, 3.6), { tone: "hi" }));
  out.push(L([1, 2, 3].map((i) => tick(i, 2.6)).join(""), { tone: "mid" }));
  return out.join("");
}

function pillarAndHead() {
  const out = [];
  const post = { x: PILLAR[0] - 5.5, y: PILLAR[1] - 5.5, w: 11, d: 11, r: 2 };
  out.push(S(k.slabOf(post, PLINTH_H + 2, HEAD_Z - 3 - PLINTH_H - 2, P, 3, 0.4), { tone: "mid", inner: L([24, 36].map((z) => k.sideSeam(post, z, P, 3)).join(""), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: PILLAR[0] - 8, y: PILLAR[1] - 8, w: 16, d: 16, r: 2 }, HEAD_Z - 3, 3, P, 3, 0.4), { tone: "mid" }));
  // head box with a lid seam
  out.push(S(k.slabOf(HEAD, HEAD_Z, HEAD_H, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(HEAD, HEAD_Z + HEAD_H - 7, P, 4), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(HEAD, 2.6), HEAD_Z + HEAD_H, P, 4), { tone: "faint" }));
  // zero-adjust knob on the lid
  const zk = [HEAD.x + HEAD.w / 2, HEAD.y + 10];
  out.push(S(k.cylinder(zk[0], zk[1], 3.4, HEAD_Z + HEAD_H, 1, P, 20), { tone: "lo" }));
  out.push(S(k.cylinder(zk[0], zk[1], 2.6, HEAD_Z + HEAD_H + 1, 3.4, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(zk[0], zk[1], 2.6, HEAD_Z + HEAD_H + 1, HEAD_Z + HEAD_H + 4.4, 14, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([zk[0] - 2, zk[1]], [zk[0] + 2, zk[1]], HEAD_Z + HEAD_H + 4.4, P), { tone: "hi" }));
  // face screws
  const corner = [[-29, 29], [29, 29], [-29, -29], [29, -29]].map(([u, v]) => [FACE_X, DIAL[0] - u * 1.08, DIAL[1] + v * 1.08]);
  out.push(L(corner.map((c) => k.sideRing(c, 1.9, "x", P, 14)).join(""), { tone: "lo" }));
  out.push(D(corner.map((c) => at(c)), { size: 0.5 }));
  // bezel, dial face, scale
  out.push(S(drumX(DIAL[0], DIAL[1], DIAL_R + 3.4, FACE_X, BEZEL_X, 64), { tone: "mid" }));
  out.push(`<path class="es-face" d="${faceRing(DIAL_R)}"/>`);
  out.push(L(faceRing(DIAL_R), { tone: "lo" }));
  out.push(L(k.pathOf(faceArc(TICK_R, -SWEEP / 2, SWEEP / 2, 72)), { tone: "lo" }));
  const minor = [], major = [];
  for (let v = 0; v <= ES_DIAL_MAX; v += 2) {
    const a = angleOf(v);
    const big = v % 10 === 0;
    const d = k.pathOf([onFace(...polar(TICK_R - (big ? 3.4 : 1.8), a)), onFace(...polar(TICK_R, a))]);
    (v === 0 ? [] : big ? major : minor).push(d);
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  out.push(L(k.pathOf([onFace(...polar(TICK_R - 3.4, angleOf(0))), onFace(...polar(TICK_R, angleOf(0)))]), { tone: "hi" }));
  for (let v = 0; v <= ES_DIAL_MAX; v += 10) {
    const [u, w] = polar(TICK_R - 8.4, angleOf(v));
    out.push(k.faceTextSvg(k.sideMatrix([BEZEL_X, DIAL[0] - u], DIAL[1] + w - 1.3, P, "right"), String(v), { size: 3.6, tone: "mid", anchor: "middle" }));
  }
  out.push(k.faceTextSvg(k.sideMatrix([BEZEL_X, DIAL[0]], DIAL[1] - 13, P, "right"), "$M", { size: 3.4, tone: "lo", anchor: "middle" }));
  // glass sheen: a faint arc that fades at both ends
  out.push(k.fadeLineSvg(faceArc(DIAL_R - 1.6, -1.25, -0.45, 14), { fade: [6, 6], tone: "faint" }));
  return out.join("");
}

function housing() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(HOUSING, -2), 0, HOUSE_TOP, P)}" style="filter:blur(3px)"/>`];
  // levelling feet
  for (const [x, y] of byDepth(k.corners(HOUSING, 7))) {
    out.push(S(k.cylinder(x, y, 3.6, 0, 1, P, 20), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 2.4, 1, HOUSE_Z - 1, P, 16), { tone: "mid" }));
  }
  out.push(S(k.slabOf(HOUSING, HOUSE_Z, HOUSE_TOP - HOUSE_Z, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(HOUSING, HOUSE_Z + 4, P, 4), { tone: "faint" }) }));
  // vent slots on the front face, closed outlines
  const fx = HOUSING.x + HOUSING.w;
  const slots = [];
  for (let i = 0; i < 9; i++) {
    const y0 = HOUSING.y + 30 + i * 9;
    if (y0 + 5 > HOUSING.y + HOUSING.d - 30) break;
    slots.push(k.pathOf([[y0, 10.5], [y0 + 5, 10.5], [y0 + 5, 14.5], [y0, 14.5]].map(([y, z]) => at([fx, y, z])), true));
  }
  out.push(L(slots.join(""), { tone: "lo" }));
  return out.join("");
}

function phaseShaft() {
  // the selector's cross shaft runs from the plinth into the housing's end
  const y0 = PLINTH.y + PLINTH.d, y1 = HOUSING.y + 2;
  const rod = { x: KNOB_AT[0] - 2, y: y0 - 1, w: 4, d: y1 - y0 + 1, r: 1 };
  const out = [S(k.slabOf(rod, 3.5, 4, P, 2, 0.3), { tone: "mid", crease: "none" })];
  const mid = (y0 + y1) / 2;
  const coupling = { x: KNOB_AT[0] - 3.5, y: mid - 3, w: 7, d: 6, r: 1.2 };
  out.push(S(k.slabOf(coupling, 2, 7, P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([KNOB_AT[0], mid - 1.4, 9]), at([KNOB_AT[0], mid + 1.4, 9])], { size: 0.4 }));
  return out.join("");
}

function loadPads() {
  return byDepth(k.corners(HOUSING, 9)).map(([x, y]) => S(k.cylinder(x, y, 4, HOUSE_TOP, 0.8, P, 20), { tone: "lo" }) + S(k.cylinder(x, y, 2.8, HOUSE_TOP + 0.8, PAD_TOP - HOUSE_TOP - 0.8, P, 18), { tone: "mid" })).join("");
}

function platform() {
  const out = [S(k.slabOf(PLATFORM, PAD_TOP, PLAT_H, P, 6, 1.2), { tone: "mid", inner: L(k.sideSeam(PLATFORM, PAD_TOP + 2, P, 6), { tone: "faint" }) })];
  out.push(L(k.planOutline(k.insetPlan(PLATFORM, 3.5), PLAT_TOP, P, 6), { tone: "faint" }));
  const screws = k.corners(PLATFORM, 6.5);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.8, PLAT_TOP, P, 14)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, PLAT_TOP])), { size: 0.45 }));
  // pin holes, and a seat ring for each weight
  SPOTS.forEach(([x, y], i) => {
    out.push(L(k.ring(x, y, RADII[i] + 2.2, PLAT_TOP, P, 48), { tone: "faint" }));
    out.push(L(k.ring(x, y, RADII[i] * PIN_SHARE + 0.9, PLAT_TOP, P, 32), { tone: "lo" }));
  });
  // soft shadows under the weights; they fade as a weight is lifted
  SPOTS.forEach(([x, y], i) => {
    const r = RADII[i] + 1.5;
    out.push(`<path class="iso-halo" data-halo="${i}" d="${k.haloOf({ x: x - r, y: y - r, w: 2 * r, d: 2 * r, r }, PLAT_TOP, 0.1, P)}" style="filter:blur(2.5px)"/>`);
  });
  return out.join("");
}

function pinSvg(i, top) {
  const [x, y] = SPOTS[i];
  const r = RADII[i] * PIN_SHARE;
  const h = top - PLAT_TOP;
  if (h < 0.05) return "";
  return S(k.cylinder(x, y, r, PLAT_TOP, h, P, 24), { tone: "mid" });
}

function weight(i) {
  const [x, y] = SPOTS[i];
  const r = RADII[i];
  const z0 = PLAT_TOP;
  const hb = BODY * r, hn = NECK * r, hk = KNOB * r;
  const out = [];
  // body with a grip groove and a foot chamfer, shoulder ring, neck, knob with a turned top ring
  const bands = [z0 + hb - r * 0.28, z0 + Math.min(1.2, r * 0.09)].map((z) => k.sideArc(x, y, r, z, P, 32)).join("");
  out.push(S(k.cylinder(x, y, r, z0, hb, P, 56, Math.min(1, r * 0.06)), { tone: "hi", crease: "lo", inner: L(bands, { tone: "faint" }) }));
  out.push(L(k.ring(x, y, r * 0.66, z0 + hb, P, 40), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, r * 0.42, z0 + hb, hn, P, 32), { tone: "hi", crease: "lo" }));
  out.push(S(k.cylinder(x, y, r * 0.6, z0 + hb + hn, hk, P, 40, Math.min(0.8, r * 0.05)), { tone: "hi", crease: "lo" }));
  if (r > 8) out.push(L(k.ring(x, y, r * 0.36, z0 + hb + hn + hk, P, 32), { tone: "faint" }));
  return out.join("");
}

function knob() {
  const [x, y] = KNOB_AT;
  const out = [];
  out.push(S(k.cylinder(x, y, KNOB_R + 1.4, KNOB_Z, 1, P, 40), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, KNOB_R, KNOB_Z + 1, KNOB_H - 1, P, 40, 0.5), { tone: "mid" }));
  out.push(L(k.knurl(x, y, KNOB_R, KNOB_Z + 1.2, KNOB_Z + KNOB_H - 0.8, 30, P), { tone: "lo" }));
  return out.join("");
}

const KNOB_TOP = KNOB_Z + KNOB_H;
function pointerD(s) {
  const a = DETENT0 + DETENT_STEP * s;
  const [x, y] = KNOB_AT;
  const sx = Math.sin(a), sy = -Math.cos(a);
  return k.lineOnTop([x - sx * 2, y - sy * 2], [x + sx * (KNOB_R - 0.6), y + sy * (KNOB_R - 0.6)], KNOB_TOP, P);
}

// ---------- assemble ----------
const order = SPOTS.map((_, i) => i).sort((a, b) => depth(...SPOTS[a]) - depth(...SPOTS[b]));
const start = esExposure(esOpenAt(0));
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: `An exposure scale. Five precision weights stand in a row on a weighing platform, one for each privacy finding in Privaini's sample report for ${ES_REPORT.site}, each as large as its modeled exposure. A dial on a pillar reads the total. A phase selector raises lift pins under the weights, phase by phase, taking remediated findings off the pan, and the needle falls.`,
  body: [
    bench(),
    labelPlate(),
    plinth(),
    pillarAndHead(),
    `<path class="es-band" data-part="band" d="${bandD(start.low, start.high)}"/>`,
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleD(start.mid)}" style="stroke-width:1.2"/>`,
    S(drumX(DIAL[0], DIAL[1], 2.6, BEZEL_X, BEZEL_X + 1.6, 24), { tone: "mid" }),
    phaseShaft(),
    housing(),
    loadPads(),
    platform(),
    ...order.map((i) => `<g data-pin="${i}"></g><g class="es-weight" data-weight="${i}">${weight(i)}</g>`),
    knob(),
    `<path data-part="pointer" class="iso-line" data-tone="hi" data-free="start" d="${pointerD(0)}" style="stroke-width:1"/>`,
    S(k.cylinder(KNOB_AT[0], KNOB_AT[1], 1.1, KNOB_TOP, 0.4, P, 12), { tone: "mid", crease: "none" }),
  ],
});

const CSS = `
.iso-figure{margin:0}
.es-face{fill:var(--anatomy-top)}
.es-band{fill:var(--anatomy-lit);fill-opacity:.22;stroke:none}
.es-weight .iso-edge{transition:stroke .5s var(--anatomy-ease)}
.es-weight[data-off] .iso-edge{stroke:var(--anatomy-mid)}
.iso-stage{cursor:pointer;touch-action:pan-y}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.es-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:480px){.iso-plate .iso-stage{overflow:hidden}.iso-plate .iso-stage svg{width:124%;margin:0 -12%}}
`;

const MODEL = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");

const live = `
${MODEL}
const P = ${JSON.stringify(P)};
const SPOTS = ${JSON.stringify(SPOTS)};
const RADII = ${JSON.stringify(RADII)};
const PLAT_TOP = ${PLAT_TOP}, PIN_SHARE = ${PIN_SHARE}, LIFT = ${LIFT}, PIN_REST = ${PIN_REST};
const BEZEL_X = ${BEZEL_X}, DIAL = ${JSON.stringify(DIAL)}, TICK_R = ${TICK_R}, SWEEP = ${SWEEP};
const KNOB_AT = ${JSON.stringify(KNOB_AT)}, KNOB_R = ${KNOB_R}, KNOB_TOP = ${KNOB_TOP}, DETENT0 = ${DETENT0}, DETENT_STEP = ${DETENT_STEP};
const at = (p) => iso(p, P);
${pinSvg.toString().replace(/\bk\./g, "").replace(/\bS\(/g, "solidSvg(")}
const onFace = ${onFace.toString()};
const angleOf = ${angleOf.toString().replace(/ES_DIAL_MAX/g, "ES_DIAL_MAX")};
const polar = ${polar.toString()};
const faceArc = ${faceArc.toString()};
const needleD = ${needleD.toString().replace(/\bk\./g, "")};
const bandD = ${bandD.toString().replace(/\bk\./g, "")};
const pointerD = ${pointerD.toString().replace(/\bk\./g, "")};

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const live = document.querySelector("[data-live]");
const needle = svg.querySelector('[data-part="needle"]');
const band = svg.querySelector('[data-part="band"]');
const pointer = svg.querySelector('[data-part="pointer"]');
const weights = ES_WEIGHTS.map((_, i) => svg.querySelector('[data-weight="' + i + '"]'));
const pins = ES_WEIGHTS.map((_, i) => svg.querySelector('[data-pin="' + i + '"]'));
const halos = ES_WEIGHTS.map((_, i) => svg.querySelector('[data-halo="' + i + '"]'));
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ease = (t) => t * t * (3 - 2 * t);

let target = 0, s = 0;
const gauge = { mid: { at: 0, rate: 0 }, low: { at: 0, rate: 0 }, high: { at: 0, rate: 0 } };
{ const e = esExposure(esOpenAt(0)); for (const key of ["mid", "low", "high"]) gauge[key].at = e[key]; }
let frame = 0, last = 0, clock = 0, touring = !still.matches, visible = false, idleTimer = 0, said = "";
const pinTop = (i, phase) => PLAT_TOP - PIN_REST + (PIN_REST + LIFT) * ease(clamp(phase - (ES_WEIGHTS[i].phase - 1), 0, 1));
const tourAt = (t) => ES_TOUR[Math.floor(t / ES_TOUR_STEP) % ES_TOUR.length];

function draw(onPan) {
  pointer.setAttribute("d", pointerD(s));
  ES_WEIGHTS.forEach((_, i) => {
    const top = pinTop(i, s);
    const lift = Math.max(0, top - PLAT_TOP);
    weights[i].setAttribute("transform", lift > 0.001 ? translateAlong(P, [0, 0, lift]) : "");
    if (onPan[i]) weights[i].removeAttribute("data-off"); else weights[i].setAttribute("data-off", "");
    const html = pinSvg(i, top);
    if (pins[i].__html !== html) { pins[i].innerHTML = html; pins[i].__html = html; }
    halos[i].style.opacity = (1 - Math.min(1, lift / LIFT) * 0.75).toFixed(3);
  });
  needle.setAttribute("d", needleD(gauge.mid.at));
  band.setAttribute("d", bandD(gauge.low.at, gauge.high.at));
  // the phase word and the range both come from which weights are on the pan right now
  let phase = 0;
  while (phase < ES_PHASES && ES_WEIGHTS.every((w, i) => w.phase > phase + 1 || !onPan[i])) phase++;
  const text = esReadout(phase, esExposure(onPan));
  if (readout.textContent !== text) readout.textContent = text;
}
function describe(phase) {
  const text = esReadout(phase, esExposure(esOpenAt(phase)));
  stage.setAttribute("aria-valuenow", String(phase));
  stage.setAttribute("aria-valuetext", text);
  return text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; const next = tourAt(clock); if (next !== target) { target = next; describe(target); } }
  s = calm ? target : s + (target - s) * (1 - Math.exp(-dt / 0.45));
  if (Math.abs(target - s) < 0.002) s = target;
  const onPan = ES_WEIGHTS.map((_, i) => pinTop(i, s) <= PLAT_TOP + 1e-6);
  const want = esExposure(onPan);
  let resting = s === target;
  for (const key of ["mid", "low", "high"]) {
    const g = gauge[key];
    if (calm) { g.at = want[key]; g.rate = 0; continue; }
    const stiff = 70, drag = 9;
    for (let n = 0; n < 4; n++) { g.rate += ((want[key] - g.at) * stiff - g.rate * drag) * dt / 4; g.at += g.rate * dt / 4; }
    if (Math.abs(want[key] - g.at) < 0.005 && Math.abs(g.rate) < 0.005) { g.at = want[key]; g.rate = 0; }
    else resting = false;
  }
  draw(onPan);
  frame = visible && !(resting && !touring) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
function steer(next) {
  touring = false;
  next = clamp(Math.round(next), 0, ES_PHASES);
  if (next !== target) { target = next; const text = describe(target); if (live) live.textContent = text; }
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; clock = target * ES_TOUR_STEP; run(); }, 3600);
  run();
}
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
// the stage's width is the plan, left to right: phase 0, 1, 2, 3
const phaseAtPointer = (event) => { const box = svg.getBoundingClientRect(); return clamp(Math.floor(((event.clientX - box.left) / box.width) * (ES_PHASES + 1)), 0, ES_PHASES); };
stage.addEventListener("pointermove", (event) => { if (event.pointerType === "mouse") steer(phaseAtPointer(event)); });
stage.addEventListener("pointerdown", (event) => steer(phaseAtPointer(event)));
stage.addEventListener("keydown", (event) => {
  const from = touring ? Math.round(s) : target;
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = from + 1;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = from - 1;
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = ES_PHASES;
  if (/^[0-3]$/.test(event.key)) to = Number(event.key);
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
stage.addEventListener("focus", () => { steer(Math.round(s)); if (live && !live.textContent) live.textContent = describe(target); });
describe(0);
draw(esOpenAt(0));
`;

const caption =
  `An illustrative phased plan for Privaini's sample report on ${ES_REPORT.site} (risk ${ES_REPORT.risk}, ${ES_REPORT.findings} findings, ${ES_REPORT.jurisdictions} jurisdictions). ` +
  `Each finding is a weight whose volume is proportional to the midpoint of its modeled exposure; the needle reads the sum of midpoints, the lit band low to high. ` +
  `Phase 1 lifts VPPA video tracking ($8.9M–$22.4M) and BIPA biometric capture ($3.4M–$14.2M), Phase 2 the GDPR transfer gap (€3.5M–€12M) and CCPA health-page pixel ($2.1M–$8.4M), ` +
  `Phase 3 the six other findings: one weight for what the $${ES_REPORT.low}M–$${ES_REPORT.high}M total leaves after the four named ranges ($${ES_OTHER.low.toFixed(1)}M–$${ES_OTHER.high.toFixed(1)}M). GDPR's euros are counted at €1 = $${ES_EUR_TO_USD}.`;

const body = k.plateHtml({
  fig: "Fig 3",
  title: "Exposure and remediation",
  hint: "Hover, tap or ← → to pick a phase",
  readout: esReadout(0, start),
  keys: [
    { mark: "lit", label: "Needle and band: remaining exposure, $M" },
    { mark: "raised", label: "Weights: findings, volume ∝ exposure midpoint" },
    { mark: "flat", label: "Lift pins: each phase takes its findings off the pan" },
  ],
  caption,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Exposure scale: arrow keys or 0 to 3 pick a remediation phase" aria-valuemin="0" aria-valuemax="${ES_PHASES}" aria-valuenow="0">${svg}</div><span class="es-sr" aria-live="polite" data-live></span>`,
});

// privainiPage() injects at the first "</body>" and "</style>"; the inlined kit source contains both inside
// template literals, so escape them there ("<\/body>" is the same string in JS) to keep the injection outside the script.
const script = (kitScript() + live).replace(/<\/(body|style)/gi, "<\\/$1");
const page = k.pageHtml({ title: "Exposure and remediation", theme, body: `<style>${CSS}</style>${body}`, script });
if (theme === "light") {
  const out = join(HERE, "exposure-scale-light.html");
  writeFileSync(out, privainiPage(page, "exposure-scale"));
  console.log("wrote", out);
} else {
  const dir = join(ROOT, "public", "explainers");
  mkdirSync(dir, { recursive: true });
  const out = join(dir, "exposure-scale.html");
  writeFileSync(out, privainiPage(page, "exposure-scale"));
  console.log("wrote", out);
}
