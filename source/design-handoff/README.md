# Workbook handoff — Alpine Map Training (Glacier Lab style)

**For the next Claude session.** This folder is everything you need to build a styled HTML workbook out of the Alpine Map Training Companion Manual. Read this file, then start producing pages.

---

## The ask, in one sentence

Render the content of `source/Alpine_Map_Training_Companion_Manual_v11.docx` as an HTML workbook that **exactly matches** the visual system shown in `reference/workbook.html`.

This is a re-skin and re-layout job, not a content rewrite. Keep the manual's wording, structure, and pedagogy. Change only the presentation.

---

## What's in this folder

```
workbook_recreate_handoff/
├── README.md                    ← you are here — the prompt
├── source/
│   └── Alpine_Map_Training_Companion_Manual_v11.docx
├── reference/
│   ├── workbook.html            ← the one page that defines the style
│   ├── tokens.css               ← every color, font, spacing variable
│   ├── styles.css               ← shared component primitives
│   └── workbook-screenshot.png  ← rendered reference (mobile + desktop)
└── template/
    └── page-template.html       ← stripped scaffold — duplicate this per page
```

---

## How to read the manual

`Alpine_Map_Training_Companion_Manual_v11.docx` is a Word doc — unzip it as a zip archive and parse `word/document.xml`. Use this approach:

```js
// run_script
const blob = await readFileBinary('source/Alpine_Map_Training_Companion_Manual_v11.docx');
// then use JSZip or a similar approach to extract document.xml
```

Or invoke the `read_pdf`-equivalent flow for .docx: read the binary, treat it as a ZIP, pull `word/document.xml` and `word/numbering.xml`.

The doc already uses **semantic Word styles** — every paragraph has a `<w:pStyle w:val="..."/>` you can map directly:

| Word style | Becomes (in HTML) |
|---|---|
| `Heading 1` | Level opener — page break, big numeral, level title |
| `Heading 2` | Page title (`.wb-title`) |
| `Heading 3` | Section sub-head inside `.wb-body h3` |
| `Normal` | Body paragraph inside `.wb-body p` |
| `ListParagraph` | `<li>` inside `<ul>` in `.wb-body` |
| Paragraphs matching `^LEVEL \d+ · .+ · PAGE \S+` | `.crumb` eyebrow |
| Heading 3 with text "Learning aim" | Triggers `.wb-aim` block (next paragraph is the aim body) |
| Heading 3 starting "Exercise " | Triggers exercise block (red eyebrow + numbered items) |
| Heading 3 == "Worked example" | Same block treatment, blue (`--ice`) eyebrow |
| Heading 3 == "Self-check" | Tick-list block, moss (`--moss`) eyebrow |
| Paragraphs starting `Fig. L...` | `.diagram .cap` figure caption |

Figures are embedded as image relationships. Pull them out alongside `document.xml` from `word/media/` and keep the `image1.png` → which-paragraph mapping. **Don't redraw figures from scratch** — use the originals, placed inside a `.diagram` cell with a mono caption underneath.

---

## What to produce

One HTML file **per workbook page** in the manual (the doc uses one `B1.1`-style page code per topic). Roughly 60–70 pages total.

Output layout:

```
workbook/
├── index.html                  ← table of contents, grouped by level
├── tokens.css                  ← copied from reference/
├── styles.css                  ← copied from reference/
├── workbook.css                ← any additional rules you need beyond styles.css
├── img/                        ← extracted figures from word/media/
│   ├── fig-L1.1.png
│   └── ...
└── pages/
    ├── B1.1-map-purpose.html
    ├── B1.2-...html
    └── ...
```

Each page is **a desktop-first layout** matching the desktop half of `reference/workbook.html`:

- Left sidebar (240px) — wordmark + table of contents for the current level, with the current page marked `active`
- Middle column (max-width 760px, generous gutters) — the actual content
- Right aside (280px) — page meta (cards earned, time, references)

Use `template/page-template.html` as the starting scaffold — it already wires `tokens.css` + `styles.css` and has every block in the right place with `<!-- TODO -->` markers.

---

## Style rules to honor

These are all in `tokens.css` and demonstrated in `reference/workbook.html`. **Do not invent new colors, fonts, or spacing values.** If something isn't in the system, ask first.

### Colors (use the CSS variables, never raw hex)

- Headings, primary action: `var(--ink)` `#0E1A2E`
- Body copy: `var(--ink-2)` `#3F4D63`
- Eyebrows, captions, meta: `var(--ink-3)` `#8693A6`
- Page background: `var(--paper)` `#EEF1F4`
- Card / content surface: `var(--paper-3)` `#FFFFFF`
- Single accent (learning aim bar, active state, CTAs): `var(--red)` `#D7263D`
- Worked-example eyebrow: `var(--ice)` `#2480B5`
- Self-check eyebrow: `var(--moss)` `#2E7D5B`

**Red is the only heat accent.** Don't use it for decorative emphasis — reserve it for learning-aim bars, exercise labels, active TOC item, primary CTA, and small flag markers on diagrams.

### Type

- Headings and display: **Manrope** 800 (load from Google Fonts, weights 400/500/600/700/800)
- Body: **Manrope** 400/500
- Mono — for page codes, eyebrows, captions, fractions: **IBM Plex Mono** 400/500/600
- Mono caps get **uppercase + letter-spacing** between `0.08em` (page codes in TOC) and `0.18em` (large eyebrows). See the existing examples — match them, don't guess.

### Type scale (in `tokens.css`)

- Page title (`.wb-title` on desktop): 48px Manrope 800, line-height 1.1, `letter-spacing: -0.025em`
- Sub-heads (`.wb-body h3`): 18px Manrope 800
- Body: 15px Manrope 400, line-height 1.55
- Eyebrows / captions: 10–11px Plex Mono 600, uppercase, tracked

### Spacing

- Sidebar padding: 32px 24px
- Middle column padding: 32px 56px 56px
- Body paragraph spacing: 12–16px after
- Section sub-heads: 22px before, 8px after
- Borders: always `1px solid var(--rule)` — never thicker except the 3px red accent on `.wb-aim`

### Components you'll reuse (already in `reference/workbook.html`)

- `.crumb` — top eyebrow showing "Workbook › Level 2 — Terrain interpretation › C2.1"
- `.wb-title` + `.wb-sub` — page title + subtitle
- `.wb-meta-row` with `.tag` pills — page number, read time, card count
- `.wb-aim` — red-left-border block with `<h4>Learning aim</h4>` + paragraph
- `.wb-body` — main content container
- `.diagram-row` with `.diagram` cells — 2- or 3-up figure grids with mono captions
- `.wb-table` — clean table with mono uppercase headers, hairline rows
- `.answer-key` `<details>` — collapsible answer-key block at the foot of exercises
- `.pager` — prev / mark-complete / next at the bottom

---

## Things to be careful of

1. **Don't paraphrase the manual.** Lift wording verbatim. The voice is dry, technical, alpine-coach. Don't soften it.
2. **Don't add icons or emoji** that aren't already in the reference. The only "icons" are: the caret in `.crumb`, the down chevron on the answer-key `<details>`, and small red triangle flags on diagrams.
3. **Don't add gradients, drop shadows, or rounded corners** beyond what tokens.css defines (`--r-xs: 2px`, `--r-sm: 4px`).
4. **Don't redraw figures.** Extract the originals from `word/media/` and drop them in. If a figure is illegible (a Word screenshot of a chart, say), note it in a comment — don't invent.
5. **Preserve page codes** (B1.1, C2.3, etc.) exactly as they appear in the manual. They're the navigation primitive.
6. **One page = one HTML file.** Don't try to put the whole workbook in a single document.
7. **The desktop layout is canonical.** A mobile version exists in `reference/workbook.html` for reference, but produce desktop pages first. Mobile is a stretch goal.

---

## Suggested workflow

1. **Read the manual structure first.** Don't generate pages yet — extract every paragraph's text + style + (if image) media reference. Build a structured JSON outline: levels → pages → blocks. Show me the outline so I can sanity-check the parse before you start rendering.
2. **Extract figures** from `word/media/` into `workbook/img/` with predictable names tied to the page they live on (e.g. `fig-B1.1-1.png`).
3. **Build `index.html`** first — the TOC, grouped by level. This is the easiest page and gets the chrome right.
4. **Build page 1 (B1.1).** Show it to me. We'll tweak.
5. **Once one page is signed off,** batch-generate the rest using the same scaffold.

---

## The prompt to paste into Claude

> I have a Word document and a design reference. Please re-render the document as an HTML workbook in the reference's exact visual style.
>
> Read `README.md` in this folder first — it's the full spec, including how to parse the .docx, what styles to map where, and the output layout.
>
> Start by parsing the manual and showing me a structured outline of every page before you render anything. Then build `index.html` and the first content page (`B1.1`), and pause for feedback before continuing.
>
> Do not paraphrase the manual content. Do not invent new colors, fonts, or components beyond what's in `reference/tokens.css` and `reference/styles.css`. Do not redraw figures — extract the originals from `word/media/`.

That's it. Hand the folder over, paste the prompt, iterate from there.
