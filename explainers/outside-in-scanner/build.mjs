// Fig 1 · Outside-in assessment.
// A gantry scanner over a sealed specimen tray. The tray is a sample company's public digital
// footprint (16 wells, one per property); a raised pin is a signal that property emits. The lit
// sensor head only ever reads from above the glass: the lid is never opened. Each raised pin it
// passes advances the findings counter, lights its category lamp and names the statute.
//
//   node explainers/outside-in-scanner/build.mjs          -> public/explainers/outside-in-scanner.html
//   node explainers/outside-in-scanner/build.mjs --light  -> explainers/outside-in-scanner/outside-in-scanner-light.html

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { privainiPage } from "../embed.mjs";
import { CATEGORIES, FACTS, FINDINGS, WELLS, lineOf } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 600;
const HEIGHT = 400;

// ---- world plan (units ~ px, z up) ---------------------------------------------------------
const PLATE = { x: -114, y: -102, w: 228, d: 218, r: 10 };
const PLATE_H = 10;
const FOOT_H = 5;

const TRAY = { x: -70, y: -70, w: 140, d: 140, r: 2 };
const TRAY_Z0 = 3;
const TRAY_TOP = 14;
const FRAME_W = 6;
const FRAME_TOP = 20; // glass sits flush with the frame top
const INNER = k.insetPlan(TRAY, FRAME_W);

const WELL_HALF = 9;
const WELL_R = 2.4;
const FLOOR = 9;
const STEM_R = 2.2;
const CAP_R = 3.9;
const CAP_H = 3;
const RAISED = 18.4; // a raised pin stands 4.4 proud of the tray, still under the glass

const RAIL_Y = 84;
const RAIL_X = 88;
const RUNNER = { x: -13, w: 26, d: 14 };
const RUNNER_Z = [6, 12];
const BEAM_Z = [48, 57];
const HX = 10.5; // head axis, ahead of the gantry centre on the beam's +x face
const HEAD = { collar: [39, 43], body: [28, 39], lens: [25.4, 28] };

// findings counter at the free +x end of the bench; its window is on the +x face (local u = -y)
const CNT = { x: 81, y: -27, w: 22, d: 54, r: 2 };
const CNT_TOP = 21;
const WIN = { x0: -12, x1: 12, z0: 6, z1: 15, r: 1.2, depth: 1.6 };

const TRAVEL = [Math.min(...WELLS.map((w) => w.x)) - HX, Math.max(...WELLS.map((w) => w.x)) - HX];

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    ...TRAVEL.flatMap((gx) => k.boxCorners({ x: gx - 6.5, y: -98, w: 13, d: 196 }, BEAM_Z[0], BEAM_Z[1] + 2)),
  ],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 45, elevation: 38 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (list, of = (p) => [p[0], p[1], 0]) => [...list].sort((a, b) => k.depthOf(of(a), P) - k.depthOf(of(b), P));
const slab = (plan, z0, z1, steps = 3, bevel = 0) => k.slabOf(plan, z0, z1 - z0, P, steps, bevel);
const screwsAt = (points, size = 0.45) => D(points.map(at), { size });
const { sinA, cosA } = k.cameraOf(P);
const LIGHT = [-sinA, cosA];
const VIEW = k.towardViewer(P);

function hull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

// A closed outline on a vertical face x = const (in y, z) or y = const (in x, z).
const onFaceX = (x, plan) => k.pathOf(k.roundedPlan(plan, 3).map(([y, z]) => at([x, y, z])), true);
const onFaceY = (y, plan) => k.pathOf(k.roundedPlan(plan, 3).map(([x, z]) => at([x, y, z])), true);

// ---- base -----------------------------------------------------------------------------------
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H + 3.5, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(screwsAt(screws.map(([x, y]) => [x, y, 0]), 0.5));

  // label plate, front left: three rule lines stand for printed text
  const label = { x: -106, y: 96, w: 26, d: 14, r: 1.2 };
  out.push(S(slab(label, 0, 0.8), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 3), { tone: "faint" }));
  out.push(L([15, 10, 12].map((w, i) =>k.lineOnTop([label.x + 4, label.y + 4 + i * 3], [label.x + 4 + w, label.y + 4 + i * 3], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(screwsAt([[label.x + label.w - 3.2, label.y + 4, 0.8], [label.x + label.w - 3.2, label.y + label.d - 4, 0.8]]));

  // travel ruler along the front, read by the gantry's index tab
  const strip = { x: -76, y: 98, w: 136, d: 7, r: 1 };
  out.push(S(slab(strip, 0, 0.6), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(screwsAt([[strip.x + 2, strip.y + 3.5, 0.6], [strip.x + strip.w - 2, strip.y + 3.5, 0.6]], 0.4));
  return out.join("");
}

function rail(y) {
  const out = [];
  const baseStrip = { x: -RAIL_X, y: y - 5, w: RAIL_X * 2, d: 10, r: 1.5 };
  out.push(S(slab(baseStrip, 0, 2, 3), { tone: "lo" }));
  out.push(S(slab({ x: -RAIL_X, y: y - 3, w: RAIL_X * 2, d: 6, r: 1 }, 2, 6, 3, 0.4), { tone: "mid" }));
  out.push(screwsAt(Array.from({ length: 9 }, (_, i) => [-80 + i * 20, y + 4, 2]), 0.4));
  for (const x of [-RAIL_X - 6, RAIL_X]) {
    out.push(S(slab({ x, y: y - 7, w: 6, d: 14, r: 1.2 }, 0, 10, 3, 0.5), { tone: "mid" }));
    out.push(screwsAt([[x + 3, y - 4, 10], [x + 3, y + 4, 10]]));
  }
  return out.join("");
}

function motor() {
  const out = [];
  const can = { x: -111, y: -RAIL_Y - 10, w: 14, d: 20, r: 2 };
  const face = can.x + can.w;
  out.push(`<path class="iso-halo" d="${k.haloOf(can, 0, 18, P)}" style="filter:blur(4px)"/>`);
  out.push(S(slab(can, 0, 18, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(can, 5, P, 4), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(can, 2.4), 18, P, 3), { tone: "faint" }));
  out.push(L(k.sideRing([face, -RAIL_Y, 11], 4.2, "x", P, 28), { tone: "lo" }));
  out.push(screwsAt([[face, -RAIL_Y - 7, 16], [face, -RAIL_Y + 7, 16], [face, -RAIL_Y - 7, 6], [face, -RAIL_Y + 7, 6]], 0.4));
  out.push(S(slab({ x: face, y: -RAIL_Y - 3, w: -RAIL_X - 6 - face, d: 6, r: 0.6 }, 8, 14, 2), { tone: "lo" }));
  return out.join("");
}

// ---- the sealed tray ------------------------------------------------------------------------
let clipCount = 0;

function wellSvg(well) {
  const plan = { x: well.x - WELL_HALF, y: well.y - WELL_HALF, w: WELL_HALF * 2, d: WELL_HALF * 2, r: WELL_R };
  const ring = k.ringOf(plan, 3);
  const open = k.onTop(ring, TRAY_TOP, P, true);
  const buckets = [[], [], [], []];
  ring.forEach(([ax, ay], index) => {
    const [bx, by] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bx - ax, by - ay) || 1;
    let [nx, ny] = [(by - ay) / length, -(bx - ax) / length];
    if (nx * (well.x - (ax + bx) / 2) + ny * (well.y - (ay + by) / 2) < 0) [nx, ny] = [-nx, -ny];
    if (nx * VIEW[0] + ny * VIEW[1] <= 1e-6) return; // this inner wall faces away
    const lit = (nx * LIGHT[0] + ny * LIGHT[1] + 1) / 2;
    const shade = Math.max(0, Math.min(3, Math.floor(lit * 4)) - 1); // inside a well: a step darker
    buckets[shade].push(k.pathOf([at([ax, ay, TRAY_TOP]), at([bx, by, TRAY_TOP]), at([bx, by, FLOOR]), at([ax, ay, FLOOR])], true));
  });
  const id = `oi-well-${clipCount++}`;
  const raised = Boolean(well.signal);
  const top = raised ? RAISED : TRAY_TOP;
  const above = raised ? k.cylinder(well.x, well.y, CAP_R + 0.8, TRAY_TOP, RAISED - TRAY_TOP + 0.6, P, 28).fill : "";
  const recess = [
    `<path class="oi-floor" d="${k.onTop(ring, FLOOR, P, true)}"/>`,
    ...buckets.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    L(k.onTop(ring, FLOOR, P, true), { tone: "faint" }),
  ].join("");
  const pin = [
    S(k.cylinder(well.x, well.y, STEM_R, FLOOR, top - CAP_H - FLOOR, P, 20), { tone: "mid", crease: "none" }),
    S(k.cylinder(well.x, well.y, CAP_R, top - CAP_H, CAP_H, P, 28, 0.35), { tone: raised ? "hi" : "mid", crease: raised ? "lo" : "faint" }),
    L(k.ring(well.x, well.y, CAP_R - 1.4, top, P, 20), { tone: raised ? "mid" : "faint" }),
    D([at([well.x, well.y, top])], { size: 0.45, tone: raised ? "hi" : "lo" }),
  ].join("");
  return [
    `<clipPath id="${id}"><path d="${open}"/>${above ? `<path d="${above}"/>` : ""}</clipPath>`,
    `<g clip-path="url(#${id})">${recess}</g>`,
    L(k.planOutline(k.insetPlan(plan, -1.3), TRAY_TOP, P, 3), { tone: "faint" }),
    L(open, { tone: "lo" }),
    `<g clip-path="url(#${id})" data-well="${well.n}">${pin}</g>`,
  ].join("");
}

const BARS = {
  back: { x: TRAY.x, y: TRAY.y, w: TRAY.w, d: FRAME_W, r: 2 },
  left: { x: TRAY.x, y: TRAY.y + FRAME_W, w: FRAME_W, d: TRAY.d - FRAME_W * 2, r: 0 },
  right: { x: TRAY.x + TRAY.w - FRAME_W, y: TRAY.y + FRAME_W, w: FRAME_W, d: TRAY.d - FRAME_W * 2, r: 0 },
  front: { x: TRAY.x, y: TRAY.y + TRAY.d - FRAME_W, w: TRAY.w, d: FRAME_W, r: 2 },
};
const bar = (plan) => S(slab(plan, TRAY_TOP, FRAME_TOP, 3, 0.4), { tone: "mid" });

function clamp(side) {
  // a hold-down clamp: a post on the plate beside the tray, a lip on the frame, a thumb screw
  const s = side;
  const post = { x: s > 0 ? 70 : -77, y: -6, w: 7, d: 12, r: 1.2 };
  const lip = { x: s > 0 ? 66 : -77, y: -6, w: 11, d: 12, r: 1.2 };
  const sx = s > 0 ? 73.5 : -73.5;
  return {
    post: S(slab(post, 0, FRAME_TOP, 3, 0.4), { tone: "mid" }),
    lip: [
      S(slab(lip, FRAME_TOP, FRAME_TOP + 3, 3, 0.4), { tone: "mid" }),
      S(k.cylinder(sx, 0, 2.8, FRAME_TOP + 3, 4.4, P, 24), { tone: "mid" }),
      L(k.knurl(sx, 0, 2.8, FRAME_TOP + 3, FRAME_TOP + 7.4, 16, P), { tone: "lo" }),
      L(k.ring(sx, 0, 1.2, FRAME_TOP + 7.4, P, 12), { tone: "lo" }),
    ].join(""),
  };
}

function trayBack() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(TRAY, 0, 1, P)}" style="filter:blur(6px)"/>`);
  for (const [x, y] of byDepth(k.corners(TRAY, 14))) out.push(S(k.cylinder(x, y, 5, 0, TRAY_Z0, P, 24), { tone: "lo" }));
  out.push(clamp(-1).post);
  out.push(S(slab(TRAY, TRAY_Z0, TRAY_TOP, 3, 0), { tone: "mid", inner: L(k.sideSeam(TRAY, 8, P, 3), { tone: "faint" }) }));
  out.push(bar(BARS.back), bar(BARS.left));
  out.push(clamp(-1).lip);
  out.push(screwsAt([[-67, -67, FRAME_TOP], [0, -67, FRAME_TOP], [67, -67, FRAME_TOP], [-67, 0, FRAME_TOP]]));
  return out.join("");
}

function wells() {
  return byDepth(WELLS, (w) => [w.x, w.y, 0]).map(wellSvg).join("");
}

function glass() {
  const out = [`<path class="oi-glass" d="${k.planOutline(INNER, FRAME_TOP, P, 3).replace(/Z?$/, "Z")}"/>`];
  // two glints at the back corner, each running from one frame edge to the other
  const glint = (s) => k.lineOnTop([INNER.x, INNER.y + s], [INNER.x + s, INNER.y], FRAME_TOP, P);
  out.push(L(glint(10) + glint(14.5), { tone: "faint" }));
  const near = (s) => k.lineOnTop([INNER.x + INNER.w, INNER.y + INNER.d - s], [INNER.x + INNER.w - s, INNER.y + INNER.d], FRAME_TOP, P);
  out.push(L(near(9), { tone: "faint" }));
  return out.join("");
}

function trayFront() {
  const out = [];
  out.push(bar(BARS.right), bar(BARS.front));
  out.push(screwsAt([[67, 0, FRAME_TOP], [-67, 67, FRAME_TOP], [0, 67, FRAME_TOP], [67, 67, FRAME_TOP], [67, -67, FRAME_TOP]]));
  // tamper seals across the lid/tray joint: intact, so the lid was never lifted
  const front = TRAY.y + TRAY.d;
  const side = TRAY.x + TRAY.w;
  for (const x of [-36, 36]) {
    out.push(S(slab({ x: x - 1.8, y: front, w: 3.6, d: 0.4, r: 0 }, 9.5, 18.5, 1), { tone: "lo", crease: "none" }));
    out.push(D([at([x, front + 0.4, 14])], { size: 0.6, tone: "mid" }));
  }
  for (const y of [-36, 36]) {
    out.push(S(slab({ x: side, y: y - 1.8, w: 0.4, d: 3.6, r: 0 }, 9.5, 18.5, 1), { tone: "lo", crease: "none" }));
    out.push(D([at([side + 0.4, y, 14])], { size: 0.6, tone: "mid" }));
  }
  // finger grips moulded into the tray body, below the lid joint
  out.push(L([-56, 56].map((x) => onFaceY(front, { x: x - 6, y: 9.6, w: 12, d: 2.6, r: 1.3 })).join(""), { tone: "lo" }));
  out.push(L([-56, 56].map((y) => onFaceX(side, { x: y - 6, y: 9.6, w: 12, d: 2.6, r: 1.3 })).join(""), { tone: "lo" }));
  // the one engraved label, on the lid's front bar
  out.push(k.faceTextSvg(k.sideMatrix([0, front], 0, P, "left"), "SEALED", { size: 3.4, tone: "lo", anchor: "middle" }).replace("<text", `<text y="-15.6"`));
  out.push(clamp(1).post, clamp(1).lip);
  return out.join("");
}

// ---- gantry ---------------------------------------------------------------------------------
function runner(y, front) {
  const out = [];
  const plan = { x: RUNNER.x, y: y - RUNNER.d / 2, w: RUNNER.w, d: RUNNER.d, r: 2 };
  out.push(S(slab(plan, RUNNER_Z[0], RUNNER_Z[1], 3, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, 8.2, P, 3), { tone: "faint" }) }));
  out.push(screwsAt([[-9, y - 4, RUNNER_Z[1]], [9, y - 4, RUNNER_Z[1]], [-9, y + 4, RUNNER_Z[1]], [9, y + 4, RUNNER_Z[1]]], 0.4));
  if (front) {
    // index tab that reads the gantry's x on the ruler
    const tab = { x: -1.6, y: y + RUNNER.d / 2, w: 3.2, d: 11, r: 0.8 };
    out.push(S(slab(tab, 6, 7, 2), { tone: "mid" }));
    out.push(L(k.lineOnTop([0, tab.y], [0, tab.y + tab.d], 7, P), { tone: "hi" }));
  }
  const post = { x: -6, y: y - 4, w: 12, d: 8, r: 1.5 };
  out.push(S(slab(post, RUNNER_Z[1], BEAM_Z[0], 3, 0.4), { tone: "mid", inner: L(k.sideSeam(post, 18, P, 3), { tone: "faint" }) }));
  out.push(screwsAt([[6, y - 2, 15], [6, y + 2, 15], [6, y - 2, 44], [6, y + 2, 44]], 0.4));
  return out.join("");
}

function beam() {
  const out = [];
  const plan = { x: -6, y: -96, w: 12, d: 192, r: 2 };
  out.push(S(slab(plan, BEAM_Z[0], BEAM_Z[1], 3, 0.6), { tone: "mid" }));
  out.push(L(onFaceX(6, { x: -82, y: 51, w: 164, d: 3, r: 1.5 }), { tone: "faint" }));
  // beam ruler for the carriage's y travel
  const strip = { x: -4.5, y: -76, w: 4.4, d: 152, r: 0.6 };
  out.push(S(slab(strip, BEAM_Z[1], BEAM_Z[1] + 0.3, 2), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.y + 4, strip.y + strip.d - 4, 4, 5, strip.x + 0.4, BEAM_Z[1] + 0.3, [1.4, 2.6], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  for (const y of [-98, 96]) out.push(S(slab({ x: -6.6, y, w: 13.2, d: 2, r: 0.8 }, BEAM_Z[0] - 0.6, BEAM_Z[1] + 0.6, 2, 0.3), { tone: "mid" }));
  out.push(screwsAt([[-3, 98, 50.5], [3, 98, 50.5], [-3, 98, 55], [3, 98, 55]], 0.4));
  return out.join("");
}

function carriage() {
  const out = [];
  const plan = { x: 6, y: -11, w: 9, d: 22, r: 1.5 };
  out.push(S(slab(plan, 43, 59, 3, 0.5), { tone: "mid" }));
  out.push(L(onFaceX(15, { x: -8.5, y: 45.5, w: 17, d: 11, r: 1.2 }), { tone: "faint" }));
  out.push(screwsAt([[15, -7, 47.5], [15, 7, 47.5], [15, -7, 54.5], [15, 7, 54.5]], 0.45));
  out.push(screwsAt([[10.5, -8, 59], [10.5, 8, 59]], 0.4));
  // the sensor head: collar, body and lens, the one lit part
  out.push(S(k.cylinder(HX, 0, 5, HEAD.collar[0], HEAD.collar[1] - HEAD.collar[0], P, 32, 0.4), { tone: "mid", inner: L(k.sideArc(HX, 0, 5, 41, P, 24), { tone: "faint" }) }));
  out.push(S(k.cylinder(HX, 0, 3.8, HEAD.body[0], HEAD.body[1] - HEAD.body[0], P, 28), { tone: "hi", lit: true, crease: "none", inner: L(k.sideArc(HX, 0, 3.8, 33.5, P, 20) + k.sideArc(HX, 0, 3.8, 31.5, P, 20), { tone: "lo" }) }));
  out.push(S(k.cylinder(HX, 0, 2.6, HEAD.lens[0], HEAD.lens[1] - HEAD.lens[0], P, 24), { tone: "hi", lit: true }));
  return out.join("");
}

function spot() {
  const lens = k.circleRing(HX, 0, 2.6, 32).map(([x, y]) => at([x, y, HEAD.lens[0]]));
  const pool = k.circleRing(HX, 0, 4.2, 40).map(([x, y]) => at([x, y, FRAME_TOP]));
  const cone = k.pathOf(hull([...lens, ...pool]), true);
  const centre = at([HX, 0, FRAME_TOP]);
  return [
    `<path class="oi-cone" d="${cone}"/>`,
    L(k.ring(HX, 0, 6.4, FRAME_TOP, P, 40), { tone: "faint" }),
    L(k.ring(HX, 0, 4.2, FRAME_TOP, P, 40), { tone: "lit" }),
    `<path class="oi-blip" data-part="blip" data-c="${centre.map((v) => v.toFixed(2)).join(",")}" d="${k.ring(HX, 0, 4.2, FRAME_TOP, P, 40)}"/>`,
  ].join("");
}

// ---- findings counter: two drum digits behind a window, eight category lamps ---------------
// A window recessed into the +x face at x = X. Local u runs along world -y (left to right as
// seen), local v along -z, which is the kit's sideMatrix "right" plane.
function recess({ x0, x1, z0, z1, r, depth }, X, back) {
  const id = `oi-clip-${clipCount++}`;
  const planeOf = (xx) => k.sideMatrix([xx, 0], 0, P, "right");
  const world = (u, z, d = 0) => at([X - d, -u, z]);
  const ring = k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 4);
  const cu = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const tops = [];
  const sides = [[], [], [], []];
  ring.forEach(([au, az], index) => {
    const [bu, bz] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bu - au, bz - az) || 1;
    let [nu, nz] = [(bz - az) / length, -(bu - au) / length];
    if (nu * (cu - (au + bu) / 2) + nz * (cz - (az + bz) / 2) < 0) [nu, nz] = [-nu, -nz];
    // inward normal in world is (0, -nu, nz): visible when it points up or toward +y (the viewer)
    if (nz <= 0 && nu >= 0) return;
    const quad = k.pathOf([world(au, az), world(bu, bz), world(bu, bz, depth), world(au, az, depth)], true);
    if (nz >= -nu) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((-nu * LIGHT[1] + 1) / 2) * 4)))].push(quad);
  });
  const shape = k.pathOf(ring.map(([u, z]) => [u, -z]), true);
  return [
    `<clipPath id="${id}"><path transform="${planeOf(X)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<g transform="${planeOf(X - depth)}"><path class="oi-window" d="${shape}"/>${back}<path class="iso-line" data-tone="faint" d="${shape}"/></g>`,
    tops.length ? `<path class="iso-top" d="${tops.join("")}"/>` : "",
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `</g>`,
    `<g transform="${planeOf(X)}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  ].join("");
}

function counter() {
  const out = [];
  const X = CNT.x + CNT.w;
  out.push(`<path class="iso-halo" d="${k.haloOf(CNT, 0, CNT_TOP, P)}" style="filter:blur(5px)"/>`);
  out.push(S(slab(CNT, 0, CNT_TOP, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(CNT, 3, P, 4), { tone: "faint" }) }));
  // two drum digits behind the window, drawn in the plane of the +x face
  const H = WIN.z1 - WIN.z0;
  const size = 6.6;
  const cells = [-5.2, 5.2];
  const back = cells
    .map((cu, index) => {
      const u0 = cu - 4.6;
      const drum = `<path class="oi-drum" d="M${u0} ${-WIN.z1}h9.2v${H}h-9.2Z"/>`;
      const shade = `<path class="oi-drum-shade" d="M${u0} ${-WIN.z1}h9.2v1.8h-9.2ZM${u0} ${-WIN.z0 - 1.8}h9.2v1.8h-9.2Z"/>`;
      const text = `<text class="oi-digit" data-digit="${index}" x="${cu}" y="${-(WIN.z0 + (H - size * 0.72) / 2)}" font-size="${size}" text-anchor="middle">0</text>`;
      return drum + text + shade;
    })
    .join("");
  const divider = `<path class="iso-line" data-tone="faint" d="M0 ${-WIN.z1}V${-WIN.z0}"/>`;
  out.push(recess(WIN, X, back + divider));
  const face = (u, z) => [X, -u, z];
  out.push(screwsAt([face(-20, 17), face(20, 17), face(-20, 4.5), face(20, 4.5)], 0.45));
  // eight category lamps on the top, one per finding category, in a row along the bench
  const strip = { x: CNT.x + 4, y: CNT.y + 4, w: 7.2, d: CNT.d - 8, r: 1.6 };
  out.push(L(k.planOutline(strip, CNT_TOP, P, 3), { tone: "faint" }));
  const step = (strip.d - 6) / (CATEGORIES.length - 1);
  CATEGORIES.forEach((_, index) => {
    const x = strip.x + strip.w / 2;
    const y = strip.y + 3 + index * step;
    out.push(S(k.cylinder(x, y, 1.9, CNT_TOP, 0.7, P, 18), { tone: "lo", crease: "none" }));
    out.push(S(k.cylinder(x, y, 1.25, CNT_TOP + 0.7, 0.8, P, 16), { tone: "mid", crease: "none" }));
    out.push(`<g data-lamp="${index}">${D([at([x, y, CNT_TOP + 1.5])], { size: 0.95, tone: "faint" })}</g>`);
  });
  const corners = [[CNT.x + CNT.w - 4, CNT.y + 4], [CNT.x + CNT.w - 4, CNT.y + CNT.d - 4]];
  out.push(L(corners.map(([x, y]) => k.ring(x, y, 1.6, CNT_TOP, P, 14)).join(""), { tone: "lo" }));
  out.push(screwsAt(corners.map(([x, y]) => [x, y, CNT_TOP]), 0.45));
  return out.join("");
}

// ---- assemble -------------------------------------------------------------------------------
const START = WELLS[0];
const g0 = START.x - HX;
const moveX = (gx) => k.translateAlong(P, [gx, 0, 0]);
const moveXY = (gx, cy) => k.translateAlong(P, [gx, cy, 0]);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A gantry scanner on a bench over a sealed specimen tray. The tray holds sixteen wells, one for each public property of a sample company; ten wells hold a raised pin, a signal that property emits, and six are flush. The lid is glass, clamped and sealed. A sensor head on the gantry travels well to well and reads only from above the glass; each raised pin it passes advances a findings counter and lights one of eight category lamps.",
  body: [
    base(),
    rail(-RAIL_Y),
    motor(),
    `<g data-move="x" transform="${moveX(g0)}">${runner(-RAIL_Y, false)}</g>`,
    trayBack(),
    wells(),
    glass(),
    trayFront(),
    rail(RAIL_Y),
    `<g data-move="x" transform="${moveX(g0)}">${runner(RAIL_Y, true)}</g>`,
    counter(),
    `<g data-move="xy" transform="${moveXY(g0, START.y)}">${spot()}</g>`,
    `<g data-move="x" transform="${moveX(g0)}">${beam()}</g>`,
    `<g data-move="xy" transform="${moveXY(g0, START.y)}">${carriage()}</g>`,
  ],
});

const CSS = `<style>
.oi-glass{fill:var(--anatomy-hi);fill-opacity:.045;stroke:none}
.oi-floor{fill:var(--anatomy-shade-0);stroke:none}
.oi-cone{fill:var(--anatomy-lit);opacity:.12;stroke:none}
.oi-blip{fill:none;stroke:var(--anatomy-lit);stroke-width:var(--anatomy-weight);opacity:0}
.oi-window{fill:var(--anatomy-shade-0);stroke:none}
.oi-drum{fill:var(--anatomy-shade-2);stroke:none}
.oi-drum-shade{fill:var(--anatomy-shade-0);opacity:.75;stroke:none}
.oi-digit{fill:var(--anatomy-hi);font-family:var(--anatomy-mono);font-weight:500}
.iso-stage{touch-action:pan-y;cursor:crosshair;outline:none}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.oi-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:560px){.iso-plate{overflow:hidden}.iso-plate .iso-svg{width:112%;margin:0 -6%}}
@media (max-width:380px){.iso-plate-corner{font-size:9.5px}}
</style>`;

const modelSource = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");

const live = `
const M = (() => { ${modelSource}
  return { WELLS, TOUR, FINDINGS, CATEGORIES, wellAt, nearestWell, lineOf, spokenOf, categoriesOf, pad2, GRID };
})();
const P = ${JSON.stringify(P)};
const HX = ${HX}, PLANE_Z = ${TRAY_TOP};
const STEP = 1.55, HOLD = 2.6, READ = 4.6;
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const movesX = [...svg.querySelectorAll('[data-move="x"]')];
const movesXY = [...svg.querySelectorAll('[data-move="xy"]')];
const blip = svg.querySelector('[data-part="blip"]');
const [bcx, bcy] = blip.dataset.c.split(",").map(Number);
const digits = [...svg.querySelectorAll("[data-digit]")];
const lamps = [...svg.querySelectorAll("[data-lamp] .iso-dots")];
const readout = document.querySelector("[data-readout]");
const status = document.querySelector("[data-status]");
const still = matchMedia("(prefers-reduced-motion: reduce)");

const head = { x: M.WELLS[0].x, y: M.WELLS[0].y };
const target = { x: head.x, y: head.y };
const logged = new Set();
let over = -2, blipAt = -10, clock = 0, frame = 0, last = 0, visible = false, idleTimer = 0, quietTimer = 0;
let touring = !still.matches, complete = false, shownCount = -1, shownLamps = "";

const tourAt = (t) => {
  const stops = M.TOUR.length;
  const index = Math.min(stops - 1, Math.floor(t / STEP));
  return { well: M.TOUR[index], done: t >= stops * STEP };
};

function log(index) {
  if (index < 0 || !M.WELLS[index].signal || logged.has(index)) return;
  logged.add(index);
}

function draw() {
  const gx = head.x - HX;
  const tx = translateAlong(P, [gx, 0, 0]);
  const txy = translateAlong(P, [gx, head.y, 0]);
  for (const node of movesX) node.setAttribute("transform", tx);
  for (const node of movesXY) node.setAttribute("transform", txy);
  if (logged.size !== shownCount) {
    shownCount = logged.size;
    const text = M.pad2(logged.size);
    digits.forEach((node, index) => (node.textContent = text[index]));
  }
  const on = M.categoriesOf(logged);
  const key = [...on].sort().join(",");
  if (key !== shownLamps) {
    shownLamps = key;
    lamps.forEach((node, index) => node.setAttribute("data-tone", on.has(index) ? "hi" : "faint"));
  }
  const age = clock - blipAt;
  if (age >= 0 && age < 1.2 && !still.matches) {
    const rise = Math.min(1, age / 0.08);
    const alpha = rise * rise * (3 - 2 * rise) * Math.exp(-Math.max(0, age - 0.08) / 0.22);
    const s = 1 + age * 1.6;
    blip.setAttribute("transform", "translate(" + bcx + " " + bcy + ") scale(" + s.toFixed(3) + ") translate(" + -bcx + " " + -bcy + ")");
    blip.style.opacity = alpha.toFixed(3);
  } else blip.style.opacity = "0";
  let text;
  if (touring && complete) text = "pass complete · " + logged.size + " findings · " + on.size + " categories";
  else if (over >= 0) text = M.lineOf(over);
  else text = "scanning · " + M.pad2(logged.size) + " logged";
  if (readout.textContent !== text) readout.textContent = text;
}

function describe() {
  const index = over >= 0 ? over : M.nearestWell(head.x, head.y);
  stage.setAttribute("aria-valuenow", String(M.WELLS[index].n));
  stage.setAttribute("aria-valuetext", M.spokenOf(index, logged.size));
}

function sense() {
  const index = M.wellAt(head.x, head.y, READ);
  if (index !== over) {
    over = index;
    if (index >= 0 && M.WELLS[index].signal) { blipAt = clock; log(index); }
    describe();
  }
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  clock += dt;
  if (touring) {
    const t = clock - tourStart;
    if (t >= M.TOUR.length * STEP + HOLD) { tourStart = clock; logged.clear(); complete = false; }
    const step = tourAt(clock - tourStart);
    complete = step.done;
    target.x = M.WELLS[step.well].x;
    target.y = M.WELLS[step.well].y;
  }
  const ease = calm ? 1 : 1 - Math.exp(-dt / 0.26);
  head.x += (target.x - head.x) * ease;
  head.y += (target.y - head.y) * ease;
  if (Math.hypot(target.x - head.x, target.y - head.y) < 0.01) { head.x = target.x; head.y = target.y; }
  sense();
  draw();
  const settled = !touring && head.x === target.x && head.y === target.y && clock - blipAt > 1.2;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
let tourStart = 0;
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };

function steer(index) {
  touring = false;
  complete = false;
  target.x = M.WELLS[index].x;
  target.y = M.WELLS[index].y;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (!still.matches) { touring = true; tourStart = clock; logged.clear(); run(); } }, 3600);
  run();
}

function worldAt(event) {
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
  const { sinA, cosA, sinE, cosE, k } = cameraOf(P);
  const u = (point.x - P.origin[0]) / k;
  const w = ((point.y - P.origin[1]) / k + PLANE_Z * cosE) / sinE;
  return [u * sinA + w * cosA, -u * cosA + w * sinA];
}

stage.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;
  const [x, y] = worldAt(event);
  const index = M.nearestWell(x, y);
  if (touring || M.WELLS[index].x !== target.x || M.WELLS[index].y !== target.y) steer(index);
  else { clearTimeout(idleTimer); idleTimer = setTimeout(() => { if (!still.matches) { touring = true; tourStart = clock; logged.clear(); run(); } }, 3600); }
});
stage.addEventListener("pointerdown", (event) => {
  const [x, y] = worldAt(event);
  steer(M.nearestWell(x, y));
});
stage.addEventListener("keydown", (event) => {
  // while touring, step from the well the reader sees; once steering, from the chosen well
  const here = touring ? M.nearestWell(head.x, head.y) : M.nearestWell(target.x, target.y);
  let col = here % M.GRID, row = Math.floor(here / M.GRID), to = null;
  if (event.key === "ArrowRight") to = row * M.GRID + Math.min(M.GRID - 1, col + 1);
  if (event.key === "ArrowLeft") to = row * M.GRID + Math.max(0, col - 1);
  if (event.key === "ArrowDown") to = Math.min(M.GRID - 1, row + 1) * M.GRID + col;
  if (event.key === "ArrowUp") to = Math.max(0, row - 1) * M.GRID + col;
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = M.WELLS.length - 1;
  if (event.key === "Escape") { clearTimeout(idleTimer); touring = !still.matches; tourStart = clock; logged.clear(); run(); event.preventDefault(); return; }
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
stage.addEventListener("focus", () => { status.textContent = stage.getAttribute("aria-valuetext") || ""; });
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
still.addEventListener?.("change", () => { if (still.matches) touring = false; run(); });

if (still.matches) {
  // one representative still: the head parked over the video page, after the first row's reads
  for (const index of M.TOUR) { if (M.WELLS[index].signal) logged.add(index); if (index === 2) break; }
  head.x = target.x = M.WELLS[2].x;
  head.y = target.y = M.WELLS[2].y;
}
sense();
draw();
`;

const body = `${CSS}${k.plateHtml({
  fig: "Fig 1",
  title: "Outside-in assessment",
  hint: "Hover a well to read it",
  readout: lineOf(0),
  keys: [
    { mark: "lit", label: "Sensor head: reads from above the glass, never enters the tray" },
    { mark: "raised", label: `Raised pin: a signal the property emits (${FINDINGS} of ${WELLS.length})` },
    { mark: "flat", label: "Flush pin: nothing fires" },
    { mark: "dim", label: `${CATEGORIES.length} lamps: one per finding category` },
  ],
  caption: `The sealed tray is a sample company's public footprint: ${WELLS.length} properties, from main site to app listing. The head never lifts the lid (no agents, credentials, internal access or questionnaires); it reads what each property emits from outside, as a regulator or plaintiff's litigator would, and names the statute each signal triggers. Observe, detect, recommend: a real assessment evaluates ${FACTS.signals} signals in ${FACTS.categories} finding categories across ${FACTS.countries} countries and ${FACTS.states} US states, and every finding is reproducible and timestamped.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Outside-in scanner: arrow keys move the sensor head from well to well; Escape resumes the tour" aria-valuemin="1" aria-valuemax="${WELLS.length}" aria-valuenow="1">${svg}</div><span class="oi-sr" aria-live="polite" data-status></span>`,
})}`;

// The live code needs only the camera from the kit. Inline just those functions (taken from the
// kit itself, so they stay in sync): the whole kit would add ~27 KB, and its pageHtml source
// contains a literal "</body>" that the shared embed helper would mistake for the page's own.
const kitBits = [
  `const AZIMUTH = ${k.AZIMUTH}, ELEVATION = ${k.ELEVATION}, RADIANS = Math.PI / 180, UNIT = Math.sqrt(1.6);`,
  `const fine = (value) => Math.round(value * 100) / 100;`,
  String(k.cameraOf),
  String(k.iso),
  String(k.axisVector),
  String(k.translateAlong),
].join("\n");
const script = (kitBits + live).replace(/<\/(body|style|script)/gi, "<\\/$1");
const page = k.pageHtml({ title: "Outside-in assessment", theme, body, script, width: 760 });
if (theme === "light") {
  const out = join(HERE, "outside-in-scanner-light.html");
  writeFileSync(out, privainiPage(page, "outside-in-scanner"));
  console.log("wrote", out);
} else {
  const dir = join(ROOT, "public", "explainers");
  mkdirSync(dir, { recursive: true });
  const out = join(dir, "outside-in-scanner.html");
  writeFileSync(out, privainiPage(page, "outside-in-scanner"));
  console.log("wrote", out);
}
