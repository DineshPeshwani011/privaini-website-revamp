# Privaini site — page build guide

How pages in this Astro site are put together. Read this before adding or changing a page.

## The concept: the lens

Everything a company publishes — cookies, pixels, policies, consent flows — is scattered signal. Privaini is the
lens that resolves it into evidence (a risk briefing) and then into decisions. The site behaves like that optical
instrument:

- **Home:** `LensHero.astro` + `src/scripts/lens/` is Privaini's hero image built as a Three.js world (signal field →
  light streams → ringed lens → laptop with the briefing → next decisions). Scroll flies the camera through five
  acts; pointing at a signal lights its stream and names the law it triggers. The still poster
  (`public/media/lens/privaini-lens-poster.webp`) is the first frame and the no-WebGL / reduced-motion fallback.
- **Every page's opening:** `hairline/HairlineField.astro` (inside `PageHero`, `PartnerHero`, the blog, post,
  legal, 404 and demo openings, and the closing `CtaBlank`) draws the lens in hairlines: rings turning very slowly
  and the page's own signals (`src/data/lens-signals.ts`, keyed by path) arriving along hairlines. Add an entry
  there for any new page. A section that holds one takes the `has-field` class.
- **Motion vocabulary (motion.ts):** headlines and sections *rack focus* (blur → sharp); IDs, statutes and
  timestamps in `[data-ui]` fragments *decode* from noise; pages change through an *iris* (cross-document view
  transitions in `global.css`); `FocusCursor.astro` is an *autofocus* bracket that locks onto what you point at.
- **Look:** the lens's deep teal ground, cyan light, glass product panels (`[data-ui]` uses backdrop blur).
  Glows are part of the language now; keep them on light sources and the one action, not on body text.
- **Two themes.** Light (white ground, deep brand teal `#0A3D47` text, cyan for actions) is the default; the
  nav's sun/moon button switches to dark and remembers the choice (`localStorage` `privaini-theme`; `?theme=dark`
  also works). Every colour is a token in `global.css`, declared for dark on `:root, .theme-dark` and overridden
  on `html[data-theme='light']`. Add `theme-dark` to anything that must stay dark in both (the CTA, deep-teal
  field blocks), and `data-nav-dark` to a full-width dark section so the nav turns dark over it.
  Canvas and WebGL pieces re-read their colours on the `privaini:theme` event. Never hard-code `#fff` text: use
  `--strong` / `--ink`.
- **The lens hero follows the theme.** In light, `world.ts` adds a final "ink pass" that flips lightness and keeps
  hue (navy → paper, cyan light → brand teal, white type → deep-teal ink) and softens the light sources
  (`LIGHT_GLOW`) so the beam prints as a wash, not a dark mass.
- **The hero's words** live in `src/data/lens-acts.ts` (copy, chapters, scroll timing) and its 3D labels in
  `src/scripts/lens/data.ts`.
- **The hero posters** (`public/media/lens/privaini-lens-poster.webp` and `…-poster-light.webp`) are 1905×1080
  frames of the live world at the top of the hero, one per theme, so the hand-off to the live render is seamless.
  Recapture them whenever the world changes: in dev, `window.__lens` exposes the world, so set progress 0, call
  `frame()` a few dozen times, then draw the canvas to a 2D canvas in the same task and save it. The original
  hero artwork the scene was built from is kept in `docs/reference/privaini-lens-artwork.webp`.

## Stack

- **Astro 5** static site, TypeScript. One file per route in `src/pages/<slug>.astro` (the slug is the old privaini.com path, e.g. `/enterprises` → `src/pages/enterprises.astro`).
- **GSAP 3 + ScrollTrigger + SplitText** and **Lenis** smooth scroll, wired once in `src/scripts/motion.ts` (loaded by the layout). Pages never initialise Lenis or GSAP themselves; they opt in with data attributes.
- **Hairline figures**: flat, labelled SVG diagrams with one slow motion each (`hairline/HairlineFigure.astro`),
  used by `ExplainerSection` and the partner `Capabilities` block. They replaced the isometric anatomy explainers on
  2026-11-03; the `explainers/` source folder is no longer built or served.
- **Three.js** only where a page has a real 3D subject (see `CoverageGlobe.astro` if present).
- Fonts are self-hosted (Fontsource). The site makes **no third-party requests** — keep it that way (no CDNs, no Google Fonts, no analytics).

## Content source

The current privaini.com was crawled; each page's text is in markdown at
`C:\Users\DineshPeshwani\AppData\Local\Temp\claude\C--Users-DineshPeshwani-Desktop-privaini-website-revamp\9678aa00-02ad-4e9f-a017-b65b21819ff8\scratchpad\site\md\<slug>.md`
(lines 1–4 are URL / TITLE / DESC / OG; use TITLE and DESC for the page's `<Base title description>`).

- Carry **all** of a page's substance across: every section, list item, figure, quote and link. Re-compose it; don't drop it.
- You may tighten a headline so it fits two lines, and drop eyebrow labels (`FOR ENTERPRISES`, `REGULATION GUIDE`, …), but keep the meaning.
- **Never invent** customers, quotes, statistics, logos, prices or outcomes. Sample data inside product fragments must come from the page or from `src/data/findings.ts` (Privaini's published sample report).
- Links: keep internal links as root paths (`/vppa`, `/request-a-demo`). The old site sent many CTAs to `/request-a-demo`; keep that.
- Images: anything from the old site is in `public/media/` (map in `src/data/media.json`, remote URL → local path). Headshots are `public/media/headshot-*.png`, customer logos in `src/data/logos.ts`.

## Page skeleton

```astro
---
import Base from '@/layouts/Base.astro';
import PageHero from '@/components/PageHero.astro';
import StatusPanel from '@/components/StatusPanel.astro';
import SectionHead from '@/components/SectionHead.astro';
import PointList from '@/components/PointList.astro';
import CtaBlank from '@/components/CtaBlank.astro';
---
<Base title="For Enterprises | Privaini" description="…">
  <PageHero title="You manage your privacy program. Privaini verifies it’s working." lead="…">
    <StatusPanel title="Program verification" rows={[…]} total={{ label: 'Program integrity', value: '72%' }} />
  </PageHero>

  <section class="section" aria-labelledby="gap-h">
    <div class="wrap">
      <SectionHead id="gap-h" title="Your program says one thing. Regulators see another." text="…" />
      <PointList variant="index" items={[…]} />
    </div>
  </section>

  <CtaBlank />
</Base>
```

- Every page: exactly one `h1` (PageHero does it), an `h2` heading on every section, ends with `<CtaBlank />` (or a page-specific closing CTA).
- Sections are `<section class="section">` (plain ground), `class="section section--raised"` (one tone lighter) or `class="section section--field"` (brand deep-teal field — at most once per page). Inside, content sits in `<div class="wrap">`. A 12-column grid is available as `class="grid"`.
- **Neighbouring sections must not share a composition.** Alternate: index rows → figures → tiles → fragment + text → quote → stories …

## Components (src/components)

| Component | Use for | Key props |
| --- | --- | --- |
| `PageHero` | Every interior page's first screen. With a default slot it becomes a split hero (copy left, product fragment on a lighter right half). | `title` (HTML allowed, e.g. `&amp;`), `lead`, `primary`/`secondary` ({label, href} or `false`), `crumb` ({label, href}), `compact` |
| `StatusPanel` | The small product panel in heroes (the old site's "PROGRAM VERIFICATION / your-company.com / Consent flows ✓ Verified …" boxes). | `title`, `subject`, `badge`, `rows: {label, value, state: 'ok'|'warn'|'bad'|'info'}[]`, `total`, `note` |
| `FindingCard` | Sample finding F-0042 (VPPA). | `compact` |
| `RiskReport` | Sample report: four findings + total, or `variant="briefing"` with score/jurisdictions. | `variant` |
| `RemediationPlan` | Phased remediation fragment for the sample report. | — |
| `SectionHead` | Section `h2` + optional sentence + optional link. | `title`, `text`, `link`, `id`, `size: 'md'|'lg'` |
| `PointList` | Lists of points. `index` = large rows (3–6 strong points); `columns` = 2–3 text columns, no boxes; `tiles` = bento of tone tiles, first one wide on the teal field (4–8 points). | `items: {title, text, meta, href, linkLabel}[]`, `variant`, `cols: 2|3` |
| `FactGrid` | Big figures on tiles (stats). Add `count`, `prefix`, `suffix`, `decimals` to make a figure count up. | `items: {figure, label, count, prefix, suffix, decimals, href, linkLabel}[]`, `accent` |
| `Timeline` | Phases over time (Pre-2020 → 2020–25 → Today). Track fills on scroll. | `items: {when, title, text}[]` |
| `CompareList` | "Not this / This / What you get". | `not`, `is`, `get`, titles |
| `QuoteBlock` | One quotation as a statement. Quotes live in `src/data/quotes.ts`. | `quote`, `tone: 'plain'|'field'` |
| `QuoteThread` | A quote rendered as a product comment with replies (home page style). | `lead`, `replies` |
| `StoryIndex` | The four customer stories / use cases as rows. | `only`, `exclude` (keys: bakkt, healthcare, education, aggregator) |
| `EnforcementBand` | "Privacy enforcement is routine": four enforcement figures + settlements ticker. | `heading`, `text`, `link` |
| `AudienceIndex` | Large index of the six solutions. | `heading`, `items` |
| `OutputIndex` | Showcase of Privaini outputs (finding card / briefing / report / plan). | `heading`, `intro` |
| `CallResponse` | How it works as give-and-get exchanges. | `heading`, `sub` |
| `ExposureSlider` | Visitor sets a number of viewers; VPPA statutory figure updates ($2,500 each). | `heading` |
| `ExplainerSection` | Text (sticky) beside a hairline figure. | `name`, `heading`, `text`, `points`, `figureTitle`, `flip`, `tone` |
| `LogoBoard` | Customer logos on tiles with the proof heading. | `heading` |
| `CtaBlank` | Closing sentence with the domain field as the blank → `/request-a-demo?domain=`. | `lead`, `after`, `note` |

Hairline figures available (pass to `ExplainerSection name=…`, or use `HairlineFigure` directly):
- `outside-in-scanner`: a scan line reads six of a domain's public properties; signals appear as it passes → home, how-it-works, platform-overview.
- `policy-practice-gap`: what the policy says against what the site does; three gaps light in turn → risk-intelligence, privacy-risk-gap, enterprises.
- `exposure-scale`: each sample finding's exposure range on one axis → insurers, what-we-find, risk-intelligence.

If a page needs a composition none of these give, write a small page-local section with a scoped `<style>` — reuse the tokens in `src/styles/global.css` (`--bg`, `--bg-2`, `--bg-3`, `--field`, `--ink`, `--muted`, `--accent`, `--accent-hi`, `--t-*`, `--gap`, `--margin`, `--radius`, `--ease-out`).

## Motion hooks (data attributes)

- `data-split` on a heading: masked line reveal on scroll (add `data-split-now` to play on load — heroes only).
- `data-reveal` on an element: rises 24px and fades in; siblings inside the same `data-reveal-group` stagger 75 ms.
- `data-count="7"` (+ `data-prefix`, `data-suffix`, `data-decimals`): counts up on scroll.
- `data-parallax="0.15"`: scrubbed drift. `data-zoom`: a picture settles from 1.1 to 1 while scrolling.
- Everything degrades to visible content without JS and under `prefers-reduced-motion`.

## House style (enforced)

- Headlines (`h1`–`h3`) two lines or fewer on desktop. No eyebrow labels above headings, no pill badges above the hero headline.
- No monospace outside product fragments (`[data-ui]`). No `01 / 02 / 03` numbering — order is shown by position or words.
- No thin divider rules, no outlined boxes, no gradients, no glows, no shadows on things at rest (product fragments and open menus excepted). Separate surfaces by a step in tone.
- No icon-topped feature cards and no rows of identical cards: use `PointList` variants, `FactGrid`, `StoryIndex`, fragments.
- One accent (cyan) on the primary action and the one lit thing. Running text 16px+ in full ink; `--muted` for secondary text only.
- Buttons: `.btn` (primary), `.btn btn--ghost` (secondary). Text links: `.link` with `<span class="arrow">→</span>`.
