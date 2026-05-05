# Carta — Stage 3 handoff

Direction 1, locked. Everything Code needs to port Carta into the
Alpine Map Training codebase without picking colours by eye.

## Files

| File | What it is | When to use it |
|---|---|---|
| `tokens.css` | Every CSS variable: palette (with comments), type families & scale, spacing, radii, motif rules. Plus base resets, `.btn`, `.pill`, `.progress`, `.wordmark`, `.phone`, `.desktop`, `.ios-bar`, `.browser-bar`. | Single source of truth. Import once globally; never redefine these values inline. |
| `home.html` | Standalone Carta home — mobile (375) + desktop (1200). | Reference when building the landing page (hero, three Level cards, references shelf, sidebar nav). |
| `workbook.html` | Standalone workbook page — C2.1 Summit shapes — mobile + desktop. | Reference for the Learning-aim card, schematic-frame diagrams, on-this-page sidebar, page codes in mono. |
| `flashcard.html` | Standalone flashcard study session — mobile + desktop. | Reference for card frame, four-rating row (Again / Hard / Good / Easy with intervals), session sidebar. |

Each standalone file imports `tokens.css` and contains only the
screen-specific CSS on top.

## Rules to honour (also in `tokens.css` as comments)

1. **CTAs are filled `--ink` on `--paper`.** `.btn.ghost` is the only
   secondary. **Never** use `--contour` (the warm brown) as a button
   fill. The mobile mock had two slipped CTAs — the rule is correct, the
   mock was inconsistent. Use slate everywhere.
2. **`--contour` is decorative only.** Contour-line SVGs, the level
   numerals (e.g. the giant "01" / "02" / "03"), the section-num
   eyebrow, the 3px left bar on `.wb-aim`, and pill text on
   `.pill.contour`. That's it.
3. **Status carries shape AND colour.** Filled circle = done (moss),
   half = partial (amber), empty ring = not started. Never rely on a
   tick character alone — keeps it colour-blind safe.
4. **Mono is for machine codes** (page IDs like `C2.1`), eyebrows,
   captions, progress fractions. Not for body copy.
5. **Display serif (Fraunces) is for** h1/h2/h3, level numerals, card
   titles, score numbers, wordmark. Inter handles all UI/body text.

## Tokens cheat-sheet (full list in `tokens.css`)

```
Paper         #F4ECD8  page bg
Paper-2       #EAE0C7  recessed (browser chrome)
Paper-3       #FBF6E9  cards, sidebar
Ink           #1F2A33  body, CTA fill
Ink-2         #354553  card body copy
Ink-3         #6B7986  meta, captions
Rule          #C8B98F  hairline borders
Contour       #8B5A2B  decorative motif (NEVER a CTA)
Contour-2     #B98455  secondary motif weight
Slate         #3E5266  alt action (rare; default action is Ink)
Moss          #5C7A3F  success
Crimson       #A33B2A  destructive / "Again"
Amber         #C58B2C  in-progress / partial
```

Fonts via Google Fonts (or `next/font`):
- **Fraunces** (display, opsz 9..144, weights 400/500/600/700)
- **Inter** (UI, weights 400/500/600/700)
- **JetBrains Mono** (machine codes, weights 400/500)

## Anything else?

Open `home.html`, `workbook.html`, `flashcard.html` directly in a
browser — they're self-contained. The full master mock with all eight
screens lives at `../directions/carta.html` if a question comes up
that the three extracted files don't answer.
