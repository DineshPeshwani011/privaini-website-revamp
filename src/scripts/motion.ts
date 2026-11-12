// Motion layer for every page: Lenis smooth scroll driven by GSAP's ticker, masked headline
// reveals, staggered section entrances, counters and scrubbed parallax.
// Folio pages get an editorial variant of it (see `editorial` below).
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

declare global {
  interface Window { __motion?: boolean; lenis?: Lenis }
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Folio pages (<Base folio>, docs/DESIGN-LANGUAGE.md) ask for the editorial layer: smooth scroll, headlines
// rising line by line out of a mask, sections settling up, counters, and no blur or text scramble.
const editorial = document.body.dataset.motion === 'editorial';
const root = document.documentElement;
window.__motion = true;

// ---------- smooth scroll ----------
let lenis: Lenis | undefined;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, anchors: { offset: -88 } });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  addEventListener('privaini:scroll-stop', () => lenis!.stop());
  addEventListener('privaini:scroll-start', () => lenis!.start());
}

// ---------- reveals ----------
function show(el: Element) {
  gsap.set(el, { clearProps: 'opacity,transform' });
}

// Counters: [data-count="7"] with optional data-decimals, data-prefix, data-suffix
function counters(duration: number) {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count!);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const state = { v: 0 };
    const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const render = () => (el.textContent = prefix + fmt.format(state.v) + suffix);
    render();
    gsap.to(state, {
      v: target,
      duration,
      ease: 'power2.out',
      onUpdate: render,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

// Flat (/v5) with Reduce Motion on: a gentle layer, so the page is not simply still. Reveals are fades only (no
// rise), headlines fade in whole, counters count; no smooth scroll, no parallax, no scramble.
const gentle = reduce && document.body.classList.contains('flat');

if (gentle) {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    el.style.visibility = 'visible';
    gsap.from(el, { opacity: 0, duration: 0.9, ease: 'power2.out', delay: el.hasAttribute('data-split-now') ? 0.2 : 0,
      scrollTrigger: el.hasAttribute('data-split-now') ? undefined : { trigger: el, start: 'top 88%', once: true } });
  });
  const groups = new Map<Element, HTMLElement[]>();
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const group = el.closest('[data-reveal-group]') ?? el.parentElement ?? document.body;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(el);
  });
  groups.forEach((els, group) => {
    const fromTop = group.getBoundingClientRect().top < innerHeight * 0.9;
    gsap.to(els, {
      opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.08, delay: fromTop ? 0.3 : 0,
      scrollTrigger: fromTop ? undefined : { trigger: group, start: 'top 88%', once: true },
    });
  });
  counters(1.4);
} else if (reduce) {
  document.querySelectorAll('[data-reveal]').forEach(show);
  document.querySelectorAll('[data-reveal-line]').forEach((el) => el.removeAttribute('data-reveal-line'));
} else if (editorial) {
  // Folio: each headline line rises out of its own mask; nothing blurs
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const immediate = el.hasAttribute('data-split-now');
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        el.style.visibility = 'visible';
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.09,
          delay: immediate ? 0.25 : 0,
          scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 86%', once: true },
        });
      },
    });
  });
  // and each group settles once, 24px up, 90ms apart, and stays there
  const groups = new Map<Element, HTMLElement[]>();
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const group = el.closest('[data-reveal-group]') ?? el.parentElement ?? document.body;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(el);
  });
  groups.forEach((els, group) => {
    const fromTop = group.getBoundingClientRect().top < innerHeight * 0.9;
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.09,
      delay: fromTop ? 0.35 : 0,
      // transform:none, not cleared: clearing it would hand the element back to the CSS starting offset
      // (translateY(24px)), and everything would drop 24px once its entrance ended
      onComplete: () => els.forEach((el) => { el.style.transform = 'none'; }),
      scrollTrigger: fromTop ? undefined : { trigger: group, start: 'top 86%', once: true },
    });
  });
  counters(1.8);
} else {
  // Rack focus: the signature move. Each headline line comes up out of blur, the way a lens finds focus.
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const immediate = el.hasAttribute('data-split-now');
    SplitText.create(el, {
      type: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        el.style.visibility = 'visible';
        return gsap.from(self.lines, {
          yPercent: 35,
          opacity: 0,
          filter: 'blur(16px)',
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.1,
          delay: immediate ? 0.2 : 0,
          clearProps: 'filter',
          scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  // Section entrances: everything resolves from blur to sharp, heading first, 75ms apart.
  const groups = new Map<Element, HTMLElement[]>();
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const group = el.closest('[data-reveal-group]') ?? el.parentElement ?? document.body;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(el);
  });
  groups.forEach((els, group) => {
    const fromTop = group.getBoundingClientRect().top < innerHeight * 0.9;
    gsap.to(els, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.0,
      ease: 'power3.out',
      stagger: 0.075,
      delay: fromTop ? 0.35 : 0,
      // filter:none (not cleared) so the CSS starting blur doesn't come back, and glass panels inside keep their backdrop blur
      onComplete: () => els.forEach((el) => { el.style.filter = 'none'; }),
      scrollTrigger: fromTop ? undefined : { trigger: group, start: 'top 85%', once: true },
    });
  });

  // Evidence decodes: identifiers, statutes and timestamps in product fragments resolve out of noise.
  document.querySelectorAll<HTMLElement>('[data-ui] .ui-mono').forEach((el) => {
    if (el.closest('[data-scan], [data-noscramble]') || el.children.length) return;
    const text = el.textContent?.trim() ?? '';
    if (!text || text.length > 48) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.to(el, { duration: 0.9 + text.length * 0.012, scrambleText: { text, chars: '01▮▯/#%§$', speed: 0.55, revealDelay: 0.15 }, ease: 'none' }),
    });
  });

  counters(1.6);

  // Scrubbed drift: [data-parallax="0.15"] moves against the scroll by that share of its height.
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax || '0.12');
    gsap.fromTo(el, { yPercent: -amount * 50 }, {
      yPercent: amount * 50,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Scale-in pictures: [data-zoom] settles from 1.08 to 1 as it scrolls through.
  document.querySelectorAll<HTMLElement>('[data-zoom]').forEach((el) => {
    gsap.fromTo(el, { scale: 1.1 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'center center', scrub: true },
    });
  });

  // Footer wordmark rises letter-block by block as the page ends.
  const mark = document.querySelector('[data-footer-mark] .wordmark');
  if (mark) {
    gsap.from(mark, {
      yPercent: 40,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: mark, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
}

// Hand scroll and refresh hooks to page scripts.
export { gsap, ScrollTrigger, SplitText, lenis, reduce };
addEventListener('load', () => ScrollTrigger.refresh());
root.classList.add('motion-ready');
