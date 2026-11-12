// Folio: the pieces every Folio home page shares.
//   mountFolioHero  the hero's lens tour (src/scripts/xray.ts) and, on a wide screen, the scene where the lens
//                   leaves the sample site for the middle of the screen and opens wide; "The" and "lens." close in
//   mountLines      each chapter's hairline drawing (src/components/folio/Lines.astro) comes in once, when its
//                   chapter does
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountXray } from './xray';

gsap.registerPlugin(ScrollTrigger);

export const WIDE = '(prefers-reduced-motion: no-preference) and (min-width: 900px)';
export const NARROW = '(prefers-reduced-motion: no-preference) and (max-width: 899px)';
export const MOTION = '(prefers-reduced-motion: no-preference)';

export function mountFolioHero(root: HTMLElement, mm: gsap.MatchMedia) {
  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);
  // the lens tours the sample site at every size; it keeps clear of the headline and buttons
  const xrRoot = q('[data-hero] [data-xray]');
  const copy = q('[data-hero-copy]');
  const xray = xrRoot ? mountXray(xrRoot, () => copy?.getBoundingClientRect() ?? null) : null;

  mm.add(WIDE, () => {
    const hero = q('[data-hero]');
    const visual = q('[data-hero-visual]');
    if (!hero || !visual || !xray) return;
    const page = visual.querySelector<HTMLElement>('[data-xr-page]')!;
    // move the sample site so its middle sits in the middle of the screen (measured on the x-ray's box, which the
    // move doesn't touch)
    const shift = () => {
      const v = xrRoot!.getBoundingClientRect(), h = hero.getBoundingClientRect();
      return { x: innerWidth / 2 - (v.left + v.width / 2), y: innerHeight / 2 - (v.top - h.top + v.height / 2) };
    };
    const s = { p: 0 };
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=130%', pin: true, scrub: 0.8, invalidateOnRefresh: true },
    })
      .to(s, { p: 1, duration: 1, ease: 'power2.inOut', onUpdate: () => xray.setScene(s.p) }, 0)
      .to(page, { x: () => shift().x, y: () => shift().y, duration: 1, ease: 'power2.inOut' }, 0)
      .to(page.querySelector('.xr-site'), { opacity: 0.06, duration: 0.6 }, 0.15)
      .to(page, { backgroundColor: 'rgba(17, 24, 26, 0)', borderColor: 'rgba(232, 236, 233, 0)', duration: 0.6 }, 0.15)
      .to(copy, { opacity: 0, y: -48, duration: 0.4 }, 0)
      .to(hero.querySelector('[data-lines]'), { opacity: 0, duration: 0.3 }, 0)
      .to(hero.querySelector('[data-hero-cap]'), { opacity: 0, duration: 0.2 }, 0)
      .fromTo(hero.querySelector('[data-arch-l]'), { opacity: 0, x: '-8vw' }, { opacity: 1, x: 0, duration: 0.5 }, 0.5)
      .fromTo(hero.querySelector('[data-arch-r]'), { opacity: 0, x: '8vw' }, { opacity: 1, x: 0, duration: 0.5 }, 0.5)
      .fromTo(hero.querySelector('[data-arch-cap]'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7);
  });
}

export function mountLines(root: HTMLElement, mm: gsap.MatchMedia) {
  mm.add(MOTION, () => {
    const drawings = [...root.querySelectorAll<SVGSVGElement>('[data-lines]')];
    drawings.forEach((d) => d.classList.add('is-armed'));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('on');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -15% 0px' });
    drawings.forEach((d) => io.observe(d));
    return () => {
      io.disconnect();
      drawings.forEach((d) => d.classList.remove('is-armed', 'on'));
    };
  });
}
