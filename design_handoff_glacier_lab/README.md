# Handoff: Glacier Lab visual redesign

## Overview

This is a **visual re-skin** of the existing Alpine Map Training app (already built in Claude Code). The app's logic, routing, data layer, content, and behaviour are unchanged. What changes is the **visual layer only**: colour palette, typography, layout density, component styling, and a handful of refined screen compositions.

The product is a digital companion to a BASI Alpine L4 ISTD navigation workbook — sixty-six workbook pages, one hundred and sixty flashcards, two graded quizzes. It's a study tool for ski instructors training toward international certifications.

The previous design direction (warm cream paper, Fraunces serif, contour-brown accent) is being replaced with a new direction codenamed **"Glacier Lab"**: pale glacier-grey paper, deep navy ink, a single alpine-red accent, secondary glacier-blue, Manrope + IBM Plex Mono typography. The look is cool, technical, internationally-credible — pitched at the global snowsports sector.

## About the design files

The files in this bundle are **HTML design references** — high-fidelity prototypes that show the intended look. **They are not production code to copy and ship.** Your task is to take the existing app codebase and update its UI to match these designs, using the codebase's existing framework, component patterns, and routing.

Treat the HTML files the way you'd treat a Figma export: read them for spec, lift the values, ignore the markup-level decisions that don't map cleanly onto the codebase.

## Fidelity

**High-fidelity.** Colours, type, spacing, radii, and shadows are all final. Use exact hex values and exact token values from `design/tokens.css`. Layouts should match within reason — adjust for real responsive breakpoints, real data, and the app's existing component library, but the visual outcome should be indistinguishable from the mockups.

## Recommended porting approach

Do this in roughly this order. Each step is testable on its own.

### Step 1 — Import the design system

1. Copy `design/tokens.css` into the app's styles directory.
2. If the app already has a tokens file, **replace the values, keep the variable names if they exist with the same semantics**; otherwise rename the variables to match the codebase's conventions but keep the values.
3. Make sure tokens are loaded **globally** before any other CSS — they're consumed by every screen.
4. If the codebase uses CSS-in-JS, Tailwind config, or a theme object, translate the tokens accordingly. Don't re-derive values from screenshots — read them from `tokens.css`.

### Step 2 — Update component primitives

`design/styles.css` defines the component vocabulary that every screen uses. Port these to the app's component layer:

- **`.btn`** — primary CTA (filled navy `--ink` on `--paper-3`). Variants: `.btn.red` (alpine-red fill, used for resume/begin actions), `.btn.ghost` (outlined). `.btn.sm` for compact. `.btn.block` for full-width.
- **`.tag`** — pill labels. Variants: `.tag.red`, `.tag.ice`, `.tag.moss`, `.tag.solid-red`, `.tag.solid-ink`.
- **`.pbar`** — thin (3px) progress bar with `.pbar.ice` variant. `i` element inside gets the width.
- **`.phone`** — mobile frame, only relevant for design previews — the real app doesn't need it.
- **`.desktop`**, **`.browser-bar`** — same: preview chrome, not for production.
- **`.tabbar`** — mobile bottom nav (sticky, 4-column grid, icons over labels).
- **`.sb` / `.sb-nav` / `.sb-section` / `.sb-stat`** — desktop sidebar pattern.
- **`.photo-slot`** — full-bleed image container. Variants: `.photo-slot.cool` (gradient placeholder), `.photo-slot.has-img` (real photo via background-image).
- **`.wm`** — wordmark lockup (mark + name + by-line).
- **`.contour-bg`**, **`.grid-bg`** — decorative motifs. `--grid-bg` uses paired linear-gradients for a precise lab feel.

### Step 3 — Apply the screens

Nine screens are mocked, each at mobile (375px) AND desktop (1200px). Port them in this order — earlier screens establish patterns the later ones reuse:

1. `home.html` — Hero, level pathway, references shelf
2. `level-index.html` — Big level numeral, ordered page list with status dots
3. `workbook.html` — Aim card, body copy, diagram row, hidden answer key, pager
4. `quiz.html` — Question with progress, score card with topic breakdown
5. `flashcard.html` — SRS card with four-rating row (Again / Hard / Good / Easy)
6. `dashboard.html` — Stat tiles, study heatmap, readiness checks
7. `settings.html` — Sectioned form rows with mono section headers
8. `onboarding.html` — Three-step first-run (welcome / pathway / cadence)
9. `level-complete.html` — Milestone screen with strikethrough numeral

`index.html` is a documentation page showing all screens — useful as your reference index, not a screen to port.

### Step 4 — Drop in the photography

Five real photos placed; one held in reserve. Files live in `design/img/`:

| File | Placed at | Notes |
|---|---|---|
| `lone-skier-navy.jpg` | Home desktop hero | Best palette match — deep navy sky |
| `skier-beanie-closeup.png` | Home mobile hero strip | Closer crop reads well at 180px height |
| `trio-blue-run.png` | Onboarding mobile welcome | Wide shot, group framing |
| `pair-with-maps.jpg` | Onboarding desktop left brand panel | Behind navy overlay, instructor / student tone |
| `trio-piste-signs.png` | Level-complete desktop "Up next" band | Behind dark-to-clear gradient |
| `study-tabletop.png` | **Reserve** — not placed | Compass + map + notebook still life |

All photos should be served from the app's normal asset pipeline — copy them into the app's static/public/assets folder and update the references.

## Design tokens (canonical — full list in `tokens.css`)

### Palette

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#EEF1F4` | Page background — pale glacier-grey |
| `--paper-2` | `#E2E7EC` | Recessed surface (browser chrome, deeper grey) |
| `--paper-3` | `#FFFFFF` | Card / list-row surface |
| `--paper-4` | `#F7F9FB` | Sidebar tint |
| `--ink` | `#0E1A2E` | Deep navy — body, primary action fill |
| `--ink-2` | `#3F4D63` | Secondary ink — body copy on cards |
| `--ink-3` | `#8693A6` | Tertiary ink — meta, captions, mono labels |
| `--ink-4` | `#B5BFCE` | Quaternary — placeholder, locked |
| `--rule` | `#D0D7E0` | Hairline borders |
| `--rule-2` | `#BCC5D0` | Emphasised hairline |
| `--red` | `#D7263D` | Alpine red — single accent, CTAs + active |
| `--red-2` | `#B41E32` | Hover / pressed |
| `--ice` | `#2480B5` | Glacier blue — secondary state (in-progress) |
| `--moss` | `#2E7D5B` | Success |
| `--amber` | `#C58B2C` | Partial / in-progress badge alt |
| `--crimson` | `#A33B2A` | Error / "Again" |

### Type

- **Display & body:** Manrope (weights 400/500/600/700/**800**). Load from Google Fonts.
- **Mono / machine codes:** IBM Plex Mono (weights 400/500/**600**).
- **Display headings** use Manrope 800 with `-0.028em` tracking (loosened slightly for h1, tighter for big numerals).
- **Body** uses Manrope 400/500/600, never 700+ (reserve for headings).
- **Mono caps** are used for: machine codes like `C2.1`, eyebrows above section titles, captions, progress fractions, and stat labels. Always letter-spaced (`0.14em`–`0.20em`) and uppercase.

Full type scale in `tokens.css` under `--fs-*`.

### Spacing & radii

- Spacing scale `--sp-1` (4px) through `--sp-11` (96px).
- Radii: `--r-xs` 2px (buttons, pills), `--r-sm` 4px (cards), `--r-lg` 8px (desktop frame), `--r-xl` 28px (phone bezel — preview only), `--r-pill` 999px.
- Borders are 1px `--rule`, occasionally 3px `--ink` for emphasis (left bar on active rows).

## Rules to honour

These are non-negotiable; the system breaks if you bend them.

1. **Alpine red is the single heat accent.** Reserve `--red` strictly for: primary CTAs, active states, "due"/"next" badges, dot indicators. Never use it for body text, links, or decorative fills.
2. **Status carries shape AND colour.** Filled circle = done (moss), half-filled = partial (amber), empty ring = not started. Never rely on colour alone — keeps it colour-blind safe.
3. **Mono is for machine codes.** Page IDs (`C2.1`), eyebrows, captions, progress fractions, stat labels. Never for body copy.
4. **Manrope 800 is for display headings only.** h1/h2/h3, level numerals, card titles, score numbers, wordmark.
5. **Cards sit on `--paper-3` over `--paper`.** Never card-on-card; never paper-on-paper without a hairline.
6. **The contour / grid background motif is decorative only.** Keep it at low opacity (~6-12%) and never put it behind body text.

## Things to be careful of

- The **mobile and desktop layouts are not just "responsive versions"** of each other — they're separately composed. The home screen, for example, has a different visual structure at desktop (sidebar + hero band + 3-column level cards) than at mobile (full-bleed hero + stacked level rows). Don't try to derive one from the other with media queries alone; use whichever the mockup specifies for each breakpoint.
- The **flashcard rating row** uses four discrete buttons with intervals shown below each (`Again` `<1m`, `Hard` `<10m`, `Good` `1d`, `Easy` `4d`). Don't reduce this to two buttons — the four-button SRS pattern is core to the product.
- The **level-complete screen** uses a navy-on-navy hero band with a red strikethrough on the level numeral. The strikethrough is a 6px (mobile) / 11px (desktop) red bar rotated `-6deg`, positioned with absolute inset over the numeral. It's the signature visual moment.
- The **photo slots** all have dark gradient overlays so white text reads. If you swap photos, make sure the overlay still pulls enough contrast (target ≥ 4.5:1 against the foreground text).
- The **wordmark glyph** is a minimal 30×30 SVG (a contour line + a red summit dot). It's currently inlined via `<symbol>` definitions. The app should produce a real, polished version of this — but the placeholder is fine for now.

## Files in this bundle

```
design/
  ├─ tokens.css                  ← canonical design tokens (palette, type, spacing)
  ├─ styles.css                  ← shared component primitives
  ├─ index.html                  ← documentation page showing all screens
  ├─ home.html                   ← Screen 01
  ├─ level-index.html            ← Screen 02
  ├─ workbook.html               ← Screen 03
  ├─ quiz.html                   ← Screen 04
  ├─ flashcard.html              ← Screen 05
  ├─ dashboard.html              ← Screen 06
  ├─ settings.html               ← Screen 07
  ├─ onboarding.html             ← Screen 08
  ├─ level-complete.html         ← Screen 09
  └─ img/                        ← hero photography (5 placed, 1 in reserve)
       ├─ lone-skier-navy.jpg
       ├─ skier-beanie-closeup.png
       ├─ trio-blue-run.png
       ├─ pair-with-maps.jpg
       ├─ trio-piste-signs.png
       └─ study-tabletop.png

screenshots/
  ├─ 00-overview.png             ← documentation index (all screens at a glance)
  ├─ 01-home.png
  ├─ 02-level-index.png
  ├─ 03-workbook.png
  ├─ 04-quiz.png
  ├─ 05-flashcard.png
  ├─ 06-dashboard.png
  ├─ 07-settings.png
  ├─ 08-onboarding.png
  └─ 09-level-complete.png
```

Screenshots are included as reference — each shows the mobile + desktop frames side by side as rendered. Open the corresponding HTML file for the live, interactive version.

Open each HTML file directly in a browser to view at intended fidelity. They are self-contained — no build step.

## Suggested prompt to Claude Code

When you open your app project in Claude Code, paste roughly this:

> I have a new visual design for the app. It's a re-skin only — all the existing logic, routing, content, and behaviour stays. I'm attaching a handoff folder called `design_handoff_glacier_lab/` containing the new design system and high-fidelity HTML mockups of every screen.
>
> Please:
> 1. Read `design_handoff_glacier_lab/README.md` first — it tells you what to do.
> 2. Then read `design/tokens.css` and `design/styles.css` to understand the new design system.
> 3. Then port the screens in the order listed in the README, mapping each HTML mockup onto the equivalent screen in our app.
>
> Don't touch app logic, routes, or data. Just the visual layer. Show me your plan before you start.
