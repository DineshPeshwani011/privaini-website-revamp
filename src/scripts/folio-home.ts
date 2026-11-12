// /v3 (Folio home): the scroll scenes. Each is scrubbed to scroll and pinned while it plays:
//   hero      (src/scripts/folio-kit.ts) the lens leaves the sample site for the middle of the screen and opens
//   findings  the findings travel sideways past the reader (01 / 05)
//   scale     the headline figure counts up, and the gauge's line runs round with it, as the page holds
//   steps     how it works advances 01 → 03 while the chapter holds
//   expand    an inset picture opens out to the full screen
//   who       the audience timeline draws itself as the chapter scrolls by, lighting each audience in turn
// Plus the hero's lens tour, each chapter's hairline drawing (both in folio-kit.ts), the evidence plates (a dialog),
// the statute map, and the contact form, which writes an email.
// Under reduced motion, or on narrow screens, nothing pins: every chapter simply sits in the page.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountFolioHero, mountLines, WIDE } from './folio-kit';

gsap.registerPlugin(ScrollTrigger);

export function mountFolioHome(root: HTMLElement) {
  const mm = gsap.matchMedia();
  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);
  const qa = <T extends Element = HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)];

  mountFolioHero(root, mm);
  mountLines(root, mm);

  mm.add(WIDE, () => {
    // ---- findings, sideways ----
    const rail = q('[data-rail]');
    if (rail) {
      const track = rail.querySelector<HTMLElement>('[data-track]')!;
      const cards = [...track.children];
      const count = rail.querySelector<HTMLElement>('[data-count-now]')!;
      const bar = rail.querySelector<HTMLElement>('[data-bar]')!;
      // the ruler under the cards: its ticks slide with them (the pattern repeats every 120px)
      const ruler = rail.querySelector<SVGPatternElement>('[data-lines-shift]');
      // travel until the last card ends on the column's right edge (the same inset as the left)
      const dist = () => track.scrollWidth - rail.clientWidth + parseFloat(getComputedStyle(track).paddingLeft);
      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        onUpdate: () => { ruler?.setAttribute('x', String(Math.round(Number(gsap.getProperty(track, 'x')) % 120))); },
        scrollTrigger: {
          trigger: rail, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (st) => {
            const n = Math.min(cards.length, Math.floor(st.progress * cards.length * 0.999) + 1);
            count.textContent = String(n).padStart(2, '0');
            bar.style.transform = `scaleX(${Math.max(0.04, st.progress)})`;
          },
        },
      });
    }

    // ---- the figure counts up, and the dial fills with it, while the chapter holds ----
    const scale = q('[data-scale]');
    if (scale) {
      const fig = scale.querySelector<HTMLElement>('[data-figure]')!;
      const arc = scale.querySelector<SVGElement>('[data-scale-arc]');
      const target = parseFloat(fig.dataset.figure!);
      const state = { v: 0 };
      fig.textContent = '0';
      gsap.timeline({
        scrollTrigger: { trigger: scale, start: 'top top', end: '+=90%', pin: true, scrub: 0.6 },
      })
        .to(state, { v: target, ease: 'none', onUpdate: () => { fig.textContent = String(Math.round(state.v)); } }, 0)
        .fromTo(arc, { strokeDashoffset: 100 }, { strokeDashoffset: 100 - target, ease: 'none' }, 0);
    }

    // ---- how it works: three steps while the chapter holds ----
    const steps = q('[data-steps]');
    if (steps) {
      const items = [...steps.querySelectorAll<HTMLElement>('[data-step]')];
      const ticks = [...steps.querySelectorAll<HTMLElement>('[data-tick]')];
      let cur = -1;
      const show = (i: number) => {
        if (i === cur) return;
        cur = i;
        items.forEach((el, k) => el.classList.toggle('on', k === i));
        ticks.forEach((el, k) => el.classList.toggle('on', k <= i));
      };
      show(0);
      ScrollTrigger.create({
        trigger: steps, start: 'top top', end: `+=${items.length * 70}%`, pin: true,
        onUpdate: (st) => show(Math.min(items.length - 1, Math.floor(st.progress * items.length))),
      });
    }

    // ---- a picture opens to the full screen ----
    const expand = q('[data-expand]');
    if (expand) {
      const media = expand.querySelector<HTMLElement>('[data-expand-media]')!;
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: expand, start: 'top top', end: '+=110%', pin: true, scrub: 0.8 } })
        .fromTo(media, { clipPath: 'inset(16% 22% 16% 22%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
        .fromTo(media.querySelector('[data-expand-xr]'), { scale: 1.2 }, { scale: 1 }, 0)
        .fromTo(expand.querySelector('[data-expand-copy]'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, 0.5);
    }
  });

  // without pins the figure still counts, once, when it comes into view (the gauge is hidden in one column)
  mm.add('(prefers-reduced-motion: no-preference) and (max-width: 899px)', () => {
    const fig = q('[data-scale] [data-figure]');
    if (!fig) return;
    const target = parseFloat(fig.dataset.figure!);
    const state = { v: 0 };
    fig.textContent = '0';
    gsap.to(state, {
      v: target, duration: 1.8, ease: 'power2.out', onUpdate: () => { fig.textContent = String(Math.round(state.v)); },
      scrollTrigger: { trigger: fig, start: 'top 85%', once: true },
    });
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ---- who it's for: the timeline draws itself as the chapter scrolls by; each audience lights as the line
    // reaches its node. Across the page on a wide screen, down it on a narrow one ----
    const line = q('[data-line]');
    if (line) {
      const items = [...line.querySelectorAll<HTMLElement>('[data-line-item]')];
      const wide = () => innerWidth >= 900;
      let at: number[] = [];
      const measure = () => {
        const r = line.getBoundingClientRect();
        at = items.map((li) => {
          const n = li.querySelector('.node')!.getBoundingClientRect();
          return wide() ? (n.left - r.left) / r.width : (n.top - r.top) / r.height;
        });
      };
      const s = { p: 0 };
      const draw = () => {
        line.style.setProperty('--p', s.p.toFixed(4));
        items.forEach((li, i) => li.classList.toggle('on', s.p >= (at[i] ?? 0) - 0.001));
      };
      line.classList.add('is-armed');
      measure();
      draw();
      gsap.to(s, {
        p: 1, ease: 'none', onUpdate: draw,
        scrollTrigger: {
          trigger: line, start: () => (wide() ? 'top 85%' : 'top 75%'), end: () => (wide() ? 'top 35%' : 'bottom 65%'),
          scrub: 0.6, invalidateOnRefresh: true, onRefresh: () => { measure(); draw(); },
        },
      });
    }
    return () => {
      if (line) {
        line.classList.remove('is-armed');
        line.style.removeProperty('--p');
        line.querySelectorAll('[data-line-item]').forEach((li) => li.classList.remove('on'));
      }
    };
  });

  // ---- evidence plates open in a dialog ----
  const dialog = q<HTMLDialogElement>('[data-plate-dialog]');
  if (dialog) {
    const fill = (plate: HTMLElement) => {
      dialog.querySelector('[data-d-n]')!.textContent = plate.dataset.n ?? '';
      dialog.querySelector('[data-d-name]')!.textContent = plate.dataset.name ?? '';
      dialog.querySelector('[data-d-law]')!.textContent = plate.dataset.law ?? '';
      dialog.querySelector('[data-d-where]')!.textContent = plate.dataset.where ?? '';
      dialog.querySelector('[data-d-code]')!.textContent = plate.dataset.code ?? '';
      dialog.querySelector('[data-d-note]')!.textContent = plate.dataset.note ?? '';
      const link = dialog.querySelector<HTMLAnchorElement>('[data-d-link]')!;
      link.href = plate.dataset.href ?? '/what-we-find';
    };
    qa('[data-plate]').forEach((plate) => plate.addEventListener('click', () => {
      fill(plate);
      dispatchEvent(new Event('privaini:scroll-stop'));
      dialog.showModal();
    }));
    dialog.addEventListener('close', () => dispatchEvent(new Event('privaini:scroll-start')));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }

  // ---- the statute map: a list and pins that select each other ----
  const map = q('[data-map]');
  if (map) {
    const rows = [...map.querySelectorAll<HTMLButtonElement>('[data-place]')];
    const pins = [...map.querySelectorAll<SVGGElement>('[data-pin]')];
    const card = map.querySelector<HTMLElement>('[data-place-card]')!;
    const pick = (key: string) => {
      const row = rows.find((r) => r.dataset.place === key);
      if (!row) return;
      rows.forEach((r) => r.setAttribute('aria-pressed', String(r === row)));
      pins.forEach((p) => p.classList.toggle('on', p.dataset.pin === key));
      card.querySelector('[data-c-law]')!.textContent = row.dataset.law ?? '';
      card.querySelector('[data-c-name]')!.textContent = row.dataset.name ?? '';
      card.querySelector('[data-c-text]')!.textContent = row.dataset.text ?? '';
      card.querySelector<HTMLAnchorElement>('[data-c-link]')!.href = row.dataset.href ?? '/what-we-find';
      card.querySelector('[data-c-linktext]')!.textContent = `Read about ${row.dataset.short ?? row.dataset.name}`;
    };
    rows.forEach((r) => {
      r.addEventListener('click', () => pick(r.dataset.place!));
      r.addEventListener('pointerenter', () => pick(r.dataset.place!));
      r.addEventListener('focus', () => pick(r.dataset.place!));
    });
    pins.forEach((p) => p.addEventListener('click', () => pick(p.dataset.pin!)));
  }

  // ---- contact: copy an address; the form writes an email to review before sending ----
  qa<HTMLButtonElement>('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy!); b.textContent = 'Copied'; } catch { b.textContent = 'Select and copy'; }
    setTimeout(() => (b.textContent = 'Copy'), 1800);
  }));
  const form = q<HTMLFormElement>('[data-brief]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const domain = String(data.get('domain') ?? '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!domain) { form.querySelector<HTMLInputElement>('[name="domain"]')!.focus(); return; }
      const lines = [
        `Domain: ${domain}`,
        `Name: ${data.get('name') ?? ''}`,
        `I am: ${data.get('role') ?? ''}`,
        `Looking for: ${data.get('need') ?? ''}`,
        '',
        String(data.get('note') ?? ''),
      ];
      location.href = `mailto:sales@privaini.com?subject=${encodeURIComponent(`Assessment request: ${domain}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
    });
  }
}
