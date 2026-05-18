# Glacier Lab style reference — Word edition

Quick lookup card. All values map back to `tokens.css` in the design system.

## Paragraph styles

| Style | Family | Wt | Pt | Color | Caps | Letter-sp | Space ▲ | Space ▼ | Border |
|---|---|---|---|---|---|---|---|---|---|
| **Heading 1** | Manrope | 800 | 32 | `0E1A2E` | no | – | 40pt | 16pt | – |
| **Heading 2** | Manrope | 800 | 22 | `0E1A2E` | no | – | 24pt | 10pt | bottom 0.75pt `D0D7E0` |
| **Heading 3** | Manrope | 700 | 13 | `0E1A2E` | no | – | 18pt | 6pt | – |
| **Normal** | Manrope | 400 | 11 | `3F4D63` | no | – | 0 | 8pt | – |
| **List Paragraph** | Manrope | 400 | 11 | `3F4D63` | no | – | 2pt | 2pt | – |
| **GL Eyebrow** | Plex Mono | 600 | 8.5 | `8693A6` | yes | 1.4pt | 8pt | 4pt | – |
| **GL Aim Label** | Plex Mono | 600 | 8.5 | `D7263D` | yes | 1.4pt | 14pt | 3pt | left 3pt `D7263D` |
| **GL Aim Body** | Manrope | 500 | 12 | `0E1A2E` | no | – | 0 | 14pt | left 3pt `D7263D` |
| **GL Exercise Label** | Plex Mono | 600 | 8.5 | `D7263D` | yes | 1.4pt | 18pt | 6pt | – |
| **GL Worked Label** | Plex Mono | 600 | 8.5 | `2480B5` | yes | 1.4pt | 18pt | 6pt | – |
| **GL Self-Check Label** | Plex Mono | 600 | 8.5 | `2E7D5B` | yes | 1.4pt | 18pt | 6pt | – |
| **GL Reflection Label** | Plex Mono | 600 | 8.5 | `8693A6` | yes | 1.4pt | 18pt | 6pt | – |
| **GL Fig Caption** | Plex Mono | 600 | 8.5 | `8693A6` | yes | 1.2pt | 4pt | 14pt | – |
| **GL Cover Eyebrow** | Plex Mono | 600 | 10 | `8693A6` | yes | 2.0pt | 0 | 8pt | – |
| **GL Cover Title** | Manrope | 800 | 64 | `0E1A2E` | no | – | 48pt | 20pt | – |
| **GL Cover Sub** | Manrope | 500 | 14 | `3F4D63` | no | – | 0 | 24pt | – |

## Palette (hex without #)

| Token | Hex | Use |
|---|---|---|
| Ink | `0E1A2E` | Headings, primary action |
| Ink-2 | `3F4D63` | Body copy |
| Ink-3 | `8693A6` | Eyebrow / caption / meta |
| Ink-4 | `B5BFCE` | Fill-in lines, locked |
| Rule | `D0D7E0` | Hairline borders |
| Red | `D7263D` | Aim / exercise / accent |
| Ice | `2480B5` | Worked example callouts |
| Moss | `2E7D5B` | Self-check |
| Amber | `C58B2C` | Partial / drill |
| Crimson | `A33B2A` | Destructive |

## Unit conversions

- **Word size (sz):** 2× point size. 11pt → `sz=22`. 8.5pt → `sz=17`.
- **Border thickness (sz):** eighths of a point. 3pt → `sz=24`. 0.75pt → `sz=6`.
- **Paragraph spacing (before/after):** twips, 20 per point. 14pt → 280 twips.
- **Letter spacing:** 20ths of a point. 1.4pt → `w:spacing w:val="28"`.
- **Line spacing exact:** twips. 240 = single. Glacier body uses `336` (≈1.4×).

## Page setup (A4)

- Page size: 11906 × 16838 twips (A4 portrait)
- Margins: top 1418 / bottom 1588 / left 1247 / right 1247 (~25/28/22/22 mm)

## Fonts to install

- **Manrope** — https://fonts.google.com/specimen/Manrope
- **IBM Plex Mono** — https://fonts.google.com/specimen/IBM+Plex+Mono

Both free under SIL Open Font License. Install all weights (400–800).
