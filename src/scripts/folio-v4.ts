// /v4 (Folio home, with the current privaini.com's content): the hero (src/scripts/folio-kit.ts), then
//   (the figures count up through the motion layer's data-count, src/scripts/motion.ts)
//   risk picture   on a wide screen the chapter holds while its plate plays as a live instrument: your company
//                  pulses, the signals lock on, packets run into the lens, the lens focuses and its capabilities
//                  lock on, a scan line compiles the briefing (14 events, $22.5M), and a fan ticks the decisions.
//                  Narrower, each part plays once as it comes into view (src/scripts/risk-picture.ts).
//   findings       Findings → Exposure → Remediation: the line draws down as the chapter scrolls by
// Plus each chapter's hairline drawing (folio-kit.ts): the staircase, the tallies, the team marks, the lens.
// Under reduced motion nothing moves: every figure and drawing is simply there.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountFolioHero, mountLines, MOTION } from './folio-kit';
import { mountRiskPicture } from './risk-picture';

gsap.registerPlugin(ScrollTrigger);

export function mountFolioV4(root: HTMLElement) {
  const mm = gsap.matchMedia();
  const q = <T extends Element = HTMLElement>(sel: string, from: ParentNode = root) => from.querySelector<T>(sel);
  const qa = <T extends Element = HTMLElement>(sel: string, from: ParentNode = root) => [...from.querySelectorAll<T>(sel)];

  // page order matters: the hero's pin first, then what follows it
  mountFolioHero(root, mm);
  mountLines(root, mm);

  // ---- the risk picture (src/scripts/risk-picture.ts) ----
  const rp = q('[data-rp]');
  const scene = q('[data-pic-scene]');
  if (rp && scene) mountRiskPicture(rp, scene, mm);

  // ---- findings: the line draws down Findings → Exposure → Remediation as the chapter scrolls by ----
  mm.add(MOTION, () => {
    const line = q('[data-fnd-line]');
    if (!line) return;
    const items = qa('[data-fnd-item]', line);
    let at: number[] = [];
    const measure = () => {
      const r = line.getBoundingClientRect();
      at = items.map((li) => (li.querySelector('.node')!.getBoundingClientRect().top - r.top) / r.height);
    };
    const s = { p: 0 };
    const show = () => {
      line.style.setProperty('--p', s.p.toFixed(4));
      items.forEach((li, i) => li.classList.toggle('on', s.p >= (at[i] ?? 0) - 0.001));
    };
    line.classList.add('is-armed');
    measure();
    show();
    gsap.to(s, {
      p: 1, ease: 'none', onUpdate: show,
      scrollTrigger: { trigger: line, start: 'top 75%', end: 'bottom 55%', scrub: 0.6, invalidateOnRefresh: true, onRefresh: () => { measure(); show(); } },
    });
    return () => {
      line.classList.remove('is-armed');
      line.style.removeProperty('--p');
      items.forEach((li) => li.classList.remove('on'));
    };
  });
}
