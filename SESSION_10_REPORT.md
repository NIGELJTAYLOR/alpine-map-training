# Session 10 — Stage 3 report (Carta visual rebuild)

## TL;DR

Carta is **live across every surface in the app.** Tokens, fonts, layout patterns, micro-interactions all match the chosen direction. Pushed to `main` across five intermediate commits ending at `8b8604c`. 98 routes prerender. Build clean throughout.

## Showcase URLs (open these in this order — ~2 min)

1. **`/`** — Home is the most dramatic transformation. Cream paper background, contour-line motif behind the hero, **"Read the mountain before you ski it."** in 64px Fraunces, three Level cards with **massive contour-brown 01/02/03 numerals**, "Reference shelf" band beneath. Hero art (compass + spot height + contour rings) on desktop right.
2. **`/levels/2`** — Level index. Massive Fraunces "02" hero, page list with proper Carta status dots (filled moss / half amber / empty ring) on the left.
3. **`/levels/2/C2.1`** — Workbook page. **Fraunces 44px title**, learning-aim card with the 3px contour left bar, page-code mono breadcrumb. The schematic-diagram framed cards appear inline below the body.
4. **`/levels/2/C7.1/quiz`** — Take 3-4 questions, finish, and see the **score summary moment**: the Fraunces 88px "12/15" with ink-3 denominator. Per-skill breakdown is the row pattern (label → bar → fraction). Error log links back to the page to revisit.
5. **`/flashcards/study/l2`** — Open a card, flip, see the four rating buttons in their crimson/amber/rule/moss tints with mono next-interval hints (`<1d`, `1d`, `6d`, `15d`).
6. **`/progress`** — Overall % as a Fraunces 88px headline. Per-level row pattern. Quiz cards. Confidence + readiness with Carta pills.
7. **`/settings`** — Trainer toggle as a Carta switch (ink track + paper handle). Three sections each with contour eyebrow.

## What changed

### Foundation (1/5)
- `src/app/globals.css` — Carta palette as CSS variables (paper, ink, contour, moss, amber, crimson, slate, rule), type scale (10 sizes), tracking, leading, radii, shadows. Tailwind v4 utility aliases (`bg-paper`, `text-ink`, etc.). Reusable utility classes (`.wordmark`, `.pill`, `.carta-progress`, `.eyebrow`, `.page-code`, `.surface-card`, `.status-dot`).
- `src/app/layout.tsx` — Fraunces (variable opsz axis), Inter, JetBrains Mono via next/font.
- `src/app/manifest.ts` — `theme_color: "#F4ECD8"` (paper).

### Header & decoration (2/5)
- `src/components/site/carta/wordmark.tsx` — three-stack contour-curve glyph + "Alpine Map Training" + "By PerformOS" byline.
- `src/components/site/carta/contour-bg.tsx` — `ContourBackground` (hero overlay), `ContourDivider`, `HeroArt` (topographic-rings + compass + spot height for the home hero).
- `src/components/site/site-header.tsx` — wordmark + slimmer mono-caps nav (L1/L2/L3/Cards/Diagrams/Templates/Progress/Settings).

### Pages and supporting components (3/5)
- `src/app/page.tsx` — full Carta home rebuild (hero band, "Three levels in order" with massive numerals, "Reference shelf" tinted band).
- `src/app/levels/[level]/page.tsx` — hero with contour-brown 96px level numeral + Fraunces 36px title, list with Carta status dots.
- `src/components/site/page-shell.tsx` — Fraunces 44px page title, learning-aim card with 3px contour left bar, surface-card prev/next pager.
- `src/components/site/answer-toggle.tsx` — clean Carta surface, contour-tint bg + Trainer pill when trainer mode is on.
- `src/components/site/page-completion.tsx` — paper-3 card, ink CTA.
- `src/components/site/trainer-notes-panel.tsx` — contour border + bg, paper-3 inner cards.
- `src/components/site/progress-indicators.tsx` — `PageStatusBadge` is now a true Carta dot (shape + colour). `LevelProgressBar` uses `.carta-progress`.
- `src/components/site/diagram-card.tsx` — figure with paper-3 outer + paper inner frame and `FIG. n` mono caption.
- `src/app/levels/[level]/[page]/page.tsx` — quiz CTA, schematics, templates list, readiness panel all carry Carta tokens.

### Quiz + flashcards (4/5)
- `src/components/site/quiz/quiz-player.tsx` — mono Q-counter + carta-progress, surface-card question frame, **Fraunces 88px score showcase**, row-pattern per-skill breakdown, paper-3 error log.
- `src/components/site/flashcards/study-session.tsx` — surface-card frame, Fraunces front prompt, four rating buttons in their tonal tints with mono next-interval estimates and 1/2/3/4 keyboard hints in the caption.
- `src/components/site/flashcards/flashcards-index.tsx` — Fraunces "X cards due" headline in the today panel, surface-card decks with mono fractions and contour "N new" highlight.

### Dashboard, settings, MDX, routes (5/5)
- `src/components/site/progress-dashboard.tsx` — Fraunces 88px overall %, row-pattern by-level, paper-3 quiz cards, Carta pills for readiness, contour "Continue / Review →" mono links.
- `src/components/site/settings-panel.tsx` — three sections, Carta toggle switch, mono About block.
- `src/components/mdx/components.tsx` — every workbook-body element rebuilt: Fraunces headings with Carta colour cues, Inter ink-2 paragraphs, mono table headers, contour-left blockquote, paper-2 inline code.
- All remaining route headers (`/progress`, `/flashcards`, `/diagrams`, `/templates`, `/templates/[slug]`, `/levels/[level]/[page]/quiz`, `/~offline`, `/settings`) restyled with eyebrow + Fraunces 44px headings.

## Files changed (count)
- **New:** 2 components (wordmark, contour-bg)
- **Modified:** ~25 files (every route, every page-level component, the MDX body, globals.css, layout.tsx)
- **Deleted:** 0
- **Bytes added (committed):** ~1,300 lines net across the five Stage 3 commits

## Judgment calls I made (none required your sign-off but worth flagging)

1. **The CTA-colour ambiguity in the Carta mocks** — I used **slate-ink fill for every CTA**, per the explicit rule in `tokens.css`: *"Contour brown is decorative only — never holds an action."* The mobile mocks had two slipped contour-fill CTAs; I followed the rule, not the mock.
2. **No left-hand sidebar layout on desktop.** The Carta master mock uses a 240px sidebar nav on desktop home + workbook page. I kept the existing top-bar layout because: (a) restructuring the layout shell is high-blast-radius for v1.5 polish, (b) the top-bar adapts cleanly to mobile without needing a separate tabbar component, (c) the visual transformation is already dramatic without the sidebar shift. **Worth doing in a follow-up if you want full structural Carta** — it's about a 2-3hr job to add a sidebar shell and a mobile bottom tabbar, then thread them through every route.
3. **No three-column workbook page.** The Carta workbook mock has a left section sidebar (C2.1/C2.2/C2.3 etc.) AND a right "ON THIS PAGE / LINKED CARDS / TRAINER MODE" sidebar. I kept the single-column reading layout. Same reasoning — high effort, the colour/typography/learning-aim-card upgrade already does the heavy lifting visually. The right "linked cards" sidebar in particular is a polish item that would require generating page-by-page card lookups.
4. **Quiz + flashcard "next-interval" hints** are estimates, not the exact SM-2 result. I write `<1d` / `1d` / `6d` / `15d`-style hints under each rating button; the actual SM-2 scheduler runs on submit. Cleaner than computing the exact interval twice (once for the hint, once for the actual schedule).
5. **No dark mode yet.** Per our agreement at the end of Stage 2, dark mode lives in iteration after the chosen direction lands. Carta's warm paper looks beautiful by day; dark variant is a tokens-swap exercise (~1-2hr) we can do whenever it bothers you on a phone in a hut at night.
6. **MDX `<input>` checkbox replacement** still routes to `<SelfCheckCheckbox>` — Carta-styled in the new tokens (slate-blue accent → ink, paper background). No behaviour change.
7. **Hero illustration on the home page** is a custom SVG (`HeroArt`) I drew based on the Carta mock's reference. Topographic rings + compass + spot height marker. Replaces the flat triangle that was there before.

## What I deliberately deferred (explicitly Stage 4 / future)

| Item | Effort | When |
|---|---|---|
| Real PWA icons (replace placeholder slate triangles with proper artwork) | 1hr (you provide art) | Stage 4 |
| Dark mode (Carta token swap) | 1-2hr | Anytime |
| Left-sidebar desktop layout per Carta mock | 2-3hr | Future polish |
| 3-column workbook page (left section nav + right "on this page" sidebar) | 3-4hr | Future polish |
| Mobile bottom tabbar | 2hr | Future polish |
| Map extracts in C7.1 / D10.1 quizzes (OpenTopoMap integration) | 3-4hr | Stage 4 |
| Inline imagery sourcing (Unsplash placeholders / your own) | 2hr | Stage 4 |
| Glossary feature | 3-4hr | Stage 4 |
| `/about` page (the AI-demo angle) | 1hr | Stage 5 |

## What needs your eyes when you look

In rough priority — all on the deployed Vercel URL after the auto-deploy finishes:

1. **Open `/` on a desktop browser.** Hero, level cards, references shelf. This is the biggest visual upgrade — should feel completely different from the previous slate-blue look.
2. **Open `/` on your phone.** Confirm the hero stacks cleanly, level cards read at single-column, no horizontal scroll.
3. **Open `/levels/2/C7.1/quiz`** and finish a few questions. The score summary at the end is the showcase moment — the massive Fraunces "X/15".
4. **Open `/flashcards/study/l2`**, take a few cards. The rating-button row with the four tonal tints + interval hints is the new card-flow showcase.
5. **Toggle trainer mode in `/settings`** then open any workbook page. Confirm the brown trainer treatment still works (auto-expanded answer key + trainer notes panel below).
6. **Print preview a workbook page** (`Ctrl/Cmd+P`). The Carta print stylesheet should produce a clean black-on-white page with the chrome stripped.

## Commits this stage

```
8b8604c  Stage 3 (5/5): progress dashboard, settings, mdx body, route polish
d4582ba  Stage 3 (4/N): Carta quiz + flashcards restyle
878f4a5  Stage 3 (3/N): Carta level index, workbook page, supporting components
692ecee  Stage 3 (2/N): Carta wordmark + restyled header + new home
356642c  Stage 3 (1/N): Carta tokens + font stack
```

Five intermediate commits (all built clean) plus this report — pushed cleanly to `origin/main`. Vercel auto-deploys.

## What's next per the agreed roadmap

| Stage | Description | Estimated effort |
|---|---|---|
| **Stage 4** | Content enrichment — map extracts (OpenTopoMap), placeholder imagery (Unsplash), glossary, see-also panels | ~variable, depends on imagery sourcing |
| **Stage 5** | Smoke test + ship v1.5 + `/about` page | ~2hr |

When you're ready, run `SMOKE_TESTS.md` against the deployed URL. If it all passes, say **"go for Stage 4"** and I'll begin the content enrichment work.

Genuinely happy with how this landed. Carta does what we hoped — gives the app the feel of a serious mountaineering reference rather than a generic learning tool.

— End of Stage 3.
