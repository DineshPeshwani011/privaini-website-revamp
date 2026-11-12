# Folio: the Privaini design language

The direction from here on (agreed 2026-11-04, replacing Ledger). Privaini sells evidence: what a regulator
or a plaintiff's firm would find, set out plainly. Folio presents that evidence as an editorial document. The
home page reads as a sequence of chapters, alternating between night and stone. Large, tight Urbanist
headlines carry the argument, and the scroll moves the reader through it scene by scene. Every corner is square:
the lens is the only round thing on the page.

Reference: [Acres & Yards](https://dineshpeshwani01.github.io/acres-yards/). We take its editorial structure:
a headline with a light italic accent line, chapters that turn between night and stone, and scenes that hold while
they play. Privaini's content replaces its real-estate content. The lens, the findings, the statutes and the
audiences are the subjects. Unlike the reference, Folio uses one typeface, Urbanist (since 2026-11-04; it replaced
a Bodoni display serif). Its corners are square, it has no chapter labels, and it has no portraits (all since
2026-11-10).

Two candidate home pages are in Folio, sharing one hero:
- `/v3`, Folio's own chapters (`src/pages/v3.astro`, scenes in `src/scripts/folio-home.ts`);
- `/v4`, the current privaini.com home page's content, word for word, as captured on 2026-11-10, set in Folio
  (`src/pages/v4.astro`, scenes in `src/scripts/folio-v4.ts`). Its nav and footer carry the live page's entries:
  the nav through Base's `nav` prop, the footer (`src/components/folio/FolioFooter.astro`) through Base's
  `footer` slot. Every other page keeps the site's own.

Shared parts:
- tokens and type: `src/styles/folio.css`;
- the hero: `src/components/folio/Hero.astro`, with its x-ray (`src/components/folio/Xray.astro`,
  `src/scripts/xray.ts`); its tour and scene, and the hairline draw-in, are `src/scripts/folio-kit.ts`;
- each chapter's hairline drawing: `src/components/folio/Lines.astro`;
- the risk picture (/v4): `src/components/folio/RiskPicture.astro`.

A page switches it on with `<Base folio>`.

### Flat (/v5)

A third candidate, `/v5` (`src/pages/v5.astro`, motion in `src/scripts/flat-v5.ts`), keeps Folio's frame (nav,
footer, Urbanist, square corners, Lenis, the motion layer) and changes the rest. Switch it on with
`<Base folio bodyClass="flat">`; its palette is the `body.folio.flat` block in `src/styles/folio.css`.
- **Colour, 60 / 30 / 10.** White chapters (hero, institutions, trusted, findings, teams), black chapters
  (enforcement, risk picture, footer), and cyan as the accent: buttons, key figures, lit marks, and one solid
  cyan chapter, the closing call to action, with ink on it. For small text on white the cyan deepens to `#0a7f91`.
- **Flat.** Solid fills only: no shadows, glows, gradients or blur, and no fades on the marquees.
- **Headlines.** Urbanist 500, tight, no italic line. The key phrase carries a cyan rule under it that draws in
  once the headline is on screen (`.mk`, with `[data-in]` on the headline).
- **Content.** Every word is the live home page's (the 2026-11-10 capture), its hero included: "See what
  regulators & litigators detect, before they do." and its three sentences.
- **The hero carries /v4's x-ray** (`src/components/folio/Xray.astro`, its tour by `mountXray`), on white, without
  /v4's lens-opening scene (since 2026-11-11, at the user's request). `src/components/flat/OutsideIn.astro`, the
  hero drawing it replaced, is unused.
- **Drawings: two, each explaining one thing,** all hairline and flat, in `src/components/flat/`:
  - `Pipeline.astro` (the risk picture): the live illustration simplified to its shape, many to one to few:
    twenty signals on a spine from "Your Company" narrow through the lens into one briefing, which fans out to
    five decisions. Its wires are drawn from where the parts sit; it plays once in view, then packets keep running.
  - `ExposureMap.astro` (findings): the finding, the statute and the $8.9M exposure as a black bar, then a step
    line that comes down at each remediation phase (Immediate, Staged), the cyan block showing what each takes off,
    while the bar gives up the same share. It builds as the three steps beside it light, and adds no figures.
- Under reduced motion every drawing is shown whole and still.
- **Richness without ornament** (2026-11-11). Surfaces are separated by tone steps, not outlines: `#f3f3f3` on
  white, `#151515` on black. Each chapter has its own composition:
  - hero: the copy on white, the x-ray beside it (no grey stage: the user found it looked off);
  - enforcement: $7B+ as one giant cyan figure, three tiles (the two shares drawn as bars of their whole, the
    third tile solid cyan), and the settlements as a large band;
  - institutions: three grey panels, each figure over its whole drawn in squares (10, 3, 90);
  - trusted: a static wall of the sixteen marks, each in its own colours, on grey cells, and the quotation beside a
    large cyan quote mark;
  - risk picture: a two-line headline, and the pipeline on a dark panel, its briefing a white card;
  - findings: large steps, and the map on a grey stage to the edge;
  - teams: a list in large type, each row turning black under the pointer;
  - the close: a left-aligned cyan poster;
  - the footer: the name across the whole width (`FolioFooter flat`).

  Type uses six sizes (`--t-display`, `--t-h2`, `--t-title`, `--t-lead`, body, `--t-small`), and running text
  is in full ink.
- **Polish pass** (2026-11-11, with the project's Hallmark, Better Typography and UI UX Pro Max skills).
  - The cyan rule now appears once, under the hero's "before they do.".
  - Every colour is a token (`--night-4`, `--stone-3`, `--on-night-line-2`, `--cyan-wash` in `body.folio.flat`).
  - Spacing sits on a 4px scale.
  - Labels are sentence case and untracked (the findings tags read "High", "Statute").
  - Arrows are drawn marks that step forward on hover.
  - Every control has an instant cyan focus ring (ink on the cyan close) and a pressed state.
  - The settlements band has a pause button.
  - The closing promises are a list.
  - The x-ray's tag no longer lands off screen near the right edge (`src/scripts/xray.ts`).
  - Hallmark's stamp heads v5's styles. It records what was fixed, and that the eyebrows "Privacy & AI Risk
    Intelligence" and "Findings" are kept on purpose (the live page's copy).
  - The system in tokens, for Stitch and other tools: `.stitch/DESIGN.md`.
- **Small marks, after carta.com** (2026-11-11, at the user's request). The shared kit is the `.flat .fx-*`
  classes in `folio.css`; each mark's shape is a mask, so its colour stays a token.
  - **Palette.** Charcoal `#1a1a1a` for the dark chapters, slate `#394040` for panels and bands on it, white with
    `#f1f1f1` panels, and cool greys for secondary text (`#656b6b`, `#a7aaaa`). Cyan stays the one accent.
  - **Dot fields (`.fx-dots`).** 3px squares every 15px: above-left of the hero's x-ray, in the institution
    panels and under the quote mark. The `--wide` grid (4px every 48px, cyan) is the canvas under the pipeline.
  - **Selection handles (`.fx-hd`).** A small square at each corner of a group: the x-ray, the $7B+ figure,
    the stat tiles, the institution panels, the logo wall and the findings card.
  - **Labels (`.fx-label`).** A cyan square, then mono capitals: the hero's and findings' labels, and "Trusted by".
  - **Chips (`.fx-chip`).** The same on a cyan bar: "Your Company", "14 events captured", "Your Next Decisions".
    Labels wipe in; a chip's bar wipes across and its square pops.
  - **Figure frame.** $7B+ sits over a cyan rule with a node at its centre, drawn from the middle.
  - **Arrows.** A team row's arrow sits in a small cyan square.
  - **Motion** (`src/scripts/flat-v5.ts`). The figures ($7B+, the three stats, 4 / 2 / 90) decode out of
    scrambled glyphs once on screen. The closing line types itself out behind an ink caret; its letters hold
    their places, so nothing moves.
  - Urbanist stays the only text face, and JetBrains Mono carries the labels.
  - **The risk picture is now a refraction** (`src/components/flat/Refraction.astro`, 2026-11-11; it replaced
    the boxes-and-arrows pipeline, which the user found dated; `Pipeline.astro` is unused). Twenty signals in one
    column send curved threads into the lens; four bands come out as the briefing (findings, exposure, evidence,
    remediation); the seven capabilities turn round the lens as a ring of words; the decisions sit along the foot.
    It draws as the section scrolls into place, then light keeps travelling down the threads. No panel, no boxes.
  - **Three more sections redrawn the same day**, after an audit:
    - enforcement: the three stat tiles became rows. Each has a large figure, its label, and a scale of a hundred
      ticks on which the share lights up (65, 32); the $11.5M average is one cyan mark on its scale;
    - findings: `ExposureMap.astro` is now one continuous line. It runs flat as the finding, climbs at the
      statute to the $8.9M exposure, then steps down at Immediate and Staged, with cyan blocks for what comes
      off. It draws stage by stage with the three steps, and has no card;
    - teams: each row's mark redraws itself under the pointer.
  - **The hero's x-ray is inverted on v5** (`<Xray theme="light" />`): a white sample site with charcoal text,
    a pale-cyan evidence layer in the lens, and a white tag with the law in deep cyan. Every x-ray colour is now
    a `--xr-*` variable in `Xray.astro`; the dark theme (v3, v4) keeps the original values.

---

## 1. Principles

1. **Chapters, not sections.** Each part of the page is a chapter, either night or stone. Neighbouring chapters
   change colour, so the reader feels the page turn. Chapters carry no labels ("Chapter 03, …"): the headline opens
   the chapter.
2. **One plain line, one italic line.** A headline is a plain statement followed by a light italic
   counterpoint: "Fewer alerts. *Better ones.*" The italic line is the only coloured text in the headline.
3. **The product is the picture.** The images are Privaini's own, drawn flat as HTML:
   - the x-ray (an ordinary website with the Privaini lens reading it);
   - evidence plates (code as a site actually ships it);
   - findings cards with real statutes and exposure ranges;
   - a statute map, and a square gauge for the headline figure.

   No renders, no 3D, no stock photography, no portraits.
4. **Scenes, held once.** On a wide screen a few chapters pin while their scene plays:
   - the lens opens;
   - the findings travel past;
   - a figure counts up;
   - the steps advance;
   - a picture opens out.

   Each scene plays once in each direction and is driven by the scroll. The lens's tour in the hero is the
   only motion that runs without scrolling, and it stops under reduced motion.
5. **Cyan is the accent, not the ground.** The primary button, the italic lines on night, a live pin, the gauge's
   line. It is never used for a section background or for body text.
6. **Square, except the lens.** Buttons, cards, chips, frames, map pins and the gauge all have square corners.
   The lens is the only circle, so the eye goes to it.
7. **One hairline per chapter.** Night chapters are not left as empty black. Each may carry one faint hairline
   drawing behind its content (section 7, Imagery), straight-lined, in the chapter's hairline colour. Never two.

## 2. Colour

The palette is fixed. Folio pages have no light/dark toggle, because every chapter is night or stone by design.

| Token | Value | Use |
|---|---|---|
| `--night` | `#0B0F10` | night chapters, the page ground, the footer |
| `--night-2` | `#121819` | a second night (the map), cards on night |
| `--night-3` | `#1A2224` | code wells, photo grounds |
| `--stone` | `#E8ECE9` | stone chapters |
| `--stone-2` | `#DDE3E0` | raised panels on stone |
| `--on-night` / `--on-night-muted` | `#E8ECE9` / `#98A3A2` | text on night |
| `--on-stone` / `--on-stone-muted` | `#0B0F10` / `#55625F` | text on stone |
| `--on-night-line` / `--on-stone-line` | 16% / 14% ink | hairlines |
| `--cyan` | `#07BCD4` | primary button, active pins, the gauge's line |
| `--cyan-soft` | `#67D6E6` | italic lines, chapter labels and links **on night** |
| `--teal` | `#0A4652` | italic lines, chapter labels, links and step numerals **on stone** |

A chapter takes its colours from one class:
- `.is-night` or `.is-stone` sets `--ink`, `--muted`, `--line` and `--em` (the italic colour).
- Components inside use those names and follow automatically.

Rules:
- **Severity stays monochrome.** High is a filled chip, medium an outlined chip. There is no red, amber or green.
- **Logos are greyscale**, inverted on night.

## 3. Type

Urbanist (self-hosted, variable, upright and italic) carries everything. JetBrains Mono appears only where
something *is* code: inside plates, logs and the x-ray's readings. Labels, IDs and badges stay in Urbanist.

| Role | Class | Urbanist | Size | Tracking | Line height |
|---|---|---|---|---|---|
| Hero headline | `.f-display` | 400 | clamp(40px, 4.4vw, 70px) | −0.045em | 1.02 |
| Chapter headline | `.f-h2` | 400 | clamp(38px, 5.6vw, 88px) | −0.05em | 1 |
| Title | `.f-title` | 400 | clamp(26px, 2.5vw, 38px) | −0.03em | 1.1 |
| Figure | `.f-figure` | 200 | clamp(120px, 19vw, 300px) | −0.065em | 0.82 |
| Accent line | `em` in the above, `.f-em` | 300 italic | inherits | inherits | inherits |
| Lead | `.f-lead` | 400 | clamp(17px, 1.2vw, 19px), max 46ch | 0 | 1.6 |
| Small | `.f-small` | 400 | 14px | 0 | 1.5 |
| Caption | `.f-caption` | 400 | 12.5px | +0.02em | — |

- Headlines are **never bold**. Size and tight tracking carry them. The accent line drops to a light italic.
- A headline breaks before its italic line (`<br />`). Two or three lines, no more.
- Code turns ligatures off, so `=>` stays as typed.

## 4. Layout

- The site's 12-column `.wrap` grid (max 1440px, `--margin` gutters). Things that run full width but start on
  the column (the findings track) use `--inset`, which is the column's left edge.
- Chapter rhythm: `.f-section` padding is clamp(96px, 11vw, 176px). A chapter opens with `.f-head`: the
  headline, then (in `.f-head--split`) a lead set to the right and aligned to the headline's last line.
- The turn of a chapter is a straight edge, or the stone slant the findings chapter starts under.
- **Radius is 0 everywhere** (`--radius` and `--ui-radius` are 0 on Folio pages, and the shared nav and footer
  are squared too). The lens is the one exception.

## 5. Components

- **Button** (`.f-btn`). 52px tall with square corners, in Urbanist 500 15px.
  - `.f-btn--cyan` is the primary: cyan, with night text.
  - `.f-btn--line` is the secondary: a 40% ink outline.
  - On hover the fill lightens, and on press it scales to 0.98.
- **Text link** (`.f-link`). In the italic colour, with an underline that withdraws to the right on hover.
- **X-ray** (`src/components/folio/Xray.astro`). A sample company site ("yourcompany", a patient-stories page)
  drawn flat and quiet, in a square browser frame. Over it, a round lens with a cyan ring shows the same page as
  a regulator reads it, magnified:
  - the pixel on the video;
  - the fingerprint on the search;
  - cookies before consent;
  - session replay in the chat;
  - the policy's promise;
  - the undisclosed AI assistant;
  - the one-click "Accept all".

  A tag beside the lens names the law in plain words. The lens tours these parts in turn, and on a mouse it
  follows the pointer over the page. The two layers share one grid in container units, so they line up at
  any size. `mode="evidence"` draws the whole page as the lens reads it (the expand chapter).
- **Evidence plate.** A night card showing the code a site ships, with its statute in italic. Below it sit a
  number, a name and the law. Plates are staggered in a four-column grid. Clicking one opens a dialog with the
  code, the note and a link.
- **Findings card.** Two halves:
  - a statute in large light Urbanist over its evidence log, severity and exposure;
  - the finding's title, observation and specs (statute, severity, per-violation, exposure).
- **Statute map.** A world of square dots (from `src/data/globe-land.json`) with square pins. A list of
  jurisdictions sits beside it. Picking a row or a pin lights both and fills the card.
- **Step.** A giant teal numeral and a title with one sentence. Three ticks show progress.
- **Audience timeline.** A hairline with a square node per audience, each with a name, a note and "Explore". As
  the chapter scrolls by, a teal line draws along it (across on a wide screen, down on a narrow one) and each
  audience lights as the line reaches its node.
- **Risk picture** (/v4, `src/components/folio/RiskPicture.astro`). The live page's illustration redrawn in
  hairline: the signals a website gives off, round "Your Company", run as wires into the lens; the lens is ringed
  by what it brings (Regulatory Repository, Technology Detection and the rest); out come the risk briefing
  (findings, exposure, evidence, remediation) and "Your Next Decisions". It is drawn as a live instrument, all
  in hairline with no glow: a faint point grid behind it, square corner brackets on the company, the briefing
  and each locked signal (VPPA and BIPA stay bracketed, as the briefing's findings), packets as short dashes on
  the wires, three turning segments and a sweep inside the lens, a spoke and a closing square for each
  capability, a fan of lines out to the decisions, and a rail along the foot with a mark per stage. Script:
  `src/scripts/risk-picture.ts`. On a wide screen it is one plate on a 1312 by 620 grid in container units;
  narrower, the parts stack, joined by short hairlines.
- **Tally** (/v4). A figure's whole, drawn under it: ten squares with four lit (4 of the top 10), three with two lit,
  ninety ticks.
- **Team card** (/v4). A square night card with a hairline mark of its own (a grid, an angular shield, a
  balance, two overlapping squares) that draws itself in, a title, a line and "Learn more".
- **Contact form.** Underlined fields with no boxes. It writes an email for the reader to review in their mail
  app (`mailto:`). Nothing is stored and nothing goes into a page URL.

## 6. Motion

| What | How |
|---|---|
| Scrolling | Lenis smooth scroll on the GSAP ticker (off under reduced motion) |
| Headlines | each line rises out of its own mask: 105% → 0, 1.2s `expo.out`, 90ms apart, once |
| Groups | opacity 0 → 1 and 24px up, 1s `power3.out`, 90ms apart, once |
| Lens tour | the hero's lens moves between the sample site's parts (1.5s `power3.inOut`), rests 2.8s on each, and its tag fades in; it keeps clear of the copy and runs only while on screen |
| Lens opens | pinned for 130% of a screen: the site moves to the middle and fades back; the lens moves to the centre and opens to 34% of the screen's height; "The" and "*lens.*" close in |
| Findings | pinned while the cards travel sideways; a counter (01 / 05) and a bar follow |
| Figure | pinned for 90%: the figure counts to its value and the gauge's cyan line runs round to the same share |
| Steps | pinned for 70% per step: the active step rises in, the ticks fill |
| Expand | pinned for 110%: an inset picture opens to the full screen, then the copy rises |
| Audience timeline | scrubbed, not pinned (it follows the pinned expand): the teal line draws as the chapter passes, and each audience rises in as it is reached |
| Risk picture (/v4) | pinned for 220% at 1100px and wider: "Your Company" sends a pulse and each signal locks on as it is reached; the wires draw and packets run down them into the lens; the lens focuses, its sweep starts and each capability locks on and decodes; a beam runs into the briefing, a scan line compiles it tile by tile (14 events, $22.5M); a fan draws out and ticks the decisions one by one; the foot rail fills with the run. What has been reached keeps running (packets, sweep, turning rings, echo pulses, rescans), paused off screen. Narrower, each part plays once as it comes into view. Pointing at a signal lights its wire; at a capability, its node |
| Findings line (/v4) | scrubbed, not pinned: Findings, Exposure, Remediation light in turn down a teal line |
| Hairlines | each chapter's drawing comes in once, when the chapter does: the hero's requests run out one by one, the contact trace draws left to right; the findings ruler's ticks slide with the cards |
| Marquees | logos 70s and statutes 90s per loop, paused on hover |
| Hover | 0.35–0.6s on `--ease-edit` (cubic-bezier(0.22, 1, 0.36, 1)) |

- Scenes pin only at **900px and wider**, with no reduced-motion preference.
- On narrower screens every chapter stacks in the page, and the figure counts once when it comes into view.
- Under `prefers-reduced-motion` everything is simply shown and the marquees stand still.

Never:
- blur reveals or text scrambles;
- a custom cursor;
- autoplaying video;
- anything that moves while it is being read.

## 7. Imagery

- **The x-ray** is the hero picture, and in evidence mode the expand picture. The 3D lens render is no longer
  used on Folio pages.
- **The gauge** beside the headline figure: a hairline square with 120 ticks and a cyan line that runs round it
  for the share. It is hidden in one column, where its edges would cross the copy.
- **Hairline drawings** (`src/components/folio/Lines.astro`), one per night chapter at most, faint (the chapter's
  `--line` colour) and straight-lined, behind the content:
  - `requests`: the sample page's fourteen third-party requests as a network waterfall, in the dark above the
    hero headline (hidden in one column);
  - `ruler`: a measured line under the findings, its ticks sliding with the cards;
  - `trace`: a square-edged signal along the foot of the contact chapter;
  - `stairs` (/v4): a staircase whose steps grow taller as it climbs, behind the enforcement figure;
  - `lens` (/v4): the lens itself, a ring with its ticks, behind the closing headline. It is the one round
    drawing, because the lens is the one round thing.

  The gauge and the map's graticule are their chapters' hairlines; the expand chapter has the x-ray.
- **Product fragments** are drawn as HTML (plates, cards, the map), never screenshots.
- **Hairline fields and figures** (`src/components/hairline/`) remain the backdrop on the pages that have not
  moved to Folio yet.

## 8. Don'ts

- Don't bring in a second typeface, or bold a headline.
- Don't round a corner. Only the lens is round.
- Don't label chapters, or give a chapter more than one hairline drawing.
- Don't use rendered or 3D imagery. Draw the product flat.
- Don't colour more than the italic line of a headline.
- Don't put cyan behind a whole section, or use it for text on stone (use `--teal`).
- Don't pin anything on narrow screens, or pin two scenes back to back without a still chapter between.
- Don't add a theme toggle to a Folio page.

## 9. Moving the rest of the site

Folio is switched on per page with `<Base folio>`. It adds `body.folio` and `data-motion="editorial"`.
- `body.folio` loads the Folio tokens over the global ones and maps the shared names (`--bg`, `--ink`,
  `--accent` and the rest), so the nav and footer follow.
- `data-motion="editorial"` puts the motion layer in its editorial mode.

To move a page:
1. Build its chapters from the `f-` classes and `.is-night` / `.is-stone`.
2. Turn the flag on.

Once the home page is approved, `/v3` replaces `/`. Inner pages then move one at a time. Ledger (2026-11-03)
was the language before this one. Its tokens and components are no longer used by any page.
