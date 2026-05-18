# Workbook re-style: Glacier Lab → Word

This package gives Claude Code everything it needs to re-style the Alpine Map Training Companion Manual (415 pages, `.docx`) to match the **Glacier Lab** visual direction already shipped on the website and app.

## What's in this folder

```
workbook_handoff_glacier_lab/
├── README.md                       ← this file — the spec
├── restyle_workbook.py             ← starter Python script (run in Claude Code)
├── style_reference.md              ← quick reference card for every style
├── tokens.json                     ← Glacier Lab tokens converted to Word units
├── workbook-screenshot.png         ← visual reference (the website's workbook page)
└── design/                         ← full Glacier Lab HTML mockups for reference
    ├── tokens.css
    ├── styles.css
    └── workbook.html
```

## What you'll do in Claude Code

1. Open this folder (or copy it into your app project) in Claude Code.
2. Place the existing workbook file alongside as `Alpine_Map_Training_Companion_Manual_v11.docx`.
3. Ask Claude Code: **"Read README.md, install dependencies, and run restyle_workbook.py on the existing workbook."**
4. Claude Code will install `python-docx`, run the script, and produce `Alpine_Map_Training_Companion_Manual_v11_glacier.docx`.
5. Open the result in Word, eyeball it, ask Claude Code to nudge whatever needs nudging.

## What the script does

The existing workbook is **structurally clean already** — every page uses semantic Word styles (`Heading 1`, `Heading 2`, `Heading 3`, `ListParagraph`, `Normal`). That's the win: we don't have to re-author content. We just **redefine the styles**.

The script:

1. **Redefines the built-in styles** (`Heading 1`, `Heading 2`, `Heading 3`, `Normal`, `ListParagraph`) to Glacier Lab values
2. **Adds new custom styles** (`GL Eyebrow`, `GL Page Code`, `GL Aim Label`, `GL Aim Body`, `GL Fig Caption`, `GL Exercise Label`, `GL Cover Title`, etc.)
3. **Walks every paragraph** and applies new styles where the original paragraph is identifiable by text pattern:
   - Paragraphs matching `LEVEL # · ... · PAGE X.Y` → `GL Eyebrow`
   - Heading 3 with text "Learning aim" → `GL Aim Label`
   - Paragraphs after "Learning aim" until next Heading 3 → `GL Aim Body`
   - Heading 3 starting with "Exercise " → `GL Exercise Label`
   - Heading 3 = "Worked example" / "Self-check" / "Reflection" → minor variants
   - Paragraphs starting with `Fig. L` → `GL Fig Caption`
4. **Optionally** builds a styled cover page at the front and an answer-key section at the back (stubs included; you fill in content)

## Glacier Lab design system → Word

### Palette (use exact hex values)

| Token | Hex | Role in workbook |
|---|---|---|
| `--paper` | `EEF1F4` | (not used in Word — Word page is white) |
| `--paper-3` | `FFFFFF` | Default page background |
| `--ink` | `0E1A2E` | Headings, page titles, page numerals |
| `--ink-2` | `3F4D63` | Body copy |
| `--ink-3` | `8693A6` | Eyebrows, figure captions, meta |
| `--ink-4` | `B5BFCE` | Fill-in lines, locked text |
| `--rule` | `D0D7E0` | Hairline borders, table cell borders |
| `--red` | `D7263D` | Learning-aim label, exercise label, accent bars, cover title accent |
| `--red-2` | `B41E32` | (hover only — n/a in Word) |
| `--ice` | `2480B5` | Secondary callouts (Worked example label) |
| `--moss` | `2E7D5B` | Self-check ticked items, answer key |
| `--amber` | `C58B2C` | Partial / drill |
| `--crimson` | `A33B2A` | Destructive / "again" |

### Type

- **Display & body:** **Manrope** (weights 400/500/600/700/800). Free from Google Fonts — user must install on their machine *and* anyone opening the .docx must also have it installed, otherwise Word falls back to Calibri.
- **Mono / machine codes:** **IBM Plex Mono** (weights 400/500/600). Also free from Google Fonts.
- **Fallback chain** (set in run properties): `Manrope, Calibri, Arial` for body; `IBM Plex Mono, Consolas, Courier New` for mono.

> **Install fonts before opening the styled doc:**
> - Manrope: https://fonts.google.com/specimen/Manrope (Download family → install all weights)
> - IBM Plex Mono: https://fonts.google.com/specimen/IBM+Plex+Mono (Download family → install all weights)

### Type scale (Word uses half-points — sz value is 2× the point size)

| Style | Family | Weight | Pt | sz | Color | Notes |
|---|---|---|---|---|---|---|
| `Heading 1` | Manrope | 800 | 32 | 64 | `0E1A2E` | Level openers ("Level 1 — Map literacy") |
| `Heading 2` | Manrope | 800 | 22 | 44 | `0E1A2E` | Page title ("B1.1 — Map Purpose and Perspective") |
| `Heading 3` | Manrope | 700 | 13 | 26 | `0E1A2E` | Section sub-heads |
| `Normal` (body) | Manrope | 400 | 11 | 22 | `3F4D63` | Default text |
| `ListParagraph` | Manrope | 400 | 11 | 22 | `3F4D63` | Bullets |
| `GL Eyebrow` | IBM Plex Mono | 600 | 8.5 | 17 | `8693A6` | Page code line, uppercase, letter-spaced |
| `GL Page Code` | Manrope | 800 | 56 | 112 | `0E1A2E` | (Optional) huge "B1.1" numeral on each page opener |
| `GL Aim Label` | IBM Plex Mono | 600 | 8.5 | 17 | `D7263D` | "Learning aim" / "Exercise 1" / etc. |
| `GL Aim Body` | Manrope | 500 | 12 | 24 | `0E1A2E` | The aim text — slightly larger, red left border |
| `GL Worked Label` | IBM Plex Mono | 600 | 8.5 | 17 | `2480B5` | "Worked example" |
| `GL Fig Caption` | IBM Plex Mono | 600 | 8.5 | 17 | `8693A6` | "Fig. L1.7 — Three views…" |
| `GL Self-Check` | Manrope | 500 | 11 | 22 | `0E1A2E` | Tick-list items |
| `GL Answer Blank` | Manrope | 400 | 11 | 22 | `B5BFCE` | "________" fill-in lines |
| `GL Cover Eyebrow` | IBM Plex Mono | 600 | 10 | 20 | `8693A6` | Cover label |
| `GL Cover Title` | Manrope | 800 | 64 | 128 | `0E1A2E` | Cover headline |
| `GL Cover Sub` | Manrope | 500 | 14 | 28 | `3F4D63` | Cover description |

### Letter-spacing (mono caps)

OOXML supports character spacing via `<w:spacing w:val="N"/>` inside `<w:rPr>` — N is in 1/20ths of a point. For our mono eyebrow style at 8.5pt we want roughly `0.16em` of spacing, which is `8.5 × 0.16 = 1.36pt`, so `w:spacing w:val="28"` (28/20 = 1.4pt). The script sets this automatically.

**Apply uppercase via `<w:caps/>`** — keeps source text lowercase-friendly while displaying uppercase.

### Spacing (paragraph before/after, in twips — 1pt = 20 twips)

| Style | Before | After | Line |
|---|---|---|---|
| `Heading 1` | 800 | 320 | 1.05× |
| `Heading 2` | 480 | 200 | 1.15× |
| `Heading 3` | 360 | 120 | 1.2× |
| `Normal` | 0 | 160 | 1.45× (= w:line value `336`, single = 240) |
| `GL Eyebrow` | 0 | 80 | single |
| `GL Aim Label` | 240 | 60 | single |
| `GL Aim Body` | 0 | 240 | 1.45× |
| `GL Fig Caption` | 80 | 240 | single |

### Borders (Word uses `<w:pBdr>` on paragraphs)

- **Heading 2 (page title)** — bottom border, hairline (`w:sz="6"` = 0.75pt), color `D0D7E0`, space 8
- **`GL Aim Body`** — left border, 3pt (`w:sz="24"`), color `D7263D`, plus 12pt left indent so the bar sits clear of the text
- **`GL Exercise Body`** — same left-border pattern but maybe optional; we'll start without

### Page setup

- A4 portrait (210 × 297 mm)
- Margins: 25mm top, 22mm sides, 28mm bottom (slightly larger bottom for the page footer)
- Footer: existing `footer1.xml` in the doc — keep as-is, but restyle to mono eyebrow

## Paragraph mapping rules (text-pattern based)

The script walks every paragraph in document order. For each paragraph, it inspects:
- The existing `pStyle`
- The plain text content
- Position relative to neighbouring paragraphs

Mapping rules, applied in order (first match wins):

1. Text matches `^LEVEL\s+\d+\s+·.+·\s+PAGE\s+\S+` → `GL Eyebrow`
2. Text starts `Fig.\s+L` → `GL Fig Caption`
3. Existing style is `Heading 3` AND text == `Learning aim` → `GL Aim Label`
4. Existing style is `Heading 3` AND text starts `Exercise ` → `GL Exercise Label`
5. Existing style is `Heading 3` AND text == `Worked example` → `GL Worked Label`
6. Existing style is `Heading 3` AND text == `Self-check` → `GL Self-Check Label`
7. Existing style is `Heading 3` AND text == `Reflection` → `GL Reflection Label`
8. Previous paragraph was `GL Aim Label` AND existing style is `Normal` → `GL Aim Body`
9. Text matches `^\[\s*\]\s` (a tick-box line) → `GL Self-Check`
10. Text matches `^_+$` or `^\s*Answer:\s*_+\s*$` → `GL Answer Blank`
11. Otherwise: leave the existing `pStyle` alone (the redefined style takes effect)

## Cover page

Insert at the very top, before all existing content, with a `w:br w:type="page"` after.

Composition (top → bottom of a single A4 portrait page):

1. (Top, ~25mm down) `GL Cover Eyebrow` — "ALPINE MAP TRAINING · PERFORMOS · COMPANION MANUAL"
2. (Centred vertically) `GL Cover Title` — **"Read the mountain."** with "**mountain**" in red `D7263D`
3. `GL Cover Sub` — "BASI Alpine L4 ISTD navigation · sixty-six workbook pages, one hundred and sixty flashcards, two graded quizzes."
4. (Spacer)
5. `GL Cover Eyebrow` — "VERSION 11 · MAY 2026"
6. (Bottom of page) `GL Cover Eyebrow` — "PerformOS · Carta · Glacier Lab"

No hero photo on the Word cover — Word handles full-bleed images poorly. Keep it typographic.

## Answer key

Add as the **final** chapter of the workbook. Use the same per-page template structure as the rest of the workbook, but:

- `GL Eyebrow` reads "ANSWER KEY · LEVEL 1 · MAP LITERACY · PAGE B1.1" (etc.)
- Page title `Heading 2` reads "B1.1 — Map Purpose and Perspective (Answers)"
- For each exercise: `GL Exercise Label` + a body paragraph with the answer

The script provides a **stub** for this — Claude Code (or you) should populate the actual answers. For exercises that are open-ended (e.g. "write 4–5 sentences…"), use `GL Answer Blank` with note "Open-ended — no single correct answer. Discuss in coaching session."

## Things to be careful of

- **Don't strip existing formatting until you've redefined the base styles.** The script does this in the right order: define styles first, then re-tag paragraphs, then strip inline run overrides (which are forcing Calibri on everything).
- **Inline run properties win over paragraph styles.** The original document has `<w:rPr><w:rFonts w:ascii="Calibri" .../></w:rPr>` on most runs, forcing Calibri. The script must clear these so the redefined Heading 2 / Heading 3 styles' fonts take effect.
- **Images already in the document stay put.** Don't delete or re-embed images — the script never touches `<w:drawing>` elements.
- **Existing `numId` (bullet) values reference `numbering.xml`.** Keep them as-is.
- **Page breaks** — preserve any `<w:br w:type="page"/>` already in the doc. Only add new ones for the cover page and the start of the answer-key chapter.

## Visual reference

`design/workbook.html` is the high-fidelity HTML mockup of a workbook page in the Glacier Lab system. It shows the intended look: page-code eyebrow, big numeric title, red learning-aim bar, figure captions, exercise blocks. Open it in a browser to see the target. The Word version won't be pixel-identical (Word can't do everything CSS can), but it should *feel* the same: cool, technical, generous whitespace, mono caps for machine codes, alpine red as the single accent.

## Suggested Claude Code prompt

Once you've put this folder and the existing `.docx` together, open Claude Code in that folder and paste:

> I have an existing 415-page Word document (`Alpine_Map_Training_Companion_Manual_v11.docx`) that I want to re-style to match the new design system in this folder.
>
> Please:
> 1. Read `README.md` first — it's the full spec.
> 2. Install `python-docx` if not present.
> 3. Run `restyle_workbook.py` against the workbook.
> 4. Show me the output filename. I'll open it in Word and tell you what to tweak.
>
> Don't change content — only styling. The doc already uses semantic styles, so this is mostly a styles-redefinition pass plus a paragraph-pattern re-tagger.

That's it. Iterate from there.
