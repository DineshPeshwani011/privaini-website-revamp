// The lens of the x-ray (src/components/folio/Xray.astro). It tours the page's parts in turn, settling on each
// while a tag names the law that part meets; over the page, on a mouse, it follows the pointer instead. Inside
// the lens the page is shown as a regulator reads it, magnified. A scroll scene can take the lens over
// (setScene): it draws to the middle of the screen and opens wide.
// Under reduced motion it rests on the first part, with its tag, and does not move.
import { gsap } from 'gsap';

export interface Xray {
  /** 0: the lens is the page's; 1: it sits in the middle of the screen, open wide */
  setScene(p: number): void;
}

export function mountXray(root: HTMLElement, avoid?: () => DOMRect | null): Xray {
  const page = root.querySelector<HTMLElement>('[data-xr-page]')!;
  const ev = root.querySelector<HTMLElement>('[data-xr-ev]')!;
  const lens = root.querySelector<HTMLElement>('[data-xr-lens]')!;
  const tag = root.querySelector<HTMLElement>('[data-xr-tag]')!;
  const tagLaw = tag.querySelector<HTMLElement>('[data-xr-law]')!;
  const tagNote = tag.querySelector<HTMLElement>('[data-xr-note]')!;
  const parts = [...root.querySelectorAll<HTMLElement>('[data-xr-target]')]
    .sort((a, b) => Number(a.dataset.xrTarget) - Number(b.dataset.xrTarget));
  // Flat (/v5) keeps the tour for visitors with Reduce Motion on: the lens drifts inside its own small picture
  const reduce = !document.body.classList.contains('flat') && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;

  let r0 = 120;          // the lens's radius, px
  let m0 = 1.4;          // and its magnification, unless a part asks for less (data-mag)
  const at = { x: 0, y: 0, m: 1.4 };   // where the tour (or the pointer) has the lens, in root px
  const ptr = { x: 0, y: 0, m: 1.4 };
  const mag = (el: HTMLElement | null) => (el?.dataset.mag ? Math.min(m0, Number(el.dataset.mag)) : m0);
  let following = false;
  let scene = 0;
  let index = -1;
  let active: HTMLElement | null = null;
  let travel: gsap.core.Tween | null = null;
  let dwell: gsap.core.Tween | null = null;
  let idle: gsap.core.Tween | null = null;
  let tagW = 280;        // the tag's width, px (measured once it shows)

  const size = () => {
    const w = page.offsetWidth;
    r0 = Math.round(Math.min(170, Math.max(64, w * 0.18)));
    m0 = w < 600 ? 1.9 : 1.4;
  };
  const centre = (el: Element) => {
    const a = el.getBoundingClientRect(), b = root.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
  };

  // a part the lens can rest on: inside the screen, below the nav, and clear of the copy
  const clear = (el: HTMLElement) => {
    const a = el.getBoundingClientRect();
    const x = a.left + a.width / 2, y = a.top + a.height / 2, r = r0;
    if (x - r * 0.5 < 0 || x + r * 0.5 > innerWidth || y - r * 0.5 < 64 || y + r * 0.5 > innerHeight) return false;
    const c = avoid?.();
    return !(c && x + r > c.left && x - r < c.right && y + r > c.top && y - r < c.bottom);
  };

  const show = (el: HTMLElement | null) => {
    active = el;
    if (el) { tagLaw.textContent = el.dataset.law ?? ''; tagNote.textContent = el.dataset.note ?? ''; }
    tag.classList.toggle('on', !!el);
  };

  // the tour: on to the next part in view, settle, name it, wait, go on
  const next = () => {
    dwell?.kill(); travel?.kill();
    for (let k = 1; k <= parts.length; k++) {
      const j = (index + k) % parts.length;
      if (!clear(parts[j])) continue;
      index = j;
      show(null);
      const c = centre(parts[j]);
      travel = gsap.to(at, {
        x: c.x, y: c.y, m: mag(parts[j]), duration: 1.5, ease: 'power3.inOut',
        onComplete: () => { show(parts[j]); dwell = gsap.delayedCall(2.8, next); },
      });
      return;
    }
    dwell = gsap.delayedCall(1.2, next);   // nothing in view yet
  };

  const draw = (x: number, y: number, r: number, m: number) => {
    lens.style.width = lens.style.height = `${2 * r}px`;
    lens.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
    // the evidence layer is the page's: put the lens's centre in its coordinates, magnify about it, clip to it
    const p = page.getBoundingClientRect(), b = root.getBoundingClientRect();
    const ex = x - (p.left - b.left), ey = y - (p.top - b.top);
    ev.style.transformOrigin = `${ex.toFixed(1)}px ${ey.toFixed(1)}px`;
    ev.style.transform = `scale(${m.toFixed(3)})`;
    ev.style.clipPath = `circle(${(r / m).toFixed(1)}px at ${ex.toFixed(1)}px ${ey.toFixed(1)}px)`;
    // the tag sits off the lens's lower right, or its lower left near the screen's edge
    // (a hidden tag measures 0 wide, so remember its width from when it was last shown)
    const d = r * 0.72 + 14;
    if (tag.offsetWidth) tagW = tag.offsetWidth;
    const tw = tagW;
    const right = b.left + x + d + tw < innerWidth - 16;
    tag.style.transform = `translate3d(${(right ? x + d : x - d - tw).toFixed(1)}px, ${(y + r * 0.45).toFixed(1)}px, 0)`;
  };

  const frame = () => {
    if (following) { at.x += (ptr.x - at.x) * 0.16; at.y += (ptr.y - at.y) * 0.16; at.m += (ptr.m - at.m) * 0.1; }
    let x = at.x, y = at.y, r = r0, m = at.m;
    if (scene > 0) {
      const b = root.getBoundingClientRect();
      x += (innerWidth / 2 - b.left - x) * scene;
      y += (innerHeight / 2 - b.top - y) * scene;
      r += (Math.min(innerHeight * 0.34, innerWidth * 0.19) - r) * scene;
      m += (1.1 - m) * scene;
    }
    draw(x, y, r, m);
  };

  size();
  const first = parts.find(clear) ?? parts[0];
  index = parts.indexOf(first);
  Object.assign(at, centre(first), { m: mag(first) });

  if (reduce) {
    frame();
    show(first);
    addEventListener('resize', () => { size(); Object.assign(at, centre(active ?? first)); frame(); });
    return { setScene: () => {} };
  }

  // run only while the picture is on screen
  let running = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; gsap.ticker.add(frame); }
    else if (!e.isIntersecting && running) { running = false; gsap.ticker.remove(frame); }
  }).observe(root);

  frame();
  dwell = gsap.delayedCall(1.1, () => { show(first); dwell = gsap.delayedCall(2.8, next); });

  addEventListener('resize', () => {
    size();
    if (!following && !travel?.isActive()) Object.assign(at, centre(active ?? parts[index] ?? first));
  });

  if (mouse) {
    const release = () => {
      following = false;
      if (active) index = parts.indexOf(active);
      dwell = gsap.delayedCall(active ? 1.6 : 0.2, next);
    };
    page.addEventListener('pointermove', (e) => {
      if (scene > 0) return;
      const b = root.getBoundingClientRect();
      ptr.x = e.clientX - b.left;
      ptr.y = e.clientY - b.top;
      if (!following) { following = true; travel?.kill(); dwell?.kill(); }
      const over = parts.find((el) => {
        const a = el.getBoundingClientRect();
        return e.clientX >= a.left && e.clientX <= a.right && e.clientY >= a.top && e.clientY <= a.bottom;
      }) ?? null;
      if (over !== active) show(over);
      ptr.m = mag(over);
      idle?.kill();
      idle = gsap.delayedCall(3, release);
    });
    page.addEventListener('pointerleave', () => {
      if (!following) return;
      idle?.kill();
      idle = gsap.delayedCall(0.6, release);
    });
  }

  return {
    setScene(p) {
      const was = scene;
      scene = p;
      tag.classList.toggle('away', p > 0.02);
      if (p > 0 && was === 0) { travel?.pause(); dwell?.pause(); idle?.kill(); following = false; }
      if (p === 0 && was > 0) { travel?.resume(); dwell?.resume(); if (!travel?.isActive() && !dwell?.isActive()) next(); }
    },
  };
}
