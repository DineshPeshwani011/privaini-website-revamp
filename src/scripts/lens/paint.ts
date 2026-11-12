// Canvas painters for the Lens world: labels, icons, glass cards, the laptop's briefing screen.
// Every painter returns a canvas; world.ts turns them into textures.
import type { IconName } from './data';

export const FONT = '"Urbanist Variable", "Urbanist", system-ui, sans-serif';
export const MONO = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace';
export const LOGO = '"Bruno Ace SC", "Urbanist Variable", sans-serif';

export const C = {
  ink: '#e8f6f8',
  soft: 'rgba(200, 228, 234, 0.72)',
  faint: 'rgba(170, 205, 214, 0.42)',
  cyan: '#5ee6f5',
  cyanDeep: '#189db5',
  green: '#4fe3a8',
  red: '#ff5a4e',
  amber: '#f5a524',
  glass: 'rgba(120, 200, 220, 0.09)',
  glassHi: 'rgba(150, 225, 240, 0.16)',
  edge: 'rgba(170, 238, 250, 0.32)',
};

export async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load(`600 48px ${FONT}`),
      document.fonts.load(`500 48px ${MONO}`),
      document.fonts.load(`400 48px ${LOGO}`),
    ]);
  } catch { /* system fallback */ }
}

// Painters draw in logical pixels; every canvas is allocated at RES× so text stays sharp when the
// camera flies close (world.ts sets RES from the device). shadowBlur ignores the transform, so glows
// go through soft() to keep their proportion at any resolution.
let RES = 2;
export function setResolution(r: number) { RES = r; }
export const soft = (px: number) => px * RES * 0.7;

export function canvas(w: number, h: number, res = RES) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * res);
  c.height = Math.ceil(h * res);
  const ctx = c.getContext('2d')!;
  ctx.scale(res, res);
  ctx.textBaseline = 'middle';
  ctx.imageSmoothingQuality = 'high';
  return { c, ctx };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function glass(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, opts: { fill?: string; stroke?: string; glow?: string; lw?: number } = {}) {
  ctx.save();
  if (opts.glow) { ctx.shadowColor = opts.glow; ctx.shadowBlur = soft(22); }
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = opts.fill ?? C.glass;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = opts.lw ?? 2;
  ctx.strokeStyle = opts.stroke ?? C.edge;
  ctx.stroke();
  ctx.restore();
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, size: number, opts: { fill?: string; stroke?: string; color?: string; font?: string } = {}) {
  ctx.font = `600 ${size}px ${opts.font ?? FONT}`;
  const w = ctx.measureText(text).width + size * 1.4;
  const h = size * 1.75;
  rr(ctx, x, y - h / 2, w, h, h / 2);
  ctx.fillStyle = opts.fill ?? 'rgba(255,255,255,0.1)';
  ctx.fill();
  if (opts.stroke) { ctx.lineWidth = 2; ctx.strokeStyle = opts.stroke; ctx.stroke(); }
  ctx.fillStyle = opts.color ?? C.ink;
  ctx.fillText(text, x + size * 0.7, y + 1);
  return w;
}

// ---------- icons (drawn in a 1×1 box, scaled by s) ----------
export function icon(ctx: CanvasRenderingContext2D, name: IconName, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 0.065;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const circle = (cx: number, cy: number, r: number, fill = false) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); fill ? ctx.fill() : ctx.stroke(); };
  switch (name) {
    case 'globe':
      circle(0.5, 0.5, 0.42);
      ctx.beginPath(); ctx.ellipse(0.5, 0.5, 0.18, 0.42, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0.08, 0.5); ctx.lineTo(0.92, 0.5); ctx.moveTo(0.16, 0.3); ctx.lineTo(0.84, 0.3); ctx.moveTo(0.16, 0.7); ctx.lineTo(0.84, 0.7); ctx.stroke();
      break;
    case 'cookie':
      ctx.beginPath(); ctx.arc(0.5, 0.5, 0.42, 0.35, Math.PI * 2 - 0.1); ctx.arc(0.86, 0.3, 0.12, Math.PI * 1.1, Math.PI * 0.25, true); ctx.stroke();
      [[0.36, 0.38], [0.55, 0.62], [0.33, 0.66], [0.6, 0.4]].forEach(([a, b]) => circle(a, b, 0.05, true));
      break;
    case 'doc':
      ctx.beginPath(); ctx.moveTo(0.2, 0.06); ctx.lineTo(0.62, 0.06); ctx.lineTo(0.82, 0.26); ctx.lineTo(0.82, 0.94); ctx.lineTo(0.2, 0.94); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0.32, 0.45); ctx.lineTo(0.7, 0.45); ctx.moveTo(0.32, 0.6); ctx.lineTo(0.7, 0.6); ctx.moveTo(0.32, 0.75); ctx.lineTo(0.58, 0.75); ctx.stroke();
      break;
    case 'code':
      ctx.beginPath(); ctx.moveTo(0.3, 0.25); ctx.lineTo(0.06, 0.5); ctx.lineTo(0.3, 0.75); ctx.moveTo(0.7, 0.25); ctx.lineTo(0.94, 0.5); ctx.lineTo(0.7, 0.75); ctx.moveTo(0.58, 0.15); ctx.lineTo(0.42, 0.85); ctx.stroke();
      break;
    case 'cloud':
      ctx.beginPath(); ctx.moveTo(0.22, 0.74); ctx.arc(0.26, 0.58, 0.16, Math.PI * 0.6, Math.PI * 1.5); ctx.arc(0.5, 0.42, 0.22, Math.PI * 1.1, Math.PI * 1.95); ctx.arc(0.76, 0.6, 0.14, Math.PI * 1.5, Math.PI * 0.45); ctx.closePath(); ctx.stroke();
      break;
    case 'camera':
      ctx.beginPath(); ctx.roundRect(0.08, 0.28, 0.84, 0.56, 0.08); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0.32, 0.28); ctx.lineTo(0.4, 0.16); ctx.lineTo(0.6, 0.16); ctx.lineTo(0.68, 0.28); ctx.stroke();
      circle(0.5, 0.56, 0.16);
      break;
    case 'db':
      ctx.beginPath(); ctx.ellipse(0.5, 0.2, 0.34, 0.11, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0.16, 0.2); ctx.lineTo(0.16, 0.8); ctx.ellipse(0.5, 0.8, 0.34, 0.11, 0, Math.PI, 0, true); ctx.lineTo(0.84, 0.2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0.5, 0.5, 0.34, 0.11, 0, 0, Math.PI); ctx.stroke();
      break;
    case 'phone':
      ctx.beginPath(); ctx.roundRect(0.28, 0.06, 0.44, 0.88, 0.08); ctx.stroke();
      circle(0.5, 0.82, 0.035, true);
      break;
    case 'nodes':
      circle(0.2, 0.5, 0.1); circle(0.78, 0.22, 0.1); circle(0.78, 0.78, 0.1);
      ctx.beginPath(); ctx.moveTo(0.29, 0.45); ctx.lineTo(0.69, 0.27); ctx.moveTo(0.29, 0.55); ctx.lineTo(0.69, 0.73); ctx.stroke();
      break;
    case 'grid':
      [[0.08, 0.08], [0.56, 0.08], [0.08, 0.56], [0.56, 0.56]].forEach(([a, b]) => { ctx.beginPath(); ctx.roundRect(a, b, 0.36, 0.36, 0.05); ctx.stroke(); });
      break;
    case 'shield':
      ctx.beginPath(); ctx.moveTo(0.5, 0.06); ctx.lineTo(0.86, 0.2); ctx.quadraticCurveTo(0.86, 0.75, 0.5, 0.94); ctx.quadraticCurveTo(0.14, 0.75, 0.14, 0.2); ctx.closePath(); ctx.stroke();
      break;
    case 'finger':
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0.5, 0.62, 0.12 + i * 0.1, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0.5, 0.62); ctx.lineTo(0.5, 0.9); ctx.stroke();
      break;
  }
  ctx.restore();
}

// ---------- labels ----------
export function label(text: string, opts: { size?: number; color?: string; icon?: IconName; glow?: string; boxed?: boolean; weight?: number; font?: string; tracking?: number } = {}) {
  const size = opts.size ?? 56;
  const pad = size * 0.5;
  const font = `${opts.weight ?? 500} ${size}px ${opts.font ?? FONT}`;
  const probe = canvas(8, 8).ctx;
  probe.font = font;
  if (opts.tracking) (probe as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${opts.tracking}px`;
  const tw = text ? probe.measureText(text).width : 0;
  const iw = opts.icon ? size * 1.15 : 0;
  const gap = opts.icon && text ? size * 0.4 : 0;
  const boxPad = opts.boxed ? size * 0.7 : 0;
  const w = tw + iw + gap + pad * 2 + boxPad * 2;
  const h = size * 1.6 + pad * 2 + (opts.boxed ? size * 0.5 : 0);
  const { c, ctx } = canvas(w, h);
  if (opts.boxed) {
    glass(ctx, pad, pad, w - pad * 2, h - pad * 2, 10, { fill: 'rgba(6, 22, 30, 0.86)', stroke: 'rgba(200, 235, 245, 0.55)', lw: 3 });
  }
  ctx.font = font;
  if (opts.tracking) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${opts.tracking}px`;
  const color = opts.color ?? C.soft;
  if (opts.glow) { ctx.shadowColor = opts.glow; ctx.shadowBlur = soft(size * 0.28); }
  let x = pad + boxPad;
  if (opts.icon) { icon(ctx, opts.icon, x, h / 2 - iw / 2, iw, color); x += iw + gap; }
  ctx.fillStyle = color;
  if (text) ctx.fillText(text, x, h / 2 + size * 0.04);
  return c;
}

// ---------- the laptop's screen ----------
export function briefingScreen() {
  const W = 2048, H = 1320;
  const { c, ctx } = canvas(W, H, Math.min(RES, 1.6));
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#123643');
  bg.addColorStop(1, '#0a1f28');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(94, 230, 245, 0.04)';
  for (let x = 0; x < W; x += 64) ctx.fillRect(x, 0, 2, H);

  ctx.font = `600 68px ${FONT}`;
  ctx.fillStyle = C.ink;
  ctx.fillText('Privaini Risk Briefing', 112, 118);
  ctx.font = `500 34px ${MONO}`;
  ctx.fillStyle = C.faint;
  ctx.fillText('your-company.com  ·  19 jurisdictions  ·  risk HIGH', 112, 186);

  const panels = [
    { x: 112, y: 250, w: 880, h: 470, title: 'Findings' },
    { x: 1056, y: 250, w: 880, h: 470, title: 'Exposure' },
    { x: 112, y: 760, w: 880, h: 470, title: 'Evidence' },
    { x: 1056, y: 760, w: 880, h: 470, title: 'Remediation' },
  ];
  panels.forEach((p) => {
    glass(ctx, p.x, p.y, p.w, p.h, 22, { fill: 'rgba(160, 230, 245, 0.07)', stroke: 'rgba(170, 238, 250, 0.22)' });
    pill(ctx, p.x + 36, p.y + 64, p.title, 36, { fill: 'rgba(230, 250, 255, 0.12)', stroke: 'rgba(230,250,255,0.25)' });
  });

  // Findings
  {
    const p = panels[0];
    rr(ctx, p.x + p.w - 150, p.y + 46, 104, 36, 8);
    ctx.fillStyle = C.amber; ctx.fill();
    const rows = [
      ['VPPA', C.red, 'Video tracking without consent'],
      ['CCPA', C.amber, 'Third-party pixel on health pages'],
      ['BIPA', C.red, 'Biometric capture without notice'],
      ['GDPR', C.amber, 'Cross-border transfer gap'],
    ] as const;
    rows.forEach(([law, col, text], i) => {
      const y = p.y + 160 + i * 78;
      ctx.font = `600 28px ${MONO}`;
      const lw = ctx.measureText(law).width + 32;
      rr(ctx, p.x + 40, y - 22, lw, 44, 8);
      ctx.fillStyle = col === C.red ? 'rgba(255, 90, 78, 0.18)' : 'rgba(245, 165, 36, 0.18)';
      ctx.fill();
      ctx.fillStyle = col;
      ctx.fillText(law, p.x + 56, y + 1);
      ctx.font = `500 34px ${FONT}`;
      ctx.fillStyle = C.ink;
      ctx.fillText(text, p.x + 64 + lw, y + 2);
    });
  }
  // Exposure
  {
    const p = panels[1];
    ctx.font = `600 96px ${FONT}`;
    ctx.fillStyle = C.amber;
    ctx.fillText('$22.5m', p.x + 40, p.y + 190);
    ctx.font = `500 30px ${FONT}`;
    ctx.fillStyle = C.soft;
    ctx.fillText('estimated exposure · 7 markets', p.x + 44, p.y + 262);
    const bars = [0.22, 0.3, 0.26, 0.42, 0.38, 0.55, 0.5, 0.68, 0.62, 0.8, 0.74, 0.95];
    bars.forEach((v, i) => {
      const bh = v * 150;
      const x = p.x + 44 + i * 66;
      rr(ctx, x, p.y + p.h - 40 - bh, 40, bh, 6);
      ctx.fillStyle = i > 8 ? C.cyan : 'rgba(94, 230, 245, 0.38)';
      ctx.fill();
    });
  }
  // Evidence
  {
    const p = panels[2];
    const lines = [
      ['meta_pixel', 'video_play → tr/'],
      ['session_replay', '/checkout'],
      ['consent', 'fired before accept'],
      ['captured', '2025-04-18 13:56:08Z'],
    ];
    lines.forEach(([k, v], i) => {
      const y = p.y + 160 + i * 64;
      ctx.font = `500 30px ${MONO}`;
      ctx.fillStyle = C.cyan;
      ctx.fillText(k, p.x + 44, y);
      ctx.fillStyle = C.soft;
      ctx.fillText(v, p.x + 340, y);
    });
    ctx.beginPath();
    const pts = [0.6, 0.55, 0.62, 0.48, 0.5, 0.38, 0.42, 0.3, 0.33, 0.22];
    pts.forEach((v, i) => {
      const x = p.x + 520 + i * 36;
      const y = p.y + 300 + v * 260;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.strokeStyle = C.green; ctx.lineWidth = 5; ctx.stroke();
  }
  // Remediation
  {
    const p = panels[3];
    const items = [['3 Immediate', true], ['7 Staged', false], ['Board brief ready', true], ['Exposure re-scored', false]] as const;
    items.forEach(([t, on], i) => {
      const y = p.y + 160 + i * 74;
      rr(ctx, p.x + 44, y - 20, 40, 40, 8);
      ctx.lineWidth = 3; ctx.strokeStyle = on ? C.green : C.faint; ctx.stroke();
      if (on) { ctx.beginPath(); ctx.moveTo(p.x + 53, y); ctx.lineTo(p.x + 62, y + 10); ctx.lineTo(p.x + 76, y - 10); ctx.strokeStyle = C.green; ctx.stroke(); }
      ctx.font = `500 34px ${FONT}`;
      ctx.fillStyle = on ? C.ink : C.soft;
      ctx.fillText(t, p.x + 112, y + 2);
    });
  }
  return c;
}

// ---------- floating evidence cards ----------
export type CardKind = 'risk' | 'vppa' | 'time' | 'events' | 'exposure' | 'remediation';
export function card(kind: CardKind) {
  switch (kind) {
    case 'risk': {
      const { c, ctx } = canvas(560, 300);
      glass(ctx, 12, 12, 536, 276, 18, { fill: 'rgba(60, 24, 26, 0.72)', stroke: 'rgba(255, 120, 100, 0.55)', glow: 'rgba(255, 90, 78, 0.55)' });
      ctx.font = `700 64px ${MONO}`;
      ctx.fillStyle = C.red;
      ctx.shadowColor = C.red; ctx.shadowBlur = soft(10);
      ctx.fillText('HIGH', 48, 86);
      ctx.shadowBlur = 0;
      [0, 1, 2].forEach((i) => { ctx.beginPath(); ctx.arc(420 + i * 30, 86, 8, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill(); });
      ctx.font = `500 44px ${MONO}`;
      ctx.fillStyle = C.ink;
      ctx.fillText('US-CA', 48, 170);
      ctx.fillText('US-IL', 48, 232);
      return c;
    }
    case 'vppa': {
      const { c, ctx } = canvas(420, 140);
      glass(ctx, 10, 10, 400, 120, 22, { fill: 'rgba(70, 24, 24, 0.78)', stroke: 'rgba(255, 120, 100, 0.6)', glow: 'rgba(255, 90, 78, 0.6)' });
      ctx.font = `700 56px ${FONT}`;
      ctx.fillStyle = C.red;
      ctx.fillText('VPPA', 46, 72);
      [0, 1, 2].forEach((i) => { ctx.beginPath(); ctx.arc(290 + i * 32, 72, 9, 0, Math.PI * 2); ctx.fillStyle = 'rgba(230, 240, 245, 0.55)'; ctx.fill(); });
      return c;
    }
    case 'time': {
      const { c, ctx } = canvas(640, 120);
      glass(ctx, 10, 10, 620, 100, 14, { fill: 'rgba(14, 40, 50, 0.8)', stroke: C.edge });
      ctx.font = `500 36px ${MONO}`;
      ctx.fillStyle = C.soft;
      ctx.fillText('2025-04-18 13:56:08Z', 44, 62);
      ctx.beginPath(); ctx.moveTo(560, 76); ctx.lineTo(590, 40); ctx.lineTo(598, 70); ctx.closePath(); ctx.fillStyle = C.soft; ctx.fill();
      return c;
    }
    case 'events': {
      const { c, ctx } = canvas(640, 130);
      glass(ctx, 10, 10, 620, 110, 16, { fill: 'rgba(14, 40, 50, 0.82)', stroke: C.edge, glow: 'rgba(94, 230, 245, 0.35)' });
      ctx.font = `500 46px ${FONT}`;
      ctx.fillStyle = C.ink;
      ctx.fillText('14 events captured', 46, 68);
      return c;
    }
    case 'exposure': {
      const { c, ctx } = canvas(460, 260);
      glass(ctx, 12, 12, 436, 236, 18, { fill: 'rgba(14, 40, 50, 0.84)', stroke: C.edge, glow: 'rgba(245, 165, 36, 0.35)' });
      ctx.font = `600 40px ${FONT}`;
      ctx.fillStyle = C.ink;
      ctx.fillText('Exposure', 44, 74);
      ctx.font = `700 76px ${MONO}`;
      ctx.fillStyle = C.amber;
      ctx.shadowColor = C.amber; ctx.shadowBlur = soft(10);
      ctx.fillText('$22.5m', 40, 172);
      return c;
    }
    case 'remediation': {
      const { c, ctx } = canvas(500, 520);
      glass(ctx, 12, 12, 476, 496, 18, { fill: 'rgba(14, 40, 50, 0.86)', stroke: C.edge });
      ctx.font = `600 40px ${FONT}`;
      ctx.fillStyle = C.ink;
      ctx.fillText('Remediation', 44, 70);
      const rows = [['3 Immediate', false], ['7 Staged', true], ['', false], ['', false]] as const;
      rows.forEach(([t, on], i) => {
        const y = 160 + i * 88;
        rr(ctx, 44, y - 20, 40, 40, 6);
        ctx.lineWidth = 3; ctx.strokeStyle = on ? C.ink : C.faint; ctx.stroke();
        if (on) { ctx.beginPath(); ctx.moveTo(53, y); ctx.lineTo(62, y + 10); ctx.lineTo(76, y - 10); ctx.strokeStyle = C.ink; ctx.stroke(); }
        if (t) { ctx.font = `500 34px ${MONO}`; ctx.fillStyle = C.soft; ctx.fillText(t, 106, y + 2); }
        else { rr(ctx, 106, y - 9, 250 - i * 30, 18, 9); ctx.fillStyle = 'rgba(200, 228, 234, 0.18)'; ctx.fill(); }
      });
      return c;
    }
  }
}

// ---------- decisions ----------
export function decisionHeader() {
  const { c, ctx } = canvas(760, 150);
  rr(ctx, 14, 14, 732, 122, 61);
  ctx.fillStyle = 'rgba(6, 22, 30, 0.85)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(230, 250, 255, 0.85)'; ctx.stroke();
  ctx.font = `600 56px ${FONT}`;
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.fillText('Your Next Decisions', 380, 78);
  return c;
}

export function decisionItem(text: string) {
  const { c, ctx } = canvas(820, 150);
  ctx.save();
  ctx.shadowColor = C.green; ctx.shadowBlur = soft(9);
  ctx.lineWidth = 7; ctx.strokeStyle = C.green; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(34, 70); ctx.lineTo(62, 100); ctx.lineTo(118, 30); ctx.stroke();
  ctx.restore();
  ctx.font = `500 52px ${FONT}`;
  ctx.fillStyle = C.green;
  ctx.fillText(text, 160, 62);
  rr(ctx, 160, 108, 260, 14, 7);
  ctx.fillStyle = 'rgba(200, 228, 234, 0.16)';
  ctx.fill();
  return c;
}

export function wordmark() {
  const { c, ctx } = canvas(1400, 300);
  ctx.translate(0, 20);
  ctx.font = `400 168px ${LOGO}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '10px';
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  // a dark body under the letters so they read against the brightest part of the lens
  ctx.shadowColor = 'rgba(1, 10, 14, 0.95)';
  ctx.shadowBlur = soft(18);
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(2, 14, 20, 0.94)';
  ctx.strokeText('PRIVAINI', 700, 136);
  ctx.fillStyle = 'rgba(2, 14, 20, 0.94)';
  ctx.fillText('PRIVAINI', 700, 136);
  // cyan glow, then a crisp cyan rim and a bright face
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = soft(10);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(94, 230, 245, 1)';
  ctx.strokeText('PRIVAINI', 700, 136);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f4feff';
  ctx.fillText('PRIVAINI', 700, 136);
  return c;
}
