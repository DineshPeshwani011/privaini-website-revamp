# privaini.com — revamp

The rebuilt Privaini marketing site, built around one idea: **the lens**. What a company emits (cookies, pixels,
policy gaps, statutes) streams through Privaini's lens and comes out as a risk briefing, then decisions. The home
page is that picture as a scroll-driven Three.js world; every other page opens on the lens drawn in hairlines,
with its own signals arriving; content racks into focus, evidence decodes, and pages change through an iris.
Every page of the current privaini.com is here, with flat hairline diagrams and a Three.js coverage globe.
See `docs/BUILD-GUIDE.md` for the concept and component reference, and `docs/DESIGN-LANGUAGE.md` for Folio,
the editorial language the site is moving to: Urbanist chapters in night and stone, with scroll scenes. Two
candidate home pages use it: `/v3` (Folio's own chapters) and `/v4` (the live home page's content, in Folio).
A third, `/v5`, sets the same content in Flat: white, black and cyan (60/30/10), flat, with three explanatory
hairline drawings.

## Run it

```bash
pnpm install          # or npm install
pnpm dev              # http://localhost:4321
pnpm build            # static output in dist/
pnpm preview
```

Node 22+. The site is fully static (`dist/` can go on any static host). Pages build as `/<slug>.html`
with `trailingSlash: 'never'`, so the host should serve `/<slug>` from `/<slug>.html` (Netlify, Vercel,
Cloudflare Pages and S3+CloudFront with a rewrite all do).

## Stack

| | |
| --- | --- |
| Framework | Astro 5 (static), TypeScript |
| Motion | GSAP 3 (ScrollTrigger, SplitText) + Lenis smooth scroll — `src/scripts/motion.ts` |
| 3D | Three.js coverage globe — `src/components/CoverageGlobe.astro`; land dots from Natural Earth via `scripts/build-globe.mjs` |
| Figures | Hairline SVG diagrams and backdrops — `src/components/hairline/` |
| Fonts | Urbanist (text and UI), JetBrains Mono (evidence data), Bruno Ace SC (wordmark) — self-hosted via Fontsource |

The site makes **no third-party requests**: no CDNs, no analytics, no font services. The home page hero
scans itself in the visitor's browser and shows that.

## Where things are

```
src/
  pages/            one file per route (slugs match the old site); post/[slug].astro renders the blog
  layouts/          Base (head, nav, footer, motion), Legal (terms, agreement, privacy notice)
  components/       shared sections and product fragments — see docs/BUILD-GUIDE.md
  data/             site nav, sample report, quotes, logos, posts.json, legal.json, media.json, globe-land.json
  scripts/motion.ts Lenis + GSAP wiring and the data-attribute motion hooks
  styles/global.css tokens, type, layout, the [data-ui] fragment kit, prose
explainers/         retired: the anatomy kit and its three figure builds, no longer built or served
scripts/            extract-content.mjs (old site → data + media), build-globe.mjs
public/media/       every image from the old site, downloaded
docs/BUILD-GUIDE.md how pages are composed; component reference; house style
```

## Content pipeline

`scripts/extract-content.mjs <crawl-dir>` turns a crawl of privaini.com (raw HTML) into `src/data/posts.json`
(blog posts with sanitized article HTML and headings), `src/data/legal.json`, and `src/data/media.json`,
and downloads every referenced image into `public/media/`. Marketing pages were re-composed by hand from
the same crawl.

## Credits

- Land outlines: Natural Earth (public domain) via world-atlas (ISC) — `scripts/data/world-atlas-LICENSE`
