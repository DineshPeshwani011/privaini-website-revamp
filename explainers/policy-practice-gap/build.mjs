// Fig 2 · Policy vs practice. A comparator bench: a gauge head on a slide travels a
// rail behind four trays. Each tray pairs a round master (what the privacy policy
// declares) with a square block (what is observed from outside). The dial is zeroed
// on the master, so the needle reads the difference: the policy–practice gap.
//
//   node explainers/policy-practice-gap/build.mjs           -> public/explainers/policy-practice-gap.html
//   node explainers/policy-practice-gap/build.mjs --light   -> explainers/policy-practice-gap/policy-practice-gap-light.html
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { kitScript } from "../scripts/inline-kit.mjs";
import { privainiPage } from "../embed.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const theme = process.argv.includes("--light") ? "light" : "dark";
const OUT = theme === "light" ? join(HERE, "policy-practice-gap-light.html") : join(ROOT, "public", "explainers", "policy-practice-gap.html");

const WIDTH = 600;
const HEIGHT = 340;
const AZIMUTH = 58;
// The dial angle (radialTicks convention: 0 toward −y, clockwise from above) that points straight up on screen.
const THETA0 = -((90 - AZIMUTH) * Math.PI) / 180;

// ── World layout (x along the row, y toward the viewer, z up) ─────────────────
const PLATE = { x: -104, y: -56, w: 208, d: 78, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const RAIL = { x: -90, y: -46, w: 180, d: 8, r: 1.2 };
const RAIL_H = 4;
const STOP_L = { x: -96, y: -48, w: 6, d: 12, r: 1.2 };
const STOP_R = { x: 90, y: -48, w: 6, d: 12, r: 1.2 };
const STOP_H = 10;
const SCALE = { x: -82, y: -29.6, w: 164, d: 5.6, r: 1 };

const COL_Y = -42;
const SLIDE = { x: -15, y: -50, w: 30, d: 16, r: 2.5 };
const SLIDE_TOP = RAIL_H + 7;
const CLAMP_Z = 40;
const COL_TOP = 68;
const DIAL_R = 17;
const DIAL_Z = 42;
const DIAL_H = 10;
const DIAL_TOP = DIAL_Z + DIAL_H;
const ARM_Z = 44;
const HOUSING_Z = 29;
// Plunger stem above its contact: over the whole stroke (REST_Z to the tallest block)
// its top stays inside the housing and never rises past the dial top.
const STEM = 22;
{
  const tallest = Math.max(...M.PAIRS.map((pair) => M.topOf(Math.max(pair.declared, pair.observed))));
  if (M.REST_Z + STEM < HOUSING_Z + 0.4 || tallest + STEM > DIAL_Z + DIAL_H || tallest > HOUSING_Z - 2) throw new Error("plunger stroke does not fit the housing");
}

const TRAY_D = 24;
const START = M.blockX(0); // the page opens on the first gap

const fit = [
  ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
  ...[M.REACH[0], M.REACH[1]].flatMap((gx) => [
    [gx - DIAL_R - 2, 0, DIAL_TOP],
    [gx + DIAL_R + 7, 0, DIAL_TOP],
    [gx, -DIAL_R, DIAL_TOP],
    [gx, DIAL_R, DIAL_Z],
    [gx, COL_Y, COL_TOP + 2],
    [gx + 15, COL_Y, CLAMP_Z + 12],
  ]),
];
const P = k.fitProjection(fit, WIDTH, HEIGHT, { pad: 16, azimuth: AZIMUTH });

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const knob = (x, y, r, z, h, count) => S(k.cylinder(x, y, r, z, h, P, 24), { tone: "mid" }) + L(k.knurl(x, y, r, z, z + h, count, P), { tone: "lo" });

// ── Plate on feet, groove, screws, label plate ───────────────────────────────
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -4, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // Name plate on the front face: the one engraved label says this is a sample entity.
  const front = PLATE.y + PLATE.d;
  const label = { x: 38, y: front, w: 48, d: 0.6, r: 0.2 };
  out.push(S(k.slabOf(label, -9.6, 7.2, P, 2), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.sideMatrix([label.x + label.w / 2, front + 0.6], -7.1, P, "left"), "SAMPLE ENTITY", { size: 3.1, tone: "mid", anchor: "middle" }));
  out.push(D([at([label.x + 2.6, front + 0.6, -6]), at([label.x + label.w - 2.6, front + 0.6, -6])], { size: 0.45 }));
  return out.join("");
}

// ── Rail, end stops and the travel scale ─────────────────────────────────────
function rail() {
  const out = [];
  out.push(S(k.slabOf(SCALE, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(SCALE.x + 2, SCALE.x + SCALE.w - 2, 4, 5, SCALE.y + 0.7, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([SCALE.x + 1, SCALE.y + 3, 0.6]), at([SCALE.x + SCALE.w - 1, SCALE.y + 3, 0.6])], { size: 0.4 }));
  out.push(S(k.slabOf(RAIL, 0, RAIL_H, P, 3, 0.4), { tone: "mid" }));
  out.push(D([-80, -60, -40, -20, 0, 20, 40, 60, 80].map((x) => at([x, RAIL.y + RAIL.d / 2, RAIL_H])), { size: 0.42 }));
  return out.join("");
}

function stop(plan, inner) {
  // Rubber bumper on the face toward the slide: in front of the left stop, behind the right one.
  const bx = inner > 0 ? plan.x + plan.w : plan.x - 1.6;
  const bumper = S(k.slabOf({ x: bx, y: COL_Y - 2.5, w: 1.6, d: 5, r: 0.6 }, 5, 3.4, P, 2), { tone: "lo", crease: "none" });
  const body = S(k.slabOf(plan, 0, STOP_H, P, 3, 0.5), { tone: "mid" });
  const screws = D([at([plan.x + plan.w / 2, plan.y + 2.6, STOP_H]), at([plan.x + plan.w / 2, plan.y + plan.d - 2.6, STOP_H])], { size: 0.45 });
  return inner > 0 ? body + screws + bumper : bumper + body + screws;
}

// ── The gauge head, built at x = 0 and moved as two groups ───────────────────
// Back group: slide, index pointer, column, clamp and arm (all behind the row).
function gaugeBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(SLIDE, 3), RAIL_H, 0.1, P)}" style="filter:blur(4px)"/>`];
  // Front skirt (gib) under the slide's front edge, with its screws.
  const skirt = { x: -14, y: SLIDE.y + SLIDE.d - 1.6, w: 28, d: 1.6, r: 0.5 };
  out.push(S(k.slabOf(skirt, 1.2, RAIL_H - 1.2, P, 2), { tone: "mid", crease: "none" }));
  out.push(D([at([-10, skirt.y + skirt.d, 2.6]), at([10, skirt.y + skirt.d, 2.6])], { size: 0.4 }));
  // Index pointer reaching over the scale.
  const pointer = { x: -1.2, y: skirt.y + skirt.d, w: 2.4, d: 6.4, r: 0.5 };
  out.push(S(k.slabOf(pointer, 2, 0.8, P, 2), { tone: "mid" }));
  out.push(L(k.lineOnTop([0, pointer.y], [0, pointer.y + pointer.d], 2.8, P), { tone: "hi" }));
  // Slide body and its gib screws.
  out.push(S(k.slabOf(SLIDE, RAIL_H, SLIDE_TOP - RAIL_H, P, 4, 0.6), { tone: "mid" }));
  out.push(D([[-11, SLIDE.y + 3], [11, SLIDE.y + 3], [-11, SLIDE.y + SLIDE.d - 3], [11, SLIDE.y + SLIDE.d - 3]].map(([x, y]) => at([x, y, SLIDE_TOP])), { size: 0.45 }));
  // Lock screw on the slide front.
  out.push(S(k.slabOf({ x: 9, y: SLIDE.y + SLIDE.d, w: 2.8, d: 2.6, r: 0.8 }, 6, 3, P, 2), { tone: "mid", crease: "none" }));
  out.push(knob(10.4, SLIDE.y + SLIDE.d + 4.2, 2.5, 5, 5.6, 18));
  // Column: collar, lower post, clamp, upper post, cap.
  out.push(S(k.cylinder(0, COL_Y, 6.5, SLIDE_TOP, 3.5, P, 32, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(0, COL_Y, 3.6, SLIDE_TOP + 3.5, CLAMP_Z - SLIDE_TOP - 3.5, P, 28), { tone: "mid", crease: "none", inner: L([28, 42].map((z) => k.sideArc(0, COL_Y, 3.6, z, P, 16)).join(""), { tone: "faint" }) }));
  const clamp = { x: -7.5, y: COL_Y - 7.5, w: 15, d: 15, r: 2.5 };
  out.push(S(k.slabOf(clamp, CLAMP_Z, 12, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(clamp, CLAMP_Z + 6, P, 4), { tone: "faint" }) }));
  out.push(S(k.cylinder(0, COL_Y, 3.6, CLAMP_Z + 12, COL_TOP - CLAMP_Z - 12, P, 28), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(0, COL_Y, 4.3, COL_TOP, 2.2, P, 28, 0.4), { tone: "mid" }));
  // Clamp thumb screw on the right face.
  out.push(S(k.slabOf({ x: clamp.x + clamp.w, y: COL_Y - 1.4, w: 2.6, d: 2.8, r: 0.8 }, CLAMP_Z + 2.5, 4, P, 2), { tone: "mid", crease: "none" }));
  out.push(knob(clamp.x + clamp.w + 4.4, COL_Y, 2.6, CLAMP_Z + 1.5, 6, 18));
  // Arm to the dial's back lug.
  const arm = { x: -3, y: clamp.y + clamp.d, w: 6, d: -DIAL_R - 2 - (clamp.y + clamp.d), r: 1.5 };
  out.push(S(k.slabOf(arm, ARM_Z, 4, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([0, arm.y + 4, ARM_Z + 4]), at([0, arm.y + arm.d - 4, ARM_Z + 4])], { size: 0.45 }));
  return out.join("");
}

// Top group: spindle housing, back lug, dial with its bezel, crown, needle.
function needleAt(turn) {
  const a = THETA0 + turn * Math.PI * 2;
  return k.lineOnTop([-Math.sin(a) * 3.4, Math.cos(a) * 3.4], [Math.sin(a) * (DIAL_R - 3.5), -Math.cos(a) * (DIAL_R - 3.5)], DIAL_TOP + 0.2, P);
}
function bezelAt(turn) {
  const from = THETA0 + turn * Math.PI * 2;
  const ticks = k.radialTicks(0, 0, DIAL_R - 3, 50, 5, DIAL_TOP, [1.3, 2.8], P, from);
  const on = (a, r) => k.iso([Math.sin(a) * r, -Math.cos(a) * r, DIAL_TOP], P);
  const mark = [on(from - 0.085, DIAL_R - 0.9), on(from + 0.085, DIAL_R - 0.9), on(from, DIAL_R - 2.9)];
  const zero = "M" + mark.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") + "Z";
  return { minor: ticks.minor, major: ticks.major, zero };
}

function gaugeTop(tipZ, zeroFlows) {
  const out = [];
  out.push(S(k.cylinder(0, 0, 3, HOUSING_Z, DIAL_Z - HOUSING_Z, P, 24), { tone: "mid", crease: "none", inner: L(k.sideArc(0, 0, 3, HOUSING_Z + 1.6, P, 12), { tone: "lo" }) }));
  out.push(S(k.cylinder(0, 0, 4.4, HOUSING_Z + 2.4, 2.4, P, 6), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -4.5, y: -DIAL_R - 4, w: 9, d: 6, r: 1.2 }, DIAL_Z + 1, 7, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, DIAL_R, DIAL_Z, DIAL_H, P, 72, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(0, 0, DIAL_R, DIAL_TOP - 3.4, DIAL_TOP, 84, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(0, 0, DIAL_R, DIAL_TOP - 3.4, P, 40), { tone: "faint" }));
  out.push(L(k.ring(0, 0, DIAL_R - 2.2, DIAL_TOP, P, 72), { tone: "lo" }));
  const bezel = bezelAt(M.bezelTurn(zeroFlows));
  out.push(`<path data-part="ticks-minor" class="iso-line" data-tone="lo" d="${bezel.minor}"/>`);
  out.push(`<path data-part="ticks-major" class="iso-line" data-tone="mid" d="${bezel.major}"/>`);
  out.push(`<path data-part="zero" class="pg-zero" d="${bezel.zero}"/>`);
  // Crown and stem on the right.
  out.push(S(k.slabOf({ x: DIAL_R - 1, y: -2.4, w: 5, d: 4.8, r: 1.2 }, DIAL_Z + 2, 5, P, 3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: DIAL_R + 3.6, y: -3.2, w: 2.6, d: 6.4, r: 1.2 }, DIAL_Z + 1.2, 6.6, P, 3), { tone: "mid" }));
  out.push(`<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleAt(M.needleTurn(tipZ))}" style="stroke-width:1.1"/>`);
  out.push(L(k.ring(0, 0, 1.6, DIAL_TOP + 0.2, P, 16), { tone: "mid" }));
  out.push(D([at([0, 0, DIAL_TOP + 0.2])], { size: 0.7, tone: "hi" }));
  return out.join("");
}

// ── The row: four trays, each a master and a block ───────────────────────────
function trayOf(index) {
  const c = M.centreOf(index);
  const plan = { x: c - M.PITCH / 2 + 1, y: -TRAY_D / 2, w: M.PITCH - 2, d: TRAY_D, r: 2 };
  const out = [S(k.slabOf(plan, 0, M.TRAY_TOP, P, 3, 0.5), { tone: "mid" })];
  // Locating pins behind the pair, index dots in front of it.
  for (const px of [c - 13, c + 13]) out.push(S(k.cylinder(px, -9.8, 1.1, M.TRAY_TOP, 2.4, P, 14), { tone: "mid", crease: "none" }));
  out.push(D(Array.from({ length: index + 1 }, (_, j) => at([c - 14 + j * 2.4, 9.8, M.TRAY_TOP])), { size: 0.5, tone: "hi" }));
  return { x0: plan.x, svg: out.join("") };
}
function masterOf(index) {
  const x = M.masterX(index);
  const h = M.topOf(M.PAIRS[index].declared) - M.TRAY_TOP;
  const out = [S(k.cylinder(x, 0, M.MASTER_R, M.TRAY_TOP, h, P, 40, 0.5), { tone: "hi", crease: "lo" })];
  out.push(L(k.ring(x, 0, M.MASTER_R - 2, M.TRAY_TOP + h, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, 0, 1, M.TRAY_TOP + h, P, 12), { tone: "lo" }));
  return { x0: x - M.MASTER_R, svg: out.join("") };
}
function blockOf(index) {
  const x = M.blockX(index);
  const plan = { x: x - M.BLOCK_W / 2, y: -M.BLOCK_W / 2, w: M.BLOCK_W, d: M.BLOCK_W, r: 1 };
  const h = M.topOf(M.PAIRS[index].observed) - M.TRAY_TOP;
  const out = [S(k.slabOf(plan, M.TRAY_TOP, h, P, 3, 0.5), { tone: "hi", crease: "lo" })];
  out.push(L(k.planOutline(k.insetPlan(plan, 2), M.TRAY_TOP + h, P, 3), { tone: "faint" }));
  return { x0: plan.x, svg: out.join("") };
}
function plungerSvg() {
  return (
    S(k.cylinder(0, 0, M.TIP_R, 0, 2.4, P, 20), { tone: "hi", lit: true }) +
    S(k.cylinder(0, 0, 1.3, 2.4, STEM - 2.4, P, 16), { tone: "hi", crease: "none", lit: true })
  );
}

const rowItems = M.PAIRS.flatMap((_, index) => [trayOf(index), masterOf(index), blockOf(index)]);
const startTip = M.contactAt(START).z;
const startZero = M.PAIRS[M.pairAt(START)].declared;
const slotOf = (x) => rowItems.filter((item) => item.x0 < x + M.TIP_R).length;
const plungerG = `<g data-part="plunger" transform="${k.translateAlong(P, [START, 0, startTip])}">${plungerSvg()}</g>`;
const rowSvg = rowItems.map((item) => `<g data-x0="${item.x0}">${item.svg}</g>`);
rowSvg.splice(slotOf(START), 0, plungerG);

const move = k.translateAlong(P, [START, 0, 0]);
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A comparator bench. A dial gauge on a slide travels a rail behind four trays. Each tray holds a round master as tall as the third-party data flows a sample entity's privacy policy declares for one practice, and a square block as tall as the flows observed from outside. The dial is zeroed on each master, so where the block is taller the needle swings by the gap.",
  body: [
    plate(),
    rail(),
    stop(STOP_L, 1),
    `<g data-part="gauge-back" transform="${move}">${gaugeBack()}</g>`,
    stop(STOP_R, -1),
    `<g data-part="row">${rowSvg.join("")}</g>`,
    `<g data-part="gauge-top" transform="${move}">${gaugeTop(startTip, startZero)}</g>`,
  ],
});

// ── Live ─────────────────────────────────────────────────────────────────────
const MODEL_SRC = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^﻿/, "").replace(/^export /gm, "");
const unkit = (fn) => fn.toString().replace(/\bk\./g, "");
const TOUR = [];
M.PAIRS.forEach((_, index) => {
  TOUR.push({ x: M.blockX(index), hold: 3.6 });
  if (index + 1 < M.PAIRS.length) TOUR.push({ x: M.masterX(index + 1), hold: 2.1 });
});
TOUR.push({ x: M.masterX(0), hold: 2.4 });

const live = `
${MODEL_SRC}
const P = ${JSON.stringify(P)};
const DIAL_R = ${DIAL_R}, DIAL_TOP = ${DIAL_TOP}, THETA0 = ${THETA0}, VIEW_W = ${WIDTH};
const TOUR = ${JSON.stringify(TOUR)};
const TOUR_LENGTH = TOUR.reduce((sum, stop) => sum + stop.hold, 0);
const needleAt = ${unkit(needleAt)};
const bezelAt = ${unkit(bezelAt)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const backG = svg.querySelector('[data-part="gauge-back"]');
const topG = svg.querySelector('[data-part="gauge-top"]');
const row = svg.querySelector('[data-part="row"]');
const items = [...row.children].filter((node) => node.dataset.x0 !== undefined);
const x0s = items.map((node) => Number(node.dataset.x0));
const plunger = svg.querySelector('[data-part="plunger"]');
const needle = svg.querySelector('[data-part="needle"]');
const minorEl = svg.querySelector('[data-part="ticks-minor"]');
const majorEl = svg.querySelector('[data-part="ticks-major"]');
const zeroEl = svg.querySelector('[data-part="zero"]');
const readout = document.querySelector("[data-readout]");
const reports = [...document.querySelectorAll(".pg-report")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const origin = iso([0, 0, 0], P)[0], perX = iso([1, 0, 0], P)[0] - origin;

let x = ${START}, vx = 0, target = x;
const tip = { at: contactAt(x).z, rate: 0 };
const zero = { x: PAIRS[pairAt(x)].declared, v: 0 };
let frame = 0, last = 0, clock = 0, touring = !still.matches, visible = false, idleTimer = 0;
let drawnBezel = bezelTurn(zero.x), slot = -1, shownText = "", shownKey = "";

function tourAt(t) {
  let left = ((t % TOUR_LENGTH) + TOUR_LENGTH) % TOUR_LENGTH;
  for (const stop of TOUR) { if (left < stop.hold) return stop.x; left -= stop.hold; }
  return TOUR[0].x;
}
function clockAt(position) {
  let best = 0, start = 0, gap = Infinity;
  for (const stop of TOUR) { const d = Math.abs(stop.x - position); if (d < gap) { gap = d; best = start; } start += stop.hold; }
  return best;
}
function describe(index, part) {
  const key = index + ":" + part;
  if (key === shownKey) return;
  shownKey = key;
  reports.forEach((node, at) => { if (at === index) node.dataset.on = ""; else delete node.dataset.on; node.dataset.at = part; });
  stage.setAttribute("aria-valuenow", String(index * 2 + (part === "observed" ? 2 : 1)));
  stage.setAttribute("aria-valuetext", valueTextOf(index, part));
}
function draw() {
  const move = translateAlong(P, [x, 0, 0]);
  backG.setAttribute("transform", move);
  topG.setAttribute("transform", move);
  plunger.setAttribute("transform", translateAlong(P, [x, 0, tip.at]));
  needle.setAttribute("d", needleAt(needleTurn(tip.at)));
  const turn = bezelTurn(zero.x);
  if (Math.abs(turn - drawnBezel) > 1e-5) {
    const bezel = bezelAt(turn);
    minorEl.setAttribute("d", bezel.minor);
    majorEl.setAttribute("d", bezel.major);
    zeroEl.setAttribute("d", bezel.zero);
    drawnBezel = turn;
  }
  let next = 0;
  while (next < x0s.length && x0s[next] < x + TIP_R) next++;
  if (next !== slot) { row.insertBefore(plunger, items[next] || null); slot = next; }
  const goal = PAIRS[pairAt(x)].declared;
  const text = readoutOf(x, tip.at, zero.x, Math.abs(zero.x - goal) > 0.02);
  if (text !== shownText) { readout.textContent = text; shownText = text; }
  const contact = contactAt(x);
  if (contact.part) describe(contact.pair, contact.part);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring && !calm) { clock += dt; target = tourAt(clock); }
  if (calm) { x = target; vx = 0; }
  else {
    const w = 1 / 0.32;
    for (let i = 0; i < 4; i++) { vx += (w * w * (target - x) - 2 * w * vx) * dt / 4; x += vx * dt / 4; }
    if (Math.abs(target - x) < 0.01 && Math.abs(vx) < 0.01) { x = target; vx = 0; }
  }
  const want = contactAt(x).z;
  if (calm) { tip.at = want; tip.rate = 0; }
  else {
    for (let i = 0; i < 4; i++) { tip.rate += ((want - tip.at) * 420 - tip.rate * 30) * dt / 4; tip.at += tip.rate * dt / 4; }
    if (Math.abs(want - tip.at) < 0.005 && Math.abs(tip.rate) < 0.005) { tip.at = want; tip.rate = 0; }
  }
  const goal = PAIRS[pairAt(x)].declared;
  if (calm) { zero.x = goal; zero.v = 0; }
  else {
    const w = 1 / 0.22;
    for (let i = 0; i < 4; i++) { zero.v += (w * w * (goal - zero.x) - 2 * w * zero.v) * dt / 4; zero.x += zero.v * dt / 4; }
    if (Math.abs(goal - zero.x) < 1e-4 && Math.abs(zero.v) < 1e-4) { zero.x = goal; zero.v = 0; }
  }
  draw();
  const settled = !touring && x === target && tip.rate === 0 && tip.at === want && zero.v === 0 && zero.x === goal;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const resume = () => { if (still.matches) return; touring = true; clock = clockAt(x); run(); };
const steer = (next) => {
  touring = false;
  target = clamp(next, REACH[0], REACH[1]);
  clearTimeout(idleTimer);
  idleTimer = setTimeout(resume, 3600);
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
still.addEventListener("change", () => { if (still.matches) { touring = false; clearTimeout(idleTimer); } else resume(); run(); });
const worldX = (clientX) => {
  const box = svg.getBoundingClientRect();
  return ((clientX - box.left) / box.width * VIEW_W - origin) / perX;
};
stage.addEventListener("pointermove", (event) => { if (event.isPrimary) steer(worldX(event.clientX)); });
stage.addEventListener("pointerdown", (event) => { if (event.isPrimary) steer(worldX(event.clientX)); });
stage.addEventListener("pointerleave", () => steer(target));
stage.addEventListener("keydown", (event) => {
  const from = touring ? x : target;
  const here = STOPS.reduce((best, stop, index) => (Math.abs(stop - from) < Math.abs(STOPS[best] - from) ? index : best), 0);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(STOPS.length - 1, here + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, here - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = STOPS.length - 1;
  if (to === null) return;
  event.preventDefault();
  steer(STOPS[to]);
});
if (still.matches) touring = false;
draw();
`;

// ── Card ─────────────────────────────────────────────────────────────────────
const reportHtml = M.PAIRS.map((_, index) => {
  const r = M.reportOf(index, "observed");
  const esc = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<dl class="pg-report"${index === M.pairAt(START) ? " data-on" : ""} data-at="observed"><div><dt>practice</dt><dd>${esc(r.practice)}</dd></div><div><dt>declared</dt><dd>${esc(r.declared)}</dd></div><div data-row="observed"><dt>observed</dt><dd>${esc(r.observed)}</dd></div><div data-row="gap"${M.gapOf(M.PAIRS[index]) ? "" : " data-zero"}><dt>gap</dt><dd>${esc(r.gap)}</dd></div></dl>`;
}).join("");

const PAGE_CSS = `<style>
.iso-stage{outline:none;touch-action:pan-y;cursor:ew-resize}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.pg-zero{fill:var(--anatomy-hi);stroke:none}
.pg-reports{display:grid;margin:2px 0 6px;padding:10px 0 12px;border-top:1px solid var(--anatomy-faint);border-bottom:1px solid var(--anatomy-faint)}
.pg-report{grid-area:1/1;display:grid;grid-template-columns:76px 1fr;gap:4px 12px;margin:0;visibility:hidden;font-family:var(--anatomy-mono);font-size:11.5px;line-height:1.5}
.pg-report[data-on]{visibility:visible}
.pg-report>div{display:contents}
.pg-report dt{color:var(--anatomy-muted);text-transform:uppercase;letter-spacing:.1em;font-size:10px;line-height:1.75}
.pg-report dd{margin:0;color:var(--anatomy-strong)}
.pg-report [data-row="gap"] dd{color:var(--anatomy-lit)}
.pg-report [data-row="gap"][data-zero] dd{color:var(--anatomy-text)}
.pg-report [data-row] dd,.pg-report [data-row] dt{transition:opacity .4s var(--anatomy-ease)}
.pg-report[data-at="master"] [data-row] dd,.pg-report[data-at="master"] [data-row] dt{opacity:.32}
@media (max-width:560px){.pg-report{grid-template-columns:64px 1fr;gap:3px 10px;font-size:11px}.iso-plate{overflow:hidden}.iso-plate .iso-svg{width:124%;margin:0 -12%}}
@media (prefers-reduced-motion:reduce){.pg-report [data-row] dd,.pg-report [data-row] dt{transition:none}}
</style>`;

const card = k.plateHtml({
  fig: "Fig 2",
  title: "Policy vs practice",
  hint: "Hover, tap or ← → to move the gauge",
  readout: M.readoutOf(START, startTip, startZero, false),
  keys: [
    { mark: "lit", label: "Plunger and needle: the gap" },
    { mark: "flat", label: "Round masters: declared" },
    { mark: "raised", label: "Square blocks: observed" },
  ],
  caption:
    "Each tray pairs a practice's declaration (a round master as tall as the third-party data flows its privacy policy discloses) with its behaviour seen from outside (a square block as tall as the flows observed). Zeroed on the master, the needle reads only the difference: the policy–practice gap litigators exploit. Sample entity; flow counts are illustrative, findings and exposure ranges are from Privaini's published sample report.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Policy versus practice comparator: arrow keys move the gauge from master to block along the four trays" aria-valuemin="1" aria-valuemax="${M.STOPS.length}" aria-valuenow="2" aria-valuetext="${M.valueTextOf(0, "observed")}">${svg}</div>`,
}).replace('<figcaption class="iso-legend">', `<figcaption class="iso-legend"><div class="pg-reports">${reportHtml}</div>`);

// The inlined kit carries pageHtml's own source, which contains a literal "</body>".
// Escape every one but the document's last (`<\/body>` is the same string inside JS),
// so nothing that edits the page at "</body>" can land inside the module script.
const page = k
  .pageHtml({ title: "Policy vs practice", theme, body: PAGE_CSS + card, script: kitScript() + live })
  .replace(/<\/body>(?=[\s\S]*<\/body>)/g, "<\\/body>");
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, privainiPage(page, "policy-practice-gap"));
console.log("wrote", OUT);
