// Pure model of the outside-in scanner figure. Everything the page shows (pins, readout,
// counter, category lamps, tour) is derived from this module, so the figure and its words agree.
//
// Real facts (Privaini): 100+ signals per assessment, 8 finding categories, coverage of
// 90 countries and 20 US states, Observe -> Detect -> Recommend, findings reproducible and
// timestamped. The 16 properties below belong to a clearly labelled SAMPLE entity; three of
// its findings are Privaini's published sample findings (F-0042 VPPA, F-0039 CCPA, BIPA).

export const FACTS = { signals: "100+", categories: 8, countries: 90, states: 20 };

// The eight finding categories and the statutes they map to (published by Privaini).
export const CATEGORIES = [
  { id: "collection", name: "Wrongful Collection", statute: "CCPA/CPRA" },
  { id: "consent", name: "Consent Flow Failures", statute: "GDPR/ePrivacy" },
  { id: "ai", name: "AI Governance Gaps", statute: "EU AI Act / State AI" },
  { id: "video", name: "Video & Tracking Disclosure", statute: "VPPA/CIPA" },
  { id: "biometric", name: "Biometric Handling", statute: "BIPA" },
  { id: "children", name: "Children's Data", statute: "COPPA" },
  { id: "sharing", name: "Data Sharing & Sale", statute: "CCPA/CPRA" },
  { id: "retention", name: "Retention & Deletion", statute: "GDPR/CCPA" },
];

export const GRID = 4; // 4 x 4 wells
export const PITCH = 30; // world units between well centres
const at = (index) => (index - (GRID - 1) / 2) * PITCH;

// Sample entity: a health system's public digital properties, one per well, row by row from
// the back of the tray (row 0) to the front (row 3), left (col 0) to right (col 3).
// `signal` is what the property emits that anyone outside can observe; null means clean.
const PROPERTIES = [
  ["main site", { behaviour: "session replay on forms", statute: "CCPA/CPRA", category: "collection" }],
  ["newsroom", null],
  ["video page", { behaviour: "pixel before consent", statute: "VPPA §2710", category: "video", finding: "F-0042" }],
  ["investor site", null],
  ["health pages", { behaviour: "third-party pixel", statute: "CCPA §1798", category: "sharing", finding: "F-0039" }],
  ["patient portal", { behaviour: "face scan, no notice", statute: "BIPA", category: "biometric" }],
  ["careers site", null],
  ["EU site", { behaviour: "trackers pre-consent", statute: "GDPR/ePrivacy", category: "consent" }],
  ["kids' hub", { behaviour: "ad tags on child pages", statute: "COPPA", category: "children" }],
  ["locations", null],
  ["chat assistant", { behaviour: "AI not disclosed", statute: "EU AI Act", category: "ai" }],
  ["pharmacy", { behaviour: "cart data to ad network", statute: "CCPA/CPRA", category: "sharing" }],
  ["help centre", { behaviour: "no deletion path", statute: "GDPR/CCPA", category: "retention" }],
  ["app listing", null],
  ["live chat", { behaviour: "transcript to third party", statute: "CIPA", category: "video" }],
  ["blog", null],
];

export const WELLS = PROPERTIES.map(([property, signal], index) => {
  const col = index % GRID;
  const row = Math.floor(index / GRID);
  return { n: index + 1, col, row, x: at(col), y: at(row), property, signal };
});

export const FINDINGS = WELLS.filter((well) => well.signal).length; // 10
export const CATEGORY_INDEX = Object.fromEntries(CATEGORIES.map((category, index) => [category.id, index]));

// The idle tour visits every well in a serpentine raster, the way a gantry scans a plate.
export const TOUR = WELLS.map((_, index) => {
  const row = Math.floor(index / GRID);
  const step = index % GRID;
  return row * GRID + (row % 2 ? GRID - 1 - step : step);
});

export const pad2 = (value) => String(value).padStart(2, "0");

// Which well the reading spot is over (centre within `radius`), or -1.
export function wellAt(x, y, radius) {
  let best = -1;
  let bestDistance = radius;
  WELLS.forEach((well, index) => {
    const distance = Math.hypot(well.x - x, well.y - y);
    if (distance <= bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

// Nearest well to a floor point, always.
export function nearestWell(x, y) {
  let best = 0;
  WELLS.forEach((well, index) => {
    if (Math.hypot(well.x - x, well.y - y) < Math.hypot(WELLS[best].x - x, WELLS[best].y - y)) best = index;
  });
  return best;
}

export function lineOf(index) {
  const well = WELLS[index];
  const head = `${pad2(well.n)} ${well.property}`;
  return well.signal ? `${head} · ${well.signal.behaviour} → ${well.signal.statute}` : `${head} · nothing fires · clean`;
}

export function spokenOf(index, logged) {
  const well = WELLS[index];
  const tail = `${logged} of ${FINDINGS} findings logged.`;
  return well.signal
    ? `Well ${well.n}, ${well.property}: ${well.signal.behaviour}, maps to ${well.signal.statute}. ${tail}`
    : `Well ${well.n}, ${well.property}: nothing fires, clean. ${tail}`;
}

export function categoriesOf(loggedSet) {
  const on = new Set();
  loggedSet.forEach((index) => {
    const signal = WELLS[index].signal;
    if (signal) on.add(CATEGORY_INDEX[signal.category]);
  });
  return on;
}
