// /v5 (Flat): the page's drawings, and the cyan rules under its key phrases.
//   marks        each [data-in] block gets .in once it is on screen: its key phrase's cyan rule draws in, and an
//                institution's tally lights
//   hero         /v4's x-ray: the Privaini lens tours the sample website, keeping clear of the copy
//                (src/scripts/xray.ts; it rests, still, under reduced motion)
//   pipeline     the risk picture's wires are drawn from where its parts sit (wide); as it comes into view it plays
//                once (signals light, wires run in, the lens turns and its capabilities light, the briefing
//                fills to 14 events and $22.5M, the fan ticks each decision), then packets keep running
//   findings     the steps light down a cyan line as the chapter scrolls, and the exposure map beside builds with
//                them (on a phone the map plays on its own as it comes into view)
// Under reduced motion none of it moves: every drawing is shown whole and still.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountXray } from './xray';

gsap.registerPlugin(ScrollTrigger);

const MOTION = '(prefers-reduced-motion: no-preference)';
const WIDE_PL = '(min-width: 1280px)';
const FND_WIDE = '(prefers-reduced-motion: no-preference) and (min-width: 900px)';
const FND_NARROW = '(prefers-reduced-motion: no-preference) and (max-width: 899px)';
const NS = 'http://www.w3.org/2000/svg';

export function mountFlatV5(root: HTMLElement) {
  const mm = gsap.matchMedia();
  marks(root);
  ticker(root);
  decodeFigures(root);
  typeOn(root);
  hero(root);
  refraction(root, mm);
  findings(root, mm);
}

/** [data-in] → .in, once, when it is well on screen */
function marks(root: HTMLElement) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -18% 0px' },
  );
  root.querySelectorAll('[data-in]').forEach((el) => io.observe(el));
}

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** [data-decode] figures come out of scrambled glyphs, settling left to right, once they are on screen
 *  (the page is served with the real figure; it is scrambled only once the script runs) */
function decodeFigures(root: HTMLElement) {
  if (still()) return;
  const DIGITS = '0123456789';
  const SIGNS = '$%+.MB#/<>';
  const scramble = (final: string, p: number) => {
    let out = '';
    for (let i = 0; i < final.length; i++) {
      const c = final[i];
      if (c === ' ' || p >= (i + 1) / (final.length + 1)) { out += c; continue; }
      const set = /\d/.test(c) ? DIGITS : SIGNS;
      out += set[(Math.random() * set.length) | 0];
    }
    return out;
  };
  root.querySelectorAll<HTMLElement>('[data-decode]').forEach((el) => {
    const final = el.textContent ?? '';
    el.textContent = scramble(final, 0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      let last = 0;
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1400);
        if (p >= 1) { el.textContent = final; return; }
        if (now - last > 50) { el.textContent = scramble(final, p * 1.05); last = now; }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
  });
}

/** [data-type] (the closing line) types itself out behind a caret once it is on screen. Each letter keeps its
 *  place while hidden, so nothing moves as it types; the heading keeps its whole text as its accessible name. */
function typeOn(root: HTMLElement) {
  const el = root.querySelector<HTMLElement>('[data-type]');
  if (!el || still()) return;
  el.setAttribute('aria-label', (el.textContent ?? '').replace(/\s+/g, ' ').trim());
  const chars: HTMLElement[] = [];
  const wrap = (node: Node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const ch of n.textContent ?? '') {
          const s = document.createElement('span');
          s.className = 'tc';
          s.setAttribute('aria-hidden', 'true');
          s.textContent = ch;
          frag.appendChild(s);
          chars.push(s);
        }
        n.parentNode?.replaceChild(frag, n);
      } else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName !== 'BR') wrap(n);
    });
  };
  wrap(el);
  if (!chars.length) return;
  const caret = document.createElement('i');
  caret.className = 'caret';
  caret.setAttribute('aria-hidden', 'true');
  chars[0].before(caret);
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    let i = 0;
    const step = () => {
      // spaces show with the letter before them
      while (i < chars.length && !chars[i].textContent?.trim()) chars[i++].classList.add('on');
      if (i >= chars.length) return;
      chars[i].classList.add('on');
      chars[i].after(caret);
      i++;
      window.setTimeout(step, 34);
    };
    window.setTimeout(step, 450);
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(el);
}

/** the settlements ticker's pause: stops and starts the band, and says which it will do next */
function ticker(root: HTMLElement) {
  const band = root.querySelector<HTMLElement>('[data-ticker]');
  const btn = band?.querySelector<HTMLButtonElement>('[data-tk-pause]');
  if (!band || !btn) return;
  btn.addEventListener('click', () => {
    const paused = band.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    btn.setAttribute('aria-label', paused ? 'Play the settlements' : 'Pause the settlements');
  });
}

/** keeps .is-vis on an element while it is on screen (its running parts pause otherwise) */
function watch(el: Element, on?: (vis: boolean) => void) {
  new IntersectionObserver(([e]) => { el.classList.toggle('is-vis', e.isIntersecting); on?.(e.isIntersecting); }).observe(el);
}

// ---- the hero: /v4's x-ray, its lens touring the sample website and keeping clear of the copy ----
function hero(root: HTMLElement) {
  const xr = root.querySelector<HTMLElement>('[data-xray]');
  const copy = root.querySelector<HTMLElement>('[data-hx-copy]');
  if (xr) mountXray(xr, () => copy?.getBoundingClientRect() ?? null);
}

// ---- the risk picture: the refraction (src/components/flat/Refraction.astro) ----
// Drawn as the section scrolls into place: the threads run from the signals into the lens, the lens wakes and its
// ring of words appears, the four bands sweep out and the briefing settles beside them (14 events, $22.5M), the
// rule draws and the decisions tick. Then light keeps travelling down the threads.
function refraction(root: HTMLElement, mm: gsap.MatchMedia) {
  const rf = root.querySelector<HTMLElement>('[data-rf]');
  if (!rf) return;
  const all = <T extends Element = SVGElement>(s: string) => [...rf.querySelectorAll<T>(s)];
  const one = <T extends Element = SVGElement>(s: string) => rf.querySelector<T>(s)!;
  const sigs = all('[data-rf-sig]'), threads = all('[data-rf-thread]'), outs = all('[data-rf-out]'), decs = all('[data-rf-dec]');
  const lens = one('[data-rf-lens]'), ring = one('[data-rf-ring]'), clip = one('[data-rf-clip]'), rule = one('[data-rf-rule]');
  const events = one('[data-rf-events]'), exposure = one('[data-rf-exposure]');
  const full = Number(clip.getAttribute('width'));
  watch(rf);

  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1100px)', () => {
    const S = { ev: 0, ex: 0 };
    const tl: gsap.core.Timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: rf, start: 'top 82%', end: 'top 12%', scrub: 0.9 },
      onUpdate: () => rf.classList.toggle('is-live', tl.progress() > 0.97),
    });
    tl.fromTo(sigs, { opacity: 0.22 }, { opacity: 1, duration: 0.1, stagger: 0.012 }, 0)
      .fromTo(threads, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, stagger: 0.012, ease: 'power1.inOut' }, 0.02)
      .fromTo(lens, { opacity: 0.15, scale: 0.86, svgOrigin: '590 330' }, { opacity: 1, scale: 1, svgOrigin: '590 330', duration: 0.18, ease: 'power2.out' }, 0.3)
      .fromTo(ring, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.4)
      .to(S, { ev: 14, duration: 0.22, onUpdate: () => { events.textContent = String(Math.round(S.ev)); } }, 0.36)
      .fromTo(clip, { attr: { width: 0 } }, { attr: { width: full }, duration: 0.22, ease: 'power1.inOut' }, 0.48)
      .fromTo(outs, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.1, stagger: 0.035, ease: 'power2.out' }, 0.58)
      .to(S, { ex: 22.5, duration: 0.2, onUpdate: () => { exposure.textContent = S.ex.toFixed(1); } }, 0.64)
      .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.14, ease: 'power1.inOut' }, 0.78)
      .fromTo(decs, { opacity: 0.2 }, { opacity: 1, duration: 0.05, stagger: 0.03 }, 0.84)
      .to({}, { duration: 0.02 });
    return () => {
      rf.classList.remove('is-live');
      events.textContent = '14';
      exposure.textContent = '22.5';
    };
  });
}

// ---- findings: the steps, and the exposure map beside them ----
function findings(root: HTMLElement, mm: gsap.MatchMedia) {
  const line = root.querySelector<HTMLElement>('[data-fnd-line]');
  const xm = root.querySelector<HTMLElement>('[data-xm]');
  if (!line || !xm) return;
  const items = [...line.querySelectorAll<HTMLElement>('[data-fnd-item]')];
  const s = { p: 0 };
  let at: number[] = [];
  const measure = () => {
    const r = line.getBoundingClientRect();
    at = items.map((li) => (li.querySelector('.node')!.getBoundingClientRect().top - r.top) / r.height);
  };
  const reset = () => {
    line.classList.remove('is-armed');
    line.style.removeProperty('--p');
    items.forEach((li) => li.classList.remove('on'));
    xm.dataset.part = '3';
  };

  // wide: the map sits beside the steps and builds with them as the chapter scrolls
  mm.add(FND_WIDE, () => {
    const show = () => {
      line.style.setProperty('--p', s.p.toFixed(4));
      let n = 0;
      items.forEach((li, i) => { const lit = s.p >= (at[i] ?? 0) - 0.001; li.classList.toggle('on', lit); if (lit) n++; });
      if (xm.dataset.part !== String(n)) xm.dataset.part = String(n);
    };
    line.classList.add('is-armed');
    s.p = 0;
    measure();
    show();
    const tw = gsap.to(s, {
      p: 1, ease: 'none', onUpdate: show,
      scrollTrigger: { trigger: line, start: 'top 62%', end: 'bottom 62%', scrub: 0.6, invalidateOnRefresh: true, onRefresh: () => { measure(); show(); } },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); reset(); };
  });

  // narrow: the steps light down the line; the map, under them, plays on its own when it comes into view
  mm.add(FND_NARROW, () => {
    const show = () => {
      line.style.setProperty('--p', s.p.toFixed(4));
      items.forEach((li, i) => li.classList.toggle('on', s.p >= (at[i] ?? 0) - 0.001));
    };
    line.classList.add('is-armed');
    s.p = 0;
    measure();
    show();
    xm.dataset.part = '0';
    const tw = gsap.to(s, {
      p: 1, ease: 'none', onUpdate: show,
      scrollTrigger: { trigger: line, start: 'top 70%', end: 'bottom 60%', scrub: 0.6, invalidateOnRefresh: true, onRefresh: () => { measure(); show(); } },
    });
    const tl = gsap.timeline({ scrollTrigger: { trigger: xm, start: 'top 75%', once: true } });
    [1, 2, 3].forEach((n, i) => tl.call(() => { xm.dataset.part = String(n); }, [], i * 0.9));
    return () => { tw.scrollTrigger?.kill(); tw.kill(); tl.scrollTrigger?.kill(); tl.kill(); reset(); };
  });
}
