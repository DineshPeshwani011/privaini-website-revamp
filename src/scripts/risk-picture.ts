// The risk picture (src/components/folio/RiskPicture.astro), played.
// Wide (1100px and up): one timeline, scrubbed while the chapter holds. Positions are shares of the hold:
//   0.00  your company sends out a pulse; each signal locks on as the pulse reaches it
//   0.10  the wires draw, the middle rows first; once drawn (0.30), packets run down them into the lens
//   0.26  the lens focuses and its tick ring turns home; the sweep starts (0.34)
//   0.34  each capability locks on in turn: its spoke draws, a square closes on its node, its name decodes
//   0.52  the beam draws into the briefing, and packets run along it (0.58)
//   0.58  a scan line compiles the briefing: the head decodes, tiles build as the line reaches them,
//         14 events are counted, the exposure counts to $22.5M
//   0.77  the fan draws out to the decisions, one branch at a time, and each decision ticks as its branch lands
//   the rail along the foot fills with the whole run, and marks each stage as it is reached
// Narrower: each part plays once as it comes into view. What has been reached keeps running (CSS, .st-* classes),
// paused while the plate is off screen. Under reduced motion none of this is set up: the plate is simply there.
import { gsap } from 'gsap';

const PLATE = '(prefers-reduced-motion: no-preference) and (min-width: 1100px)';
const STACK = '(prefers-reduced-motion: no-preference) and (max-width: 1099px)';
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>+=#';
const STAGES = ['emit', 'wires', 'lens', 'out', 'brief', 'dec'];
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** Shows `text` decoded up to p (0 to 1): the start settled, the rest random glyphs, spaces kept. */
function decode(el: HTMLElement, text: string, p: number) {
  if (p <= 0 || p >= 1) {
    if (el.textContent !== text) el.textContent = text;
    return;
  }
  const n = Math.floor(text.length * p);
  let s = text.slice(0, n);
  for (let i = n; i < text.length; i++) s += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
  el.textContent = s;
}

export function mountRiskPicture(rp: HTMLElement, scene: HTMLElement, mm: gsap.MatchMedia) {
  const q = <T extends Element = HTMLElement>(sel: string) => rp.querySelector<T>(sel)!;
  const qa = <T extends Element = HTMLElement>(sel: string) => [...rp.querySelectorAll<T>(sel)];
  const el = {
    src: q('.rp-src'), company: q('.rp-company'), sigs: qa('[data-rp-sig]'), wires: qa<SVGPathElement>('[data-rp-wire]'),
    lens: q('.rp-lens'), focus: q<SVGGElement>('[data-rp-focus]'), ticks: q<SVGGElement>('[data-rp-ticks]'),
    caps: qa('[data-rp-cap]'), nodes: qa<SVGGElement>('[data-rp-node]'), beam: qa<SVGPathElement>('[data-rp-beam]'),
    brief: q('.rp-brief'), head: q('[data-rp-head]'), chip: q('[data-rp-chip]'), tiles: qa('[data-rp-tile]'),
    events: q('[data-rp-events]'), exposure: q('[data-rp-exposure]'),
    decide: q('.rp-decide'), fan: qa<SVGPathElement>('[data-rp-fan]'), decs: qa('[data-rp-dec]'),
    rail: q<SVGPathElement>('[data-rp-rail]'), marks: qa<SVGRectElement>('[data-rp-mark]'),
  };
  const capText = el.caps.map((c) => c.textContent ?? '');
  const headText = el.head.textContent ?? '';
  const stage = (name: string, on: boolean) => rp.classList.toggle(`st-${name}`, on);

  // keep the running parts still while the plate is off screen
  new IntersectionObserver(([e]) => rp.classList.toggle('is-vis', e.isIntersecting)).observe(rp);

  // where the pulse has to reach each signal (it grows one company-width sideways, three up and down),
  // and where the scan line meets each tile
  let sigAt: number[] = [];
  let tileAt: number[] = [];
  const measure = () => {
    const c = el.company.getBoundingClientRect();
    const cx = c.left + c.width / 2;
    const cy = c.top + c.height / 2;
    const raw = el.sigs.map((s) => {
      const r = s.getBoundingClientRect();
      const dx = Math.abs(r.left + r.width / 2 - cx) - c.width / 2;
      const dy = Math.abs(r.top + r.height / 2 - cy) - c.height / 2;
      return Math.max(0, dx / (c.width / 2), dy / (c.width * 1.5));
    });
    const far = Math.max(...raw, 0.001);
    sigAt = raw.map((d) => 0.04 + (0.9 * d) / far);
    const h = el.brief.offsetHeight || 1;
    tileAt = el.tiles.map((t) => t.offsetTop / h);
  };

  // the run's state, each 0 to its end; the show* functions draw it
  const S = { e: 0, cap: 0, scan: 0, dec: 0 };
  const showEmit = () => {
    rp.style.setProperty('--e', S.e.toFixed(3));
    el.sigs.forEach((s, i) => s.classList.toggle('on', S.e >= sigAt[i]));
    stage('emit', S.e >= 0.999);
  };
  const showCaps = () =>
    el.caps.forEach((c, i) => {
      const on = S.cap > i;
      c.classList.toggle('on', on);
      el.nodes[i]?.classList.toggle('on', on);
      decode(c, capText[i], clamp((S.cap - i) / 1.5));
    });
  const showScan = () => {
    el.brief.style.setProperty('--scan', S.scan.toFixed(4));
    el.brief.classList.toggle('is-scanning', S.scan > 0 && S.scan < 1);
    el.chip.classList.toggle('on', S.scan > 0.02);
    el.tiles.forEach((t, i) => t.classList.toggle('on', S.scan > tileAt[i]));
    decode(el.head, headText, clamp(S.scan / 0.3));
    el.events.textContent = String(Math.round(14 * clamp((S.scan - 0.04) / 0.86)));
    const from = tileAt[1] ?? 0.2;
    el.exposure.textContent = (22.5 * clamp((S.scan - from) / (0.96 - from))).toFixed(1);
  };
  const showDec = () => {
    el.fan.forEach((b, i) => b.style.setProperty('stroke-dashoffset', String(1 - clamp(S.dec - i))));
    el.decs.forEach((d, i) => d.classList.toggle('on', S.dec >= i + 0.98));
  };
  const showAll = () => { showEmit(); showCaps(); showScan(); showDec(); };

  const arm = () => {
    rp.classList.add('is-armed');
    measure();
    S.e = S.cap = S.scan = S.dec = 0;
    showAll();
  };
  const disarm = () => {
    rp.classList.remove('is-armed', ...STAGES.map((s) => `st-${s}`));
    rp.style.removeProperty('--e');
    el.brief.style.removeProperty('--scan');
    el.brief.classList.remove('is-scanning');
    [...el.sigs, ...el.caps, ...el.nodes, ...el.tiles, el.chip, ...el.decs, ...el.marks].forEach((x) => x.classList.remove('on', 'hl'));
    el.wires.forEach((w) => w.classList.remove('hl'));
    el.caps.forEach((c, i) => (c.textContent = capText[i]));
    el.head.textContent = headText;
    el.events.textContent = '14';
    el.exposure.textContent = '22.5';
    el.fan.forEach((b) => b.style.removeProperty('stroke-dashoffset'));
  };

  // wide: one timeline, scrubbed while the chapter holds
  mm.add(PLATE, () => {
    arm();
    const middleOut = [4, 3, 5, 2, 6, 1, 7, 0, 8].map((i) => el.wires[i]).filter(Boolean);
    const at = { wires: 0.3, lens: 0.34, out: 0.58, brief: 0.77, dec: 0.97 };
    const markAt = [0.002, 0.3, 0.58, 0.77];
    const tl: gsap.core.Timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: '+=220%', pin: true, scrub: 0.6,
        invalidateOnRefresh: true, onRefresh: () => { measure(); showAll(); },
      },
      onUpdate: () => {
        const t = tl.time();
        (Object.keys(at) as (keyof typeof at)[]).forEach((k) => stage(k, t >= at[k]));
        el.marks.forEach((m, i) => m.classList.toggle('on', t >= markAt[i]));
      },
    });
    tl.to(S, { e: 1, duration: 0.2, onUpdate: showEmit }, 0)
      .fromTo(middleOut, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.1, stagger: 0.012 }, 0.1)
      .fromTo(el.focus, { scale: 1.14, opacity: 0.3, svgOrigin: '170 170' }, { scale: 1, opacity: 1, svgOrigin: '170 170', duration: 0.14 }, 0.26)
      .fromTo(el.ticks, { rotation: -90, svgOrigin: '170 170' }, { rotation: 0, svgOrigin: '170 170', duration: 0.3 }, 0.26)
      .to(S, { cap: el.caps.length + 0.5, duration: 0.2, onUpdate: showCaps }, 0.34)
      .fromTo(el.beam, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.05 }, 0.52)
      .fromTo(el.brief, { opacity: 0.25 }, { opacity: 1, duration: 0.04 }, 0.55)
      .to(S, { scan: 1, duration: 0.18, onUpdate: showScan }, 0.58)
      .to(S, { dec: el.decs.length, duration: 0.2, onUpdate: showDec }, 0.77)
      .fromTo(el.rail, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 0);

    // pointing at a signal lights its wire; at a capability, its node
    const offs: (() => void)[] = [];
    const hover = (src: HTMLElement, targets: (Element | undefined)[]) => {
      const all = [src, ...targets].filter(Boolean) as Element[];
      const on = () => all.forEach((t) => t.classList.add('hl'));
      const off = () => all.forEach((t) => t.classList.remove('hl'));
      src.addEventListener('pointerenter', on);
      src.addEventListener('pointerleave', off);
      offs.push(() => { src.removeEventListener('pointerenter', on); src.removeEventListener('pointerleave', off); off(); });
    };
    el.sigs.forEach((s) => hover(s, [el.wires[Number(s.dataset.row)]]));
    el.caps.forEach((c, i) => hover(c, [el.nodes[i]]));

    return () => { offs.forEach((f) => f()); disarm(); };
  });

  // narrower: each part plays once as it comes into view
  mm.add(STACK, () => {
    arm();
    const once = (trigger: Element, name: string) =>
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger, start: 'top 80%', once: true }, onStart: () => stage(name, true) });
    once(el.src, 'emit').to(S, { e: 1, duration: 1.8, ease: 'power1.inOut', onUpdate: showEmit });
    once(el.lens, 'lens')
      .fromTo(el.focus, { scale: 1.14, opacity: 0.3, svgOrigin: '170 170' }, { scale: 1, opacity: 1, svgOrigin: '170 170', duration: 1.2, ease: 'power2.out' }, 0)
      .fromTo(el.ticks, { rotation: -90, svgOrigin: '170 170' }, { rotation: 0, svgOrigin: '170 170', duration: 1.6, ease: 'power3.out' }, 0)
      .to(S, { cap: el.caps.length + 0.5, duration: 2.4, onUpdate: showCaps }, 0.3);
    once(el.brief, 'brief').to(S, { scan: 1, duration: 2, onUpdate: showScan });
    once(el.decide, 'dec').to(S, { dec: el.decs.length, duration: 1.8, onUpdate: showDec });
    return disarm;
  });
}
