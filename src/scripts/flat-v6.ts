// /v6 (the second take on Flat): everything /v5 plays (the figures that decode, the closing line that types itself,
// the x-ray, the refraction, the marquee), plus the findings stepper: when the steps come into view they light one
// after another, and the exposure map is drawn part by part with them (data-part 1, 2, 3 on the map).
// The page is served complete; the stepper is armed (dimmed, the map blank) only once this script runs.
import { mountFlatV5 } from './flat-v5';

export function mountFlatV6(root: HTMLElement) {
  mountFlatV5(root);
  stepper(root);
}

function stepper(root: HTMLElement) {
  const sec = root.querySelector<HTMLElement>('.f6');
  const row = root.querySelector<HTMLElement>('[data-f6-steps]');
  const xm = root.querySelector<HTMLElement>('[data-xm]');
  if (!sec || !row || !xm) return;
  const steps = [...row.querySelectorAll<HTMLElement>('[data-f6-step]')];
  sec.classList.add('is-armed');
  steps.forEach((s) => s.classList.remove('on'));
  xm.dataset.part = '0';
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    steps.forEach((s, i) => window.setTimeout(() => {
      s.classList.add('on');
      xm.dataset.part = String(i + 1);
    }, 250 + i * 1200));
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(row);
}
