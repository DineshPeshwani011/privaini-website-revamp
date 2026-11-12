// Pure model for the exposure scale (Fig 3). No imports, no DOM: the build and the page both run it.
// Source: Privaini's published sample report for your-company.com (risk HIGH, 19 jurisdictions, 10 findings).
// Ranges are in millions. The phasing is an illustrative plan for that sample report.

export const ES_REPORT = { site: "your-company.com", risk: "HIGH", jurisdictions: 19, findings: 10, low: 18, high: 58 };

// GDPR's range is published in euros. It is counted at this rate (stated in the caption), which is the rate
// at which the four named ranges fit inside the report's $18M–$58M total.
export const ES_EUR_TO_USD = 1;

export const ES_NAMED = [
  { id: "vppa", law: "VPPA §2710", what: "Video tracking without consent", low: 8.9, high: 22.4, currency: "USD", phase: 1 },
  { id: "bipa", law: "BIPA", what: "Biometric capture without notice", low: 3.4, high: 14.2, currency: "USD", phase: 1 },
  { id: "gdpr", law: "GDPR Art.6", what: "Cross-border data transfer gap", low: 3.5, high: 12, currency: "EUR", phase: 2 },
  { id: "ccpa", law: "CCPA §1798", what: "Third-party pixel on health pages", low: 2.1, high: 8.4, currency: "USD", phase: 2 },
];

const esTenth = (value) => Math.round(value * 10) / 10;
const esUsd = (finding, value) => (finding.currency === "EUR" ? value * ES_EUR_TO_USD : value);

// The six other findings are one weight: whatever the report total leaves after the four named ranges.
export const ES_OTHER = {
  id: "other",
  law: "6 other findings",
  what: "Remainder of the report total",
  count: 6,
  currency: "USD",
  phase: 3,
  low: esTenth(ES_REPORT.low - ES_NAMED.reduce((sum, f) => sum + esUsd(f, f.low), 0)),
  high: esTenth(ES_REPORT.high - ES_NAMED.reduce((sum, f) => sum + esUsd(f, f.high), 0)),
};

export const ES_WEIGHTS = [...ES_NAMED, ES_OTHER].map((f) => {
  const low = esUsd(f, f.low);
  const high = esUsd(f, f.high);
  return { ...f, lowUsd: low, highUsd: high, mid: (low + high) / 2 };
});

export const ES_PHASES = 3;
export const ES_DIAL_MAX = 60;

// Which weights are still on the pan once `phase` (0..3) is complete.
export const esOpenAt = (phase) => ES_WEIGHTS.map((w) => w.phase > phase);

// Sum of the findings still on the pan: low, high and the sum of midpoints (what the needle reads).
export function esExposure(onPan) {
  let low = 0, high = 0, mid = 0;
  ES_WEIGHTS.forEach((w, i) => {
    if (!onPan[i]) return;
    low += w.lowUsd;
    high += w.highUsd;
    mid += w.mid;
  });
  return { low: esTenth(low), high: esTenth(high), mid: esTenth(mid) };
}

export function esMoney(value) {
  const v = esTenth(value);
  if (v <= 0) return "$0";
  return v >= 10 && Number.isInteger(v) ? `$${v}M` : `$${v.toFixed(1)}M`;
}

export function esRange({ low, high }) {
  return high <= 0 ? "$0" : `${esMoney(low)}–${esMoney(high)}`;
}

export function esReadout(phase, exposure) {
  if (phase <= 0) return `phase 0 · exposure ${esRange(exposure)}`;
  return `phase ${phase} of ${ES_PHASES} · remaining ${esRange(exposure)}`;
}

// The idle tour: hold each phase, then turn back to the start.
export const ES_TOUR = [0, 1, 2, 3, 3, 0];
export const ES_TOUR_STEP = 2.6;
