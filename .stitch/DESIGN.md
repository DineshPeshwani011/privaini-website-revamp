---
name: Privaini Flat (/v5)
colors:
  background: '#ffffff'
  on-background: '#1a1a1a'
  surface: '#ffffff'
  surface-container-low: '#f1f1f1'
  surface-container: '#e5e5e5'
  on-surface: '#1a1a1a'
  on-surface-variant: '#656b6b'
  outline-variant: '#dddddd'
  inverse-surface: '#1a1a1a'
  inverse-surface-container: '#394040'
  inverse-surface-container-high: '#4a5252'
  inverse-track: '#2b3030'
  inverse-on-surface: '#ffffff'
  inverse-on-surface-variant: '#a7aaaa'
  inverse-outline-variant: '#323232'
  primary: '#07bcd4'
  on-primary: '#1a1a1a'
  primary-text-on-light: '#0a7f91'
  primary-wash: '#07bcd41f'
  dot: '#dedfdf'
  dot-on-container: '#d3d5d5'
  primary-dot: '#07bcd48c'
typography:
  display-lg:
    fontFamily: Urbanist
    fontSize: 84px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.05em
  headline-lg:
    fontFamily: Urbanist
    fontSize: 64px
    fontWeight: '500'
    lineHeight: '1.04'
    letterSpacing: -0.045em
  title-md:
    fontFamily: Urbanist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.15'
    letterSpacing: -0.03em
  body-lead:
    fontFamily: Urbanist
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.55'
    letterSpacing: '0'
  body-base:
    fontFamily: Urbanist
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.55'
    letterSpacing: '0'
  label-sm:
    fontFamily: Urbanist
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  figure-xl:
    fontFamily: Urbanist
    fontSize: 360px
    fontWeight: '300'
    lineHeight: '0.8'
    letterSpacing: -0.07em
  evidence-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  wordmark:
    fontFamily: Bruno Ace SC
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1'
    letterSpacing: '0'
rounded:
  DEFAULT: 0px
  lens: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  section: clamp(104px, 11vw, 184px)
  gutter: clamp(16px, 2vw, 28px)
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1440px
---

# Design System: Privaini Flat (/v5)

Extracted from source on 2026-11-11 and updated the same day for the Carta-style details (charcoal and slate, dot fields, selection handles, mono labels and chips, decoding figures): `src/pages/v5.astro`, `src/styles/folio.css` (`body.folio.flat`),
`src/components/flat/Pipeline.astro`, `src/components/flat/ExposureMap.astro`,
`src/components/folio/FolioFooter.astro`, `src/components/folio/Xray.astro`. The narrative sits in
`docs/DESIGN-LANGUAGE.md` § Flat; this file is the portable, token-first version of the same system.

## 1. Visual Theme & Atmosphere

Flat is a printed brief in three inks. Most of the page is plain white paper set with large, tight black
Urbanist; about a third turns over to charcoal for the chapters that carry the evidence (what enforcement
costs, how the risk picture is made); and one brand cyan does all the signalling — the buttons, the giant
$7B+, a filled tile, the lit squares that count a whole, the one rule under the hero's last phrase, and a
single solid cyan field for the closing call. The proportion is held on purpose: roughly 60 white, 30
charcoal, 10 cyan. Small, smart marks give it life, after carta.com: square-dot fields, selection handles at the
corners of a group, labels and chips in mono capitals behind a small square, figures that decode out of scrambled
glyphs, and a closing line that types itself out.

Nothing floats. There are no shadows, glows, gradients or blur, and no outlined cards: a surface is told apart
from its ground by one tone step (`#f1f1f1` on white, slate `#394040` on charcoal). Every corner is square — the only
round thing on the page is the Privaini lens. Ornament is replaced by scale (a 360px figure, an 84px headline)
and by drawings that explain one thing each in thin hairlines: a sample website with the lens touring it, many
signals narrowing through one lens into a few decisions, and a step line that shows what each remediation
phase takes off an exposure. The mood is calm, exact and confident: evidence, not alarm.

## 2. Color Palette & Roles

### Primary Foundation
- **Paper White** (`#ffffff`) — the ground of the hero, institutions, trusted, findings and teams chapters.
- **Stone Step** (`#f1f1f1`) — the one tone step on white: figure panels, the logo wall's cells, the findings
  stage, team rows, the empty part of a tally.
- **Pressed Stone** (`#e5e5e5`) — a stone cell under the pointer.
- **Charcoal** (`#1a1a1a`) — the ground of the enforcement and risk-picture chapters and the footer; also the
  text colour on white and on cyan.
- **Slate** (`#394040`) — the tone step on charcoal, cool and faintly green: stat tiles, the settlements band, the
  pipeline's canvas.
- **Slate Raised** (`#4a5252`) and **Track** (`#2b3030`) — a raised surface on slate, and the empty track of a bar.
- **Dots** (`#dedfdf` on white, `#d3d5d5` on the tone step, cyan at 55% on slate) — the dot fields.

### Accent & Interactive
- **Brand Cyan** (`#07bcd4`) — primary buttons (ink label), the $7B+ figure, settlement amounts, a share's bar,
  lit tally squares, focus rings, the hero's key-phrase rule, the closing chapter's whole field.
- **Deep Cyan** (`#0a7f91`) — cyan deepened to read as small text on white (4.7:1).
- **Cyan Wash** (`#07bcd4` at 12%) — the lens's core.

### Typography & Text Hierarchy
- **Charcoal** (`#1a1a1a`) — all running text on white, full strength (never a soft grey for body copy).
- **Graphite** (`#656b6b`) — secondary notes only: captions, a tile's title (a cool, faintly green grey).
- **White** (`#ffffff`) — all running text on black.
- **Ash** (`#a7aaaa`) — secondary notes on charcoal.
- **Hairline on white** (`#1a1a1a` at 14%, ≈ `#dddddd`) and **on charcoal** (`#ffffff` at 14%, ≈ `#3c3c3c`) —
  rules inside product fragments and the drawings' faint lines.

### Functional States
The page has no form, so no error, warning or success colours. Severity is monochrome: a **High** finding is
an ink-black tag with a white label. Focus is a 2px cyan outline offset 4px (ink on the cyan chapter).

## 3. Typography Rules

### Hierarchy & Weights
One family does everything: **Urbanist** (variable), a geometric sans with round bowls and a crisp, slightly
technical rhythm. Two supporting faces have narrow roles: **JetBrains Mono** only for evidence (cookie names,
regions in the briefing) and for labels and chips, in small capitals; **Bruno Ace SC** only for the PRIVAINI wordmark.

| Role | Size | Weight | Leading | Tracking |
|:---|:---|:---|:---|:---|
| Display (h1) | clamp(46px, 5.8vw, 92px) | 500 | 1.0 | -0.05em |
| Headline (h2) | clamp(36px, 4.4vw, 68px) | 500 | 1.04 | -0.045em |
| Step / row titles (h3, team names) | clamp(30px, 3.4vw, 54px) | 500 | 1.05 | -0.04em |
| Title | clamp(24px, 2.2vw, 34px) | 500 | 1.15 | -0.03em |
| Statement (quote, closing line) | clamp(26px, 2.5vw, 36px) | 400 | 1.25–1.3 | -0.03em |
| Lead | clamp(18px, 1.35vw, 21px) | 400–500 | 1.55 | 0 |
| Body | 16–18px | 400 | 1.55 | 0 |
| Label / chip (JetBrains Mono) | 12–12.5px | 500 | 1.2 | 0.04–0.06em, capitals |
| Figure | up to 400px | 300 | 0.8 | -0.07em, tabular figures |

### Spacing Principles
Display type is set tight and slightly negative; everything at reading size is untracked. Labels and chips are
the one exception: small mono capitals, lightly tracked, always after a small square (cyan for a label, ink on a
cyan chip). Headings balance
(`text-wrap: balance`); descriptions avoid one-word last lines (`text-wrap: pretty`); the quotation's opening
mark hangs in the margin. Numbers that count up use tabular figures so they don't jiggle.

## 4. Component Stylings

### Buttons
Square-cornered rectangles, 56px tall (60–64px for the hero and closing calls), 30–36px of side padding,
600-weight 16px labels. **Primary:** Brand Cyan with an ink label; on hover it turns ink with a white label
(white with an ink label on black). **Secondary ("line"):** a 1px outline at 45% of the text colour, filling on
hover. **Closing call:** ink with a white label on the cyan field. The trailing arrow is a drawn mark, not a
character, and steps 4px forward on hover. Pressed is a 0.98 scale or a slight fade; focus is the cyan ring.

### Cards & Panels
There are no shadowed or outlined cards. Panels are flat tone-step fields with generous padding (28–44px):
stat tiles on `#394040` (one solid cyan for emphasis), figure panels on `#f1f1f1`, team rows on `#f1f1f1`,
each separated from its neighbours by a 4–8px gap of the ground colour. Team rows invert to ink with white text
and a cyan mark under the pointer.

### Navigation
A plain bar: wordmark left, six text links, a quiet "Log in" and one cyan "See your exposure" button. Over
white it is white; over black chapters it turns black. It tucks away while scrolling down and returns on the
way up. On phones it becomes a full-screen drawer.

### Inputs & Forms
None on this page.

### Domain-Specific Components
- **The x-ray (hero):** a dark sample website (`#11181a`) in a thin frame, with the round Privaini lens
  touring its parts. Inside the lens the page reads as a regulator sees it (cookies, consent, statutes), and a
  black tag names the law. It is the page's one dark object on white.
- **The pipeline (risk picture):** twenty signals on a spine from a white "Your Company" block, their
  hairline wires narrowing into the lens (cyan ring, turning tick ring), one cyan line into a white
  "Privaini Risk Briefing" card (findings, exposure, evidence, remediation tiles on `#f1f1f1`), then a fan
  out to five decisions with cyan checkboxes. Short dashes run along the wires once it has played.
- **The exposure map (findings):** a white card with an ink header strip; the finding (F-0042, High, VPPA),
  the statute set large, an ink exposure bar, and a step chart in which each remediation phase cuts a cyan
  block from the exposure while the bar gives up the same share.
- **Tallies:** a figure drawn as its whole in squares (4 of 10, 2 of 3, all 90), lit in cyan.
- **Settlements band:** a full-width `#394040` strip of company names in white and amounts in cyan, scrolling;
  a square ink pause button sits on a solid end-cap at the right.

## 5. Layout Principles

### Grid & Structure
A 12-column grid inside a 1440px max container with fluid outer margins (16px on phones, up to 48px) and a
16–28px gutter. Asymmetric splits live inside the grid (copy 1–6 beside a visual 7–12; a figure across 9
columns with its label in the last 3). Grey stages may run from a column edge to the screen edge.

### Whitespace Strategy
A 4px spacing unit throughout (gaps of 4, 8, 12, 16, 24, 32, 48px). Sections are 104–184px apart, clearly more
than any gap inside one. Space is filled by scale and real content rather than ornament.

### Alignment & Visual Balance
Left-aligned by default; nothing is centred except inside the lens. Each chapter has its own composition (split
poster, one giant figure, three panels, a logo wall with a quotation, an instrument on a dark panel, steps
beside a stage, a list in large type, a cyan poster, the name across the footer), so no two neighbours share a
layout.

### Responsive Behavior & Touch
Desktop-first grids collapse to one column under 900px: visuals follow their copy, panels stack, the pipeline
becomes a vertical sequence joined by short cyan rules (under 1280px), the logo wall goes 8 → 4 columns.
Controls stay at least 44–48px tall. Motion is entrance-only (a 24px rise and fade, once) plus each drawing's
own play; under reduced motion everything is shown complete and still.

## 6. Design System Notes for Stitch Generation

### Language to Use
"Flat editorial B2B page in three inks: white paper, near-black chapters, one brand cyan. Large tight
geometric sans headlines, square corners everywhere, no shadows or gradients, surfaces separated by a single
light-grey (or dark-grey) tone step. Thin hairline diagrams that explain one idea each. Calm, exact, evidential."

### Color References
Paper White `#ffffff` · Stone Step `#f1f1f1` · Charcoal `#1a1a1a` · Night Step `#394040` · Brand Cyan
`#07bcd4` · Deep Cyan text `#0a7f91` · Graphite `#656b6b` · Ash `#a7aaaa`.

### Component Prompts
- "A full-width black statistics chapter: a 2-line white headline top-left, then one enormous light-weight cyan
  dollar figure spanning nine columns with a short white label at its baseline on the right; beneath it three
  square tiles in slate `#394040`, each with a large white percentage, a one-line label and a flat cyan
  progress bar on a `#2b3030` track — the third tile solid cyan with ink text."
- "A team list in large type on white: four full-width rows in light grey `#f1f1f1` separated by 4px gaps, each
  with a thin line icon, a 48px name, a one-line description and a 'Learn more' link underlined in cyan; on hover
  the row turns black, the text white and the icon cyan. Square corners, no borders, no shadows."
- "A closing call on a solid brand-cyan field: a two-line, left-aligned, 96px ink headline; below it a large
  ink sentence on the left and a square ink button with a white label and a drawn arrow on the right; then four
  short promises in a row, each after a small ink square."

### Incremental Iteration
Keep the proportions first (60/30/10), then the flatness (tone steps, never shadows or outlines), then the
type scale. Add cyan sparingly — if a screen gains a second cyan element, remove one. Keep every corner square
unless it is the lens. When a section feels empty, enlarge its one main thing before adding anything new.
