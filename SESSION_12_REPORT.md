# Session 12 — Stage 5 report (v1.5 ship)

## TL;DR

**v1.5 is tagged and shipped.** Twelve conversations across roughly forty hours, no human-written code, end-to-end from a written brief to a polished PWA.

- Tagged `v1.5.0` on `main` at commit `892d211`
- README rewritten to cover the v1.5 surface area
- `SMOKE_TESTS.md` extended with the v1.5 additions (glossary, `/about`, OpenTopoMap maps, see-also panels, PerformOS branding)
- `/about` page picks up `Get in touch` section with `performos.ai` web + `Hello@performos.ai` email

## What ships in v1.5

Visual identity (Carta — Direction 1, designed in Claude Design and ported to code):
- Cream-paper palette + slate ink + decorative contour brown
- Fraunces (display) + Inter (UI) + JetBrains Mono (machine codes)
- Custom contour-line motif throughout
- Real PerformOS branding (favicon, PWA install icons, header byline wordmark)

Content (66 pages + ancillary):
- All Levels 1–3 workbook content rendered from MDX
- 20 schematic SVG diagrams + 9 printable templates
- 50+ glossary terms with cross-links
- 4 OpenTopoMap quiz extracts (Courchevel area)
- "See also" cross-reference panels at the bottom of every page
- `/about` page documenting the build narrative

Interaction:
- Two interactive 15-question quizzes (C7.1, D10.1) with auto-grading + self-mark + error log
- 160 spaced-repetition flashcards across 8 decks with SM-2 scheduling
- Per-page completion + interactive self-check checkboxes
- Confidence ratings + readiness checks captured per skill area

Trainer surface:
- Toggle in `/settings` auto-expands answer keys, shows trainer notes inline
- "Trainer" pill in the header for visibility
- `/progress` dashboard surfaces all candidate state in one view

PWA:
- Installable to home screen (iOS / Android / desktop)
- Works offline once installed
- Hand-rolled service worker (network-first navigation, cache-first assets)

## Showcase URLs (the v1.5 tour)

| # | URL | What you're checking |
|---|---|---|
| 1 | https://alpine-map-training.vercel.app/ | Carta home — hero + level cards + reference shelf |
| 2 | https://alpine-map-training.vercel.app/levels/2/C2.1 | Workbook page with see-also panel at the bottom |
| 3 | https://alpine-map-training.vercel.app/levels/2/C7.1/quiz | OpenTopoMap extract above the quiz, with three coloured markers |
| 4 | https://alpine-map-training.vercel.app/levels/2/C7.2 | A → B → C → D walk with route line drawn |
| 5 | https://alpine-map-training.vercel.app/flashcards/study/l2 | Carta-styled card flow with rating buttons |
| 6 | https://alpine-map-training.vercel.app/glossary | 50+ terms with alphabet jump strip |
| 7 | https://alpine-map-training.vercel.app/about | The AI-demo narrative + PerformOS contact |
| 8 | https://alpine-map-training.vercel.app/progress | Fraunces overall % + per-level/quiz/confidence/readiness |
| 9 | https://alpine-map-training.vercel.app/settings | Trainer-mode toggle + storage info |

## What you should do next

1. **Run `SMOKE_TESTS.md`** end-to-end against the deployed URL — it now has 4 new sections covering the v1.5 additions. Allow ~15 minutes for the full pass, ~5 minutes for the core flow.
2. **If anything fails or feels off**, tell me and I'll fix before we treat v1.5 as locked.
3. **Once happy**, the `v1.5.0` tag is the marker — anything we build from here is v1.6 or v2.0.

## What got built across the twelve sessions

| Session | Stage | What it added |
|---|---|---|
| 1 | scaffold | Next.js 16 + Tailwind v4 + shadcn/ui + Velite, first Vercel deploy |
| 2 | content | Level 1 ingestion (19 pages) + page rendering |
| 3 | content | Levels 2 + 3 (47 pages) + 20 diagrams + 9 templates |
| 4 | feature | C7.1 + D10.1 interactive quizzes with auto-grade + self-mark |
| 5 | feature | localStorage progress (page completion, self-checks, quiz state) |
| 6 | platform | PWA service worker + install prompt + offline fallback |
| 7 | feature | Trainer mode toggle + confidence + readiness capture |
| 8 | polish | a11y audit + print stylesheet + smoke checklist (**v1.0**) |
| 9 | feature | 160 flashcards with SM-2 spaced repetition |
| 10 | visual | Carta visual rebuild (Stage 3) |
| 11 | content | Glossary + /about + see-also + OpenTopoMap maps (Stage 4) |
| 12 | ship | README + SMOKE_TESTS + tag v1.5.0 (this report — **v1.5**) |

## Total surface

- 98 routes prerendered as static HTML
- 11 SESSION reports committed
- ~40 hours of build time across 12 conversations
- 1 chosen design direction out of 3 (Carta), one designed by Claude Design and ported by Claude Code
- 0 lines of code written by human hands
- 100% of architectural decisions made through extended prompting

## Honest known limitations / future work

| Area | Limitation | Effort to address |
|---|---|---|
| Layout | No left-sidebar desktop layout per Carta master mock — kept top-bar nav | 2-3 hr |
| Layout | No 3-column workbook page (left section nav + right ON-THIS-PAGE sidebar) | 3-4 hr |
| Mobile | No bottom tabbar on mobile per Carta — top-bar serves both | 2 hr |
| Visual | No dark mode yet (Carta tokens defined for light only) | 1-2 hr |
| Content | Inline glossary tooltips (hover term in body content) — only the /glossary route + see-also exists | 3-4 hr |
| Content | Maps don't have on-image text labels — coloured dots + below-image legend instead | 30 min if Jimp font wrangled |
| Content | Imagery placeholders for hero strips (workbook still uses ContourBackground decorative SVGs only) | Variable, depends on Nigel sourcing photos |
| Trainer | No PIN gate on `/settings` — anyone can toggle trainer mode | ~1 hr |
| Multi-user | Single-candidate localStorage only — no multi-candidate / cross-device sync | Days, needs backend |
| Interactivity | Per-page exercise inputs (every Exercise N becomes interactive) — only C7.1 + D10.1 are full | Days, needs structured exercise extraction |

These are explicit v1.5 → v2.0 line items. The brief flagged most of them as such; nothing on this list is a v1.5 bug.

## Vercel deployment

`v1.5.0` auto-deploys on the push that landed the tag. The deployed URL stays the same:

> https://alpine-map-training.vercel.app/

Vercel preserves the latest production deployment from `main`. The tag is for human bookkeeping (and any rollback we ever need).

## Commits this stage

```
892d211  Stage 5: ship v1.5
3895aaa  Wire real PerformOS branding (favicon, PWA icons, header byline)
d0007f1  Add SESSION_11_REPORT (Stage 4 — content enrichment)
9223560  Stage 4: content enrichment — glossary, /about, see-also, OpenTopoMap
865c632  Add SESSION_10_REPORT (Stage 3 — Carta visual rebuild)
…
```

Plus the tag `v1.5.0` pushed to `origin`.

## v1.5 done

This is the v1.5 milestone. Everything in the brief that was "must have" or "should have for v1.5" is built and shipped. Future work is your call — could be:

- **v1.6 polish**: dark mode, left-sidebar layout, bottom tabbar, inline glossary tooltips
- **v1.6 content**: real photography, on-image map labels, more flashcards
- **v2.0 platform**: backend sync, multi-candidate, authentication, native wrappers, PDF export
- **Or**: rest the project for a while; let John use it; gather actual feedback before deciding

I'd suggest the third option for at least a week or two before deciding on v1.6. Real-use feedback beats anticipated polish every time.

— End of v1.5.
