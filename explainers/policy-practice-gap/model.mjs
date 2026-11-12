// Policy vs practice: the comparator's model, one pure module with no imports.
// The build draws from it and the page inlines it (export stripped), so the block
// heights, the plunger, the needle, the bezel and every word of the readout agree.
//
// Unit: one third-party data flow (a recipient that receives data from a practice).
// A master puck is as tall as the flows the privacy policy declares for that practice;
// a measured block is as tall as the flows observed firing from outside. The gauge is
// zeroed on the master, so the needle reads observed − declared: the undisclosed flows.
// The entity is a sample. Flow counts are illustrative; the findings, statutes and
// exposure ranges are Privaini's published sample-report findings.

export const FLOW = 5; // world units of height per flow
export const TRAY_TOP = 3; // trays are 3 thick on the plate
export const DATUM = 8; // a zero-flow master or block stands 8 above its tray
export const DATUM_Z = TRAY_TOP + DATUM;
export const PER_TURN = 10; // flows per needle turn: one major division per flow
export const PITCH = 37; // tray pitch along the row
export const HALF = 9; // master and block centres sit HALF either side of the tray centre
export const MASTER_R = 7.5;
export const BLOCK_W = 15;
export const TIP_R = 2.4; // plunger contact
export const REST_Z = DATUM_Z - 2.5; // the plunger's stroke limit, with nothing under it

export const PAIRS = [
  {
    practice: "video pages",
    declared: 0,
    observed: 2,
    said: "no sharing of video-viewing data",
    seen: "a tracking pixel fires on video engagement, before consent",
    finding: "F-0042 · High · VPPA §2710 · video tracking without consent · $2,500 per violation · est. $8.9M–$22.4M",
    law: "VPPA §2710",
  },
  {
    practice: "health pages",
    declared: 1,
    observed: 3,
    said: "one analytics provider",
    seen: "third-party pixels also load on health pages",
    finding: "F-0039 · CCPA §1798 · third-party pixel on health pages · est. $2.1M–$8.4M",
    law: "CCPA §1798",
  },
  {
    practice: "checkout",
    declared: 2,
    observed: 2,
    said: "payment processor and fraud screening",
    seen: "the same two flows, nothing else",
    finding: "",
    law: "",
  },
  {
    practice: "face sign-in",
    declared: 0,
    observed: 1,
    said: "no biometric data collected",
    seen: "face geometry captured at sign-in, without notice",
    finding: "BIPA · biometric capture without notice · est. $3.4M–$14.2M",
    law: "BIPA",
  },
];

export const centreOf = (index) => (index - (PAIRS.length - 1) / 2) * PITCH;
export const masterX = (index) => centreOf(index) - HALF;
export const blockX = (index) => centreOf(index) + HALF;
export const topOf = (flows) => DATUM_Z + flows * FLOW;
export const gapOf = (pair) => pair.observed - pair.declared;

// Stops along the row: each master, then its block.
export const STOPS = PAIRS.flatMap((_, index) => [masterX(index), blockX(index)]);
export const REACH = [masterX(0) - MASTER_R, blockX(PAIRS.length - 1) + BLOCK_W / 2];

// The tray (pair) the gauge is reading: the nearest tray centre.
export function pairAt(x) {
  const index = Math.round((x - centreOf(0)) / PITCH);
  return Math.max(0, Math.min(PAIRS.length - 1, index));
}

// What the plunger tip (a disc of TIP_R) rests on with its axis at x:
// the highest top it overlaps, else the stroke limit. `part` is what lies under the axis.
export function contactAt(x) {
  let z = REST_Z;
  let part = null;
  let pair = -1;
  PAIRS.forEach((entry, index) => {
    const m = masterX(index);
    const b = blockX(index);
    if (Math.abs(x - m) < MASTER_R + TIP_R) z = Math.max(z, topOf(entry.declared));
    if (x + TIP_R > b - BLOCK_W / 2 && x - TIP_R < b + BLOCK_W / 2) z = Math.max(z, topOf(entry.observed));
    if (Math.abs(x - m) <= MASTER_R) [part, pair] = ["master", index];
    if (Math.abs(x - b) <= BLOCK_W / 2) [part, pair] = ["observed", index];
  });
  return { z, part, pair };
}

// The dial: the needle turns with the plunger, the bezel is turned to zero on the master.
export const needleTurn = (tipZ) => (tipZ - DATUM_Z) / FLOW / PER_TURN;
export const bezelTurn = (zeroFlows) => zeroFlows / PER_TURN;
export const readingOf = (tipZ, zeroFlows) => (tipZ - DATUM_Z) / FLOW - zeroFlows;

const signed = (value) => {
  const near = Math.round(value);
  const text = Math.abs(value - near) < 0.05 ? String(Math.abs(near)) : Math.abs(value).toFixed(1);
  return (value > 0.05 ? "+" : value < -0.05 ? "−" : "") + text;
};

// The corner readout, from where the parts are this frame.
export function readoutOf(x, tipZ, zeroFlows, zeroing) {
  const { part, pair } = contactAt(x);
  const index = pair < 0 ? pairAt(x) : pair;
  const entry = PAIRS[index];
  const reading = readingOf(tipZ, zeroFlows);
  if (part === "master") return `${entry.practice} · declared ${entry.declared} · ${zeroing ? "zeroing" : "zero set"}`;
  if (part === "observed") {
    const gap = signed(reading);
    return gap === "0" ? `${entry.practice} · gap 0 · matches` : `${entry.practice} · gap ${gap} flow${gap === "+1" || gap === "−1" ? "" : "s"}`;
  }
  return `${entry.practice} · reads ${signed(reading)}`;
}

// The report rows under the card, for the pair under the gauge.
export function reportOf(index, part) {
  const entry = PAIRS[index];
  const gap = gapOf(entry);
  return {
    practice: entry.practice,
    declared: `${entry.declared} flow${entry.declared === 1 ? "" : "s"} · ${entry.said}`,
    observed: `${entry.observed} flow${entry.observed === 1 ? "" : "s"} · ${entry.seen}`,
    gap: gap ? `+${gap} undisclosed · ${entry.finding}` : "0 · declaration matches behaviour, nothing to exploit",
    measured: part === "observed",
  };
}

export function valueTextOf(index, part) {
  const entry = PAIRS[index];
  const gap = gapOf(entry);
  if (part === "master") return `${entry.practice}: master block, the policy declares ${entry.declared} third-party flows; dial zeroed`;
  return gap
    ? `${entry.practice}: observed ${entry.observed} flows, gap of ${gap} undisclosed, ${entry.law}`
    : `${entry.practice}: observed ${entry.observed} flows, no gap`;
}
