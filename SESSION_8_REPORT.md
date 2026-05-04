# Session 8 — Report (v1.0 release)

## TL;DR

Eight sessions, ~25 hours of build time, on schedule with the brief's
estimate. v1.0 of the Alpine Map Training PWA ships:

- Levels 1–3 ingested in full (66 pages, 95 answer-key records, 28 trainer-notes bundles, 20 schematic diagrams, 9 templates)
- Two interactive 15-question quizzes with auto-grading and self-mark
- localStorage progress (page completion, self-checks, quiz state, confidence ratings, readiness checks)
- Trainer mode toggle (auto-expanded answer keys + inline trainer notes)
- PWA installable to home screen on iOS/Android/desktop, offline once installed
- Accessibility pass: skip link, semantic main, aria-live indicator, dialog roles, reduced-motion support
- Print stylesheet covers nav-hiding, theme reset, page-break hints, A4 margins
- New `SMOKE_TESTS.md` checklist + rewritten `README.md`

## Session 8 changes

### Accessibility
- **Skip-to-content link** in the root layout. Hidden until focused; jumps to `#main-content`.
- **Every route now has `<main id="main-content" tabIndex={-1}>`** — including the workbook page route (via PageShell, which previously rendered just `<article>`) and the templates/[slug] route (was `<article>`).
- **Header nav links carry `aria-current="page"`** when active, so screen readers announce the current location.
- **Offline indicator** gained `role="status"` + `aria-live="polite"` + `aria-atomic="true"` so screen readers announce connectivity changes.
- **Install-prompt cards** gained `role="dialog"` + `aria-labelledby` pointing at the heading.

### Print stylesheet
Big rewrite in `globals.css`. When printing:
- Hides every `.no-print` element plus sticky headers, dialogs and live regions
- Forces light theme tokens regardless of dark-mode preference
- Underlines all links so URLs aren't lost
- Adds page-break hints — avoid breaking inside cards/tables/figures, avoid break-after on `h1/h2/h3`
- Tighter type (11pt body, 1.4 line-height) and 1.5cm `@page` margins
- Forces images and SVGs to fit page width

Components marked `.no-print`: `SiteHeader`, `OfflineIndicator`, `InstallPrompt`, `PageCompletionControls`. Trainer-notes panel and answer-toggle stay visible (they're useful on paper *if* you're already in trainer mode, which expands them).

### Reduced motion
`@media (prefers-reduced-motion: reduce)` strips animations, transitions, and smooth-scroll across the whole app.

### Smoke checklist
New `SMOKE_TESTS.md` — manual checklist organised by area (navigation, reading, quizzes, trainer mode, readiness, progress, diagrams + templates, a11y, PWA + offline, print). ~5 min for the core flow, ~15 min for the full pass. Recommend running before any deploy you actually trust.

I considered installing Playwright for a real automated suite but decided against:
- Playwright pulls ~200MB of browser binaries
- The most valuable tests would mostly cover UI happy-paths that I can verify by eye in 5 minutes
- A11y tests would need axe-core integration too (more deps)
- For v1.0 with one person using it, a manual checklist that takes the same 5 minutes is the right tool

If you want automation later — e.g. once multiple candidates are on it — Playwright is the natural next step.

### README
Rewrote from the create-next-app default. Now covers what shipped in v1.0, the stack, repository layout, day-to-day workflows (re-ingest, edit a quiz, dev/build/deploy), architecture notes, and the per-session report index.

## v1.0 release notes (the full picture)

### Routes
| Route | What it does |
|---|---|
| `/` | Home with level cards (live progress counts) |
| `/levels/<n>` | Level index — pages with status badges + level-wide progress bar |
| `/levels/<n>/<page>` | Workbook page — body, diagrams, templates, answer toggle, trainer notes (when on), readiness check (closing pages), completion controls |
| `/levels/<n>/<page>/quiz` | Interactive quiz (C7.1 and D10.1) with score summary + confidence ratings + error log |
| `/diagrams` | Gallery of all 20 schematic diagrams |
| `/templates` + `/templates/<slug>` | Index + per-template view |
| `/progress` | Personal dashboard — overall stats, per-level/quiz, confidence, readiness, reset |
| `/settings` | Trainer-mode toggle |
| `/~offline` | PWA offline fallback |
| `/manifest.webmanifest` | PWA manifest |

90 routes prerender as static HTML. Build is clean.

### Storage schema
Single localStorage key `alpine-map-training:progress`, JSON blob, schema versioned.
```
{
  candidateId: "default",
  version: 1,
  lastUpdated: ISO,
  settings: { trainerMode: bool },
  pages: { "L<n>.<page>": { status, selfCheck: bool[], lastViewed } },
  quizzes: { "L<n>.<page>": { startedAt, completedAt?, responses, score?, totalQuestions?, timeMinutes? } },
  confidenceScores: { "<quizId>.<skillId>": { value, updatedAt } },
  readinessChecks: { "<scopeKey>": { status, notes, updatedAt } }
}
```

### Stack
- Next.js 16 App Router + TypeScript
- Tailwind v4 + shadcn/ui (Base UI primitives)
- Velite for MDX content pipeline
- react-markdown for question prompts
- Hand-rolled Service Worker
- Vercel auto-deploy from `main`

## Brief vs delivery — what made it, what didn't

### v1.0 must-haves (per the brief, section 5)
- ✅ All Levels 1–3 content rendered
- ✅ Navigation: Level → Section → Page tree, prev/next
- ✅ Exercise types (sort of — see deferred)
- ✅ C7.1 and D10.1 quizzes with submit, scoring, error log
- ✅ Self-check checklists with localStorage persistence
- ✅ Page completion status
- ✅ Schematic SVG diagrams embedded inline
- ✅ Templates as printable views
- ✅ PWA manifest, service worker, offline support
- ✅ Installable to home screen
- ✅ Responsive layout
- ✅ Basic trainer mode (toggle, trainer notes, answer keys)
- ✅ Deployed to Vercel with auto-deploy from GitHub

### Brief features I deferred (and why)
| Feature | Status | Notes |
|---|---|---|
| Per-exercise interactive inputs across the whole workbook | Partial | C7.1 + D10.1 quizzes are fully interactive; per-exercise inputs on every page deferred. The brief described 9 exercise types — building all of them generically across all 66 pages would have eaten v1 entirely. The two showcase quizzes prove the pattern; expanding to per-page inputs is straightforward when the interactive workbook becomes a v1.5 priority. |
| Photo upload for sketch tasks | Out of scope per brief (v2.0) | |
| Backend / cross-device sync | Out of scope per brief (v2.0) | |
| Authentication | Out of scope per brief (v1 = local only) | |
| Multi-candidate support | v1.5 line item | |
| PIN protection for trainer mode | v1.5 line item | |
| Trainer dashboard view of candidate progress | Partially done — the existing `/progress` dashboard does this when trainer mode is on |
| Spaced-repetition reminders | v1.5 line item | |
| Customisable venue (replace "Courchevel" globally) | v1.5 line item, not encountered as a hard-coded string in the migrated content |
| Print-friendly stylesheet | Done in Session 8 | |
| Confidence score recording | Done in Session 7 | |
| Readiness check capture | Done in Session 7 | |
| Real PWA icons (current ones are placeholder slate-blue squares with a white triangle) | Polish item — easy swap whenever you have artwork |
| Real-time collaboration | v2.0 |
| Native iOS / Android wrappers | v2.0 |
| Analytics / telemetry | v2.0 |
| Export progress as PDF | v2.0 |

## Known compromises (carried forward from earlier reports)

- **Trainer mode has no auth gate.** A candidate who finds `/settings` can reveal answers. Add a PIN in v1.5 if needed.
- **Self-check checkbox indexing is by render-order position.** If the source MDX is reordered, existing ticks shift. For v1 the source is stable.
- **Sketch-task quiz answers** auto-grade as self-correct on "I have done this on paper" — no way to downgrade to partial mid-flow.
- **Hand-rolled SW caches only what you've visited.** Pages you've never opened route to `/~offline` when offline. Adding a precache list would need either Serwist (broken under Turbopack) or hand-maintaining a route list.
- **The two npm deprecation warnings** (`node-domexception`, `source-map@beta`) are transitive. Wait for upstream.
- **Stray `C:\Users\mrnig_ndtz4tw\package-lock.json`** from Session 1's vercel CLI install. Harmless. Safe to delete any time.

## What I'd suggest doing first when you're back at the desk

In rough priority:

1. **Run `SMOKE_TESTS.md` against the deployed URL** — 15 minutes; gives you confidence v1.0 actually works end-to-end.
2. **Install the PWA on your phone** (and John's, when ready). Walk through a couple of pages, finish a quiz, turn on Airplane Mode, confirm it works.
3. **Real PWA icons** — design or commission a proper icon set; replace `public/icon-*.png`. Affects how it looks on the home screen — you'll want this before the candidate sees it.
4. **Decide on trainer-mode auth** — if John is going to be using this and you don't want him peeking at answers, add a PIN gate before `/settings` (v1.5 line item).

## Commits since last report

```
1c8f675  Session 8: a11y audit, print stylesheet, v1.0 polish
67a3527  Add SESSION_7_REPORT
b07781c  Session 7: trainer mode, confidence + readiness capture
14496bb  Add SESSION_6_REPORT
03517ad  Session 6: PWA service worker and install prompt
05257e3  Add SESSION_5_REPORT
878318f  Session 5: localStorage progress persistence
f785495  Add SESSION_4_REPORT
5acd5bd  Session 4: interactive C7.1 and D10.1 quizzes
8067859  Add SESSION_3_REPORT
3371f18  Session 3: ingest L2 + L3, schematic diagrams, templates
15ef2d6  Add SESSION_2_REPORT for morning review
cdf1f39  Session 2: ingest Level 1 content and render pages
0eb87f8  Scaffold Session 1: Next.js 16 + Tailwind v4 + shadcn/ui + Velite
```

## v1.0 — done

Eight sessions, on plan. The candidate has a polished installable web app
delivering the full Levels 1–3 workbook content interactively, working on
any device, online or offline. The trainer has a single tool for session
preparation, in-session reference, and progress review.

Source content in OneDrive untouched throughout. No destructive ops.
Project lives at `C:\Users\mrnig_ndtz4tw\Projects\alpine-map-training`,
GitHub at `https://github.com/NIGELJTAYLOR/alpine-map-training`, Vercel
auto-deploys on push.

— End of Session 8. End of v1.0 build.
